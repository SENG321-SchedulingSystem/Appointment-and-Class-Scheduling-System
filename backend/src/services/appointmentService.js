'use strict';

// AppointmentEngine (docs/UML_Diagrams.md §2, docs/Architecture.md):
// Handles student appointment booking with transactional concurrency control (US-05, FR-08).
// Rules:
// 1. Authenticated as STUDENT (enforced at router guard).
// 2. Validate NewAppointment schema ({ availabilityId }) (400).
// 3. Atomically check existence (404), pairing with instructor (403), and AVAILABLE status (409).
// 4. Create appointment with status SCHEDULED, lock slot as BOOKED (201).

const ApiError = require('../errors/ApiError');
const { validateNewAppointment } = require('../validation/validators');

function createAppointmentService({ appointmentRepo }) {
  return {
    async bookAppointment(studentId, body) {
      const errors = validateNewAppointment(body);
      if (errors.length) {
        throw ApiError.badRequest(errors.join(' '));
      }

      return appointmentRepo.bookAppointment({
        studentId,
        availabilityId: body.availabilityId,
      });
    },

    async getAppointment(id) {
      const appt = await appointmentRepo.findById(id);
      if (!appt) {
        throw ApiError.notFound('Appointment not found.');
      }
      return appt;
    },
  };
}

module.exports = { createAppointmentService };

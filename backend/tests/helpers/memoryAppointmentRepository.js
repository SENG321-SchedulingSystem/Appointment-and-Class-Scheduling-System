'use strict';

// In-memory stand-in for src/repositories/appointmentRepository.js.
// Simulates Firestore transaction concurrency semantics using slot-level locks
// so concurrent requests for the same slot serialize atomically (one 201, one 409).

const ApiError = require('../../src/errors/ApiError');

function createMemoryAppointmentRepository({ availabilityRepo, assignmentRepo }) {
  const appointments = new Map();
  const locks = new Map();
  let seq = 0;

  async function withLock(key, fn) {
    while (locks.has(key)) {
      await locks.get(key);
    }
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    locks.set(key, promise);
    try {
      return await fn();
    } finally {
      locks.delete(key);
      release();
    }
  }

  return {
    appointments,

    async bookAppointment({ studentId, availabilityId }) {
      return withLock(availabilityId, async () => {
        // Small async pause to simulate transactional Firestore round-trip
        await new Promise((resolve) => setImmediate(resolve));

        const slot = await availabilityRepo.findById(availabilityId);
        if (!slot) {
          throw ApiError.notFound(
            'The requested availability slot does not exist in the system.',
            'SLOT_NOT_FOUND',
          );
        }

        if (slot.startTime && Date.parse(slot.startTime) <= Date.now()) {
          throw ApiError.badRequest(
            'Cannot book an availability slot that has already started.',
            'PAST_START_TIME',
          );
        }

        const assignment = await assignmentRepo.findByStudentId(studentId);
        if (!assignment || assignment.instructorId !== slot.instructorId) {
          throw ApiError.forbidden(
            'You are not authorized to book an appointment with an instructor who is not assigned to you.',
            'INSTRUCTOR_NOT_ASSIGNED',
          );
        }

        if (slot.status !== 'AVAILABLE') {
          throw ApiError.conflict('SLOT_UNAVAILABLE', 'This slot is already booked.');
        }

        // Atomically update slot to BOOKED
        slot.status = 'BOOKED';
        if (availabilityRepo.availabilities && availabilityRepo.availabilities.has(availabilityId)) {
          availabilityRepo.availabilities.set(availabilityId, { ...slot });
        }

        seq += 1;
        const apptId = `apt_${seq}`;
        const appointment = {
          id: apptId,
          availabilityId,
          studentId,
          status: 'SCHEDULED',
        };

        appointments.set(apptId, { ...appointment });
        return { ...appointment };
      });
    },

    async findById(id) {
      const appt = appointments.get(id);
      return appt ? { ...appt } : null;
    },

    async listByStudentId(studentId) {
      return [...appointments.values()]
        .filter((a) => a.studentId === studentId)
        .map((a) => ({ ...a }));
    },
  };
}

module.exports = { createMemoryAppointmentRepository };

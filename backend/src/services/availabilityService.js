'use strict';

// AvailabilityService: instructor calendar management (US-03, FR-05, FR-06) and
// the student view of the assigned instructor's open slots (US-04, FR-07).
// Business rules and validation follow docs/UML_Diagrams.md §3 and docs/SRS.md §3.3.

const ApiError = require('../errors/ApiError');
const {
  validateNewAvailability,
  validateAvailabilityQuery,
  validateSlotId,
} = require('../validation/validators');

function createAvailabilityService({ availabilityRepo, assignmentRepo }) {
  return {
    async createSlot(instructorId, body) {
      const errors = validateNewAvailability(body);
      if (errors.length) {
        throw ApiError.badRequest(errors.join(' '));
      }

      const startMs = Date.parse(body.startTime);
      const endMs = Date.parse(body.endTime);
      const now = Date.now();

      if (startMs <= now) {
        throw ApiError.badRequest('startTime must be in the future', 'PAST_START_TIME');
      }

      if (endMs <= startMs) {
        throw ApiError.badRequest('endTime must be after startTime', 'INVALID_TIME_RANGE');
      }

      const overlapping = await availabilityRepo.findOverlapping(instructorId, body.startTime, body.endTime);
      if (overlapping.length > 0) {
        throw ApiError.badRequest('Slot overlaps an existing slot of the instructor', 'SLOT_OVERLAP');
      }

      return availabilityRepo.create({
        instructorId,
        startTime: body.startTime,
        endTime: body.endTime,
        status: 'AVAILABLE',
      });
    },

    async listInstructorSlots(instructorId, query = {}) {
      const errors = validateAvailabilityQuery(query);
      if (errors.length) {
        throw ApiError.badRequest(errors.join(' '));
      }

      return availabilityRepo.findByInstructorId(instructorId, {
        from: query.from,
        to: query.to,
      });
    },

    // FR-07 rule 1: a student sees only the future AVAILABLE slots of the one
    // instructor assigned to them. BOOKED slots and other instructors' slots
    // are never returned (privacy).
    async listStudentSlots(studentId, query = {}) {
      const errors = validateAvailabilityQuery(query);
      if (errors.length) {
        throw ApiError.badRequest(errors.join(' '));
      }

      const assignment = await assignmentRepo.findByStudentId(studentId);
      if (!assignment) {
        throw ApiError.forbidden('You have not been assigned to an instructor yet.', 'INSTRUCTOR_NOT_ASSIGNED');
      }
      if (query.instructorId && query.instructorId !== assignment.instructorId) {
        throw ApiError.forbidden(
          'You are not authorized to view the availability of an instructor who is not assigned to you.',
          'INSTRUCTOR_NOT_ASSIGNED',
        );
      }

      const slots = await availabilityRepo.findByInstructorId(assignment.instructorId, {
        from: query.from,
        to: query.to,
        status: 'AVAILABLE',
      });
      const now = Date.now();
      return slots.filter((s) => Date.parse(s.startTime) > now);
    },

    async deleteSlot(slotId, callerInstructorId) {
      const errors = validateSlotId(slotId);
      if (errors.length) {
        throw ApiError.badRequest(errors.join(' '));
      }

      const slot = await availabilityRepo.findById(slotId);
      if (!slot) {
        throw ApiError.notFound(
          'The requested availability slot does not exist in the system.',
          'SLOT_NOT_FOUND',
        );
      }

      if (slot.instructorId !== callerInstructorId) {
        throw ApiError.forbidden(
          'You do not have permission to delete this availability slot.',
          'FORBIDDEN',
        );
      }

      if (slot.status !== 'AVAILABLE') {
        throw ApiError.conflict(
          'SLOT_ALREADY_BOOKED',
          'Cannot delete availability slot because an appointment has already been booked for this slot.',
        );
      }

      await availabilityRepo.deleteById(slotId);
    },
  };
}

module.exports = { createAvailabilityService };

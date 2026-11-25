'use strict';

// Student-instructor pairing (FR-04, US-02). Order of checks follows
// docs/UML_Diagrams.md §4: schema (400), existence (404), roles (400).

const ApiError = require('../errors/ApiError');
const { validateAssignment } = require('../validation/validators');

function createAssignmentService({ userRepo, assignmentRepo }) {
  return {
    async assign(body, adminId) {
      const errors = validateAssignment(body);
      if (errors.length) throw ApiError.badRequest(errors.join(' '));

      const { studentId, instructorId } = body;
      const [student, instructor] = await Promise.all([
        userRepo.findById(studentId),
        userRepo.findById(instructorId),
      ]);

      if (!student) throw ApiError.notFound(`User ${studentId} does not exist.`);
      if (!instructor) throw ApiError.notFound(`User ${instructorId} does not exist.`);

      if (student.role !== 'STUDENT' || instructor.role !== 'INSTRUCTOR') {
        throw ApiError.badRequest(
          'Role mismatch: studentId must belong to a STUDENT and instructorId to an INSTRUCTOR.',
          'ROLE_MISMATCH',
        );
      }

      return assignmentRepo.upsert({ studentId, instructorId, assignedBy: adminId });
    },
  };
}

module.exports = { createAssignmentService };

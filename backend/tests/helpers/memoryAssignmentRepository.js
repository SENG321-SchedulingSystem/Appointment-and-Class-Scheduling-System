'use strict';

// In-memory stand-in for src/repositories/assignmentRepository.js.

function createMemoryAssignmentRepository() {
  const assignments = new Map(); // studentId -> { studentId, instructorId, assignedBy }

  return {
    assignments,
    async upsert({ studentId, instructorId, assignedBy }) {
      assignments.set(studentId, { studentId, instructorId, assignedBy });
      return { studentId, instructorId };
    },
    async findByStudentId(studentId) {
      const a = assignments.get(studentId);
      return a ? { studentId, instructorId: a.instructorId } : null;
    },
  };
}

module.exports = { createMemoryAssignmentRepository };

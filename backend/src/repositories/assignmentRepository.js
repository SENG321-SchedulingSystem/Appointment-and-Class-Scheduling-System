'use strict';

// PairingRepo (docs/UML_Diagrams.md §4): one document per student,
// assignments/{studentId} = { studentId, instructorId, assignedBy, assignedAt }.
// Keying by studentId makes "one active instructor per student" structural:
// a new assignment overwrites the previous one.

const { FieldValue } = require('firebase-admin/firestore');
const { getDb } = require('../config/firebase');
const { ASSIGNMENTS } = require('../config/collections');

function createAssignmentRepository(db = getDb) {
  const assignments = () => (typeof db === 'function' ? db() : db).collection(ASSIGNMENTS);

  return {
    async upsert({ studentId, instructorId, assignedBy }) {
      await assignments().doc(studentId).set({
        studentId,
        instructorId,
        assignedBy,
        assignedAt: FieldValue.serverTimestamp(),
      });
      return { studentId, instructorId };
    },

    async findByStudentId(studentId) {
      const doc = await assignments().doc(studentId).get();
      if (!doc.exists) return null;
      const { instructorId } = doc.data();
      return { studentId, instructorId };
    },
  };
}

module.exports = { createAssignmentRepository };

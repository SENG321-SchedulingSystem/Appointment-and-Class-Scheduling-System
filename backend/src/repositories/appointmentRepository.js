'use strict';

// ApptRepo (docs/UML_Diagrams.md §2, §5.2): Firestore access for `appointments`.
// Documents store { id, availabilityId, studentId, status, createdAt }.
// Concurrency control: booking runs inside a Firestore runTransaction, atomically
// reading the slot document, checking instructor assignment, ensuring AVAILABLE status,
// writing the appointment document, and updating the slot to BOOKED.

const { FieldValue } = require('firebase-admin/firestore');
const { getDb } = require('../config/firebase');
const { APPOINTMENTS, AVAILABILITIES, ASSIGNMENTS } = require('../config/collections');
const ApiError = require('../errors/ApiError');

function toAppointment(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    availabilityId: data.availabilityId,
    studentId: data.studentId,
    status: data.status,
  };
}

function createAppointmentRepository(db = getDb) {
  const firestore = () => (typeof db === 'function' ? db() : db);
  const appointments = () => firestore().collection(APPOINTMENTS);
  const availabilities = () => firestore().collection(AVAILABILITIES);
  const assignments = () => firestore().collection(ASSIGNMENTS);

  return {
    async bookAppointment({ studentId, availabilityId }) {
      return firestore().runTransaction(async (transaction) => {
        const slotRef = availabilities().doc(availabilityId);
        const slotDoc = await transaction.get(slotRef);

        if (!slotDoc.exists) {
          throw ApiError.notFound(
            'The requested availability slot does not exist in the system.',
            'SLOT_NOT_FOUND',
          );
        }

        const slotData = slotDoc.data();

        const assignmentRef = assignments().doc(studentId);
        const assignmentDoc = await transaction.get(assignmentRef);

        if (!assignmentDoc.exists || assignmentDoc.data().instructorId !== slotData.instructorId) {
          throw ApiError.forbidden(
            'You are not authorized to book an appointment with an instructor who is not assigned to you.',
            'INSTRUCTOR_NOT_ASSIGNED',
          );
        }

        if (slotData.status !== 'AVAILABLE') {
          throw ApiError.conflict('SLOT_UNAVAILABLE', 'This slot is already booked.');
        }

        const apptRef = appointments().doc();
        const appointment = {
          id: apptRef.id,
          availabilityId,
          studentId,
          status: 'SCHEDULED',
        };

        transaction.set(apptRef, {
          ...appointment,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.update(slotRef, {
          status: 'BOOKED',
          updatedAt: FieldValue.serverTimestamp(),
        });

        return appointment;
      });
    },

    async findById(id) {
      const doc = await appointments().doc(id).get();
      return doc.exists ? toAppointment(doc) : null;
    },

    async listByStudentId(studentId) {
      const snap = await appointments().where('studentId', '==', studentId).get();
      return snap.docs.map(toAppointment);
    },
  };
}

module.exports = { createAppointmentRepository };

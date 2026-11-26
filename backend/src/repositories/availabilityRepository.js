'use strict';

// AvailRepo (docs/UML_Diagrams.md §3, §5.2): Firestore access for `availabilities`.
// Documents store { id, instructorId, startTime, endTime, status, createdAt }.
// Timestamps are stored as ISO-8601 UTC strings per SRS §3.3 (FR-05, FR-06).

const { FieldValue } = require('firebase-admin/firestore');
const { getDb } = require('../config/firebase');
const { AVAILABILITIES } = require('../config/collections');

function toAvailability(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    instructorId: data.instructorId,
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status,
  };
}

function createAvailabilityRepository(db = getDb) {
  const firestore = () => (typeof db === 'function' ? db() : db);
  const availabilities = () => firestore().collection(AVAILABILITIES);

  return {
    async create({ id, instructorId, startTime, endTime, status = 'AVAILABLE' }) {
      const ref = id ? availabilities().doc(id) : availabilities().doc();
      const payload = {
        instructorId,
        startTime,
        endTime,
        status,
        createdAt: FieldValue.serverTimestamp(),
      };
      await ref.set(payload);
      return {
        id: ref.id,
        instructorId,
        startTime,
        endTime,
        status,
      };
    },

    async findById(id) {
      const doc = await availabilities().doc(id).get();
      return doc.exists ? toAvailability(doc) : null;
    },

    async findByInstructorId(instructorId, { from, to, status } = {}) {
      const snap = await availabilities().where('instructorId', '==', instructorId).get();
      let slots = snap.docs.map(toAvailability);

      if (status) {
        slots = slots.filter((s) => s.status === status);
      }
      if (from) {
        const fromMs = Date.parse(from);
        slots = slots.filter((s) => Date.parse(s.startTime) >= fromMs);
      }
      if (to) {
        const toMs = Date.parse(to);
        slots = slots.filter((s) => Date.parse(s.endTime) <= toMs);
      }

      slots.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
      return slots;
    },

    async findOverlapping(instructorId, startTime, endTime) {
      const newStartMs = Date.parse(startTime);
      const newEndMs = Date.parse(endTime);
      const snap = await availabilities().where('instructorId', '==', instructorId).get();

      return snap.docs
        .map(toAvailability)
        .filter((s) => Date.parse(s.startTime) < newEndMs && Date.parse(s.endTime) > newStartMs);
    },

    async deleteById(id) {
      await availabilities().doc(id).delete();
    },
  };
}

module.exports = { createAvailabilityRepository };

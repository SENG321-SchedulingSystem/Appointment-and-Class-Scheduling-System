'use strict';

// In-memory stand-in for src/repositories/availabilityRepository.js,
// used by unit and integration tests so they execute without Firestore emulator.

function createMemoryAvailabilityRepository() {
  const availabilities = new Map();
  let seq = 0;

  return {
    availabilities,

    async create({ id, instructorId, startTime, endTime, status = 'AVAILABLE' }) {
      seq += 1;
      const slotId = id || `avail_${seq}`;
      const slot = {
        id: slotId,
        instructorId,
        startTime,
        endTime,
        status,
      };
      availabilities.set(slotId, { ...slot });
      return { ...slot };
    },

    async findById(id) {
      const slot = availabilities.get(id);
      return slot ? { ...slot } : null;
    },

    async findByInstructorId(instructorId, { from, to, status } = {}) {
      let slots = [...availabilities.values()].filter((s) => s.instructorId === instructorId);

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
      return slots.map((s) => ({ ...s }));
    },

    async findOverlapping(instructorId, startTime, endTime) {
      const newStartMs = Date.parse(startTime);
      const newEndMs = Date.parse(endTime);

      return [...availabilities.values()]
        .filter((s) => s.instructorId === instructorId)
        .filter((s) => Date.parse(s.startTime) < newEndMs && Date.parse(s.endTime) > newStartMs)
        .map((s) => ({ ...s }));
    },

    async deleteById(id) {
      availabilities.delete(id);
    },
  };
}

module.exports = { createMemoryAvailabilityRepository };

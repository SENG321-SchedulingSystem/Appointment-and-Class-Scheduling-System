'use strict';

const { createAppointmentRepository } = require('../src/repositories/appointmentRepository');

function fakeFirestore() {
  const store = new Map();
  let seq = 0;

  return {
    store,
    collection: (col) => ({
      doc: (id) => {
        const docId = id || `gen_${++seq}`;
        return {
          id: docId,
          async get() {
            const data = store.get(`${col}/${docId}`);
            return { exists: Boolean(data), id: docId, data: () => data };
          },
          async set(data) {
            store.set(`${col}/${docId}`, { id: docId, ...data });
          },
          async update(data) {
            const current = store.get(`${col}/${docId}`) || {};
            store.set(`${col}/${docId}`, { ...current, ...data });
          },
        };
      },
      where: (field, op, val) => ({
        async get() {
          const docs = [...store.entries()]
            .filter(([key]) => key.startsWith(`${col}/`))
            .map(([, data]) => data)
            .filter((d) => (op === '==' ? d[field] === val : true))
            .map((data) => ({
              id: data.id,
              data: () => data,
            }));
          return { docs, empty: docs.length === 0 };
        },
      }),
    }),
    async runTransaction(updateFunction) {
      const transaction = {
        get: async (ref) => ref.get(),
        set: (ref, data) => ref.set(data),
        update: (ref, data) => ref.update(data),
      };
      return updateFunction(transaction);
    },
  };
}

describe('Firestore appointmentRepository', () => {
  let db;
  let repo;

  beforeEach(() => {
    db = fakeFirestore();
    repo = createAppointmentRepository(db);

    // Seed assignment and availability slot
    db.store.set('assignments/stu_1', { studentId: 'stu_1', instructorId: 'inst_A' });
    db.store.set('availabilities/avail_1', {
      id: 'avail_1',
      instructorId: 'inst_A',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
      status: 'AVAILABLE',
    });
  });

  test('bookAppointment succeeds, creates appointment and sets slot to BOOKED', async () => {
    const appt = await repo.bookAppointment({ studentId: 'stu_1', availabilityId: 'avail_1' });

    expect(appt).toMatchObject({
      id: expect.any(String),
      availabilityId: 'avail_1',
      studentId: 'stu_1',
      status: 'SCHEDULED',
    });

    const slot = db.store.get('availabilities/avail_1');
    expect(slot.status).toBe('BOOKED');

    const savedAppt = await repo.findById(appt.id);
    expect(savedAppt).toEqual(appt);
  });

  test('bookAppointment throws 404 when slot does not exist', async () => {
    await expect(
      repo.bookAppointment({ studentId: 'stu_1', availabilityId: 'avail_nonexistent' }),
    ).rejects.toMatchObject({
      status: 404,
      code: 'SLOT_NOT_FOUND',
    });
  });

  test('bookAppointment throws 403 when student is not assigned to the slot instructor', async () => {
    db.store.set('availabilities/avail_other', {
      id: 'avail_other',
      instructorId: 'inst_OTHER',
      status: 'AVAILABLE',
    });

    await expect(
      repo.bookAppointment({ studentId: 'stu_1', availabilityId: 'avail_other' }),
    ).rejects.toMatchObject({
      status: 403,
      code: 'INSTRUCTOR_NOT_ASSIGNED',
    });
  });

  test('bookAppointment throws 409 when slot is already BOOKED', async () => {
    db.store.get('availabilities/avail_1').status = 'BOOKED';

    await expect(
      repo.bookAppointment({ studentId: 'stu_1', availabilityId: 'avail_1' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'SLOT_UNAVAILABLE',
    });
  });

  test('listByStudentId returns appointments for student', async () => {
    const appt = await repo.bookAppointment({ studentId: 'stu_1', availabilityId: 'avail_1' });
    const list = await repo.listByStudentId('stu_1');

    expect(list).toHaveLength(1);
    expect(list[0]).toEqual(appt);

    const emptyList = await repo.listByStudentId('stu_none');
    expect(emptyList).toEqual([]);
  });
});

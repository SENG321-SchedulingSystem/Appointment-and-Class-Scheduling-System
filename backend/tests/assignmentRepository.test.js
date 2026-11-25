'use strict';

const { createAssignmentRepository } = require('../src/repositories/assignmentRepository');

function fakeFirestore() {
  const store = new Map();
  return {
    store,
    collection: (col) => ({
      doc: (id) => ({
        async set(data) {
          store.set(`${col}/${id}`, data);
        },
        async get() {
          const data = store.get(`${col}/${id}`);
          return { exists: Boolean(data), data: () => data };
        },
      }),
    }),
  };
}

describe('Firestore assignmentRepository', () => {
  test('upsert writes assignments/{studentId}; a second upsert replaces it', async () => {
    const db = fakeFirestore();
    const repo = createAssignmentRepository(db);

    await repo.upsert({ studentId: 's1', instructorId: 'i1', assignedBy: 'a1' });
    const result = await repo.upsert({ studentId: 's1', instructorId: 'i2', assignedBy: 'a1' });

    expect(result).toEqual({ studentId: 's1', instructorId: 'i2' });
    expect(db.store.size).toBe(1);
    expect(db.store.get('assignments/s1')).toMatchObject({ studentId: 's1', instructorId: 'i2', assignedBy: 'a1' });
    expect(await repo.findByStudentId('s1')).toEqual({ studentId: 's1', instructorId: 'i2' });
    expect(await repo.findByStudentId('nope')).toBeNull();
  });
});

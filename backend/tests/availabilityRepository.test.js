'use strict';

const { createAvailabilityRepository } = require('../src/repositories/availabilityRepository');

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
          async set(data) {
            store.set(`${col}/${docId}`, { id: docId, ...data });
          },
          async get() {
            const data = store.get(`${col}/${docId}`);
            return { exists: Boolean(data), id: docId, data: () => data };
          },
          async delete() {
            store.delete(`${col}/${docId}`);
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
  };
}

describe('Firestore availabilityRepository', () => {
  test('create and findById', async () => {
    const db = fakeFirestore();
    const repo = createAvailabilityRepository(db);

    const created = await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
      status: 'AVAILABLE',
    });

    expect(created.id).toBeDefined();
    expect(created.instructorId).toBe('inst_1');

    const found = await repo.findById(created.id);
    expect(found).toEqual(created);

    const notFound = await repo.findById('nonexistent');
    expect(notFound).toBeNull();
  });

  test('create with specific id', async () => {
    const db = fakeFirestore();
    const repo = createAvailabilityRepository(db);

    const created = await repo.create({
      id: 'custom_avail_id',
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
    });

    expect(created.id).toBe('custom_avail_id');
    const found = await repo.findById('custom_avail_id');
    expect(found).toMatchObject({ id: 'custom_avail_id', instructorId: 'inst_1' });
  });

  test('findByInstructorId with date and status filters, sorted by startTime', async () => {
    const db = fakeFirestore();
    const repo = createAvailabilityRepository(db);

    await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-03T10:00:00Z',
      endTime: '2026-12-03T11:00:00Z',
      status: 'AVAILABLE',
    });
    await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
      status: 'AVAILABLE',
    });
    await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-02T10:00:00Z',
      endTime: '2026-12-02T11:00:00Z',
      status: 'BOOKED',
    });

    // Check sorting
    const allSlots = await repo.findByInstructorId('inst_1');
    expect(allSlots).toHaveLength(3);
    expect(allSlots[0].startTime).toBe('2026-12-01T10:00:00Z');
    expect(allSlots[1].startTime).toBe('2026-12-02T10:00:00Z');
    expect(allSlots[2].startTime).toBe('2026-12-03T10:00:00Z');

    // Status filter
    const bookedOnly = await repo.findByInstructorId('inst_1', { status: 'BOOKED' });
    expect(bookedOnly).toHaveLength(1);
    expect(bookedOnly[0].status).toBe('BOOKED');

    // Date range filter
    const inRange = await repo.findByInstructorId('inst_1', {
      from: '2026-12-02T00:00:00Z',
      to: '2026-12-02T23:59:59Z',
    });
    expect(inRange).toHaveLength(1);
    expect(inRange[0].startTime).toBe('2026-12-02T10:00:00Z');
  });

  test('findOverlapping intervals for instructor', async () => {
    const db = fakeFirestore();
    const repo = createAvailabilityRepository(db);

    await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T12:00:00Z',
    });

    // Completely before: 08:00 - 10:00 (no overlap)
    expect(await repo.findOverlapping('inst_1', '2026-12-01T08:00:00Z', '2026-12-01T10:00:00Z')).toHaveLength(0);

    // Completely after: 12:00 - 14:00 (no overlap)
    expect(await repo.findOverlapping('inst_1', '2026-12-01T12:00:00Z', '2026-12-01T14:00:00Z')).toHaveLength(0);

    // Overlapping start: 09:00 - 11:00
    expect(await repo.findOverlapping('inst_1', '2026-12-01T09:00:00Z', '2026-12-01T11:00:00Z')).toHaveLength(1);

    // Overlapping end: 11:00 - 13:00
    expect(await repo.findOverlapping('inst_1', '2026-12-01T11:00:00Z', '2026-12-01T13:00:00Z')).toHaveLength(1);

    // Completely inside: 10:30 - 11:30
    expect(await repo.findOverlapping('inst_1', '2026-12-01T10:30:00Z', '2026-12-01T11:30:00Z')).toHaveLength(1);

    // Different instructor (inst_2) has no overlap
    expect(await repo.findOverlapping('inst_2', '2026-12-01T10:00:00Z', '2026-12-01T12:00:00Z')).toHaveLength(0);
  });

  test('deleteById removes document', async () => {
    const db = fakeFirestore();
    const repo = createAvailabilityRepository(db);

    const slot = await repo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
    });

    await repo.deleteById(slot.id);
    expect(await repo.findById(slot.id)).toBeNull();
  });
});

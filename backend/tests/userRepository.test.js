'use strict';

// Unit tests for the Firestore UserRepo against a minimal fake of the
// Admin SDK surface it uses. The real behaviour (including concurrent
// duplicate emails) is checked against the Firestore emulator.

const { createUserRepository, emailKey } = require('../src/repositories/userRepository');

function fakeFirestore() {
  const store = new Map(); // "collection/id" -> data
  let seq = 0;

  const docRef = (col, id) => ({
    id,
    path: `${col}/${id}`,
    async get() {
      const data = store.get(`${col}/${id}`);
      return { id, exists: Boolean(data), data: () => data };
    },
  });

  const query = (col, filters = []) => ({
    where: (field, _op, value) => query(col, [...filters, [field, value]]),
    limit: () => query(col, filters),
    async get() {
      const docs = [...store.entries()]
        .filter(([key]) => key.startsWith(`${col}/`))
        .map(([key, data]) => ({ id: key.slice(col.length + 1), data: () => data }))
        .filter((d) => filters.every(([f, v]) => d.data()[f] === v));
      return { empty: docs.length === 0, docs };
    },
  });

  return {
    store,
    collection: (col) => ({
      ...query(col),
      doc: (id) => docRef(col, id ?? `gen_${++seq}`),
    }),
    batch() {
      const ops = [];
      const batch = {
        create: (ref, data) => (ops.push([ref, data]), batch),
        async commit() {
          if (ops.some(([ref]) => store.has(ref.path))) {
            throw Object.assign(new Error('ALREADY_EXISTS'), { code: 6 });
          }
          for (const [ref, data] of ops) store.set(ref.path, data);
        },
      };
      return batch;
    },
  };
}

describe('Firestore userRepository', () => {
  let db;
  let repo;
  const user = { name: 'Eren', email: 'eren@example.com', passwordHash: 'h', role: 'STUDENT' };

  beforeEach(() => {
    db = fakeFirestore();
    repo = createUserRepository(db);
  });

  test('create writes the user and its email index document', async () => {
    const created = await repo.create(user);

    expect(created).toMatchObject({ id: expect.any(String), ...user });
    expect(db.store.get(`users/${created.id}`)).toMatchObject(user);
    expect(db.store.get(`userEmails/${emailKey(user.email)}`)).toMatchObject({ userId: created.id });
  });

  test('a taken email maps ALREADY_EXISTS to 409 EMAIL_ALREADY_EXISTS', async () => {
    await repo.create(user);
    await expect(repo.create({ ...user, name: 'Other' })).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_ALREADY_EXISTS',
    });
  });

  test('other Firestore errors are passed through', async () => {
    db.batch = () => ({
      create() {
        return this;
      },
      commit: async () => {
        throw Object.assign(new Error('unavailable'), { code: 14 });
      },
    });
    await expect(repo.create(user)).rejects.toMatchObject({ code: 14 });
  });

  test('findByEmail, findById and list read users back', async () => {
    const created = await repo.create(user);
    await repo.create({ ...user, email: 'ali@example.com', role: 'INSTRUCTOR' });

    expect(await repo.findByEmail('eren@example.com')).toMatchObject({ id: created.id, role: 'STUDENT' });
    expect(await repo.findByEmail('nobody@example.com')).toBeNull();
    expect(await repo.findById(created.id)).toMatchObject({ email: 'eren@example.com' });
    expect(await repo.findById('missing')).toBeNull();
    expect(await repo.list()).toHaveLength(2);
    expect((await repo.list({ role: 'INSTRUCTOR' })).map((u) => u.email)).toEqual(['ali@example.com']);
  });
});

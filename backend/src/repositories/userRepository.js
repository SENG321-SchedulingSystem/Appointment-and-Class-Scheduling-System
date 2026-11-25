'use strict';

// UserRepo (docs/UML_Diagrams.md §4): Firestore access for the `users` collection.
// Documents store { name, email, passwordHash, role, createdAt }. Emails are
// stored lower-cased so that lookups and the uniqueness check are case-insensitive.
//
// Unique emails: every user has a companion document userEmails/{sha256(email)}.
// Both are written in one batch with create(), which fails atomically with
// ALREADY_EXISTS when the email is taken. This holds under concurrent requests
// without a transaction or a query lock.

const crypto = require('node:crypto');
const { FieldValue } = require('firebase-admin/firestore');
const { getDb } = require('../config/firebase');
const { USERS, USER_EMAILS } = require('../config/collections');
const ApiError = require('../errors/ApiError');

const GRPC_ALREADY_EXISTS = 6;

const emailKey = (email) => crypto.createHash('sha256').update(email).digest('hex');

function toUser(doc) {
  const data = doc.data();
  return { id: doc.id, name: data.name, email: data.email, role: data.role, passwordHash: data.passwordHash };
}

function createUserRepository(db = getDb) {
  const firestore = () => (typeof db === 'function' ? db() : db);
  const users = () => firestore().collection(USERS);

  return {
    async findByEmail(email) {
      const snap = await users().where('email', '==', email).limit(1).get();
      return snap.empty ? null : toUser(snap.docs[0]);
    },

    async findById(id) {
      const doc = await users().doc(id).get();
      return doc.exists ? toUser(doc) : null;
    },

    async list({ role } = {}) {
      const query = role ? users().where('role', '==', role) : users();
      const snap = await query.get();
      return snap.docs.map(toUser);
    },

    async create({ name, email, passwordHash, role }) {
      const userRef = users().doc();
      const emailRef = firestore().collection(USER_EMAILS).doc(emailKey(email));
      const createdAt = FieldValue.serverTimestamp();

      try {
        await firestore()
          .batch()
          .create(emailRef, { userId: userRef.id, createdAt })
          .create(userRef, { name, email, passwordHash, role, createdAt })
          .commit();
      } catch (err) {
        if (err.code === GRPC_ALREADY_EXISTS) {
          throw ApiError.conflict('EMAIL_ALREADY_EXISTS', 'This email address is already registered.');
        }
        throw err;
      }
      return { id: userRef.id, name, email, role, passwordHash };
    },
  };
}

module.exports = { createUserRepository, emailKey };

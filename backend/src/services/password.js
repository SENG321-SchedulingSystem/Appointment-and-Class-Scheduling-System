'use strict';

// Password hashing (NFR-S4). Only the bcrypt hash is ever stored.

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { SALT_ROUNDS, hashPassword, verifyPassword };

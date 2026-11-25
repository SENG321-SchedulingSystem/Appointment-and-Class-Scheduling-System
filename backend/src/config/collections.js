'use strict';

// Firestore collection names (docs/UML_Diagrams.md §5.2).
module.exports = Object.freeze({
  USERS: 'users',
  USER_EMAILS: 'userEmails', // document id = sha256(email); guarantees unique emails
  ASSIGNMENTS: 'assignments', // document id = studentId (one instructor per student)
  AVAILABILITIES: 'availabilities',
  APPOINTMENTS: 'appointments',
});

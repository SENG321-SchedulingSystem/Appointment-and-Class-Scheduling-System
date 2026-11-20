'use strict';

// Firestore collection names (docs/UML_Diagrams.md §5.2).
module.exports = Object.freeze({
  USERS: 'users',
  ASSIGNMENTS: 'assignments', // document id = studentId (one instructor per student)
  AVAILABILITIES: 'availabilities',
  APPOINTMENTS: 'appointments',
});

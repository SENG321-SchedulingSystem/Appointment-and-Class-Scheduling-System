# UML Dynamic Behaviour and Domain Model (Sprint 2)

**Project:** Appointment and Class Scheduling System
**Owner:** Furkan Çelebi (Implementation & Integration Engineer)
**Approver:** Eren Okat (Lead Software Architect), see [RACI Matrix](RACI_Matrix.md)
**API Contract Reference:** `openapi.yaml` (v0.3.0)
**Related Documents:** [`Architecture.md`](Architecture.md), [`API_Integration_Strategy.md`](API_Integration_Strategy.md), [`QA_Strategy.md`](QA_Strategy.md)

This document refines the architecture into UML models that the backend implementation follows directly:

- three **sequence diagrams** for the critical runtime flows, drawn at component level, and
- one **domain / class diagram** for the persisted entities and their relations.

Participant names match the C4 Level 3 components in [`Architecture.md` §2.3](Architecture.md#23-c4-level-3-component-diagram-backend-api-container). Field names, enum values, status codes and error codes match `openapi.yaml` v0.3.0, which stays the single source of truth. Where a diagram needs a rule the contract does not express yet, it is listed in [§6 Open Points](#6-open-points-for-the-contract-and-srs).

---

## 1. Conventions

| Item | Convention |
| :--- | :--- |
| Identity | The caller's `userId` and `role` are read only from the verified JWT claims (`sub`, `role`), never from the request body (ADR-04). |
| Errors | Every failure is returned as `application/problem+json` with `title`, `status`, `code` and `detail` (RFC 7807), produced by the global `ErrorHandler`. |
| Time | All timestamps are ISO-8601 UTC. "Now" is the server clock at request time. |
| Collections | Firestore collections are `users`, `assignments`, `availabilities` and `appointments` (see [§5](#5-firestore-persistence-mapping)). |
| Timings | Millisecond values in §2 are illustrative, to show ordering. They are not measurements. Performance targets are defined in `NFR_Quality_Measures.md`. |

---

## 2. Sequence Diagram 1: Double-Booking Prevention (US-05, `POST /appointments`)

Two students who are assigned to the same instructor press **Book** on the same `AVAILABLE` slot `avail_789` within the same few milliseconds. `Architecture.md` §3 shows this at system level. The diagram below shows the same flow through each backend component.

The booking runs inside `db.runTransaction()`. The Firebase Admin SDK uses **pessimistic locking** on the server side: a document read inside a transaction is locked until that transaction commits or aborts. A competing transaction therefore cannot commit a write against the same slot snapshot. If it is aborted because of contention, the SDK retries the whole transaction function automatically, and the retry reads the committed `BOOKED` state.

```mermaid
sequenceDiagram
  autonumber
  actor SA as Student A (SPA)
  actor SB as Student B (SPA)
  participant MW as AuthMiddleware
  participant VAL as SchemaValidator
  participant ENG as AppointmentEngine
  participant TX as TxManager
  participant AR as AvailRepo
  participant PR as PairingRepo
  participant APR as ApptRepo
  participant FS as Cloud Firestore

  Note over SA,SB: t = 0 ms, both click "Book" on avail_789

  par Request A
    SA->>MW: POST /appointments {availabilityId: "avail_789"} Bearer JWT(sub=stu_A, role=STUDENT)
  and Request B
    SB->>MW: POST /appointments {availabilityId: "avail_789"} Bearer JWT(sub=stu_B, role=STUDENT)
  end

  MW->>MW: verify signature + exp, requireRole(STUDENT)
  MW->>VAL: req.user = {id, role}
  VAL->>VAL: body matches NewAppointment schema
  VAL->>ENG: bookSlot(callerId, "avail_789")

  Note over ENG,FS: t ≈ 5 ms, Transaction A and Transaction B start

  ENG->>TX: runTransaction(fnA)
  ENG->>TX: runTransaction(fnB)

  TX->>AR: Tx A: get(availabilities/avail_789)
  AR->>FS: transactional read (lock acquired by Tx A)
  FS-->>AR: {instructorId: inst_123, status: AVAILABLE}
  AR-->>TX: slot

  TX->>AR: Tx B: get(availabilities/avail_789)
  AR->>FS: transactional read
  Note over FS: Tx B waits, document is locked by Tx A

  TX->>PR: Tx A: get(assignments/stu_A)
  PR->>FS: transactional read
  FS-->>PR: {instructorId: inst_123}
  PR-->>TX: pairing matches slot.instructorId

  Note over TX: Tx A: slot exists, pairing ok, status == AVAILABLE

  TX->>APR: Tx A: create(appointments/apt_321, {availabilityId, studentId: stu_A, status: SCHEDULED})
  TX->>AR: Tx A: update(availabilities/avail_789, {status: BOOKED})
  TX->>FS: Tx A: commit (both writes, atomic)
  FS-->>TX: Tx A: commit OK at t ≈ 18 ms, lock released
  TX-->>ENG: Appointment apt_321
  ENG-->>SA: 201 Created {id: "apt_321", availabilityId: "avail_789", studentId: "stu_A", status: "SCHEDULED"}

  FS-->>AR: Tx B: read resumes (or Tx B is aborted and retried by the SDK)
  AR-->>TX: {instructorId: inst_123, status: BOOKED}
  TX->>PR: Tx B: get(assignments/stu_B)
  PR-->>TX: pairing matches slot.instructorId

  Note over TX: Tx B: status != AVAILABLE, throw SlotUnavailableError

  TX->>FS: Tx B: rollback, no writes
  TX-->>ENG: SlotUnavailableError
  ENG-->>SB: 409 Conflict application/problem+json {code: "SLOT_UNAVAILABLE"} at t ≈ 24 ms

  Note over SA,SB: Result: exactly one appointment for avail_789 (NFR-C1, NFR-C2)
```

### 2.1 Decision order inside the transaction

The transaction function checks the following, in this order. The first rule that fails ends the transaction without any write.

| Step | Check | Failure response |
| :---: | :--- | :--- |
| 1 | JWT is present, correctly signed and not expired | `401 UNAUTHORIZED` (before the transaction) |
| 2 | `role == STUDENT` | `403 FORBIDDEN` (before the transaction) |
| 3 | Body has `availabilityId` (string) | `400` (before the transaction) |
| 4 | `availabilities/{availabilityId}` exists | `404 SLOT_NOT_FOUND` |
| 5 | `assignments/{callerId}.instructorId == slot.instructorId` | `403 INSTRUCTOR_NOT_ASSIGNED` |
| 6 | `slot.status == AVAILABLE` | `409 SLOT_UNAVAILABLE` |
| 7 | Create the appointment and set the slot to `BOOKED` in one commit | `201 Created` |

Steps 4 to 6 read inside the transaction, so a pairing change or a competing booking that commits first is always seen.

---

## 3. Sequence Diagram 2: Publishing Availability with Past-Date Validation (US-03, `POST /availability`)

An instructor publishes a new slot. The backend rejects it when it starts in the past, when `endTime` is not after `startTime`, or when it overlaps one of the instructor's existing slots. The overlap query and the insert run in one transaction, so two parallel requests from the same instructor cannot both create overlapping slots.

```mermaid
sequenceDiagram
  autonumber
  actor I as Instructor (SPA)
  participant MW as AuthMiddleware
  participant VAL as SchemaValidator
  participant SVC as AvailabilityService
  participant TX as TxManager
  participant AR as AvailRepo
  participant FS as Cloud Firestore

  I->>MW: POST /availability {startTime, endTime} Bearer JWT(sub=inst_123, role=INSTRUCTOR)

  alt token missing, invalid or expired
    MW-->>I: 401 Unauthorized {code: "UNAUTHORIZED"}
  else role != INSTRUCTOR
    MW-->>I: 403 Forbidden {code: "FORBIDDEN"}
  else authenticated instructor
    MW->>VAL: req.user = {id: inst_123, role: INSTRUCTOR}
    alt body does not match NewAvailability (missing field, not date-time)
      VAL-->>I: 400 Bad Request
    else schema valid
      VAL->>SVC: createSlot(inst_123, startTime, endTime)
      SVC->>SVC: now = server UTC clock

      alt startTime <= now
        SVC-->>I: 400 Bad Request {detail: "startTime must be in the future"}
      else endTime <= startTime
        SVC-->>I: 400 Bad Request {detail: "endTime must be after startTime"}
      else chronologically valid
        SVC->>TX: runTransaction(fn)
        TX->>AR: findOverlapping(inst_123, startTime, endTime)
        AR->>FS: query availabilities where instructorId == inst_123 and startTime < endTime
        FS-->>AR: candidate slots
        AR-->>TX: slots where candidate.endTime > startTime

        alt at least one overlapping slot
          TX-->>SVC: SlotOverlapError (no write)
          SVC-->>I: 400 Bad Request {detail: "Slot overlaps an existing slot"}
        else no overlap
          TX->>AR: create(availabilities/avail_789, {instructorId: inst_123, startTime, endTime, status: AVAILABLE})
          TX->>FS: commit
          FS-->>TX: commit OK
          TX-->>SVC: Availability
          SVC-->>I: 201 Created {id: "avail_789", instructorId: "inst_123", startTime, endTime, status: "AVAILABLE"}
        end
      end
    end
  end
```

### 3.1 Validation rules

| Rule | Where it is enforced | Reason |
| :--- | :--- | :--- |
| `instructorId` comes from the token | `AuthMiddleware` → `req.user.id` | `NewAvailability` has no `instructorId`, so one instructor cannot create slots for another. |
| `startTime` and `endTime` are valid `date-time` strings | `SchemaValidator` | Contract shape check, done before any business logic. |
| `startTime > now` | `AvailabilityService` | Depends on the server clock, so a stateless mock cannot check it (`API_Integration_Strategy.md`). |
| `endTime > startTime` | `AvailabilityService` | Chronological order (NFR-R3). |
| No overlap with the instructor's existing slots | `AvailabilityService` inside the transaction | SRS FR-05 rule 4. Two intervals overlap when `a.start < b.end` and `a.end > b.start`. |

---

## 4. Sequence Diagram 3: Authorization and Student-Instructor Pairing (US-02, `POST /assignments`)

The admin logs in, receives a JWT that contains the role claim, and assigns a student to an instructor. The second part shows how the stored pairing is used later to authorize a student request. This is the same check that protects `POST /appointments`.

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin (SPA)
  actor S as Student (SPA)
  participant AUTH as AuthService
  participant MW as AuthMiddleware
  participant VAL as SchemaValidator
  participant USVC as UserService
  participant UR as UserRepo
  participant PR as PairingRepo
  participant FS as Cloud Firestore

  rect rgba(127, 127, 127, 0.08)
    Note over A,FS: Part 1: login and token issue
    A->>AUTH: POST /auth/login {email, password}
    AUTH->>UR: findByEmail(email)
    UR->>FS: query users where email == ...
    FS-->>UR: {id: adm_1, role: ADMIN, passwordHash}
    UR-->>AUTH: user
    AUTH->>AUTH: bcrypt.compare(password, passwordHash)
    alt wrong email or password
      AUTH-->>A: 401 Unauthorized {code: "UNAUTHORIZED"}
    else credentials valid
      AUTH->>AUTH: sign JWT {sub: adm_1, role: ADMIN, exp}
      AUTH-->>A: 200 OK {token, userId: "adm_1", name, role: "ADMIN"}
    end
  end

  rect rgba(127, 127, 127, 0.08)
    Note over A,FS: Part 2: pairing a student with an instructor
    A->>MW: POST /assignments {studentId: "stu_456", instructorId: "inst_123"} Bearer JWT
    MW->>MW: verify signature + exp, read claims {sub, role}
    alt token missing, invalid or expired
      MW-->>A: 401 Unauthorized
    else role claim != ADMIN
      MW-->>A: 403 Forbidden {code: "FORBIDDEN"}
    else admin
      MW->>VAL: req.user = {id: adm_1, role: ADMIN}
      alt body does not match Assignment schema
        VAL-->>A: 400 Bad Request
      else schema valid
        VAL->>USVC: assign("stu_456", "inst_123")
        USVC->>UR: getById(stu_456), getById(inst_123)
        UR->>FS: read users/stu_456, users/inst_123
        FS-->>UR: documents
        UR-->>USVC: student, instructor
        alt a user does not exist
          USVC-->>A: 404 Not Found {code: "RESOURCE_NOT_FOUND"}
        else student.role != STUDENT or instructor.role != INSTRUCTOR
          USVC-->>A: 400 Bad Request {detail: "Role mismatch"}
        else valid pair
          USVC->>PR: upsert(assignments/stu_456, {studentId, instructorId: inst_123, assignedBy: adm_1, assignedAt: now})
          PR->>FS: set document (replaces an earlier instructor)
          FS-->>PR: OK
          USVC-->>A: 201 Created
        end
      end
    end
  end

  rect rgba(127, 127, 127, 0.08)
    Note over S,FS: Part 3: the pairing authorizes later student requests
    S->>MW: GET /availability?instructorId=inst_999 Bearer JWT(sub=stu_456, role=STUDENT)
    MW->>MW: verify JWT, role STUDENT is allowed on this route
    MW->>PR: get(assignments/stu_456)
    PR->>FS: read
    FS-->>PR: {instructorId: inst_123}
    alt requested instructorId != assigned instructorId
      MW-->>S: 403 Forbidden {code: "INSTRUCTOR_NOT_ASSIGNED"}
    else instructorId omitted or equal to inst_123
      MW-->>S: 200 OK [AVAILABLE slots of inst_123]
    end
  end
```

Part 3 shows the authorization step in `AuthMiddleware` to keep the diagram short. In the code, the pairing lookup is done by the availability and appointment services, with `req.user` set by the middleware.

### 4.1 Authorization matrix derived from the JWT `role` claim

| Endpoint | ADMIN | INSTRUCTOR | STUDENT |
| :--- | :---: | :---: | :---: |
| `POST /auth/login` | public | public | public |
| `GET /users`, `POST /users` | ✅ | `403` | `403` |
| `POST /assignments` | ✅ | `403` | `403` |
| `GET /availability` | `403` | ✅ own slots | ✅ assigned instructor only |
| `POST /availability` | `403` | ✅ | `403` |
| `DELETE /availability/{id}` | `403` | ✅ own, `AVAILABLE` only | `403` |
| `POST /appointments` | `403` | `403` | ✅ assigned instructor only |

---

## 5. Domain / Class Diagram

The diagram shows the domain entities, their attributes, and how they relate. `Role`, `SlotStatus` and `AppointmentStatus` are the enums defined in `openapi.yaml`. `passwordHash`, `assignedBy`, `assignedAt` and `createdAt` are stored by the backend but never returned by the API.

```mermaid
classDiagram
  direction LR

  class Role {
    <<enumeration>>
    ADMIN
    INSTRUCTOR
    STUDENT
  }

  class SlotStatus {
    <<enumeration>>
    AVAILABLE
    BOOKED
  }

  class AppointmentStatus {
    <<enumeration>>
    SCHEDULED
    CANCELLED
    COMPLETED
  }

  class User {
    +String id
    +String name
    +String email
    -String passwordHash
    +Role role
    +DateTime createdAt
    +hasRole(Role r) bool
  }

  class StudentInstructorPairing {
    +String studentId
    +String instructorId
    +String assignedBy
    +DateTime assignedAt
  }

  class AvailabilitySlot {
    +String id
    +String instructorId
    +DateTime startTime
    +DateTime endTime
    +SlotStatus status
    +isInFuture(DateTime now) bool
    +overlaps(DateTime start, DateTime end) bool
    +isBookable() bool
  }

  class Appointment {
    +String id
    +String availabilityId
    +String studentId
    +String instructorId
    +AppointmentStatus status
    +DateTime createdAt
  }

  User "1" --> "1" Role : has
  User "1 student" -- "0..1" StudentInstructorPairing : is assigned by
  User "1 instructor" -- "0..*" StudentInstructorPairing : teaches
  User "1 instructor" --> "0..*" AvailabilitySlot : publishes
  AvailabilitySlot "1" --> "1" SlotStatus
  AvailabilitySlot "1" -- "0..1" Appointment : reserved by
  User "1 student" --> "0..*" Appointment : books
  Appointment "1" --> "1" AppointmentStatus
```

### 5.1 Relationships and invariants

| Relationship | Multiplicity | Invariant enforced by the backend |
| :--- | :--- | :--- |
| Student to pairing | 1 to 0..1 | A student has at most one active instructor. The pairing document id is the `studentId`, so a new assignment replaces the old one (SRS FR-04). |
| Instructor to pairing | 1 to 0..* | An instructor can teach many students. |
| Pairing roles | - | `studentId` points to a `STUDENT` user and `instructorId` to an `INSTRUCTOR` user. |
| Instructor to slot | 1 to 0..* | `slot.instructorId` always comes from the creating instructor's token. Slots of one instructor never overlap. |
| Slot to appointment | 1 to 0..1 | A slot is `BOOKED` exactly when it has a `SCHEDULED` appointment. Both are written in one transaction (ADR-03). |
| Student to appointment | 1 to 0..* | `appointment.studentId` always comes from the token (NFR-S3). The student must be paired with `slot.instructorId` at booking time. |
| Slot deletion | - | A slot can be deleted only by its owner and only while it is `AVAILABLE`; otherwise `409 SLOT_ALREADY_BOOKED`. |

`Appointment.instructorId` is a denormalised copy of `slot.instructorId`. It lets an instructor list their appointments without reading each slot. The contract does not return it yet.

### 5.2 Firestore persistence mapping

| Entity | Collection | Document id | Indexed query fields |
| :--- | :--- | :--- | :--- |
| `User` | `users` | generated (`usr_…`) | `email` (stored lower-case), `role` |
| Email uniqueness index | `userEmails` | `sha256(email)` | none. Written together with the user in one batch `create()`, which fails with `ALREADY_EXISTS` for a taken email (`409 EMAIL_ALREADY_EXISTS`) |
| `StudentInstructorPairing` | `assignments` | `studentId` | `instructorId` |
| `AvailabilitySlot` | `availabilities` | generated (`avail_…`) | `instructorId` + `startTime`, `status` |
| `Appointment` | `appointments` | generated (`apt_…`) | `studentId`, `instructorId`, `availabilityId` |

---

## 6. Open Points for the Contract and SRS

These do not block implementation. They are listed so that `openapi.yaml`, `SRS.md` and these diagrams stay consistent.

1. **Specific `400` error codes.** The contract's `BadRequest` response has no fixed `code`. The backend will send `VALIDATION_ERROR` for schema failures and proposes `SLOT_IN_PAST`, `INVALID_TIME_RANGE` and `SLOT_OVERLAP` for availability rules, and `ROLE_MISMATCH` for assignments. These should be added to `openapi.yaml` as examples in a later minor version.
2. **Naming in the SRS (PR #61).** The draft SRS uses `slotId`, lowercase enums and `confirmed`. The diagrams follow the contract (`availabilityId`, `AVAILABLE`/`BOOKED`, `SCHEDULED`).
3. **Re-assignment response.** SRS FR-04 allows `200 OK` when an existing pairing is replaced, but the contract only defines `201`. The backend returns `201` for both until the contract changes.
4. **Token issuer.** `Architecture.md` (AuthService) has the API sign its own JWT on `POST /auth/login`, and these diagrams follow that. The draft deployment document (PR #57) names Firebase Authentication as the issuer instead. The team should agree on one before Sprint 3.

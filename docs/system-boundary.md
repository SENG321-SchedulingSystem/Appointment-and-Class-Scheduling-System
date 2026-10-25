# System Boundary Specification

This document defines the components to be included in the initial release (MVP) of the system and the out-of-scope features deferred to subsequent versions.

## 1. In-Scope (Version 1 / MVP)
- **User and Role Management:**
  - Definition of Admin, Instructor, and Student roles in the system.
  - Creation of new users by the Admin (prevention of duplicate registration with the same email).
  - Assignment/association of a student with an authorized instructor by the Admin.
- **Calendar and Availability Management:**
  - Instructors entering forward-looking available lesson hours into the system.
  - Rejection of availability entry for past dates or hours via validation.
- **Appointment and Booking Flow:**
  - Students filtering and listing the available hours of their assigned instructor.
  - Students creating an appointment request for an available slot (`201 Created`).
  - Prevention of booking an already booked or occupied slot via a conflict error (`409 Conflict`).

## 2. Out-of-Scope / Deferred Features
The following features are excluded from the initial release to limit complexity:
- Instant notification delivery via WhatsApp / SMS (in-platform status codes and UI notifications will be used in the first phase).
- Lesson package/balance purchasing and financial payment integrations.
- Live video lesson environment (video conference links will be provided through external tools).
- Past lesson notes, homework upload, and file sharing module.
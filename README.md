# SENG 321 - Appointment and Class Scheduling System

SENG 321 Term Project: A centralized appointment and class scheduling system with role-based access for students and instructors.

## System Vision
For instructors, students, and administrators who need dependable coordination of lesson schedules, the Scheduling System provides current availability, consistent reservation rules, and traceable account management. The first release supports web users and exposes an API contract for implementation and testing.

## System Boundary

```mermaid
flowchart LR
    Admin[Administrator] -->|Manages accounts and assigns roles| System[Scheduling System]
    Instructor[Instructor] -->|Submits availability intervals| System
    Student[Student] -->|Searches availability and requests reservations| System

# CMS Events

Phase 4 introduces first-class events and attendance management behind the disabled-by-default `cms.events` feature flag.

- Draft, published, cancelled, and completed lifecycle states.
- In-person or virtual locations, Nairobi timezone default, schedules, registration windows, and capacity.
- Serializable capacity allocation with automatic waitlisting.
- Unique attendee email per event, optional member linkage, check-in, and no-show tracking.
- Audited event, registration, lifecycle, and attendance mutations.
- Optional `eventId` on legacy Baraza registrations; existing records are preserved and never automatically rewritten.

Apply `prisma/migrations/20260810150000_cms_events/migration.sql` after the first three CMS migrations, verify on an isolated Neon branch, and enable `cms.events` only after RBAC seeding.

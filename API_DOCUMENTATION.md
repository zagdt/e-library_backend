# E-Library API Documentation

**Base URL**: `https://08ca7c9acbee.ngrok-free.app/api/v1` (Default)
**Version**: v1

All API responses generally follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": { ... } // If applicable
}
```

Error responses:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if any
}
```

---

## 1. Authentication (`/auth`)

### POST `/auth/signup`
Register a new user (Student).
**Body:**
```json
{
  "email": "user@vu.edu.ug", // required, valid email
  "password": "Password123!", // required, min 8 chars, 1 upper, 1 lower, 1 number, 1 special
  "name": "John Doe" // required, min 2 chars
}
```

### POST `/auth/login`
**Body:**
```json
{
  "email": "user@vu.edu.ug",
  "password": "Password123!"
}
```
**Response:** Returns `accessToken` and `refreshToken`.

### POST `/auth/refresh`
Refresh access token.
**Body:**
```json
{
  "refreshToken": "..."
}
```

### POST `/auth/logout`
**Auth Required:** Yes
Invalidates the current session/tokens.

### POST `/auth/verify-email`
**Body:**
```json
{
  "token": "verification-token-from-email"
}
```

### POST `/auth/forgot-password`
Request password reset link.
**Body:**
```json
{
  "email": "user@vu.edu.ug"
}
```

### POST `/auth/reset-password`
**Body:**
```json
{
  "token": "reset-token",
  "password": "NewStrongPassword1!"
}
```

### GET `/auth/me`
**Auth Required:** Yes
Get current user profile.

### PATCH `/auth/me`
**Auth Required:** Yes
Update profile.
**Body:**
```json
{
  "name": "Jane Doe" // optional
}
```

### POST `/auth/change-password`
**Auth Required:** Yes
**Body:**
```json
{
  "currentPassword": "OldPassword",
  "newPassword": "NewPassword"
}
```

---

## 2. Resources (`/resources`)

### GET `/resources`
List resources with filtering.
**Query Params:**
- `page` (default 1)
- `limit` (default 20)
- `search` (string)
- `category` (BOOK, JOURNAL, PAPER, MAGAZINE, THESIS, OTHER)
- `department` (string)
- `year` (number)
- `tag` (string)
- `author` (string)
- `accessType` (VIEW_ONLY, DOWNLOADABLE, CAMPUS_ONLY)
- `sortBy` (createdAt, title, downloadCount, viewCount)
- `approvalStatus` (APPROVED, PENDING, REJECTED) - *Admin only can see non-approved*
- `resourceType` (BOOK, JOURNAL, THESIS, MODULE_NOTES, PAST_PAPER, LECTURE_SLIDE, LAB_MANUAL, ASSIGNMENT, OTHER)

### GET `/resources/trending`
Get trending resources based on views/downloads.

### GET `/resources/latest`
Get recently added resources.

### GET `/resources/favorites`
**Auth Required:** Yes
Get user's favorite resources.

### GET `/resources/:id`
Get single resource details.

### POST `/resources`
**Auth Required:** Staff/Admin
**Content-Type:** `multipart/form-data`
**Body:**
- `file`: (File, required for VIEW_ONLY/DOWNLOADABLE) - PDF, EPUB, DOC, PPT
- `coverImage`: (File, optional) - JPG, PNG, WEBP
- `title`: string
- `authors`: string[] (JSON stringified if using FormData)
- `description`: string
- `category`: string (Enum)
- `resourceType`: string (Enum, e.g., MODULE_NOTES)
- `campusLocation`: string (MAIN_CAMPUS, MARKET_PLAZA, ONLINE) - default ONLINE
- `department`: string
- `publicationYear`: number
- `accessType`: string (VIEW_ONLY, DOWNLOADABLE, CAMPUS_ONLY)
- `tags`: string[] (JSON stringified)
- `courseIds`: string[] (JSON stringified IDs of courses this resource belongs to)
- `courseUnitId`: string (ID of course unit)
- `physicalLocation`: string (Required if CAMPUS_ONLY)
- `shelfNumber`: string
- `copies`: number

### PUT `/resources/:id`
**Auth Required:** Staff/Admin
Update resource metadata. Same fields as create (except files are typically handled separately or not updated here).

### DELETE `/resources/:id`
**Auth Required:** Admin
Delete a resource.

### POST `/resources/:id/download`
**Auth Required:** Yes
Get a signed download URL (S3/Cloudinary).

### GET `/resources/:id/preview`
Get a signed preview URL.

### POST `/resources/:id/favorite`
**Auth Required:** Yes
Add resource to favorites.

### DELETE `/resources/:id/favorite`
**Auth Required:** Yes
Remove resource from favorites.

### GET `/resources/:id/is-favorite`
**Auth Required:** Yes
Check if resource is favorited.

---

## 3. Discovery (`/discovery`)
Federated search across external academic databases (OpenAlex, CORE, DOAJ, ERIC, DOAB, Google Scholar).

### GET `/discovery/search`
**Query Params:**
- `q`: Search term (min 2 chars)
- `source`: string or array (openalex, core, doaj, eric, doab, googleScholar)
- `page`: default 1
- `limit`: default 20

### GET `/discovery/sources`
List available external sources.

---

## 4. Courses (`/courses`)

### GET `/courses`
List courses.
**Query Params:**
- `page`, `limit`
- `search` (code or name)
- `department`

### GET `/courses/departments`
Get list of unique departments.

### GET `/courses/:id`
Get course details (including units).

### GET `/courses/:id/resources`
Get resources linked to a course.

### POST `/courses`
**Auth Required:** Admin
**Body:**
```json
{
  "code": "CSC301",
  "name": "Data Structures",
  "department": "Computer Science"
}
```

### PUT `/courses/:id`
**Auth Required:** Admin
Update course details.

### DELETE `/courses/:id`
**Auth Required:** Admin

---

## 5. Course Units (Modules)
Mounted under `/courses`.

### GET `/courses/:courseId/units`
List units for a specific course.

### POST `/courses/:courseId/units`
**Auth Required:** Staff/Admin
Create a unit for a course.
**Body:**
```json
{
  "code": "CSC301.1",
  "name": "Introduction to DS",
  "description": "..."
}
```

### GET `/courses/units/:unitId`
Get unit details and its approved resources.

### GET `/courses/units/:unitId/resources`
Get paginated resources for a unit.

### PUT `/courses/units/:unitId`
**Auth Required:** Staff/Admin
Update unit details.

### DELETE `/courses/units/:unitId`
**Auth Required:** Admin

---

## 6. Requests (`/requests`)

### POST `/requests`
**Auth Required:** Yes
Request a resource not in the library.
**Body:**
```json
{
  "title": "Book Title",
  "reason": "Required for final project..."
}
```

### GET `/requests`
**Auth Required:** Admin? (Check implementation, usually Admin for all, User for own via /my)
List all requests (likely filtered by user or admin access).

### GET `/requests/my`
**Auth Required:** Yes
Get current user's requests.

### GET `/requests/stats`
**Auth Required:** Admin
Get request statistics (pending, resolved, etc).

### GET `/requests/:id`
Get request details.

### PUT `/requests/:id`
**Auth Required:** Admin
Update request status/reply.
**Body:**
```json
{
  "status": "RESOLVED",
  "adminReply": "Available now."
}
```

### POST `/requests/:id/respond`
**Auth Required:** Admin
Respond with structured access info (e.g. external link).

### DELETE `/requests/:id`
**Auth Required:** User (own) or Admin

---

## 7. Notifications (`/notifications`)

### GET `/notifications`
**Auth Required:** Yes
List user notifications.

### GET `/notifications/unread-count`

### PUT `/notifications/read-all`

### DELETE `/notifications/clear-read`

### PUT `/notifications/:id/read`

### DELETE `/notifications/:id`

---

## 8. Search (`/search`)
Internal resource search (optimized).

### GET `/search`
**Query Params:** Same as `/resources` essentially, but strictly for search.

### GET `/search/top-terms`
Get popular search queries.

### GET `/search/suggestions`
Autocomplete suggestions.
**Query Params:** `q`

---

## 9. Analytics (`/analytics`)
**Auth Required:** Admin (All routes)

- GET `/analytics/overview` - Dashboard summary
- GET `/analytics/trends/downloads`
- GET `/analytics/trends/users`
- GET `/analytics/top/resources`
- GET `/analytics/top/search-terms`
- GET `/analytics/distribution/users-by-role`
- GET `/analytics/distribution/resources-by-category`
- GET `/analytics/requests`
- GET `/analytics/report` - Generate full report

---

## 10. Admin (`/admin`)
**Auth Required:** Admin (All routes)

### Resources Approval
- GET `/admin/resources/pending-approval`
- POST `/admin/resources/:id/approve` (Body: `{ "note": "..." }`)
- POST `/admin/resources/:id/reject` (Body: `{ "reason": "..." }`)
- GET `/admin/resources/approval-stats`

### User Management
- GET `/admin/users` (Query: `page`, `limit`, `role`, `search`)
- GET `/admin/users/suspended`
- GET `/admin/users/export`
- GET `/admin/users/:id`
- PUT `/admin/users/:id/role` (Body: `{ "role": "STAFF" }`)
- POST `/admin/users/:id/suspend`
- POST `/admin/users/:id/unsuspend`
- DELETE `/admin/users/:id`
- POST `/admin/users/bulk/roles`
- POST `/admin/users/bulk/delete`

### System
- GET `/admin/metrics` - System health/performance
- GET `/admin/audit-logs` - Filterable audit trail
- GET `/admin/settings` - System settings (e.g. IP ranges)
- PUT `/admin/settings/:key`

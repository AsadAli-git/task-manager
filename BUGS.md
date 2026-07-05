# Known Bugs (for practice purposes)

This file lists all intentional bugs planted in the codebase for the practice exercises.

## Security Bugs
1. `src/controllers/userController.js:8` — JWT secret hardcoded in source code
2. `src/middleware/auth.js:4` — Same hardcoded JWT secret duplicated
3. `src/controllers/userController.js:48` — Login error message reveals whether email exists (user enumeration)
4. `src/controllers/userController.js:62` — No authorization check on delete — any user can delete any other user
5. `src/routes/userRoutes.js:17` — DELETE route missing `adminOnly` middleware
6. `src/models/user.js:34` — bcrypt salt rounds set to 1 (should be 10+)
7. `src/middleware/errorHandler.js:7` — Full stack trace exposed to client in all environments

## Logic Bugs
8. `src/models/task.js:55` — `update()` overwrites entire task instead of merging — loses unspecified fields
9. `src/models/task.js:63` — `filterByStatus()` ignores the status argument and returns all tasks
10. `src/controllers/taskController.js:18` — Uses broken `filterByStatus` without noticing

## Validation Bugs
11. `src/models/task.js:34` — `create()` allows empty or undefined title
12. `src/controllers/taskController.js:27` — `userId` is hardcoded instead of reading from `req.user`
13. `src/controllers/taskController.js:55` — `getMyTasks` also hardcodes userId
14. `src/utils/helpers.js:16` — `sanitizeInput` only strips `<script>` tags, misses other XSS vectors
15. `src/utils/helpers.js:22` — `isValidEmail` only checks for `@`, too permissive

## API Design Bugs
16. `src/controllers/taskController.js:47` — DELETE returns 200 with body instead of 204 No Content
17. `src/routes/taskRoutes.js:10` — GET /tasks is public — should require authentication

## Frontend Bugs
21. `public/app.js:17` — Login response doesn't include user info — name/role faked from email only
22. `public/app.js:143` — `escapeHtml()` misses quote characters — incomplete XSS protection
23. `public/app.js:95` — Status filter on `/tasks?status=` relies on broken backend `filterByStatus`
24. `src/app.js:17` — CORS wildcard (`*`) too permissive — fine for dev, dangerous in production
25. `public/app.js` — No token expiry handling — expired JWT causes silent failures with no re-login prompt

## Test Bugs
18. `tests/task.test.js:14` — Expects `null` but model returns `undefined` for missing task
19. `tests/task.test.js:19` — Test incorrectly asserts empty title should NOT throw
20. `tests/task.test.js:25` — `filterByStatus` test will fail because the model bug is still there

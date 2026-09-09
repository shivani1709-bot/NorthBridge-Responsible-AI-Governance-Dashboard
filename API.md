# NorthBridge REST API

The backend is a local Express service using SQLite. Seed records are development/demo data only.

Run it with `npm run server` (`PORT`, `DB_PATH`, and `CORS_ORIGIN` are supported environment variables). JSON success responses use `{ data }`; errors use `{ error: { message } }`.

| Method | Endpoint | Body/query |
|---|---|---|
| GET, POST | `/api/ai-systems` | `search`, `risk`, `status`; or `{name,owner,risk,status,review?}` |
| GET, PUT, DELETE | `/api/ai-systems/:id` | Partial system fields for PUT |
| GET, POST | `/api/risk-assessments` | `{aiSystemId?,name,category,score,owner,findings?}` |
| GET, PUT, DELETE | `/api/risk-assessments/:id` | Partial assessment fields for PUT |
| GET, POST | `/api/vetting-requests` | `{name,type,submitted,due?}` |
| GET, PUT, DELETE | `/api/vetting-requests/:id` | `{decision}` supports approval/rejection |
| GET, POST | `/api/rai-roles` | `{name,role,area,systems?,status?}` |
| PUT, DELETE | `/api/rai-roles/:id` | Partial role fields |
| GET, POST | `/api/escalations` | `{system,summary,severity,owner,due?}` |
| GET, PUT | `/api/escalations/:id` | `{status,resolution,...}` supports resolution |
| GET | `/api/roadmap` | Persisted milestones and calculated progress |
| PUT | `/api/roadmap/milestones/:id` | `{completed:boolean}` |
| GET | `/api/dashboard` | Database-calculated dashboard counts |
| GET | `/api/exports/kpi.csv` | CSV generated from persisted assessments |

Validation is enforced with Zod at the API boundary. Responses use 422 for invalid input, 404 for missing records, 409 for uniqueness conflicts, 500 for unexpected errors, and never expose stack traces.

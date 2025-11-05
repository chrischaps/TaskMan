# Test User Credentials

These credentials are created when you run the database seed script.

## Test Users

| Username | Email | Password | Starting Tokens | Notes |
|----------|-------|----------|----------------|-------|
| **alice** | alice@test.com | `password123` | 100 | Task board unlocked |
| **bob** | bob@test.com | `password123` | 100 | Task board unlocked |
| **charlie** | charlie@test.com | `password123` | 100 | Task board unlocked |

## System User

| Username | Email | Password | Purpose |
|----------|-------|----------|---------|
| **system** | system@taskman.local | N/A | Creates tutorial tasks (not for login) |

## Reseeding the Database

To reset and reseed the database with fresh test users and tasks:

```powershell
cd backend
.\reseed.ps1
```

Or manually:
```bash
cd backend
npx prisma migrate reset --force --skip-seed
npx prisma generate
npm run prisma:seed
```

## Notes

- All test users start at **Level 1**
- All test users have **task board unlocked** for easier testing (skips tutorial requirement)
- All test users start with **100 tokens** to test task creation
- You can log in with either username OR email

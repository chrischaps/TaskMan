# TaskMan Database Reseed Script
# This script resets the database, runs migrations, and seeds test data

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TaskMan Database Reseed Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Reset the database
Write-Host "[1/3] Resetting database..." -ForegroundColor Yellow
npx prisma migrate reset --force --skip-seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database reset failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database reset complete" -ForegroundColor Green
Write-Host ""

# Step 2: Regenerate Prisma Client
Write-Host "[2/3] Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma Client regenerated" -ForegroundColor Green
Write-Host ""

# Step 3: Run seed script
Write-Host "[3/3] Seeding database..." -ForegroundColor Yellow
npm run prisma:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database seeding failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database seeded successfully" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database reseed complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

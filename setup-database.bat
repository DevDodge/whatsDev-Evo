@echo off
echo ========================================
echo PostgreSQL Database Setup
echo ========================================
echo.
echo PostgreSQL is running on port: 10034
echo.
echo Please update the password in:
echo   evolution-api\.env
echo.
echo Current connection string:
echo   postgresql://postgres:password@localhost:10034/evolution
echo.
echo ========================================
echo Creating database 'evolution'...
echo ========================================
echo.

REM Attempt to create database (you may need to provide the correct password)
psql -U postgres -h localhost -p 10034 -c "CREATE DATABASE evolution;" 2>nul

echo.
echo If database already exists, you'll see an error (ignore it).
echo.
echo Next: Update the password in evolution-api\.env
echo Then run: npm run db:deploy:win
echo.
pause

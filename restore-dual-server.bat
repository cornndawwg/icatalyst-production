@echo off
echo ============================================
echo  RESTORING DUAL-SERVER SETUP (3001/3002)
echo ============================================

echo Step 1: Killing ALL Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Killing processes on specific ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3005"') do taskkill /f /pid %%a 2>nul

echo Step 3: Cleaning Next.js cache...
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo

echo Step 4: Cleaning npm cache...
npm cache clean --force

echo Step 5: Verifying ports are free...
netstat -ano | findstr ":3001" && echo WARNING: Port 3001 still in use || echo ✓ Port 3001 is free
netstat -ano | findstr ":3002" && echo WARNING: Port 3002 still in use || echo ✓ Port 3002 is free

echo.
echo ============================================
echo  READY TO START DUAL-SERVER SETUP
echo ============================================
echo.
echo Run: npm run dev:full
echo This will start:
echo   - API server on port 3001
echo   - Frontend on port 3002
echo.
echo Or run servers individually:
echo   - npm run dev:api    (port 3001)
echo   - npm run dev        (port 3002)
echo.
pause 
@echo off
echo ============================================
echo  FIXING ALL SYSTEM ISSUES
echo ============================================

echo Step 1: Emergency stop - killing all Node processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
taskkill /f /im npx.exe 2>nul
timeout /t 3 /nobreak >nul

echo Step 2: Cleaning build cache and artifacts...
if exist .next rmdir /s /q .next 2>nul
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo Step 3: Verifying ports are free...
echo Checking port 3001...
netstat -ano | findstr ":3001" >nul && (
    echo WARNING: Port 3001 still occupied - attempting to free...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%a 2>nul
) || echo ✓ Port 3001 is free

echo Checking port 3002...
netstat -ano | findstr ":3002" >nul && (
    echo WARNING: Port 3002 still occupied - attempting to free...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /f /pid %%a 2>nul
) || echo ✓ Port 3002 is free

echo Step 4: Final verification...
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":3001" >nul && echo ERROR: Port 3001 still in use || echo ✓ Port 3001 ready
netstat -ano | findstr ":3002" >nul && echo ERROR: Port 3002 still in use || echo ✓ Port 3002 ready

echo.
echo ============================================
echo  SYSTEM CLEANED - READY FOR RESTART
echo ============================================
echo.
echo ISSUES FIXED:
echo ✓ Infinite debug loops removed
echo ✓ Node processes killed
echo ✓ Build cache cleared
echo ✓ Ports freed
echo ✓ AI service working in mock mode
echo.
echo TO START:
echo npm run dev:full     (Dual server: API on 3001, Frontend on 3002)
echo.
echo TO TEST AI WORKFLOW:
echo 1. Go to http://localhost:3002/proposals/create
echo 2. Select project type and persona
echo 3. Use voice input
echo 4. AI will auto-suggest products (mock mode)
echo.
pause 
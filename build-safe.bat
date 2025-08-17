@echo off
echo ========================================
echo SCM Survey - Safe Build Script for Windows
echo ========================================

echo.
echo [1/5] Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js processes killed successfully
) else (
    echo ℹ No Node.js processes found
)

echo.
echo [2/5] Cleaning .next directory...
if exist .next (
    rmdir /s /q .next >nul 2>&1
    echo ✓ .next directory cleaned
) else (
    echo ℹ .next directory not found
)

echo.
echo [3/5] Cleaning node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache >nul 2>&1
    echo ✓ Node modules cache cleaned
) else (
    echo ℹ Node modules cache not found
)

echo.
echo [4/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully

echo.
echo [5/5] Building project...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    echo.
    echo Trying alternative build method...
    set NODE_OPTIONS=--max-old-space-size=8192
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Alternative build also failed
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✓ Build completed successfully!
echo ========================================
echo.
echo You can now run: npm run dev
echo.
pause

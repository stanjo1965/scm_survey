@echo off
echo SCM Survey 개발 서버 시작 중...
echo.

REM 기존 Node.js 프로세스 종료
echo 기존 프로세스 정리 중...
taskkill /f /im node.exe >nul 2>&1

REM 포트 3000 사용 프로세스 확인 및 종료
echo 포트 3000 정리 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM 캐시 정리
echo 캐시 정리 중...
if exist .next rmdir /s /q .next >nul 2>&1
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1

REM 잠시 대기
timeout /t 2 /nobreak >nul

REM 개발 서버 시작
echo 개발 서버 시작 중...
echo 브라우저에서 http://localhost:3000 으로 접속하세요.
echo.
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev:safe

pause 
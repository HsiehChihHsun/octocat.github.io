@echo off
echo Starting deployment to GitHub...
echo.

:: Navigate to the script's directory
cd /d "%~dp0"

:: Add all changes
echo Adding files...
git add .

:: Commit with timestamp
echo Committing changes...
set timestamp=%date% %time%
git commit -m "Update website content - %timestamp%"

:: Push to GitHub
echo Pushing to GitHub...
git push origin main

echo.
if %errorlevel% equ 0 (
    echo Deployment Successful!
) else (
    echo Deployment Failed. Please check the error messages above.
)

echo.
pause

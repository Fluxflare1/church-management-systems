@echo off
echo ========================================
echo    THOGMi Platform Setup - Windows
echo ========================================
echo.

echo Step 1: Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop and ensure it's running.
    pause
    exit /b 1
)
echo ✓ Docker is available

echo.
echo Step 2: Setting up environment file...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo ✓ .env file created
) else (
    echo .env file already exists
)

echo.
echo Step 3: Building and starting containers...
echo This may take several minutes...
docker-compose down
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo ERROR: Docker compose failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo Step 4: Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 5: Running database migrations...
docker-compose exec backend python manage.py migrate

echo.
echo Step 6: Creating superuser...
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@thogmi.org', 'admin123')
    print('✓ Superuser created')
    print('Username: admin')
    print('Password: admin123')
    print('Email: admin@thogmi.org')
else:
    print('✓ Superuser already exists')
"

echo.
echo Step 7: Collecting static files...
docker-compose exec backend python manage.py collectstatic --noinput

echo.
echo ========================================
echo           SETUP COMPLETE!
echo ========================================
echo.
echo Your THOGMi platform is now running!
echo.
echo Access points:
echo Frontend Website: http://localhost:3000
echo Backend API:      http://localhost:8000
echo Admin Panel:      http://localhost:8000/admin
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin123
echo Email:    admin@thogmi.org
echo.
echo To stop the platform, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.
pause

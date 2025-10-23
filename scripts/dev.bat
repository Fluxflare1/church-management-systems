@echo off
echo Starting THOGMi Platform Development Environment...

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

:: Copy environment file if it doesn't exist
if not exist ".env" (
    echo Copying .env.example to .env...
    copy .env.example .env
    echo Please update .env with your configuration before continuing.
    pause
    exit /b 1
)

:: Build and start containers
echo Building and starting Docker containers...
docker-compose up -d --build

:: Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:: Run database migrations
echo Running database migrations...
docker-compose exec backend python manage.py migrate

:: Create superuser if it doesn't exist
echo Creating superuser...
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@thogmi.org', 'admin123')
    print('Superuser created: username=admin, password=admin123')
else:
    print('Superuser already exists')
"

:: Collect static files
echo Collecting static files...
docker-compose exec backend python manage.py collectstatic --noinput

echo.
echo 🎉 Development environment is ready!
echo.
echo Access the applications at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Admin Panel: http://localhost:8000/admin
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin123
echo.
pause

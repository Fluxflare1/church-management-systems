Write-Host "Starting THOGMi Platform Development Environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info *>$null
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Copy environment file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please update .env with your configuration before continuing." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Build and start containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Green
docker-compose up -d --build

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Green
docker-compose exec backend python manage.py migrate

# Create superuser
Write-Host "Creating superuser..." -ForegroundColor Green
docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@thogmi.org

# Set superuser password
Write-Host "Setting superuser password..." -ForegroundColor Green
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print('Superuser created: username=admin, password=admin123')
"

# Collect static files
Write-Host "Collecting static files..." -ForegroundColor Green
docker-compose exec backend python manage.py collectstatic --noinput

Write-Host "`n🎉 Development environment is ready!" -ForegroundColor Green
Write-Host "`nAccess the applications at:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "Admin Panel: http://localhost:8000/admin" -ForegroundColor White
Write-Host "`nAdmin credentials:" -ForegroundColor Cyan
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host "`n"
Read-Host "Press Enter to continue"

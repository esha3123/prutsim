# YAWS - Yet Another Website of Saket

A Flask-based web application with API endpoints, authentication, and frontend components.

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Standard Setup](#standard-setup)
  - [Docker Setup](#docker-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Development Server](#development-server)
  - [Production Server](#production-server)
- [Database Management](#database-management)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Project Overview

YAWS is a Flask web application that provides a structured platform with API endpoints, authentication system, and frontend interfaces. The application is organized using Flask blueprints for better code organization and maintainability.

## Prerequisites

### Windows and Linux
- Python 3.8+ installed
- pip (Python package installer)
- Virtual environment tool (venv or conda)
- Git (optional, for cloning the repository)

### Docker Setup (Optional)
- Docker installed
- Docker Compose installed (optional, for multi-container setups)

## Installation

### Standard Setup

#### Clone the repository (if using Git):
```bash
git clone <repository-url>
cd YAWS
```

#### Windows Setup
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Linux Setup
```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Docker Setup

To run the application using Docker:

1. Build the Docker image:
```bash
docker build -t yaws-app .
```

2. Run the container:
```bash
docker run -p 5000:5000 yaws-app
```

## Configuration

The application uses environment variables for configuration:

- `FLASK_ENV`: Set to `development` or `production` (default: `development`)
- `FLASK_APP`: Set to `manage.py`
- `DATABASE_URL`: Database connection string

Windows:
```cmd
set FLASK_ENV=development
set FLASK_APP=manage.py
```

Linux/macOS:
```bash
export FLASK_ENV=development
export FLASK_APP=manage.py
```

Docker:
These variables can be passed to the Docker container using the `-e` flag or through a docker-compose.yml file.

## Running the Application

### Development Server

#### Windows and Linux (Standard Setup)
```bash
# Make sure your virtual environment is activated
# Then run:
python run.py
```

Alternatively, you can use Flask's built-in development server:
```bash
flask run --host=0.0.0.0 --port=5000
```

The development server will be available at: http://localhost:5000

### Production Server

For production deployments, it's recommended to use a production WSGI server like Gunicorn.

#### Linux
```bash
# Install Gunicorn (if not already in requirements.txt)
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
```

#### Windows (using waitress as Gunicorn is not supported on Windows)
```bash
# Install waitress
pip install waitress

# Run with waitress
waitress-serve --port=5000 "app:create_app('production')"
```

#### Docker (Production Mode)
```bash
docker run -p 5000:5000 -e FLASK_ENV=production yaws-app
```

## Database Management

The application uses Flask-Migrate (Alembic) for database migrations.

Initialize migrations (first time only):
```bash
flask db init
```

Create a new migration:
```bash
flask db migrate -m "Migration message"
```

Apply migrations:
```bash
flask db upgrade
```

Create database tables directly (alternative to migrations):
```bash
flask create_tables
```

Drop all database tables:
```bash
flask drop_tables
```

## Project Structure

```
YAWS/
├── app/                    # Main application package
│   ├── api/                # API blueprint and routes
│   ├── auth/               # Authentication blueprint and routes
│   ├── config/             # Configuration settings
│   ├── frontend/           # Frontend blueprint and routes
│   ├── models/             # Database models
│   ├── static/             # Static assets (CSS, JS, images)
│   ├── templates/          # HTML templates
│   └── utils/              # Utility functions
├── migrations/             # Database migration files
├── manage.py               # Management script
├── run.py                  # Application entry point
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

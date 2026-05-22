# Use Python 3.8 as the base image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=manage.py \
    FLASK_ENV=production

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# For production, add Gunicorn
RUN pip install --no-cache-dir gunicorn

# Copy the application code
COPY . .

# Expose port
EXPOSE 5000

# Command to run the application
# For development:
# CMD ["python", "run.py"]
# For production:
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app('production')"]
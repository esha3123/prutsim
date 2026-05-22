import multiprocessing

# Server socket
bind = "0.0.0.0:5000"
backlog = 2048

# Worker processes - more conservative for Render
workers = 2  # Use a fixed small number for Render's free tier
worker_class = 'sync'
worker_connections = 1000
timeout = 60  # Longer timeout for database operations
keepalive = 2
max_requests = 1000  # Restart workers after this many requests
max_requests_jitter = 50  # Add jitter to prevent all workers restarting at once

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'yaws'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None

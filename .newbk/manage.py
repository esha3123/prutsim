import os
from flask_migrate import Migrate
from app import create_app
from app.models.models import db

# Get environment from ENV variable or use development by default
environment = os.environ.get('FLASK_ENV', 'development')
app = create_app(environment)

migrate = Migrate(app, db)

@app.cli.command("create_tables")
def create_tables():
    """Create database tables."""
    with app.app_context():
        db.create_all()

@app.cli.command("drop_tables")
def drop_tables():
    """Drop all database tables."""
    with app.app_context():
        db.drop_all()

if __name__ == '__main__':
    app.run()
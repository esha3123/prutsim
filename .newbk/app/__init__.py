from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
import os
from app.config.config import config
from app.models.models import db

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    Migrate(app, db)
    
    # Register blueprints
    from app.api import api_bp
    from app.auth import auth_bp
    from app.frontend import frontend_bp
    
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(frontend_bp)
    
    # Try to create database tables, with different error handling for production vs development
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Error creating database tables: {str(e)}")
            # Only raise the error in development mode
            if app.config.get('ENV') != 'production' and app.config.get('DEBUG'):
                raise
            # In production, we'll continue without database tables
            # They should be created via migrations
    
    # Setup static file serving for uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    return app

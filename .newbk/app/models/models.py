from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import re

db = SQLAlchemy()

class Notice(db.Model):
    __tablename__ = 'yaws2_notices'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    date_uploaded = db.Column(db.DateTime, default=datetime.utcnow)
    filename = db.Column(db.String(255))  # Store the filename separately
    notice_type = db.Column(db.String(50), default='general')  # 'general' or 'exam'
    
    # Add data validation
    def __init__(self, title, url, filename=None, notice_type='general'):
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if not url or len(url.strip()) == 0:
            raise ValueError("URL cannot be empty")
        # Sanitize inputs
        self.title = re.sub(r'[<>]', '', title.strip())
        self.url = url.strip()
        self.filename = filename
        self.notice_type = notice_type.strip() if notice_type else 'general'
        
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'date_uploaded': self.date_uploaded.isoformat(),
            'filename': self.filename,
            'notice_type': self.notice_type
        }

class Image(db.Model):
    __tablename__ = 'yaws2_images'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False, default='general')  # e.g., 'cultural', 'sports', etc.
    date_uploaded = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, title, filename, category='general', description=None):
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if not filename or len(filename.strip()) == 0:
            raise ValueError("Filename cannot be empty")
        
        # Sanitize inputs
        self.title = re.sub(r'[<>]', '', title.strip())
        self.filename = filename.strip()
        self.category = re.sub(r'[<>]', '', category.strip())
        self.description = description.strip() if description else None
        
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'filename': self.filename,
            'category': self.category,
            'date_uploaded': self.date_uploaded.isoformat(),
            'url': f'/api/uploads/images/{self.filename}'
        }

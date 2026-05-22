from flask import current_app
import os
from werkzeug.utils import secure_filename

def allowed_file(filename, extensions=None):
    """
    Check if the uploaded file has an allowed extension
    
    Args:
        filename (str): The name of the file to check
        extensions (list, optional): List of allowed extensions. If None, uses app config.
    
    Returns:
        bool: True if the file has an allowed extension, False otherwise
    """
    if not filename or '.' not in filename:
        return False
        
    ext = filename.rsplit('.', 1)[1].lower()
    
    if extensions:
        return ext in extensions
    else:
        return ext in current_app.config['ALLOWED_EXTENSIONS']

def generate_unique_filename(filename):
    """Generate a unique filename if the original already exists"""
    filename = secure_filename(filename)
    base, ext = os.path.splitext(filename)
    counter = 1
    
    while os.path.exists(os.path.join(current_app.config['UPLOAD_FOLDER'], filename)):
        filename = f"{base}_{counter}{ext}"
        counter += 1
        
    return filename

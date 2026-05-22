from flask import Blueprint, request, jsonify, current_app, send_file, session
from app.models.models import db, Notice, Image
from app.utils.helpers import allowed_file, generate_unique_filename
from werkzeug.security import safe_join
import os
from werkzeug.utils import secure_filename
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Combined route for all notices with optional type filtering
@api_bp.route('/notices', methods=['GET'])
def get_notices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    notice_type = request.args.get('type')
    
    # Build query based on parameters
    query = Notice.query
    
    # Filter by type if specified
    if notice_type:
        query = query.filter_by(notice_type=notice_type)
    
    # Apply sorting and pagination
    pagination = query.order_by(Notice.date_uploaded.desc()).paginate(page=page, per_page=per_page)
    notices = pagination.items
    
    notice_list = []
    for notice in notices:
        notice_data = {
            'id': notice.id,
            'title': notice.title,
            'url': notice.url,
            'date_uploaded': notice.date_uploaded.isoformat() if notice.date_uploaded else None,
            'notice_type': notice.notice_type
        }
        notice_list.append(notice_data)
    
    return jsonify({
        'notices': notice_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })

# For backward compatibility - redirect to main notices route
@api_bp.route('/notices/general', methods=['GET'])
def get_general_notices():
    return get_notices()

# For backward compatibility - redirect to main notices route
@api_bp.route('/notices/exam', methods=['GET'])
def get_exam_notices():
    return get_notices()

@api_bp.route('/notices', methods=['POST'])
def add_notice():
    """
    Add a new notice
    ---
    parameters:
      - name: file
        in: formData
        type: file
        description: PDF file to upload
      - name: title
        in: formData
        type: string
        description: Notice title
      - name: notice_type
        in: formData
        type: string
        description: Notice type (general or exam)
      - name: url
        in: formData
        type: string
        description: URL (if no file is uploaded)
    responses:
      201:
        description: Notice created successfully
      400:
        description: Bad request
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        # Check if file is uploaded
        has_file = 'file' in request.files and request.files['file'] and request.files['file'].filename
        
        # Check if URL is provided in form data
        url_in_form = 'url' in request.form and request.form['url'].strip()
        
        # Get notice type (default to general if not provided)
        notice_type = request.form.get('notice_type', 'general')
        if notice_type not in ['general', 'exam']:
            notice_type = 'general'  # Default to general if invalid type
        
        # If neither file nor URL is provided
        if not has_file and not url_in_form and request.content_type != 'application/json':
            return jsonify({'error': 'Missing data', 'message': 'Either file upload or URL is required'}), 400
        
        if has_file:
            file = request.files['file']
            if allowed_file(file.filename):
                filename = generate_unique_filename(file.filename)
                
                filepath = safe_join(current_app.config['UPLOAD_FOLDER'], filename)
                if not filepath:
                    return jsonify({'error': 'Invalid file path', 'message': 'Security issue with file path'}), 400
                    
                file.save(filepath)
                title = request.form.get('title', filename)
                # Store only filename in URL, not full path
                new_notice = Notice(title=title, url=f'/uploads/{filename}', filename=filename, notice_type=notice_type)
                db.session.add(new_notice)
                db.session.commit()
                return jsonify({'success': True, 'message': 'Notice added successfully', 'notice': new_notice.to_dict()}), 201
            return jsonify({'error': 'Invalid file', 'message': 'Invalid file format'}), 400
        
        # Handle URL submission either from form or JSON
        if url_in_form:
            title = request.form.get('title', '')
            url = request.form['url']
            
            # Validate URL format
            if not url.startswith(('http://', 'https://', '/uploads/')):
                return jsonify({'error': 'Invalid URL', 'message': 'Invalid URL format'}), 400
                
            new_notice = Notice(title=title, url=url, notice_type=notice_type)
            db.session.add(new_notice)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Notice added successfully', 'notice': new_notice.to_dict()}), 201
            
        # Handle JSON submission
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Missing data', 'message': 'Title required'}), 400
        
        if 'url' not in data or not data['url']:
            return jsonify({'error': 'Missing data', 'message': 'URL required when not uploading a file'}), 400
            
        # Validate URL format
        if not data['url'].startswith(('http://', 'https://', '/uploads/')):
            return jsonify({'error': 'Invalid URL', 'message': 'Invalid URL format'}), 400
            
        # Get notice type from JSON data
        notice_type = data.get('notice_type', 'general')
        if notice_type not in ['general', 'exam']:
            notice_type = 'general'  # Default to general if invalid type
            
        new_notice = Notice(title=data['title'], url=data['url'], notice_type=notice_type)
        db.session.add(new_notice)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Notice added successfully', 'notice': new_notice.to_dict()}), 201
        
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/notices/<int:notice_id>', methods=['DELETE'])
def delete_notice(notice_id):
    """
    Delete a notice
    ---
    parameters:
      - name: notice_id
        in: path
        type: integer
        required: true
        description: Notice ID to delete
    responses:
      200:
        description: Notice deleted successfully
      401:
        description: Unauthorized
      404:
        description: Notice not found
      500:
        description: Server error
    """
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        notice = Notice.query.get_or_404(notice_id)
        
        # Delete file if it exists
        if notice.filename:
            filepath = safe_join(current_app.config['UPLOAD_FOLDER'], notice.filename)
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                
        db.session.delete(notice)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Notice deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve uploaded files
    ---
    parameters:
      - name: filename
        in: path
        type: string
        required: true
        description: File name to retrieve
    responses:
      200:
        description: File content
      400:
        description: Invalid filename
      404:
        description: File not found
      500:
        description: Error accessing file
    """
    # Sanitize filename and prevent directory traversal
    filename = secure_filename(filename)
    if not filename:
        return jsonify({'error': 'Invalid filename', 'message': 'Invalid filename'}), 400
        
    try:
        filepath = safe_join(current_app.config['UPLOAD_FOLDER'], filename)
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'File not found', 'message': 'File not found'}), 404
            
        return send_file(filepath)
    except Exception as e:
        return jsonify({'error': 'File access error', 'message': str(e)}), 500

@api_bp.route('/images', methods=['POST'])
def add_image():
    """
    Add a new image
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: Image file to upload
      - name: title
        in: formData
        type: string
        required: true
        description: Image title
      - name: category
        in: formData
        type: string
        required: true
        description: Image category (e.g., cultural, sports)
      - name: description
        in: formData
        type: string
        description: Image description (optional)
    responses:
      201:
        description: Image created successfully
      400:
        description: Bad request
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    # Check if user is logged in as admin
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        # Check if file is uploaded
        if 'file' not in request.files or not request.files['file'] or not request.files['file'].filename:
            return jsonify({'error': 'Missing file', 'message': 'Image file is required'}), 400
            
        file = request.files['file']
        # Check allowed image formats
        if not allowed_file(file.filename, ['jpg', 'jpeg', 'png', 'gif']):
            return jsonify({'error': 'Invalid file', 'message': 'Invalid image format. Allowed formats: jpg, jpeg, png, gif'}), 400
            
        # Get form data
        title = request.form.get('title', '')
        if not title:
            return jsonify({'error': 'Missing data', 'message': 'Title is required'}), 400
            
        category = request.form.get('category', 'general')
        description = request.form.get('description', '')
        
        # Generate unique filename and save file
        filename = generate_unique_filename(file.filename)
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'images', category)
        
        # Create category folder if it doesn't exist
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = safe_join(upload_folder, filename)
        if not filepath:
            return jsonify({'error': 'Invalid file path', 'message': 'Security issue with file path'}), 400
            
        file.save(filepath)
        
        # Create new image record in database
        new_image = Image(
            title=title,
            filename=f"{category}/{filename}",
            category=category,
            description=description
        )
        db.session.add(new_image)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Image added successfully', 
            'image': new_image.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/images', methods=['GET'])
def get_images():
    """
    Get paginated images with optional category filter
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: per_page
        in: query
        type: integer
        default: 12
        description: Items per page
      - name: category
        in: query
        type: string
        description: Filter by category
    responses:
      200:
        description: A list of images
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    
    query = Image.query
    
    if category:
        query = query.filter(Image.category == category)
    
    query = query.order_by(Image.date_uploaded.desc())
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    images = pagination.items
    
    return jsonify({
        'images': [image.to_dict() for image in images],
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
        'page': page,
        'pages': pagination.pages,
        'total': pagination.total
    })

@api_bp.route('/images/categories', methods=['GET'])
def get_image_categories():
    """
    Get all available image categories
    ---
    responses:
      200:
        description: A list of image categories
    """
    # Get distinct categories from database
    categories = db.session.query(Image.category).distinct().all()
    return jsonify({
        'categories': [category[0] for category in categories]
    })

@api_bp.route('/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    """
    Delete an image
    ---
    parameters:
      - name: image_id
        in: path
        type: integer
        required: true
        description: Image ID to delete
    responses:
      200:
        description: Image deleted successfully
      401:
        description: Unauthorized
      404:
        description: Image not found
      500:
        description: Server error
    """
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized', 'message': 'Login required'}), 401
        
    try:
        image = Image.query.get_or_404(image_id)
        
        # Delete file from filesystem
        filepath = safe_join(current_app.config['UPLOAD_FOLDER'], 'images', image.filename)
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
            
        db.session.delete(image)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Image deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@api_bp.route('/uploads/images/<path:filename>')
def uploaded_image(filename):
    """
    Serve uploaded image files
    ---
    parameters:
      - name: filename
        in: path
        type: string
        required: true
        description: Image filename to retrieve (can include category path)
    responses:
      200:
        description: Image file
      400:
        description: Invalid filename
      404:
        description: File not found
      500:
        description: Error accessing file
    """
    # Prevent directory traversal
    if '..' in filename or filename.startswith('/'):
        return jsonify({'error': 'Invalid filename', 'message': 'Invalid filename'}), 400
        
    try:
        # Split filename into category and actual filename if needed
        path_parts = filename.split('/')
        if len(path_parts) > 1:
            # If path contains category subdirectory
            filepath = safe_join(current_app.config['UPLOAD_FOLDER'], 'images', filename)
        else:
            # Default to general category if no category in path
            filepath = safe_join(current_app.config['UPLOAD_FOLDER'], 'images', 'general', filename)
            
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'File not found', 'message': 'Image not found'}), 404
            
        return send_file(filepath)
    except Exception as e:
        return jsonify({'error': 'File access error', 'message': str(e)}), 500

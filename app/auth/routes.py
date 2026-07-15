from flask import Blueprint, request, session, redirect, url_for, render_template, current_app, flash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == current_app.config['ADMIN_USERNAME'] and password == current_app.config['ADMIN_PASSWORD']:
            session['logged_in'] = True
            flash('Login successful', 'success')
            return redirect(url_for('auth.admin_panel'))
        flash('Invalid credentials', 'error')
        return render_template('auth/login.html', error='Invalid credentials')
    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    """Handle user logout"""
    session.pop('logged_in', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/admin')
def admin_panel():
    """Display admin panel"""
    if not session.get('logged_in'):
        flash('Please login first', 'warning')
        return redirect(url_for('auth.login'))
    return render_template('auth/admin.html')

@auth_bp.route('/staff-login', methods=['GET', 'POST'])
def staff_login():
    """Handle staff login"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == current_app.config['STAFF_USERNAME'] and password == current_app.config['STAFF_PASSWORD']:
            session['staff_logged_in'] = True
            flash('Staff login successful', 'success')
            return redirect(url_for('auth.staff_admin'))
        flash('Invalid credentials', 'error')
        return render_template('auth/staff-login.html', error='Invalid credentials')
    return render_template('auth/staff-login.html')

@auth_bp.route('/staff-admin')
def staff_admin():
    """Display staff admin panel"""
    if not session.get('staff_logged_in'):
        flash('Please login first', 'warning')
        return redirect(url_for('auth.staff_login'))
    return render_template('auth/staff-admin.html')

@auth_bp.route('/staff-logout')
def staff_logout():
    """Handle staff logout"""
    session.pop('staff_logged_in', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('auth.staff_login'))


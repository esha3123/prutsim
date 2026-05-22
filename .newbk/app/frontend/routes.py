from flask import Blueprint, request, session, redirect, url_for, render_template, current_app, flash

frontend_bp = Blueprint('frontend', __name__)

@frontend_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@frontend_bp.route('/student/<string:subpath>', methods=['GET'])
def student(subpath):
    try:
        return render_template(f'student/{subpath}.html')
    except:
        return render_template('404.html')
    
@frontend_bp.route('/about/<string:subpath>', methods=['GET'])
def about(subpath):
    try:
        return render_template(f'about/{subpath}.html')
    except:
        return render_template('404.html')
@frontend_bp.route('/rnd/<string:subpath>', methods=['GET'])
def rnd(subpath):
    try:
        return render_template(f'rnd/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/academics/<string:subpath>', methods=['GET'])
def academics(subpath):
    try:
        return render_template(f'academics/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/library/<string:subpath>', methods=['GET'])
def library(subpath):
    try:
        if subpath == 'notices':
            # Import needed for notices
            import requests
            from flask import current_app
            
            # Fetch general notices from our API
            api_url = f"{request.url_root}api/notices?type=general"
            response = requests.get(api_url)
            notices = []
            
            if response.status_code == 200:
                data = response.json()
                notices = data.get('notices', [])
            
            return render_template(f'library/{subpath}.html', notices=notices)
        else:
            return render_template(f'library/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/extension/<string:subpath>', methods=['GET'])
def extension(subpath):
    try:
        return render_template(f'extension/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/examination/<string:subpath>', methods=['GET'])
def examination(subpath):
    try:
        if subpath == 'notices':
            # Import needed for notices
            import requests
            from flask import current_app
            
            # Fetch examination notices from our API
            api_url = f"{request.url_root}api/notices/exam"
            response = requests.get(api_url)
            notices = []
            
            if response.status_code == 200:
                data = response.json()
                notices = data.get('notices', [])
            
            return render_template(f'examination/{subpath}.html', notices=notices)
        else:
            return render_template(f'examination/{subpath}.html')
    except Exception as e:
        current_app.logger.error(f"Error in examination route: {str(e)}")
        return render_template('404.html')

@frontend_bp.route('/feedback/<string:subpath>', methods=['GET'])
def feedback(subpath):
    try:
        return render_template(f'feedback/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/more/<string:subpath>', methods=['GET'])
def more(subpath):
    try:
        return render_template(f'more/{subpath}.html')
    except:
        return render_template('404.html')

@frontend_bp.route('/<string:subpath>', methods=['GET'])
def facu(subpath):
    try:
        return render_template(f'facu/{subpath}.html')
    except:
        return render_template('404.html')

# NAAC Page Routes - Each section gets its own URL
@frontend_bp.route('/naac', methods=['GET'])
def naac():
    return render_template('facu/naac.html', active_section="naac-dvv")

@frontend_bp.route('/naac/dvv', methods=['GET'])
def naac_dvv():
    return render_template('facu/naac.html', active_section="naac-dvv")

@frontend_bp.route('/naac/appeal', methods=['GET'])
def naac_appeal():
    return render_template('facu/naac.html', active_section="naac-appeal")

@frontend_bp.route('/naac/iqac', methods=['GET'])
def naac_iqac():
    return render_template('facu/naac.html', active_section="iqac")

@frontend_bp.route('/naac/strategic-plan', methods=['GET'])
def naac_strategic_plan():
    return render_template('facu/naac.html', active_section="strategic-plan")

@frontend_bp.route('/naac/aqar', methods=['GET'])
def naac_aqar():
    return render_template('facu/naac.html', active_section="aqar")

@frontend_bp.route('/naac/iiqa', methods=['GET'])
def naac_iiqa():
    return render_template('facu/naac.html', active_section="iiqa")

@frontend_bp.route('/naac/ssr', methods=['GET'])
def naac_ssr():
    return render_template('facu/naac.html', active_section="ssr")

@frontend_bp.route('/naac/criteria-docs', methods=['GET'])
def naac_criteria_docs():
    return render_template('facu/naac.html', active_section="criteria-docs")

@frontend_bp.route('/naac/institutional', methods=['GET'])
def naac_institutional():
    return render_template('facu/naac.html', active_section="institutional")

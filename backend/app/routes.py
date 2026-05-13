# Define all your Flask routes (API endpoints)
from flask import Blueprint, request, jsonify, send_file, current_app
from functools import wraps

from firebase_admin import auth, firestore
import io
import zipfile
import os
import tempfile
import shutil
import pandas as pd
from app.models import UserSignUp, SurveyResponse

from app.utils import SurveyAnalyzer, load_responses_from_firestore, save_graphs_to_pdf, clean_firestore_responses
from app.extensions import limiter

main = Blueprint('main', __name__)

ALLOWED_EMAIL_DOMAIN = 'vanalen.org'

VALID_INSTALLATION_IDS = {'common-ground', 'breathing-pavilion'}

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Missing authorization token"}), 401
        try:
            auth.verify_id_token(token)
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)
    return decorated

question_map = {
    "q1": "Before this installation, how often did you visit this site?",
    "q2": "Since the installation, how often do you visit this site?",
    "q3": "On average, how much time do you spend at this site per visit?",
    "q4": "What is your age group?",
    "q5": "What is your gender?",
    "q6": "What is your race/ethnicity?",
    "q7": "What is your zip code?",
    "q8": "How welcome do you feel on this site?",
    "q9": "How safe do you feel on this site?",
    "q10": "How comfortable do you feel on this site?",
    "q11": "How positive is your overall experience at this site?",
    "q12": "What activity best describes your time spent at this site?",
    "q13": "Has this installation made you more interested in exploring the surrounding neighborhood?",
}

@main.route('/')
def health_check():
    return jsonify({"message": "Hello, VAI project!"})

# submitting a survey response (rate limited: 10 submissions per minute per IP)
@main.route('/submit-survey', methods=['POST'])
@limiter.limit("10 per minute")
def submit_survey():
    response_data = request.json

    if not response_data:
        return jsonify({"error": "Request body is required"}), 400

    installation_id = response_data.get('installationId')
    if not installation_id or installation_id not in VALID_INSTALLATION_IDS:
        return jsonify({"error": f"Invalid installationId. Must be one of: {', '.join(VALID_INSTALLATION_IDS)}"}), 400

    raw_responses = response_data.get('responses')
    if not raw_responses or not isinstance(raw_responses, dict):
        return jsonify({"error": "responses must be a non-empty object"}), 400

    responses = {}
    for key, value in raw_responses.items():
        if isinstance(value, list):
            if len(value) > 1:
                responses[key] = value
            elif len(value) == 1:
                responses[key] = value[0]
            else:
                responses[key] = ""
        else:
            responses[key] = value

    survey_response = SurveyResponse(responses, installation_id)

    try:
        current_app.db.collection('surveyResponses').add(survey_response.to_dict())
        return jsonify({"message": "Survey submitted", "survey responses": responses}), 200
    except Exception as e:
        print("Error saving survey response:", str(e))
        return jsonify({"error": str(e)}), 400


# creating a new user (restricted to @vanalen.org email addresses)
@main.route('/register-user', methods=['POST'])
def register_user():
    user_data = request.json
    first_name = user_data.get('firstName')
    last_name = user_data.get('lastName')
    email = user_data.get('email')
    password = user_data.get('password')

    if not all([first_name, last_name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if not email.endswith(f'@{ALLOWED_EMAIL_DOMAIN}'):
        return jsonify({"error": "Registration is restricted to Van Alen Institute staff. Please use your @vanalen.org email address."}), 403

    user = UserSignUp(first_name, last_name, email, password)

    try:
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=f"{user.first_name} {user.last_name}"
        )
        current_app.db.collection('users').document(user_record.uid).set(user.to_dict(user_record.uid))
        return jsonify({"message": "User created successfully", "uid": user_record.uid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# verifying that the user attempting to login exists within our DB
@main.route('/verify-token', methods=['POST'])
def verify_token():
    id_token = request.json.get("idToken")
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return jsonify({"message": "Token verified", "uid": uid}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@main.route('/get-survey-responses', methods=['GET'])
@require_auth
def get_survey_responses():
    try:
        db = current_app.db
        responses_ref = db.collection('surveyResponses')
        docs = responses_ref.stream()

        responses = []
        for doc in docs:
            response = doc.to_dict()
            response['id'] = doc.id
            responses.append(response)

        return jsonify(responses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/generate-report', methods=['GET'])
@require_auth
def generate_report():
    tmp_dir = None
    try:
        raw_responses = load_responses_from_firestore()
        responses = clean_firestore_responses(raw_responses, question_map)

        if not responses:
            return jsonify({"error": "No survey responses found to generate report."}), 400

        analyzer = SurveyAnalyzer(responses, question_map)

        tmp_dir = tempfile.mkdtemp()
        csv_path = os.path.join(tmp_dir, 'survey_summary.csv')
        pdf_path = os.path.join(tmp_dir, 'survey_graphs_summary.pdf')
        graphs_dir = os.path.join(tmp_dir, 'survey_graphs')
        os.makedirs(graphs_dir, exist_ok=True)

        analyzer.export_summary_csv(csv_path)
        analyzer.generate_graphs(graphs_dir)
        save_graphs_to_pdf(graphs_dir, pdf_path, question_map)

        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w') as zf:
            zf.write(csv_path, 'survey_summary.csv')
            zf.write(pdf_path, 'survey_graphs_summary.pdf')

        memory_file.seek(0)
        return send_file(memory_file, mimetype='application/zip', as_attachment=True, download_name='survey_reports.zip')

    except Exception as e:
        print("Error in generate_report:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if tmp_dir and os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir, ignore_errors=True)

import json
import base64
import os
from flask import Flask
from firebase_admin import credentials, initialize_app, firestore
from .config import Config
from flask_cors import CORS
from .extensions import limiter


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Firebase setup — support base64-encoded JSON env var (production) or file path (local)
    firebase_key_json = os.getenv('FIREBASE_KEY_JSON')
    if firebase_key_json:
        key_dict = json.loads(base64.b64decode(firebase_key_json))
        cred = credentials.Certificate(key_dict)
    else:
        cred = credentials.Certificate(app.config['FIREBASE_KEY_PATH'])
    initialize_app(cred)

    # Make Firestore client accessible elsewhere
    app.db = firestore.client()

    # Rate limiter
    limiter.init_app(app)

    # Register routes
    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app

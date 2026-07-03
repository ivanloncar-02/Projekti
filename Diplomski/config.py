import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY           = os.getenv('SECRET_KEY', 'default-key')
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS_PATH', 'ztp-firebase-key.json')
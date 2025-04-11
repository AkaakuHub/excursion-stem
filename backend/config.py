import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads/'
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac'}
    DEMUCS_MODEL_PATH = os.environ.get('DEMUCS_MODEL_PATH') or 'path/to/demucs/model'
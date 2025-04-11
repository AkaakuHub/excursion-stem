import os
from datetime import timedelta


class Config:
    # アプリケーション設定
    SECRET_KEY = os.environ.get("SECRET_KEY") or "2025年版_音楽分離ゲーム_秘密鍵"
    DEBUG = os.environ.get("DEBUG", "False") == "True"

    # ファイル処理設定
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER") or "uploads/"
    OUTPUT_FOLDER = os.environ.get("OUTPUT_FOLDER") or "output/"
    ALLOWED_EXTENSIONS = {"mp3", "wav", "ogg", "flac", "m4a"}
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32MB

    # セッション設定
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)

    # APIレート制限設定
    RATELIMIT_DEFAULT = "200 per day, 50 per hour"
    RATELIMIT_STORAGE_URL = "memory://"

    # CORSの許可設定
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

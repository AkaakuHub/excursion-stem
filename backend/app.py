from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from services.audio_service import AudioService
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# アップロードディレクトリの確保
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# サービスの初期化
audio_service = AudioService()

def allowed_file(filename):
    """許可されたファイル拡張子かどうかをチェック"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """音声ファイルをアップロードする"""
    if 'file' not in request.files:
        return jsonify({'error': 'ファイルがありません'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'ファイルが選択されていません'}), 400
    
    if file and allowed_file(file.filename):
        # 一意のファイル名を生成
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
        file.save(file_path)
        
        return jsonify({
            'status': 'success',
            'fileId': file_id,
            'filename': filename,
            'path': file_path
        }), 200
    
    return jsonify({'error': '許可されていないファイル形式です'}), 400

@app.route('/api/process', methods=['POST'])
def process_audio():
    """音声ファイルを処理して分離する"""
    try:
        # フォームデータからファイルと範囲を取得
        if 'file' not in request.files:
            return jsonify({'error': 'ファイルがありません'}), 400
            
        file = request.files['file']
        start_time = float(request.form.get('startTime', 0))
        end_time = float(request.form.get('endTime', 30))
        
        if file.filename == '':
            return jsonify({'error': 'ファイルが選択されていません'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '許可されていないファイル形式です'}), 400
        
        # アップロード処理
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
        file.save(file_path)
        
        # 音声処理サービスを使用して分離
        separated_tracks = audio_service.process_audio_file(file_path, start_time, end_time)
            
        # 各パートのURLを返す
        track_urls = {}
        for track_name, track_path in separated_tracks.items():
            # ファイルパスをそのまま保存
            track_urls[track_name] = f"/api/audio?path={track_path}"
        
        return jsonify({
            'status': 'success',
            'tracks': track_urls
        }), 200
        
    except Exception as e:
        app.logger.error(f"処理エラー: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview', methods=['POST'])
def preview_audio():
    """アップロードされた音声の特定範囲をプレビュー用に切り出す"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'ファイルがありません'}), 400
            
        file = request.files['file']
        start_time = float(request.form.get('startTime', 0))
        end_time = float(request.form.get('endTime', 30))
        
        # アップロード処理
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
        file.save(file_path)
        
        # プレビュー用の切り抜き
        preview_path = audio_service.get_preview(file_path, start_time, end_time)
        
        if preview_path:
            preview_url = f"/api/audio/{os.path.basename(preview_path)}"
            return jsonify({
                'status': 'success',
                'previewUrl': preview_url
            }), 200
        else:
            return jsonify({'error': 'プレビューの生成に失敗しました'}), 500
            
    except Exception as e:
        app.logger.error(f"プレビューエラー: {str(e)}")
        return jsonify({'error': str(e)}), 500

# パラメータ使用方式に変更
@app.route('/api/audio')
def get_audio():
    """音声ファイルを提供する（パス指定方式）"""
    file_path = request.args.get('path')
    
    if not file_path:
        return jsonify({'error': 'ファイルパスが指定されていません'}), 400
    
    # ファイルパスからディレクトリとファイル名を分離
    directory = os.path.dirname(file_path)
    filename = os.path.basename(file_path)
    
    app.logger.info(f"音声ファイルへのアクセス: {directory}/{filename}")
    
    return send_from_directory(directory, filename)

# 後方互換性のために残しておく
@app.route('/api/audio/<filename>')
def get_audio_by_filename(filename):
    """音声ファイルを提供する（ファイル名指定方式）"""
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
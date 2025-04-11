from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
import subprocess
import time
import json
import librosa
import soundfile as sf

app = Flask(__name__)
CORS(app)

# 設定
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac'}

# フォルダが存在しない場合は作成
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'ファイルがありません'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'ファイルが選択されていません'}), 400
    
    if file and allowed_file(file.filename):
        # 一意のファイル名を生成
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
        file.save(file_path)
        
        return jsonify({
            'status': 'success',
            'fileId': file_id,
            'filename': filename,
            'path': file_path
        })
    
    return jsonify({'error': '許可されていないファイル形式です'}), 400

@app.route('/api/process', methods=['POST'])
def process_audio():
    try:
        # フォームデータからファイルと範囲を取得
        file = request.files['file']
        start_time = float(request.form.get('startTime', 0))
        end_time = float(request.form.get('endTime', 30))
        
        if not file:
            return jsonify({'error': 'ファイルがありません'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '許可されていないファイル形式です'}), 400
        
        # アップロード処理
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
        file.save(file_path)
        
        # 選択範囲の切り取り
        segment_path = cut_audio_segment(file_path, start_time, end_time, file_id)
        
        # Demucsを使用して楽器パートを分離
        stems = separate_audio(segment_path, file_id)
        
        # 各パートのURLを返す
        track_urls = {}
        for stem_name, stem_path in stems.items():
            # 相対パスからURLを生成
            track_urls[stem_name] = f"/api/audio/{os.path.basename(stem_path)}"
        
        return jsonify({
            'status': 'success',
            'tracks': track_urls
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cut_audio_segment(file_path, start_time, end_time, file_id):
    """音声ファイルから指定した範囲を切り出す"""
    y, sr = librosa.load(file_path, sr=None)
    
    # 時間をサンプル数に変換
    start_sample = int(start_time * sr)
    end_sample = int(end_time * sr)
    
    # 範囲を切り出す
    segment = y[start_sample:end_sample]
    
    # 切り出した音声を保存
    segment_path = os.path.join(OUTPUT_FOLDER, f"segment_{file_id}.wav")
    sf.write(segment_path, segment, sr)
    
    return segment_path

def separate_audio(audio_path, file_id):
    """Demucsを使用して音声を分離する"""
    # Demucsコマンドを実行
    output_path = os.path.join(OUTPUT_FOLDER, f"stems_{file_id}")
    
    # 実際の環境ではDemucsをインストールしてコマンドを実行
    # ここではダミーの実装（実際のアプリでは下記のようなコマンドを実行）
    # subprocess.run([
    #     "demucs", 
    #     "--out", output_path,
    #     "--two-stems=vocals", 
    #     audio_path
    # ], check=True)
    
    # デモ用：実際には分離処理が行われるが、ここではダミーファイルを生成
    dummy_stems = {
        'drums': os.path.join(OUTPUT_FOLDER, f"drums_{file_id}.wav"),
        'bass': os.path.join(OUTPUT_FOLDER, f"bass_{file_id}.wav"),
        'vocals': os.path.join(OUTPUT_FOLDER, f"vocals_{file_id}.wav"),
        'other': os.path.join(OUTPUT_FOLDER, f"other_{file_id}.wav")
    }
    
    # ダミーファイルの生成（実際のアプリではこの部分は不要）
    y, sr = librosa.load(audio_path, sr=None)
    for stem_name, stem_path in dummy_stems.items():
        sf.write(stem_path, y, sr)  # 同じ音声をコピー（デモ用）
    
    return dummy_stems

@app.route('/api/audio/<filename>')
def get_audio(filename):
    """音声ファイルを提供する"""
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
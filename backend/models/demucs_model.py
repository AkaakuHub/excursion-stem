import os
import subprocess
import glob
from typing import Dict
from flask import current_app

class DemucsModel:
    """Demucsモデルを使用して音声ファイルを楽器パートごとに分離するクラス"""
    
    def __init__(self):
        # モデル名: DemucsのHTDemucs v4モデルを使用
        self.model_name = "htdemucs_ft"
        
    def separate(self, audio_file: str, session_id: str) -> Dict[str, str]:
        """
        音声ファイルを楽器パートごとに分離する
        
        Args:
            audio_file: 分離する音声ファイルのパス
            session_id: 一意のセッションID
            
        Returns:
            各パートのファイルパスを含む辞書
        """
        output_dir = current_app.config['OUTPUT_FOLDER']
        
        # Demucsコマンドを実行
        command = [
            "demucs", 
            "--model", self.model_name,
            "--out", output_dir,
            "--name", f"session_{session_id}",
            audio_file
        ]
        
        try:
            # サブプロセスでDemucsを実行
            subprocess.run(command, check=True, capture_output=True)
            
            # 分離されたファイルを検索
            base_path = os.path.join(output_dir, self.model_name, f"session_{session_id}")
            
            # パスが見つからない場合はHTDemucS_ftフォルダを試す（バージョンによって異なる可能性あり）
            if not os.path.exists(base_path):
                base_path = os.path.join(output_dir, "htdemucs_ft", f"session_{session_id}")
            
            # 各パートのファイルパスを取得
            tracks = {}
            instrument_dirs = ["drums", "bass", "vocals", "other"]
            
            for instrument in instrument_dirs:
                pattern = os.path.join(base_path, instrument, "*.wav")
                matching_files = glob.glob(pattern)
                
                if matching_files:
                    tracks[instrument] = matching_files[0]
            
            return tracks
        
        except subprocess.CalledProcessError as e:
            print(f"Demucs実行エラー: {e}")
            raise RuntimeError(f"音声分離に失敗しました: {e.stderr.decode('utf-8')}")
        
        except Exception as e:
            print(f"音声分離中に予期せぬエラーが発生しました: {e}")
            raise
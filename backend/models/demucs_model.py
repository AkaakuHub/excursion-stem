import os
import subprocess
import glob
import logging
from typing import Dict
from flask import current_app

logger = logging.getLogger(__name__)


class DemucsModel:
    """Demucsモデルを使用して音声ファイルを楽器パートごとに分離するクラス"""

    def __init__(self):
        # モデル名: DemucsのHTDemucs v4モデルを使用
        self.model_name = "htdemucs"  # htdemucs_ftではなくhtdemucsを使用

    def separate(self, audio_file: str, session_id: str) -> Dict[str, str]:
        """
        音声ファイルを楽器パートごとに分離する

        Args:
            audio_file: 分離する音声ファイルのパス
            session_id: 一意のセッションID

        Returns:
            各パートのファイルパスを含む辞書
        """
        output_dir = current_app.config["OUTPUT_FOLDER"]

        # 出力ディレクトリを設定（セッションIDをファイル名の一部として使用）
        output_path = os.path.join(output_dir, f"session_{session_id}")

        # demucsコマンドを修正 - --nameオプションを削除
        command = [
            "demucs",
            "-n",
            self.model_name,  # モデル名
            "-o",
            output_dir,  # 出力ディレクトリ
            audio_file,  # 入力ファイル
        ]

        logger.info(f"Demucsコマンド実行: {' '.join(command)}")

        try:
            # サブプロセスでDemucsを実行
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            logger.info(f"Demucs実行成功: {result.stdout}")

            # 分離されたファイルを検索 - 入力ファイル名をベースにする
            input_filename = os.path.splitext(os.path.basename(audio_file))[0]
            base_path = os.path.join(output_dir, self.model_name, input_filename)

            # パスが見つからない場合は異なるパターンを試す
            if not os.path.exists(base_path):
                logger.warning(f"通常の出力パスが見つかりません: {base_path}")
                # 可能性のあるディレクトリをすべて検索
                possible_dirs = glob.glob(os.path.join(output_dir, "*", "*"))
                if possible_dirs:
                    # 最新のディレクトリを選択（最も最近作成されたもの）
                    latest_dir = max(possible_dirs, key=os.path.getmtime)
                    base_path = latest_dir
                    logger.info(f"代替ディレクトリを使用: {base_path}")

            # 各パートのファイルパスを取得
            tracks = {}
            instrument_dirs = ["drums", "bass", "vocals", "other"]

            for instrument in instrument_dirs:
                pattern = os.path.join(base_path, instrument, "*.wav")
                matching_files = glob.glob(pattern)

                if matching_files:
                    tracks[instrument] = matching_files[0]
                    logger.info(f"{instrument}パートを発見: {matching_files[0]}")
                else:
                    # 別のパターンも試す - モデルやdemucsのバージョンによって構造が異なる場合がある
                    alt_pattern = os.path.join(base_path, "*.wav")
                    alt_files = [
                        f
                        for f in glob.glob(alt_pattern)
                        if instrument in os.path.basename(f).lower()
                    ]
                    if alt_files:
                        tracks[instrument] = alt_files[0]
                        logger.info(
                            f"{instrument}パートを代替パターンで発見: {alt_files[0]}"
                        )

            if not tracks:
                raise FileNotFoundError(
                    f"分離されたパートが見つかりません: {base_path}"
                )

            return tracks

        except subprocess.CalledProcessError as e:
            error_msg = f"Demucs実行エラー: {e.stderr}"
            logger.error(error_msg)
            raise RuntimeError(f"音声分離に失敗しました: {e.stderr}")

        except Exception as e:
            error_msg = f"音声分離中に予期せぬエラーが発生しました: {e}"
            logger.error(error_msg)
            raise

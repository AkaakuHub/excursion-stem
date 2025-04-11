import os
import uuid
import logging
from typing import Dict, Optional
import librosa
import soundfile as sf
from models.demucs_model import DemucsModel
from flask import current_app

logger = logging.getLogger(__name__)


class AudioService:
    def __init__(self):
        self.demucs_model = DemucsModel()

    def process_audio_file(
        self, file_path: str, start_time: float, end_time: float
    ) -> Dict[str, str]:
        """
        音声ファイルを処理して分離されたトラックを返す

        Args:
            file_path: 処理する音声ファイルのパス
            start_time: 開始時間（秒）
            end_time: 終了時間（秒）

        Returns:
            各楽器パートのファイルパスを含む辞書
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"音声ファイル {file_path} が見つかりません")

        # 一意のセッションIDを生成
        session_id = str(uuid.uuid4())[:8]
        logger.info(f"新しい処理セッション開始: {session_id}, ファイル: {file_path}")

        # 音声セグメントを切り出す
        segment_path = self._cut_audio_segment(
            file_path, start_time, end_time, session_id
        )
        logger.info(f"音声セグメント切り出し完了: {segment_path}")

        # 音声を分離
        separated_parts = self.demucs_model.separate(segment_path, session_id)
        logger.info(f"音声分離完了: {len(separated_parts)}パート")

        return separated_parts

    def _cut_audio_segment(
        self, file_path: str, start_time: float, end_time: float, session_id: str
    ) -> str:
        """
        音声ファイルから指定された時間範囲のセグメントを切り出す

        Args:
            file_path: 音声ファイルのパス
            start_time: 開始時間（秒）
            end_time: 終了時間（秒）
            session_id: セッション識別子

        Returns:
            切り出されたセグメントのファイルパス
        """
        try:
            # 音声を読み込む
            logger.info(f"音声ファイル読み込み開始: {file_path}")
            audio, sr = librosa.load(file_path, sr=None)
            logger.info(
                f"音声読み込み完了: サンプルレート={sr}, 長さ={len(audio)/sr}秒"
            )

            # サンプル数に変換
            start_sample = int(start_time * sr)
            end_sample = int(end_time * sr)

            # セグメントを切り出す
            if end_sample > len(audio):
                end_sample = len(audio)
                logger.warning(
                    f"終了時間が音声の長さを超えています。終了位置を調整: {end_sample/sr}秒"
                )

            audio_segment = audio[start_sample:end_sample]

            # 出力パスを生成
            output_dir = current_app.config["OUTPUT_FOLDER"]
            output_path = os.path.join(output_dir, f"segment_{session_id}.wav")

            # 音声を保存
            sf.write(output_path, audio_segment, sr)
            logger.info(f"セグメント保存完了: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"音声セグメント切り出しエラー: {e}")
            raise

    def get_preview(
        self, file_path: str, start_time: float, end_time: float
    ) -> Optional[str]:
        """
        音声ファイルからプレビュー用のセグメントを生成

        Args:
            file_path: 音声ファイルのパス
            start_time: 開始時間（秒）
            end_time: 終了時間（秒）

        Returns:
            プレビューファイルのパスまたはNone
        """
        try:
            session_id = f"preview_{uuid.uuid4()}"[:12]
            logger.info(f"プレビュー生成開始: セッションID={session_id}")
            return self._cut_audio_segment(file_path, start_time, end_time, session_id)
        except Exception as e:
            logger.error(f"プレビュー生成エラー: {e}")
            return None

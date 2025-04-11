import os
import librosa
import numpy as np
import soundfile as sf


def load_audio(file_path):
    audio, sr = librosa.load(file_path, sr=None, mono=False)
    return audio, sr


def get_audio_preview(audio, start_time, end_time, sr):
    start_sample = int(start_time * sr)
    end_sample = int(end_time * sr)
    return audio[:, start_sample:end_sample]


def split_audio_by_instrument(audio, sr, model):
    # Placeholder for the actual Demucs model processing
    # This function should call the DFemucs model to separate the audio into different instruments
    # For now, we will just return the original audio as a mockup
    return {"vocals": audio, "drums": audio, "bass": audio, "other": audio}


def save_audio_segment(audio_segment, sr, output_path):
    librosa.output.write_wav(output_path, audio_segment, sr)


def pitch_shift_audio(input_file: str, output_file: str, semitones: int = 12) -> str:
    """
    音声ファイルのピッチを変更する

    Args:
        input_file: 入力音声ファイルのパス
        output_file: 出力音声ファイルのパス
        semitones: シフトする半音の数（12=1オクターブ）

    Returns:
        処理後の音声ファイルパス
    """
    try:
        # 音声データの読み込み
        y, sr = librosa.load(input_file, sr=None)

        # ピッチシフト処理（1オクターブ上げるには12半音上げる）
        y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=semitones)

        # 処理後の音声を保存
        sf.write(output_file, y_shifted, sr)

        return output_file
    except Exception as e:
        print(f"ピッチシフト処理エラー: {str(e)}")
        return None

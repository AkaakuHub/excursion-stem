from typing import List
import os
from utils.audio_processing import cut_audio_segment
from models.demucs_model import DemucsModel

class AudioService:
    def __init__(self):
        self.demucs_model = DemucsModel()

    def process_audio_file(self, file_path: str, start_time: float, end_time: float) -> List[str]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The audio file {file_path} does not exist.")
        
        # Cut the audio segment
        cut_audio_path = cut_audio_segment(file_path, start_time, end_time)
        
        # Separate the audio into different parts using Demucs
        separated_parts = self.demucs_model.separate(cut_audio_path)
        
        return separated_parts

    def preview_audio_segment(self, file_path: str, start_time: float, end_time: float) -> str:
        # This method could return a path to a preview file or a streamable URL
        return cut_audio_segment(file_path, start_time, end_time)
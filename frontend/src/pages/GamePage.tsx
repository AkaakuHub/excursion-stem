import React, { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';
import FileUploader from '../components/FileUploader';
import GameInterface from '../components/GameInterface';
import TrackSelector from '../components/TrackSelector';
import { uploadAudioFile, processAudio } from '../services/api';

const GamePage: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleFileUpload = async (file: File) => {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
    };

    const handleProcessAudio = async () => {
        if (audioFile) {
            setIsProcessing(true);
            await processAudio(audioFile);
            setIsProcessing(false);
        }
    };

    return (
        <div className="game-page">
            <h1>音楽パート分けゲーム</h1>
            <FileUploader onFileUpload={handleFileUpload} />
            {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
            <TrackSelector />
            <GameInterface onProcessAudio={handleProcessAudio} isProcessing={isProcessing} />
        </div>
    );
};

export default GamePage;
import React from 'react';
import FileUploader from '../components/FileUploader';
import AudioPlayer from '../components/AudioPlayer';
import TrackSelector from '../components/TrackSelector';
import GameInterface from '../components/GameInterface';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <h1>音楽パート分けゲーム</h1>
            <FileUploader />
            <AudioPlayer />
            <TrackSelector />
            <GameInterface />
        </div>
    );
};

export default HomePage;
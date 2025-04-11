import React, { useState } from 'react';

const GameInterface: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleInstrumentSelect = (instrument: string) => {
        setSelectedInstrument(instrument);
    };

    const handleScoreUpdate = (points: number) => {
        setScore(score + points);
    };

    return (
        <div className="game-interface">
            <h1>音楽パート分けゲーム</h1>
            <button onClick={handlePlayPause}>
                {isPlaying ? '一時停止' : '再生'}
            </button>
            <div>
                <h2>スコア: {score}</h2>
            </div>
            <div>
                <h3>楽器を選択:</h3>
                <button onClick={() => handleInstrumentSelect('ギター')}>ギター</button>
                <button onClick={() => handleInstrumentSelect('ドラム')}>ドラム</button>
                <button onClick={() => handleInstrumentSelect('ボーカル')}>ボーカル</button>
                <button onClick={() => handleInstrumentSelect('ベース')}>ベース</button>
            </div>
            {selectedInstrument && (
                <div>
                    <h4>選択した楽器: {selectedInstrument}</h4>
                </div>
            )}
        </div>
    );
};

export default GameInterface;
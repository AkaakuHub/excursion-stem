import React, { useState } from 'react';

const TrackSelector: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [previewRange, setPreviewRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAudioFile(file);
            // Initialize preview range based on the audio file duration
            // This is a placeholder; actual duration should be fetched from the audio file
            setPreviewRange({ start: 0, end: 30 }); // Assuming a 30 seconds duration for preview
        }
    };

    const handlePreviewChange = (start: number, end: number) => {
        setPreviewRange({ start, end });
    };

    const handleConvert = () => {
        if (audioFile) {
            // Call the backend API to process the audio file with the selected range
            console.log('Converting audio file:', audioFile.name, 'with range:', previewRange);
            // Implement API call here
        }
    };

    return (
        <div>
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            {audioFile && (
                <div>
                    <h3>Selected File: {audioFile.name}</h3>
                    <p>Preview Range: {previewRange.start} - {previewRange.end} seconds</p>
                    <button onClick={() => handlePreviewChange(previewRange.start - 5, previewRange.end)}>Preview Back</button>
                    <button onClick={() => handlePreviewChange(previewRange.start + 5, previewRange.end)}>Preview Forward</button>
                    <button onClick={handleConvert}>Convert</button>
                </div>
            )}
        </div>
    );
};

export default TrackSelector;
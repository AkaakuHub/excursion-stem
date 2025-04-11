import React, { useState, useEffect, useRef } from 'react';

type Track = {
  name: string;
  url: string;
  label: string;
  color: string;
};

type StemPlayerProps = {
  tracks: Record<string, string>;
  defaultActiveTrack?: string[];
};

export default function StemPlayer({ tracks, defaultActiveTrack = ['drums'] }: StemPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackIds, setActiveTrackIds] = useState<string[]>(defaultActiveTrack);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // 表示用のトラック情報
  const trackData: Track[] = [
    { name: 'drums', url: tracks.drums || '', label: 'ドラム', color: 'bg-red-500' },
    { name: 'bass', url: tracks.bass || '', label: 'ベース', color: 'bg-blue-500' },
    { name: 'vocals', url: tracks.vocals || '', label: 'ボーカル', color: 'bg-green-500' },
    { name: 'other', url: tracks.other || '', label: 'その他の楽器', color: 'bg-purple-500' }
  ].filter(track => track.url);

  useEffect(() => {
    // オーディオ要素の同期
    const audios = Object.values(audioRefs.current).filter(Boolean) as HTMLAudioElement[];
    
    if (isPlaying) {
      // すべてのトラックを同時に再生
      const playPromises = audios
        .filter(audio => activeTrackIds.includes(audio.dataset.trackId || ''))
        .map(audio => audio.play());
      
      Promise.all(playPromises).catch(err => console.error('再生エラー:', err));
    } else {
      // すべてのトラックを一時停止
      audios.forEach(audio => audio.pause());
    }
  }, [isPlaying, activeTrackIds]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    // すべてのトラックを最初から再生
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.currentTime = 0;
      }
    });
    setIsPlaying(true);
  };

  const toggleTrack = (trackId: string) => {
    if (activeTrackIds.includes(trackId)) {
      setActiveTrackIds(activeTrackIds.filter(id => id !== trackId));
    } else {
      setActiveTrackIds([...activeTrackIds, trackId]);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="stem-player bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">パート別プレイヤー</h2>
      
      {/* 音声要素（非表示） */}
      {trackData.map(track => (
        <audio
          key={track.name}
          ref={el => audioRefs.current[track.name] = el}
          src={track.url}
          data-track-id={track.name}
          onEnded={handleAudioEnded}
        />
      ))}
      
      {/* 再生コントロール */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handlePlayPause}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              一時停止
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              再生
            </>
          )}
        </button>
        
        <button
          onClick={handleRestart}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          最初から
        </button>
      </div>
      
      {/* トラックトグル */}
      <div className="grid grid-cols-2 gap-3">
        {trackData.map(track => (
          <button
            key={track.name}
            onClick={() => toggleTrack(track.name)}
            className={`py-3 px-4 rounded-lg text-white font-medium transition-all flex items-center justify-center ${
              activeTrackIds.includes(track.name) 
                ? `${track.color} shadow-md` 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            {activeTrackIds.includes(track.name) ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {track.label}
          </button>
        ))}
      </div>
    </div>
  );
}
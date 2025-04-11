import React, { useState, useEffect, useRef } from 'react';

type AudioRangeSelectorProps = {
  audioUrl: string;
  onRangeChange: (range: { start: number; end: number }) => void;
  previewUrl?: string | null;
  onPreviewRequest?: () => Promise<void>;
  isProcessing?: boolean;
};

export default function AudioRangeSelector({ 
  audioUrl, 
  onRangeChange, 
  previewUrl,
  onPreviewRequest,
  isProcessing = false
}: AudioRangeSelectorProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(30);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // デフォルトの範囲を設定（30秒以内または曲の長さ）
      setRangeEnd(Math.min(30, audio.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // 選択範囲外に行ったら一時停止
      if (audio.currentTime >= rangeEnd) {
        audio.pause();
        audio.currentTime = rangeStart;
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [rangeEnd, rangeStart]);

  // プレビューオーディオの設定
  useEffect(() => {
    const previewAudio = previewAudioRef.current;
    if (!previewAudio) return;

    const handlePreviewEnded = () => {
      setIsPlaying(false);
      setIsPreviewMode(false);
    };

    previewAudio.addEventListener('ended', handlePreviewEnded);
    
    return () => {
      previewAudio.removeEventListener('ended', handlePreviewEnded);
    };
  }, [previewUrl]);

  useEffect(() => {
    // 範囲が変更されたらコールバックを呼び出す
    onRangeChange({ start: rangeStart, end: rangeEnd });
  }, [rangeStart, rangeEnd, onRangeChange]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // プレビューモードの場合はプレビューオーディオを操作
    if (isPreviewMode && previewUrl && previewAudioRef.current) {
      if (isPlaying) {
        previewAudioRef.current.pause();
      } else {
        previewAudioRef.current.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      // 再生開始前に選択範囲の先頭に設定
      audio.currentTime = rangeStart;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRangePreview = async () => {
    if (previewUrl && previewAudioRef.current) {
      // 既存のプレビューを再生
      setIsPreviewMode(true);
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.play();
      setIsPlaying(true);
    } else if (onPreviewRequest) {
      // 新しいプレビューをリクエスト
      await onPreviewRequest();
      setIsPreviewMode(true);
      // プレビューが読み込まれたら自動的に再生
      if (previewAudioRef.current) {
        previewAudioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("プレビュー再生エラー:", err);
        });
      }
    } else {
      // プレビュー機能がない場合は通常の範囲再生
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.currentTime = rangeStart;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleRangeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseFloat(e.target.value);
    // 開始時間は終了時間より前に
    if (newStart < rangeEnd - 5) {
      setRangeStart(newStart);
      if (audioRef.current && isPlaying && !isPreviewMode) {
        audioRef.current.currentTime = newStart;
      }
    }
  };

  const handleRangeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = parseFloat(e.target.value);
    // 終了時間は開始時間より後に（最低5秒）
    if (newEnd > rangeStart + 5 && newEnd <= duration) {
      setRangeEnd(newEnd);
    }
  };

  return (
    <div className="audio-range-selector bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">範囲選択</h2>
      
      {/* 元の音声 */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* プレビュー用音声 */}
      {previewUrl && (
        <audio ref={previewAudioRef} src={previewUrl} preload="auto" />
      )}
      
      {/* 再生コントロール */}
      <div className="flex items-center mb-6 space-x-4">
        <button 
          onClick={handlePlayPause}
          disabled={isProcessing}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition-colors flex items-center shadow-md disabled:opacity-50"
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              一時停止
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              再生
            </>
          )}
        </button>
        
        <button 
          onClick={handleRangePreview}
          disabled={isProcessing}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-full transition-colors flex items-center shadow-md disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <svg className="w-5 h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              処理中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              選択範囲をプレビュー
            </>
          )}
        </button>
        
        <div className="text-gray-700">
          {isPreviewMode ? '選択範囲プレビュー中' : `現在位置: ${formatTime(currentTime)}`}
        </div>
      </div>
      
      {/* 波形表示（スタイル用のプレースホルダー） */}
      <div className="relative h-24 bg-gray-100 rounded mb-6 overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gray-200" style={{ 
          width: `${(rangeEnd / duration) * 100}%`,
          left: `${(rangeStart / duration) * 100}%`
        }}></div>
        <div className="absolute top-0 h-full bg-blue-500 opacity-30" style={{ 
          width: `${((rangeEnd - rangeStart) / duration) * 100}%`,
          left: `${(rangeStart / duration) * 100}%`
        }}></div>
        <div className="absolute top-0 h-full w-0.5 bg-red-500" style={{ 
          left: `${(currentTime / duration) * 100}%`
        }}></div>
      </div>
      
      {/* 範囲選択スライダー */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始位置: {formatTime(rangeStart)}
          </label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={rangeStart}
            onChange={handleRangeStartChange}
            className="w-full accent-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了位置: {formatTime(rangeEnd)}
          </label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={rangeEnd}
            onChange={handleRangeEndChange}
            className="w-full accent-blue-500"
          />
        </div>
        
        <div className="text-center text-gray-700">
          選択範囲: {formatTime(rangeStart)} - {formatTime(rangeEnd)} (長さ: {formatTime(rangeEnd - rangeStart)})
        </div>
      </div>
    </div>
  );
}
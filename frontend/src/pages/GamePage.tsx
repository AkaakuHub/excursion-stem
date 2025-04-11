import React, { useState, useEffect } from "react";
import AudioUploader from "../components/AudioUploader";
import AudioRangeSelector from "../components/AudioRangeSelector";
import StemPlayer from "../components/StemPlayer";
import { processAudio } from "../services/audioService";

export default function GamePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState({ start: 0, end: 30 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [stems, setStems] = useState<Record<string, string> | null>(null);
  const [gameStatus, setGameStatus] = useState<'upload' | 'select' | 'process' | 'play'>('upload');

  // ファイルがアップロードされたら
  const handleFileUpload = (file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setGameStatus('select');
  };

  // 範囲が変更されたら
  const handleRangeChange = (range: { start: number; end: number }) => {
    setSelectedRange(range);
  };

  // 音声を処理
  const handleProcessAudio = async () => {
    if (!audioFile) return;

    try {
      setIsProcessing(true);
      setGameStatus('process');
      
      // 音声を処理してパート分けする
      const result = await processAudio(audioFile, selectedRange.start, selectedRange.end);
      
      // APIからの応答からステムを設定
      setStems(result.tracks);
      setGameStatus('play');
    } catch (error) {
      console.error("音声処理エラー:", error);
      alert("音声の処理中にエラーが発生しました。別の音声ファイルを試してください。");
      setGameStatus('select');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="game-page space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-900">
        音楽パート分けゲーム
      </h1>
      
      {gameStatus === 'upload' && (
        <AudioUploader onFileUpload={handleFileUpload} />
      )}
      
      {gameStatus === 'select' && audioUrl && (
        <div className="space-y-8">
          <AudioRangeSelector audioUrl={audioUrl} onRangeChange={handleRangeChange} />
          
          <div className="text-center">
            <button
              onClick={handleProcessAudio}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg shadow-lg text-xl transition-colors"
            >
              この範囲で音声を処理する
            </button>
          </div>
        </div>
      )}
      
      {gameStatus === 'process' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-xl text-gray-700">音声を処理中です...</p>
          <p className="text-sm text-gray-500 mt-2">このプロセスには数分かかることがあります</p>
        </div>
      )}
      
      {gameStatus === 'play' && stems && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              音楽パートゲーム - 挑戦モード
            </h2>
            <p className="mb-4">
              パートを少しずつ増やしながら、曲当てに挑戦しましょう！最初はドラムだけを聴いてみましょう。
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                最初からやり直す
              </button>
            </div>
          </div>
          
          <StemPlayer tracks={stems} />
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef } from 'react';

type AudioUploaderProps = {
  onFileUpload: (file: File) => void;
};

export default function AudioUploader({ onFileUpload }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // サポートされている音声形式かチェック
    const supportedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'];
    if (!supportedFormats.includes(file.type)) {
      alert('サポートされている音声形式は MP3, WAV, OGG, FLAC のみです。');
      return;
    }

    setFileName(file.name);
    onFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-uploader">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
        />
        
        {fileName ? (
          <div className="py-4">
            <p className="text-green-600 mb-2 text-lg">ファイルが選択されました</p>
            <p className="text-gray-700 font-medium text-xl">{fileName}</p>
            <p className="text-blue-500 mt-3 text-sm">クリックして別の音楽ファイルを選択</p>
          </div>
        ) : (
          <div className="py-8">
            <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-xl font-medium mb-2">音楽ファイルをドラッグ&ドロップ</p>
            <p className="text-gray-500 mb-4">または</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors shadow-md">
              ファイルを選択
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
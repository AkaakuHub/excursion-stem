import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-900">
          音楽パート分けゲーム
        </h1>
        <p className="text-xl text-gray-700">
          楽器のパートを少しずつ追加しながら曲を当てるゲーム
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">遊び方</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li className="text-lg">
            お好きな音楽ファイルをアップロードします（MP3, WAV, OGG, FLACがサポートされています）
          </li>
          <li className="text-lg">
            曲の一部分を選択します（1分以内の範囲を選ぶとより速く処理できます）
          </li>
          <li className="text-lg">
            選択した範囲の音声が楽器パートごとに分離されます（ドラム、ベース、ボーカル、その他）
          </li>
          <li className="text-lg">
            最初はドラムだけを聴いて曲を当てましょう。徐々に他の楽器を追加して、曲を当てるまで挑戦します！
          </li>
        </ol>
      </div>
      
      <div className="text-center">
        <Link to="/game" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-10 rounded-lg text-xl font-medium shadow-lg transition-colors">
          ゲームを始める
        </Link>
      </div>
      
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>© 2025 音楽パート分けゲーム - Powered by Demucs</p>
        <p className="mt-1">このアプリはFacebook Research Demucsを使用して音楽を分離しています</p>
      </div>
    </div>
  );
}
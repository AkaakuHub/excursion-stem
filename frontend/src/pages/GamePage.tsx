import React, { useState } from "react";
import AudioRangeSelector from "../components/AudioRangeSelector";
import AudioUploader from "../components/AudioUploader";
import StemPlayer from "../components/StemPlayer";
import { getAudioPreview, processAudio } from "../services/audioService";

export default function GamePage() {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [selectedRange, setSelectedRange] = useState({ start: 0, end: 30 });
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [stems, setStems] = useState<Record<string, string> | null>(null);
	const [gameStatus, setGameStatus] = useState<
		"upload" | "select" | "process" | "play"
	>("upload");
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// ファイルがアップロードされたら
	const handleFileUpload = (file: File) => {
		setAudioFile(file);
		const url = URL.createObjectURL(file);
		setAudioUrl(url);
		setGameStatus("select");

		// エラーをリセット
		setError(null);
	};

	// 範囲が変更されたら
	const handleRangeChange = (range: { start: number; end: number }) => {
		setSelectedRange(range);
	};

	// 範囲プレビューのリクエスト
	const handlePreviewRequest = async () => {
		if (!audioFile) return;

		try {
			setIsProcessing(true);
			const previewUrlPath = await getAudioPreview(
				audioFile,
				selectedRange.start,
				selectedRange.end,
			);

			// バックエンドからのURLをフルURLに変換
			const baseUrl = window.location.origin;
			const fullUrl = `${baseUrl}${previewUrlPath}`;

			setPreviewUrl(fullUrl);
		} catch (error) {
			console.error("プレビュー生成エラー:", error);
			if (error instanceof Error) {
				setError(`プレビューの生成に失敗しました: ${error.message}`);
			} else {
				setError("プレビューの生成に失敗しました");
			}
		} finally {
			setIsProcessing(false);
		}
	};

	// 音声を処理
	const handleProcessAudio = async () => {
		if (!audioFile) return;

		try {
			setIsProcessing(true);
			setGameStatus("process");
			setError(null);

			// 音声を処理してパート分けする
			const result = await processAudio(
				audioFile,
				selectedRange.start,
				selectedRange.end,
			);

			// APIからの応答からステムを設定
			setStems(result.tracks);
			setGameStatus("play");
		} catch (error) {
			console.error("音声処理エラー:", error);
			if (error instanceof Error) {
				setError(`音声の処理中にエラーが発生しました: ${error.message}`);
			} else {
				setError(
					"音声の処理中にエラーが発生しました。別の音声ファイルを試してください。",
				);
			}
			setGameStatus("select");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="game-page space-y-8">
			<h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-900">
				音楽パート分けゲーム
			</h1>

			{/* エラー表示 */}
			{error && (
				<div
					className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
					role="alert"
				>
					<strong className="font-bold">エラー: </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{gameStatus === "upload" && (
				<AudioUploader onFileUpload={handleFileUpload} />
			)}

			{gameStatus === "select" && audioUrl && (
				<div className="space-y-8">
					<AudioRangeSelector
						audioUrl={audioUrl}
						onRangeChange={handleRangeChange}
						previewUrl={previewUrl}
						onPreviewRequest={handlePreviewRequest}
						isProcessing={isProcessing}
					/>

					<div className="text-center">
						<button
							type="button"
							onClick={handleProcessAudio}
							disabled={isProcessing}
							className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg shadow-lg text-xl transition-colors disabled:opacity-50"
						>
							この範囲で音声を処理する
						</button>
					</div>
				</div>
			)}

			{gameStatus === "process" && (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4" />
					<p className="text-xl text-gray-700">音声を処理中です...</p>
					<p className="text-sm text-gray-500 mt-2">
						このプロセスには数分かかることがあります
					</p>
				</div>
			)}

			{gameStatus === "play" && stems && (
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
								type="button"
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

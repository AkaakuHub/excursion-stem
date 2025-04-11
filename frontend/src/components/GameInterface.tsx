import React, { useState } from "react";
import { useAudioStore } from "../store/audioStore";

type GameInterfaceProps = {
	onProcessAudio: () => Promise<void>;
	isProcessing: boolean;
};

type Instrument = "vocals" | "drums" | "bass" | "other";

export default function GameInterface({
	onProcessAudio,
	isProcessing,
}: GameInterfaceProps) {
	const { separatedTracks } = useAudioStore();
	const [score, setScore] = useState(0);
	const [selectedInstrument, setSelectedInstrument] =
		useState<Instrument | null>(null);
	const [gameStatus, setGameStatus] = useState<
		"ready" | "playing" | "finished"
	>("ready");
	const [correctAnswer, setCorrectAnswer] = useState<Instrument | null>(null);

	const instruments: Instrument[] = ["vocals", "drums", "bass", "other"];
	const japaneseNames: Record<Instrument, string> = {
		vocals: "ボーカル",
		drums: "ドラム",
		bass: "ベース",
		other: "その他の楽器",
	};

	const startGame = async () => {
		if (!separatedTracks && !isProcessing) {
			await onProcessAudio();
		}

		// ランダムな楽器を正解として選ぶ
		const randomInstrument =
			instruments[Math.floor(Math.random() * instruments.length)];
		setCorrectAnswer(randomInstrument);
		setGameStatus("playing");
	};

	const handleInstrumentSelect = (instrument: Instrument) => {
		setSelectedInstrument(instrument);

		// 回答を判定
		if (instrument === correctAnswer) {
			setScore(score + 10);
			alert("正解！ +10点");
		} else {
			alert(
				`不正解... 正解は「${japaneseNames[correctAnswer as Instrument]}」でした`,
			);
		}

		// 次の問題を準備
		setSelectedInstrument(null);
		const nextInstrument =
			instruments[Math.floor(Math.random() * instruments.length)];
		setCorrectAnswer(nextInstrument);
	};

	const endGame = () => {
		setGameStatus("finished");
	};

	return (
		<div className="game-interface bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-4">ゲームインターフェース</h2>

			<div className="mb-4">
				<div className="text-lg font-medium">
					スコア: <span className="text-blue-600">{score}</span>
				</div>
			</div>

			{gameStatus === "ready" && (
				<button
					type="button"
					onClick={startGame}
					disabled={isProcessing}
					className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg disabled:opacity-50"
				>
					{isProcessing ? "処理中..." : "ゲームを開始"}
				</button>
			)}

			{gameStatus === "playing" && (
				<div>
					<p className="mb-3">このパートの楽器は何でしょう？</p>

					<div className="grid grid-cols-2 gap-3">
						{instruments.map((instrument) => (
							<button
								type="button"
								key={instrument}
								onClick={() => handleInstrumentSelect(instrument)}
								className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
							>
								{japaneseNames[instrument]}
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={endGame}
						className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
					>
						ゲーム終了
					</button>
				</div>
			)}

			{gameStatus === "finished" && (
				<div>
					<h3 className="text-xl mb-2">ゲーム終了</h3>
					<p className="mb-4">最終スコア: {score}点</p>
					<button
						type="button"
						onClick={() => {
							setScore(0);
							setGameStatus("ready");
						}}
						className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
					>
						もう一度プレイ
					</button>
				</div>
			)}
		</div>
	);
}

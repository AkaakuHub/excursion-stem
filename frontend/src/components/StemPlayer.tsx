import React, { useState, useEffect, useRef } from "react";
import { getFullTrackUrls } from "../services/audioService";

type Track = {
	name: string;
	url: string;
	label: string;
	color: string;
	variant?: string; // バリアントの種類（通常/高い等）
	group?: string; // グループ化するための識別子
};

type StemPlayerProps = {
	tracks: Record<string, string>;
	defaultActiveTrack?: string[];
};

export default function StemPlayer({
	tracks,
	defaultActiveTrack = ["drums"],
}: StemPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [activeTrackIds, setActiveTrackIds] =
		useState<string[]>(defaultActiveTrack);
	const [trackProgress, setTrackProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
	const animationRef = useRef<number | null>(null);
	const [bassVariant, setBassVariant] = useState<"normal" | "high">("normal");

	// 相対URLを絶対URLに変換
	const fullUrlTracks = getFullTrackUrls(tracks);

	// 表示用のトラック情報
	const trackData: Track[] = [
		{
			name: "drums",
			url: fullUrlTracks.drums || "",
			label: "ドラム",
			color: "bg-red-500",
		},
		{
			name: bassVariant === "normal" ? "bass" : "high_bass",
			url:
				bassVariant === "normal"
					? fullUrlTracks.bass || ""
					: fullUrlTracks.high_bass || "",
			label: bassVariant === "normal" ? "ベース" : "ベース（高）",
			color: "bg-blue-500",
			group: "bass",
			variant: bassVariant,
		},
		{
			name: "vocals",
			url: fullUrlTracks.vocals || "",
			label: "ボーカル",
			color: "bg-green-500",
		},
		{
			name: "other",
			url: fullUrlTracks.other || "",
			label: "その他の楽器",
			color: "bg-purple-500",
		},
	].filter((track) => track.url);

	// ベースのバリアント切り替え処理
	const toggleBassVariant = () => {
		const newVariant = bassVariant === "normal" ? "high" : "normal";
		setBassVariant(newVariant);

		// アクティブなトラックも切り替える
		if (
			activeTrackIds.includes("bass") ||
			activeTrackIds.includes("high_bass")
		) {
			setActiveTrackIds((prev) => {
				const withoutBass = prev.filter(
					(id) => id !== "bass" && id !== "high_bass",
				);
				return [...withoutBass, newVariant === "normal" ? "bass" : "high_bass"];
			});
		}
	};

	// トラックのロード時にデュレーションを設定
	useEffect(() => {
		const handleLoadedMetadata = (e: Event) => {
			const audio = e.target as HTMLAudioElement;
			if (audio && audio.duration) {
				setDuration(audio.duration);
			}
		};

		// 各オーディオ要素にメタデータロードイベントを設定
		Object.values(audioRefs.current).forEach((audio) => {
			if (audio) {
				audio.addEventListener("loadedmetadata", handleLoadedMetadata);
			}
		});

		return () => {
			// クリーンアップ
			Object.values(audioRefs.current).forEach((audio) => {
				if (audio) {
					audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
				}
			});
		};
	}, [tracks]);

	// 再生状態の変更を監視
	useEffect(() => {
		const audios = Object.values(audioRefs.current).filter(
			Boolean,
		) as HTMLAudioElement[];

		if (isPlaying) {
			// アクティブなトラックのみ再生
			audios.forEach((audio) => {
				if (activeTrackIds.includes(audio.dataset.trackId || "")) {
					audio.play().catch((err) => console.error("再生エラー:", err));
				} else {
					audio.pause();
				}
			});

			// プログレスバーのアニメーション開始
			startProgressAnimation();
		} else {
			// すべてのトラックを一時停止
			audios.forEach((audio) => audio.pause());

			// アニメーション停止
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		}
	}, [isPlaying, activeTrackIds]);

	// プログレスバーアニメーション
	const startProgressAnimation = () => {
		const updateProgress = () => {
			// 最初のアクティブなオーディオ要素を取得
			const firstActiveAudio = Object.values(audioRefs.current).find(
				(audio) =>
					audio && activeTrackIds.includes(audio.dataset.trackId || ""),
			) as HTMLAudioElement | undefined;

			if (firstActiveAudio) {
				setTrackProgress(firstActiveAudio.currentTime);

				// 再生が終了したらアニメーションを停止
				if (firstActiveAudio.currentTime >= firstActiveAudio.duration) {
					setIsPlaying(false);
					setTrackProgress(0);
					return;
				}
			}

			animationRef.current = requestAnimationFrame(updateProgress);
		};

		animationRef.current = requestAnimationFrame(updateProgress);
	};

	// 再生/一時停止の切り替え
	const handlePlayPause = () => {
		setIsPlaying(!isPlaying);
	};

	// 再生位置を変更
	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = Number.parseFloat(e.target.value);
		setTrackProgress(newTime);

		// すべてのオーディオ要素の再生位置を変更
		Object.values(audioRefs.current).forEach((audio) => {
			if (audio) {
				audio.currentTime = newTime;
			}
		});
	};

	// トラックの再生開始
	const handleRestart = () => {
		// すべてのトラックを最初から再生
		Object.values(audioRefs.current).forEach((audio) => {
			if (audio) {
				audio.currentTime = 0;
			}
		});
		setTrackProgress(0);
		setIsPlaying(true);
	};

	// 再生終了時の処理
	const handleAudioEnded = () => {
		setIsPlaying(false);
		setTrackProgress(0);
	};

	// 時間のフォーマット (秒を「分:秒」形式に)
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// トラックの有効/無効を切り替え
	const toggleTrack = (trackId: string) => {
		const track = trackData.find((t) => t.name === trackId);

		// ベースグループのトラックを特別扱い
		if (track?.group === "bass") {
			if (activeTrackIds.includes(trackId)) {
				// ベースを無効化
				setActiveTrackIds(
					activeTrackIds.filter((id) => id !== "bass" && id !== "high_bass"),
				);
			} else {
				// 現在のバリアントに基づいてベースを有効化
				const bassId = bassVariant === "normal" ? "bass" : "high_bass";
				const otherTrackIds = activeTrackIds.filter(
					(id) => id !== "bass" && id !== "high_bass",
				);
				setActiveTrackIds([...otherTrackIds, bassId]);
			}
		} else {
			// 通常のトラック切り替え処理
			if (activeTrackIds.includes(trackId)) {
				setActiveTrackIds(activeTrackIds.filter((id) => id !== trackId));
			} else {
				setActiveTrackIds([...activeTrackIds, trackId]);
			}
		}
	};

	return (
		<div className="stem-player bg-white p-6 rounded-xl shadow-md">
			<h2 className="text-xl font-semibold mb-4">パート別プレイヤー</h2>

			{/* 音声要素（非表示） */}
			{/* すべてのオーディオ要素を常に含める */}
			<audio
				ref={(el) => (audioRefs.current["drums"] = el)}
				src={fullUrlTracks.drums || ""}
				data-track-id="drums"
				onEnded={handleAudioEnded}
				crossOrigin="anonymous"
			/>
			<audio
				ref={(el) => (audioRefs.current["bass"] = el)}
				src={fullUrlTracks.bass || ""}
				data-track-id="bass"
				onEnded={handleAudioEnded}
				crossOrigin="anonymous"
			/>
			<audio
				ref={(el) => (audioRefs.current["high_bass"] = el)}
				src={fullUrlTracks.high_bass || ""}
				data-track-id="high_bass"
				onEnded={handleAudioEnded}
				crossOrigin="anonymous"
			/>
			<audio
				ref={(el) => (audioRefs.current["vocals"] = el)}
				src={fullUrlTracks.vocals || ""}
				data-track-id="vocals"
				onEnded={handleAudioEnded}
				crossOrigin="anonymous"
			/>
			<audio
				ref={(el) => (audioRefs.current["other"] = el)}
				src={fullUrlTracks.other || ""}
				data-track-id="other"
				onEnded={handleAudioEnded}
				crossOrigin="anonymous"
			/>

			{/* 再生コントロール */}
			<div className="flex space-x-4 mb-6">
				<button
					onClick={handlePlayPause}
					className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
				>
					{isPlaying ? (
						<>
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							一時停止
						</>
					) : (
						<>
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							再生
						</>
					)}
				</button>

				<button
					onClick={handleRestart}
					className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
				>
					<svg
						className="w-5 h-5 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					最初から
				</button>
			</div>

			{/* プログレスバー */}
			<div className="mb-4">
				<div className="flex items-center mb-1">
					<span className="text-sm text-gray-500 mr-2">
						{formatTime(trackProgress)}
					</span>
					<input
						type="range"
						min="0"
						max={duration || 100}
						step="0.01"
						value={trackProgress}
						onChange={handleSeek}
						className="w-full accent-blue-500"
					/>
					<span className="text-sm text-gray-500 ml-2">
						{formatTime(duration)}
					</span>
				</div>
			</div>

			{/* トラックトグル */}
			<div className="grid grid-cols-2 gap-3">
				{trackData.map((track) => (
					<button
						key={track.name}
						onClick={() => toggleTrack(track.name)}
						className={`py-3 px-4 rounded-lg text-white font-medium transition-all flex items-center justify-center disabled:brightness-75 cursor-pointer disabled:cursor-not-allowed
                            ${
															activeTrackIds.includes(track.name)
																? `${track.color} shadow-md`
																: "bg-gray-300 hover:bg-gray-400"
														}`}
						disabled={isPlaying}
					>
						{activeTrackIds.includes(track.name) ? (
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						) : (
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						)}
						{track.label}
					</button>
				))}
			</div>

			{/* ベースバリアント切り替えボタン */}
			{fullUrlTracks.bass && fullUrlTracks.high_bass && (
				<div className="mt-4">
					<button
						onClick={toggleBassVariant}
						className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg border border-blue-300 transition-colors flex items-center mx-auto"
						disabled={isPlaying}
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
							/>
						</svg>
						{bassVariant === "normal"
							? "ベースを1オクターブ上げる"
							: "通常のベースに戻す"}
					</button>
				</div>
			)}
		</div>
	);
}

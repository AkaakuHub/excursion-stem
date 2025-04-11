import React from "react";
import { useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
	audioSrc: string;
};

export default function AudioPlayer({ audioSrc }: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const handleDurationChange = () => setDuration(audio.duration);
		const handleEnded = () => setIsPlaying(false);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("durationchange", handleDurationChange);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("durationchange", handleDurationChange);
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		setIsPlaying(!isPlaying);
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current;
		if (!audio) return;

		const newTime = Number.parseFloat(e.target.value);
		audio.currentTime = newTime;
		setCurrentTime(newTime);
	};

	return (
		<div className="audio-player bg-gray-100 p-4 rounded-lg">
			<audio ref={audioRef} src={audioSrc} />

			<div className="flex items-center space-x-4">
				<button
					type="button"
					onClick={togglePlay}
					className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full"
				>
					{isPlaying ? "一時停止" : "再生"}
				</button>

				<div className="flex-1">
					<input
						type="range"
						min={0}
						max={duration || 100}
						value={currentTime}
						onChange={handleSeek}
						className="w-full"
					/>
					<div className="flex justify-between text-sm text-gray-600">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

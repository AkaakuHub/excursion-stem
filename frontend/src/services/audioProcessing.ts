import { useState } from "react";

export const useAudioProcessing = () => {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [previewRange, setPreviewRange] = useState<{
		start: number;
		end: number;
	}>({ start: 0, end: 0 });

	const handleFileChange = (file: File) => {
		setAudioFile(file);
	};

	const setRange = (start: number, end: number) => {
		setPreviewRange({ start, end });
	};

	const processAudio = async () => {
		if (!audioFile) return;

		const formData = new FormData();
		formData.append("audio", audioFile);
		formData.append("start", previewRange.start.toString());
		formData.append("end", previewRange.end.toString());

		const response = await fetch("/api/process-audio", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Audio processing failed");
		}

		return await response.json();
	};

	return {
		audioFile,
		previewRange,
		handleFileChange,
		setRange,
		processAudio,
	};
};

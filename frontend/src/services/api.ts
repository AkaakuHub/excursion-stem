import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Adjust the base URL as needed

export const uploadAudioFile = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);

	const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
};

export const separateAudioParts = async (
	fileId: string,
	range: { start: number; end: number },
) => {
	const response = await axios.post(`${API_BASE_URL}/separate`, {
		fileId,
		range,
	});

	return response.data;
};

export const getGameData = async (gameId: string) => {
	const response = await axios.get(`${API_BASE_URL}/game/${gameId}`);
	return response.data;
};

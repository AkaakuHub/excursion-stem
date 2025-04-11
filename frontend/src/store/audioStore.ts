import { create } from "zustand";

type AudioState = {
	audioFile: File | null;
	audioUrl: string | null;
	currentRange: { start: number; end: number };
	separatedTracks: { [key: string]: string } | null;
	setAudioFile: (file: File | null) => void;
	setAudioUrl: (url: string | null) => void;
	setCurrentRange: (range: { start: number; end: number }) => void;
	setSeparatedTracks: (tracks: { [key: string]: string } | null) => void;
	reset: () => void;
};

const initialState = {
	audioFile: null,
	audioUrl: null,
	currentRange: { start: 0, end: 30 },
	separatedTracks: null,
};

export const useAudioStore = create<AudioState>((set) => ({
	...initialState,
	setAudioFile: (file) => set({ audioFile: file }),
	setAudioUrl: (url) => set({ audioUrl: url }),
	setCurrentRange: (range) => set({ currentRange: range }),
	setSeparatedTracks: (tracks) => set({ separatedTracks: tracks }),
	reset: () => set(initialState),
}));

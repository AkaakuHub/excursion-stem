export type AudioFile = {
  id: string;
  name: string;
  url: string;
};

export type GameState = {
  currentTrack: AudioFile | null;
  score: number;
  isPlaying: boolean;
  selectedRange: { start: number; end: number } | null;
};

export type InstrumentPart = {
  name: string;
  audioUrl: string;
};
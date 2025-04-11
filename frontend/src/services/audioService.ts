import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * 音声ファイルを処理してパートに分離する
 */
export async function processAudio(file: File, startTime = 0, endTime = 30): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('startTime', startTime.toString());
  formData.append('endTime', endTime.toString());

  try {
    const response = await axios.post(`${API_URL}/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('音声処理エラー:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '音声処理中にエラーが発生しました');
    }
    throw new Error('サーバーとの通信に失敗しました');
  }
}

/**
 * 音声ファイルの特定範囲をプレビューする
 */
export async function getAudioPreview(file: File, startTime = 0, endTime = 30): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('startTime', startTime.toString());
  formData.append('endTime', endTime.toString());

  try {
    const response = await axios.post(`${API_URL}/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // バックエンドから返されたプレビューURLを返す
    return response.data.previewUrl;
  } catch (error) {
    console.error('プレビュー取得エラー:', error);
    throw new Error('プレビューの生成に失敗しました');
  }
}

/**
 * 絶対URLを生成する (相対URLをフルURLに変換)
 */
export function getFullAudioUrl(relativeUrl: string): string {
  const baseUrl = API_URL.split('/api')[0]; // APIベースURLからのパスを取得
  return `${baseUrl}${relativeUrl}`; 
}

/**
 * 複数のトラックURLを絶対URLに変換する
 */
export function getFullTrackUrls(tracks: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, relativeUrl] of Object.entries(tracks)) {
    result[key] = getFullAudioUrl(relativeUrl);
  }
  
  return result;
}
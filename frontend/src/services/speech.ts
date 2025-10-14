import { apiFetch } from './api';

export interface SpeechRecognizeRequest {
  audioBase64: string;
  sampleRate: number;
  format?: 'wav' | 'pcm' | 'amr';
}

export interface SpeechRecognizeResponse {
  text: string;
  alternatives: string[];
  requestId?: string;
}

export const recognizeSpeech = async (payload: SpeechRecognizeRequest) =>
  apiFetch<SpeechRecognizeResponse>('api/speech/recognize', {
    method: 'POST',
    body: JSON.stringify({
      format: 'wav',
      ...payload
    })
  });

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'processing' | 'error';

export interface VoiceRecording {
  audioBase64: string;
  durationMs: number;
  sampleRate: number;
  blob: Blob;
}

interface UseVoiceRecorder {
  status: RecorderStatus;
  error: string | null;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceRecording | null>;
  reset: () => void;
}

const TARGET_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

const getAudioContext = () => {
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error('Web Audio API is not supported by this browser.');
  }
  return new AudioContextCtor();
};

// 检查浏览器是否支持getUserMedia
const checkMediaSupport = () => {
  // 检查现代API
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return { supported: true, modern: true };
  }
  
  // 检查旧版API
  const getUserMedia = (navigator as any).getUserMedia || 
    (navigator as any).webkitGetUserMedia || 
    (navigator as any).mozGetUserMedia || 
    (navigator as any).msGetUserMedia;
  
  if (getUserMedia) {
    return { supported: true, modern: false };
  }
  
  return { supported: false, modern: false };
};

// 获取用户媒体流
const getUserMediaStream = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  const support = checkMediaSupport();
  
  if (!support.supported) {
    throw new Error('此浏览器不支持语音录制功能。请使用现代浏览器或启用HTTPS访问。');
  }
  
  if (support.modern) {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
  
  // 使用旧版API
  const getUserMedia = (navigator as any).getUserMedia || 
    (navigator as any).webkitGetUserMedia || 
    (navigator as any).mozGetUserMedia || 
    (navigator as any).msGetUserMedia;
  
  return new Promise<MediaStream>((resolve, reject) => {
    getUserMedia.call(navigator, constraints, resolve, reject);
  });
};

const floatTo16BitPCM = (input: Float32Array) => {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  let offset = 0;
  for (let i = 0; i < input.length; i += 1) {
    let sample = input[i];
    sample = Math.max(-1, Math.min(1, sample));
    output.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return output;
};

const createWaveHeader = (sampleLength: number, sampleRate: number) => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + sampleLength * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format = PCM
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, sampleLength * 2, true);

  return view;
};

const encodeWav = (samples: Float32Array, sampleRate: number) => {
  const header = createWaveHeader(samples.length, sampleRate);
  const pcm = floatTo16BitPCM(samples);

  const result = new Uint8Array(header.byteLength + pcm.byteLength);
  result.set(new Uint8Array(header.buffer), 0);
  result.set(new Uint8Array(pcm.buffer), header.byteLength);

  return result.buffer;
};

const mergeBuffers = (records: Float32Array[], totalLength: number) => {
  const result = new Float32Array(totalLength);
  let offset = 0;
  records.forEach((record) => {
    result.set(record, offset);
    offset += record.length;
  });
  return result;
};

const downsampleBuffer = (buffer: Float32Array, inputRate: number, outRate: number) => {
  if (inputRate === outRate) {
    return buffer;
  }
  const ratio = inputRate / outRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let resultIndex = 0;
  let bufferIndex = 0;

  while (resultIndex < newLength) {
    const nextBufferIndex = Math.round((resultIndex + 1) * ratio);
    let accumulator = 0;
    let count = 0;
    for (let i = bufferIndex; i < nextBufferIndex && i < buffer.length; i += 1) {
      accumulator += buffer[i];
      count += 1;
    }
    result[resultIndex] = count > 0 ? accumulator / count : 0;
    resultIndex += 1;
    bufferIndex = nextBufferIndex;
  }

  return result;
};

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.replace(/^data:audio\/wav;base64,/, ''));
      } else {
        reject(new Error('Failed to convert audio blob to base64.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read audio blob.'));
    reader.readAsDataURL(blob);
  });

export const useVoiceRecorder = (): UseVoiceRecorder => {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunks = useRef<Float32Array[]>([]);
  const startTimestamp = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setDurationMs(0);
    recordedChunks.current = [];
    startTimestamp.current = 0;
  }, []);

  const cleanup = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current
        .close()
        .catch((err) => console.warn('Failed to close audio context:', err));
    }
    audioContextRef.current = null;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (status === 'recording') return;

    setError(null);

    try {
      // 获取媒体流
      const stream = await getUserMediaStream({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        }
      });

      const audioContext = getAudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

      recordedChunks.current = [];
      startTimestamp.current = performance.now();
      setDurationMs(0);

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        recordedChunks.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      processorRef.current = processor;
      sourceRef.current = source;
      streamRef.current = stream;

      const updateDuration = () => {
        setDurationMs(performance.now() - startTimestamp.current);
        rafRef.current = requestAnimationFrame(updateDuration);
      };

      rafRef.current = requestAnimationFrame(updateDuration);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
      let errorMessage = '无法访问麦克风。';
      
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.name === 'NotAllowedError') {
          errorMessage = '麦克风权限被拒绝，请允许网站访问麦克风。';
        } else if (err.message.includes('not found') || err.name === 'NotFoundError') {
          errorMessage = '未找到麦克风设备，请检查设备连接。';
        } else if (err.message.includes('HTTPS') || err.message.includes('不支持')) {
          errorMessage = err.message;
        } else if (err.message.includes('secure')) {
          errorMessage = '语音录制需要HTTPS环境。请使用https://访问或在本地环境测试。';
        } else {
          errorMessage = `录音失败: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      cleanup();
      setStatus('error');
    }
  }, [cleanup, status]);

  const stopRecording = useCallback(async (): Promise<VoiceRecording | null> => {
    if (status !== 'recording') {
      return null;
    }

    setStatus('processing');

    try {
      processorRef.current?.disconnect();
      processorRef.current = null;

      const audioContext = audioContextRef.current;
      if (!audioContext) {
        throw new Error('Audio context is not available.');
      }

      const inputRate = audioContext.sampleRate;
      const totalLength = recordedChunks.current.reduce((sum, chunk) => sum + chunk.length, 0);
      const merged = mergeBuffers(recordedChunks.current, totalLength);
      const downsampled = downsampleBuffer(merged, inputRate, TARGET_SAMPLE_RATE);

      const wavBuffer = encodeWav(downsampled, TARGET_SAMPLE_RATE);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const base64 = await blobToBase64(blob);
      const duration = performance.now() - startTimestamp.current;

      cleanup();
      reset();

      return {
        audioBase64: base64,
        durationMs: duration,
        sampleRate: TARGET_SAMPLE_RATE,
        blob
      };
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError(err instanceof Error ? err.message : 'Audio processing failed.');
      cleanup();
      setStatus('error');
      return null;
    }
  }, [cleanup, reset, status]);

  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    error,
    durationMs,
    startRecording,
    stopRecording,
    reset
  };
};
import { useMemo, useState } from "react";
import InlineAlert from "../feedback/InlineAlert";
import Toast from "../feedback/Toast";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { recognizeSpeech } from "../../services/speech";

interface VoiceRecorderProps {
  onTranscript?: (text: string) => void;
}

const VoiceRecorder = ({ onTranscript }: VoiceRecorderProps) => {
  const { startRecording, stopRecording, status, durationMs, error, reset } = useVoiceRecorder();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRecording = status === "recording";
  const isProcessing = status === "processing" || isSubmitting;

  const durationLabel = useMemo(() => {
    const seconds = Math.floor(durationMs / 1000);
    const remainder = Math.floor((durationMs % 1000) / 100);
    return `${seconds}.${remainder}s`;
  }, [durationMs]);

  const buttonLabel = (() => {
    if (isSubmitting) return "识别中…";
    if (status === "processing") return "处理中…";
    if (isRecording) return "点击结束";
    return "点击开始";
  })();

  const handleToggle = async () => {
    if (isRecording) {
      const recording = await stopRecording();
      if (!recording) return;

      setIsSubmitting(true);
      try {
        const result = await recognizeSpeech({
          audioBase64: recording.audioBase64,
          sampleRate: recording.sampleRate,
          format: "wav"
        });

        // 显示Toast提示
        setToastMessage(result.text);
        setShowToast(true);

        onTranscript?.(result.text);
      } catch (err) {
        console.error("语音识别失败", err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    reset();
    await startRecording();
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isProcessing}
        className={`flex items-center justify-between rounded-3xl px-8 py-6 text-white transition-all duration-300 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed ${isRecording
          ? "bg-red-500 hover:bg-red-400 shadow-xl shadow-red-300/40 scale-105 animate-pulse"
          : "bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-300/40 hover:scale-105"
          }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{isRecording ? "⏺" : "🎤"}</span>
          <span className="text-lg font-bold tracking-wide">{buttonLabel}</span>
        </div>
        <div className="flex flex-col items-end text-xs font-semibold text-white/90">
          <span>{isRecording ? "正在录音…" : "最长建议 30 秒"}</span>
          <span>{isRecording ? `已录制 ${durationLabel}` : "识别结果将自动填入"}</span>
        </div>
      </button>

      {isRecording ? (
        <InlineAlert tone="info" title="录音中" message="完成后再次点击按钮即可提交识别。请保持环境安静。" />
      ) : null}

      {error ? (
        <div className="space-y-3">
          <InlineAlert tone="danger" title="录音失败" message={error} />
          {error.includes('HTTPS') || error.includes('不支持') ? (
            <InlineAlert 
              tone="info" 
              title="解决方案" 
              message="• 使用 https:// 访问网站 • 或在本地环境(localhost)测试 • 或使用现代浏览器(Chrome/Firefox/Safari)" 
            />
          ) : error.includes('权限') ? (
            <InlineAlert 
              tone="info" 
              title="解决方案" 
              message="• 点击浏览器地址栏的麦克风图标 • 选择'允许'访问麦克风 • 刷新页面重试" 
            />
          ) : null}
        </div>
      ) : null}

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;

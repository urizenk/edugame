import { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-playful-peach-300/50 px-8 py-6 min-w-[400px]">
                <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">🎤</span>
                    <div className="flex-1">
                        <p className="text-base font-bold text-playful-peach-700 mb-2">识别结果</p>
                        <p className="text-xl font-bold text-ink-900">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;


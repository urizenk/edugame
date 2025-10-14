import type { ReactNode } from 'react';

interface LoadingScreenProps {
  label?: string;
  helper?: ReactNode;
}

const LoadingScreen = ({ label = '加载中…', helper }: LoadingScreenProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-playful-peach-50 via-playful-honey-50/60 via-40% via-playful-coral-50/40 via-70% to-playful-lavender-50/30 text-ink-700">
    <div className="relative">
      <div className="flex h-20 w-20 animate-spin items-center justify-center rounded-full border-[6px] border-playful-peach-200 border-t-playful-coral-500" />
      <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce-gentle">
        🎨
      </div>
    </div>
    <div className="text-center">
      <p className="text-xl font-bold tracking-wide bg-gradient-to-r from-playful-peach-600 via-playful-coral-600 to-playful-honey-600 bg-clip-text text-transparent">{label}</p>
      {helper ? <div className="mt-2 text-sm text-ink-600 font-medium">{helper}</div> : null}
    </div>
  </div>
);

export default LoadingScreen;

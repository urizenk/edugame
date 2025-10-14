import type { ReactNode } from 'react';

type InlineAlertTone = 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<InlineAlertTone, string> = {
  info: 'bg-gradient-to-r from-brand-50 to-playful-lavender-50 text-brand-800 border-brand-300/60 shadow-lg shadow-brand-200/30',
  success: 'bg-gradient-to-r from-playful-mint-50 to-emerald-50 text-playful-mint-800 border-playful-mint-300/60 shadow-lg shadow-playful-mint-200/30',
  warning: 'bg-gradient-to-r from-playful-honey-50 to-amber-50 text-playful-honey-800 border-playful-honey-300/60 shadow-lg shadow-playful-honey-200/30',
  danger: 'bg-gradient-to-r from-playful-coral-50 to-playful-peach-50 text-playful-coral-800 border-playful-coral-300/60 shadow-lg shadow-playful-coral-200/30'
};

const toneIcons: Record<InlineAlertTone, string> = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
  danger: '❌'
};

interface InlineAlertProps {
  tone?: InlineAlertTone;
  title?: string;
  message?: ReactNode;
  className?: string;
}

const InlineAlert = ({
  tone = 'info',
  title,
  message,
  className
}: InlineAlertProps) => (
  <div
    className={`flex gap-3 rounded-2xl border-2 px-5 py-4 text-sm ${toneStyles[tone]} ${className ?? ''}`}
  >
    <span className="text-xl flex-shrink-0" aria-hidden="true">{toneIcons[tone]}</span>
    <div className="flex flex-col gap-1">
      {title ? <span className="font-bold text-base">{title}</span> : null}
      {message ? <span className="text-sm leading-relaxed">{message}</span> : null}
    </div>
  </div>
);

export default InlineAlert;

'use client';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

const trackSize = {
  sm: 'w-9 h-5',
  md: 'w-11 h-6',
} as const;

const thumbSize = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;

const thumbPosition = {
  sm: { off: 'translate-x-0.5', on: 'translate-x-[18px]', indeterminate: 'translate-x-[9px]' },
  md: { off: 'translate-x-0.5', on: 'translate-x-[22px]', indeterminate: 'translate-x-[11px]' },
} as const;

export function ToggleSwitch({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  label,
  size = 'md',
}: ToggleSwitchProps) {
  const trackColor = indeterminate
    ? 'bg-yellow-400'
    : checked
      ? 'bg-blue-600'
      : 'bg-gray-300';

  const position = indeterminate
    ? thumbPosition[size].indeterminate
    : checked
      ? thumbPosition[size].on
      : thumbPosition[size].off;

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      {label && <span className="text-sm text-gray-700 select-none">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center shrink-0 rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${trackSize[size]} ${trackColor}`}
      >
        <span
          aria-hidden="true"
          className={`inline-flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out ${thumbSize[size]} ${position}`}
        >
          {indeterminate && (
            <span className="text-[8px] leading-none font-bold text-yellow-600">—</span>
          )}
        </span>
      </button>
    </label>
  );
}

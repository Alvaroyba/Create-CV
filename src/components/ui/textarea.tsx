'use client';

import { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  error?: string;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  markdownHint?: boolean;
}

export function Textarea({
  label,
  error,
  maxLength,
  value,
  onChange,
  markdownHint = false,
  id,
  className = '',
  ...rest
}: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`block w-full min-h-24 resize-y rounded-lg border px-3 py-2 text-base transition-colors duration-200 outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
        {...rest}
      />
      <div className="flex justify-between mt-1">
        <div>
          {error && (
            <p id={`${textareaId}-error`} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {markdownHint && !error && (
            <p className="text-xs text-gray-400 italic">
              Soporta **negrita**, *itálica* y [enlaces](url)
            </p>
          )}
        </div>
        {maxLength != null && (
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

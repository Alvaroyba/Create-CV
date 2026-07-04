'use client';

import { useState, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { isDateInFuture } from '@/lib/utils';
import type { FieldConfig } from '@/components/forms/section-configs';

interface FieldRendererProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

function ListField({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <ul className="space-y-1 mb-2">
        {value.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
              aria-label={`Eliminar "${item}"`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Agregar elemento..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          Agregar
        </Button>
      </div>
    </div>
  );
}

function TagsField({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-sm">
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-blue-400 hover:text-blue-600 leading-none"
              aria-label={`Eliminar "${tag}"`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Escribir y pulsar Enter..."
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function RatingField({ value, onChange, label, max = 5 }: { value: number; onChange: (v: number) => void; label: string; max?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => {
          const starVal = i + 1;
          const isActive = value >= starVal;
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onChange(value === starVal ? 0 : starVal)}
              className={`p-1 rounded-full transition-colors ${isActive ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
              aria-label={`Calificar con ${starVal} estrellas`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <Input
          label={field.label}
          type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          error={error}
        />
      );

    case 'date': {
      const strValue = (value as string) ?? '';
      let dateError = error;
      if (strValue && field.name === 'startDate' && isDateInFuture(strValue)) {
        dateError = 'La fecha de inicio no puede ser posterior a hoy.';
      }
      return (
        <Input
          label={field.label}
          type="text"
          value={strValue}
          onChange={(v) => onChange(v)}
          placeholder={field.placeholder ?? 'YYYY-MM'}
          error={dateError}
        />
      );
    }

    case 'textarea':
      return (
        <Textarea
          label={field.label}
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          maxLength={field.maxLength}
          markdownHint={field.markdownHint}
          error={error}
        />
      );

    case 'list':
      return (
        <ListField
          label={field.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(v)}
        />
      );

    case 'tags':
      return (
        <TagsField
          label={field.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(v)}
        />
      );

    case 'rating':
      return (
        <RatingField
          label={field.label}
          value={(value as number) ?? 0}
          onChange={(v) => onChange(v)}
          max={field.max ?? 5}
        />
      );
  }
}

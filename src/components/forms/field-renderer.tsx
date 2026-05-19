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
      if (strValue && !/^\d{4}(-\d{2})?$/.test(strValue)) {
        dateError = 'Formato de fecha no válido. Usa YYYY-MM (ej. 2024-03) o YYYY.';
      } else if (strValue && field.name === 'startDate' && isDateInFuture(strValue)) {
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
  }
}

'use client';

import { useState } from 'react';
import type { SectionKey } from '@/lib/schemas/cv';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FieldRenderer } from '@/components/forms/field-renderer';
import type { SectionConfig } from '@/components/forms/section-configs';

interface EntryCardProps {
  entry: Record<string, unknown> & { id: string; isActive: boolean };
  sectionKey: SectionKey;
  config: SectionConfig;
  onChange: (id: string, updates: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function EntryCard({
  entry,
  sectionKey,
  config,
  onChange,
  onRemove,
  onToggle,
  onMoveUp,
  onMoveDown,
}: EntryCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const title = config.entryTitle(entry);

  return (
    <div className={`border border-gray-200 rounded-xl p-4 transition-opacity ${entry.isActive ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="flex-1 font-medium text-gray-900 truncate">{title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Mover arriba">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Mover abajo">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          )}
          <ToggleSwitch checked={entry.isActive} onChange={() => onToggle(entry.id)} size="sm" />
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)} aria-label="Eliminar entrada">
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' || field.type === 'list' || field.type === 'tags' ? 'md:col-span-2' : ''}>
            <FieldRenderer
              field={field}
              value={entry[field.name]}
              onChange={(val) => onChange(entry.id, { [field.name]: val })}
            />
          </div>
        ))}
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onRemove(entry.id);
          setShowDeleteModal(false);
        }}
        title="Eliminar entrada"
        variant="danger"
        confirmLabel="Eliminar"
      >
        <p>¿Estás seguro de que quieres eliminar &ldquo;{title}&rdquo;? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}

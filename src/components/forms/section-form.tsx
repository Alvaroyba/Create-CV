'use client';

import type { SectionKey, SectionEntry } from '@/lib/schemas/cv';
import { MAX_ENTRIES } from '@/lib/constants';
import { useCVContext } from '@/providers/cv-provider';
import { useToggle } from '@/hooks/use-toggle';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Button } from '@/components/ui/button';
import { EntryCard } from '@/components/forms/entry-card';
import type { SectionConfig } from '@/components/forms/section-configs';

interface SectionFormProps {
  sectionKey: SectionKey;
  config: SectionConfig;
}

export function SectionForm({ sectionKey, config }: SectionFormProps) {
  const { data, addEntry, updateEntry, removeEntry, reorderEntries } = useCVContext();
  const { toggleEntry, toggleSection, getSectionState } = useToggle();

  const entries = data[sectionKey] as SectionEntry[];
  const sectionState = getSectionState(sectionKey);
  const atLimit = entries.length >= MAX_ENTRIES;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
          <span className="text-sm text-gray-500">{entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}</span>
        </div>
        {entries.length > 0 && (
          <ToggleSwitch
            checked={sectionState === 'all'}
            indeterminate={sectionState === 'mixed'}
            onChange={() => toggleSection(sectionKey)}
            label="Toda la sección"
            size="sm"
          />
        )}
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            entry={entry as unknown as Record<string, unknown> & { id: string; isActive: boolean }}
            sectionKey={sectionKey}
            config={config}
            onChange={(id, updates) => updateEntry(sectionKey, id, updates)}
            onRemove={(id) => removeEntry(sectionKey, id)}
            onToggle={(id) => toggleEntry(sectionKey, id)}
            onMoveUp={index > 0 ? () => reorderEntries(sectionKey, index, index - 1) : undefined}
            onMoveDown={index < entries.length - 1 ? () => reorderEntries(sectionKey, index, index + 1) : undefined}
          />
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => addEntry(sectionKey)}
        disabled={atLimit}
      >
        + Agregar {config.addLabel}
      </Button>
    </div>
  );
}

'use client';

import { useCVContext } from '@/providers/cv-provider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MAX_FIELD_LENGTHS } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export function BasicsForm() {
  const { data, setBasics } = useCVContext();
  const { basics } = data;

  const updateProfile = (index: number, updates: Record<string, string>) => {
    const profiles = [...basics.profiles];
    profiles[index] = { ...profiles[index], ...updates };
    setBasics({ profiles });
  };

  const addProfile = () => {
    setBasics({ profiles: [...basics.profiles, { network: '', username: '', url: undefined }] });
  };

  const removeProfile = (index: number) => {
    setBasics({ profiles: basics.profiles.filter((_, i) => i !== index) });
  };

  const nameError = basics.name.trim() === '' ? 'El nombre completo es obligatorio' : undefined;
  const emailError = basics.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email) ? 'Formato de email inválido' : undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre *"
          value={basics.name}
          onChange={(v) => setBasics({ name: v })}
          maxLength={MAX_FIELD_LENGTHS.name}
          error={nameError}
        />
        <Input
          label="Título profesional"
          value={basics.label}
          onChange={(v) => setBasics({ label: v })}
          maxLength={MAX_FIELD_LENGTHS.label}
          placeholder="Ej: Ingeniero de Software"
        />
        <Input
          label="Email"
          type="email"
          value={basics.email ?? ''}
          onChange={(v) => setBasics({ email: v || undefined })}
          error={emailError}
        />
        <Input
          label="Teléfono"
          value={basics.phone}
          onChange={(v) => setBasics({ phone: v })}
          placeholder="+34 600 000 000"
        />
        <Input
          label="Sitio web"
          type="url"
          value={basics.url ?? ''}
          onChange={(v) => setBasics({ url: v || undefined })}
          placeholder="https://..."
        />
        <Input
          label="Ciudad"
          value={basics.location.city}
          onChange={(v) => setBasics({ location: { ...basics.location, city: v } })}
          maxLength={MAX_FIELD_LENGTHS.city}
        />
        <Input
          label="País"
          value={basics.location.country}
          onChange={(v) => setBasics({ location: { ...basics.location, country: v } })}
          maxLength={MAX_FIELD_LENGTHS.country}
        />
      </div>

      <Textarea
        label="Resumen profesional"
        value={basics.summary}
        onChange={(v) => setBasics({ summary: v })}
        maxLength={MAX_FIELD_LENGTHS.summary}
        markdownHint
      />

      <div>
        <h3 className="text-base font-medium text-gray-800 mb-3">Perfiles</h3>
        <div className="space-y-3">
          {basics.profiles.map((profile, i) => (
            <div key={i} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                <Input
                  label="Red"
                  value={profile.network}
                  onChange={(v) => updateProfile(i, { network: v })}
                  placeholder="Ej: LinkedIn"
                />
                <Input
                  label="Usuario"
                  value={profile.username}
                  onChange={(v) => updateProfile(i, { username: v })}
                />
                <Input
                  label="URL"
                  type="url"
                  value={profile.url ?? ''}
                  onChange={(v) => updateProfile(i, { url: v })}
                  placeholder="https://..."
                />
              </div>
              <button
                type="button"
                onClick={() => removeProfile(i)}
                className="mt-6 text-red-400 hover:text-red-600 text-lg leading-none"
                aria-label="Eliminar perfil"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={addProfile} className="mt-3">
          + Agregar perfil
        </Button>
      </div>
    </div>
  );
}

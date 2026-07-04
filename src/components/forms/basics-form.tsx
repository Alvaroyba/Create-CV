'use client';

import { useCVContext } from '@/providers/cv-provider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MAX_FIELD_LENGTHS } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export function BasicsForm({ templateId }: { templateId?: string }) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBasics({ image: base64String });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>

      {templateId === 'creative' && (
        <div className="flex items-center gap-4 mb-2">
          {basics.image ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={basics.image} alt="Perfil" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil (opcional)</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                id="photo-upload"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 text-sm"
              >
                Subir foto
              </label>
              {basics.image && (
                <Button variant="ghost" size="sm" onClick={() => setBasics({ image: undefined })}>
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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

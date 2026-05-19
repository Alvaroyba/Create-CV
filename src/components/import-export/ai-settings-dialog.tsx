'use client';

import { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  AI_PROVIDERS,
  loadAIConfig,
  saveAIConfig,
  clearAIConfig,
} from '@/lib/ai-config';
import type { AIProvider, AIConfig } from '@/lib/ai-config';

type VerifyState = 'idle' | 'verifying' | 'valid' | 'invalid';

interface AISettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AISettingsDialog({ open, onClose }: AISettingsDialogProps) {
  const [provider, setProvider] = useState<AIProvider>('ollama');
  const [model, setModel] = useState('llama3');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (!open) return;
    const config = loadAIConfig();
    if (config) {
      setProvider(config.provider);
      setModel(config.model);
      setApiKey(config.apiKey);
      setVerifyState('idle');
    } else {
      setProvider('ollama');
      setModel('llama3');
      setApiKey('');
      setVerifyState('idle');
    }
    setVerifyError('');
  }, [open]);

  const handleProviderChange = useCallback((newProvider: AIProvider) => {
    setProvider(newProvider);
    setModel(AI_PROVIDERS[newProvider].models[0].id);
    setVerifyState('idle');
  }, []);

  const isLocal = provider === 'ollama';

  const handleVerify = useCallback(async () => {
    if (!isLocal && !apiKey.trim()) return;
    setVerifyState('verifying');
    setVerifyError('');

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setVerifyState('valid');
      } else {
        setVerifyState('invalid');
        setVerifyError(data.error ?? 'Clave inválida.');
      }
    } catch {
      setVerifyState('invalid');
      setVerifyError('No se pudo verificar la clave.');
    }
  }, [apiKey, provider, isLocal]);

  const handleSave = useCallback(() => {
    const config: AIConfig = {
      provider,
      apiKey: isLocal ? 'ollama' : apiKey.trim(),
      model,
    };
    saveAIConfig(config);
    onClose();
  }, [provider, apiKey, model, onClose, isLocal]);

  const handleClear = useCallback(() => {
    clearAIConfig();
    setApiKey('');
    setVerifyState('idle');
    setVerifyError('');
  }, []);

  return (
    <Modal open={open} onClose={onClose} title="Configurar IA">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((key) => (
              <option key={key} value={key}>{AI_PROVIDERS[key].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {AI_PROVIDERS[provider].models.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {!isLocal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setVerifyState('idle'); }}
                placeholder="sk-..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showKey ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        )}

        {isLocal && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            Ollama se ejecuta localmente, no necesita API key. Asegúrate de que Ollama esté corriendo (<code className="text-xs bg-gray-200 px-1 rounded">ollama serve</code>).
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerify}
            loading={verifyState === 'verifying'}
            disabled={!isLocal && !apiKey.trim()}
          >
            {isLocal ? 'Verificar conexión' : 'Verificar clave'}
          </Button>
          {verifyState === 'valid' && (
            <span className="text-sm text-green-600 font-medium">Clave válida</span>
          )}
          {verifyState === 'invalid' && (
            <span className="text-sm text-red-600">{verifyError}</span>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLocal ? false : !apiKey}>
            Borrar configuración
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isLocal && !apiKey.trim()}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

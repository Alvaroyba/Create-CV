import type { TemplateDefinition } from './types';
import { classicTemplate } from './classic';
import { modernTemplate } from './modern';
import { creativeTemplate } from './creative';

// ── Template Registry ───────────────────────────────────────────────────

const registry = new Map<string, TemplateDefinition>();

function registerTemplate(template: TemplateDefinition): void {
  registry.set(template.id, template);
}

export function getTemplate(id: string): TemplateDefinition {
  const template = registry.get(id);
  if (!template) {
    // Fallback to classic if the requested template doesn't exist
    const classic = registry.get('classic');
    if (!classic) {
      throw new Error(`Template "${id}" not found and no fallback available.`);
    }
    return classic;
  }
  return template;
}

export function getAllTemplates(): TemplateDefinition[] {
  return Array.from(registry.values());
}

// ── Register built-in templates ─────────────────────────────────────────

registerTemplate(classicTemplate);
registerTemplate(modernTemplate);
registerTemplate(creativeTemplate);

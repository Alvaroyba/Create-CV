'use client';

import type { CVData, SectionKey, SectionEntry } from '@/lib/schemas/cv';
import type { Work, Education, Skill, Language, Project, Certification, Volunteer, Publication } from '@/lib/schemas/cv';
import { markdownToHTML } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { SECTION_CONFIGS, SECTION_ORDER } from '@/components/forms/section-configs';

function DateRange({ start, end, showPresent }: { start?: string; end?: string; showPresent?: boolean }) {
  if (!start && !end) return null;
  return (
    <span className="text-sm text-gray-500">
      {start ? formatDate(start) : ''}
      {(start || end) && ' — '}
      {end ? formatDate(end) : showPresent ? 'Actualmente' : ''}
    </span>
  );
}

function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-0.5">
      {items.map((h, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: markdownToHTML(h) }} />
      ))}
    </ul>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  if (!content) return null;
  return <div className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: markdownToHTML(content) }} />;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mt-5 mb-2">
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
      <hr className="border-gray-300 mt-1" />
    </div>
  );
}

function WorkSection({ entries }: { entries: Work[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-3">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-sm">{e.position}</span>
          {e.company && <span className="text-sm text-gray-600"> — {e.company}</span>}
        </div>
        <DateRange start={e.startDate} end={e.endDate} showPresent />
      </div>
      <MarkdownBlock content={e.summary} />
      <Highlights items={e.highlights} />
    </div>
  ));
}

function EducationSection({ entries }: { entries: Education[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-3">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-sm">{e.area}</span>
          {e.studyType && <span className="text-sm text-gray-600"> ({e.studyType})</span>}
          {e.institution && <span className="text-sm text-gray-600"> — {e.institution}</span>}
        </div>
        <DateRange start={e.startDate} end={e.endDate} />
      </div>
      {e.score && <p className="text-sm text-gray-600">Nota: {e.score}</p>}
      {e.courses.length > 0 && (
        <p className="text-sm text-gray-600 mt-0.5">Cursos: {e.courses.join(', ')}</p>
      )}
    </div>
  ));
}

function SkillsSection({ entries }: { entries: Skill[] }) {
  return (
    <div className="space-y-1.5">
      {entries.map((e) => (
        <div key={e.id} className="text-sm">
          <span className="font-semibold">{e.name}</span>
          {e.level && <span className="text-gray-500"> ({e.level})</span>}
          {e.keywords.length > 0 && <span className="text-gray-600">: {e.keywords.join(', ')}</span>}
        </div>
      ))}
    </div>
  );
}

function LanguagesSection({ entries }: { entries: Language[] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1">
      {entries.map((e) => (
        <span key={e.id} className="text-sm">
          <span className="font-semibold">{e.language}</span>
          {e.fluency && <span className="text-gray-500"> — {e.fluency}</span>}
        </span>
      ))}
    </div>
  );
}

function ProjectsSection({ entries }: { entries: Project[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-3">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-sm">{e.name}</span>
        <DateRange start={e.startDate} end={e.endDate} />
      </div>
      <MarkdownBlock content={e.description} />
      <Highlights items={e.highlights} />
      {e.keywords.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{e.keywords.join(' · ')}</p>
      )}
      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{e.url}</a>}
    </div>
  ));
}

function CertificationsSection({ entries }: { entries: Certification[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-2 text-sm">
      <span className="font-semibold">{e.name}</span>
      {e.issuer && <span className="text-gray-600"> — {e.issuer}</span>}
      {e.date && <span className="text-gray-500 ml-2">({formatDate(e.date)})</span>}
      {e.url && (
        <>
          {' '}
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver</a>
        </>
      )}
    </div>
  ));
}

function VolunteerSection({ entries }: { entries: Volunteer[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-3">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-sm">{e.position}</span>
          {e.organization && <span className="text-sm text-gray-600"> — {e.organization}</span>}
        </div>
        <DateRange start={e.startDate} end={e.endDate} />
      </div>
      <MarkdownBlock content={e.summary} />
      <Highlights items={e.highlights} />
    </div>
  ));
}

function PublicationsSection({ entries }: { entries: Publication[] }) {
  return entries.map((e) => (
    <div key={e.id} className="mb-3">
      <div>
        <span className="font-semibold text-sm">{e.name}</span>
        {e.publisher && <span className="text-sm text-gray-600"> — {e.publisher}</span>}
        {e.releaseDate && <span className="text-sm text-gray-500 ml-2">({formatDate(e.releaseDate)})</span>}
      </div>
      <MarkdownBlock content={e.summary} />
      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{e.url}</a>}
    </div>
  ));
}

const SECTION_RENDERERS: Record<SectionKey, React.ComponentType<{ entries: SectionEntry[] }>> = {
  work: WorkSection as React.ComponentType<{ entries: SectionEntry[] }>,
  education: EducationSection as React.ComponentType<{ entries: SectionEntry[] }>,
  skills: SkillsSection as React.ComponentType<{ entries: SectionEntry[] }>,
  languages: LanguagesSection as React.ComponentType<{ entries: SectionEntry[] }>,
  projects: ProjectsSection as React.ComponentType<{ entries: SectionEntry[] }>,
  certifications: CertificationsSection as React.ComponentType<{ entries: SectionEntry[] }>,
  volunteer: VolunteerSection as React.ComponentType<{ entries: SectionEntry[] }>,
  publications: PublicationsSection as React.ComponentType<{ entries: SectionEntry[] }>,
};

interface PreviewSectionsProps {
  data: CVData;
}

export function PreviewSections({ data }: PreviewSectionsProps) {
  const { basics } = data;

  return (
    <div className="font-serif text-gray-900">
      {/* Header */}
      <div className="text-center mb-4">
        {basics.name && <h1 className="text-xl font-bold">{basics.name}</h1>}
        {basics.label && <p className="text-sm text-gray-600 mt-0.5">{basics.label}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location.city && (
            <span>{[basics.location.city, basics.location.country].filter(Boolean).join(', ')}</span>
          )}
          {basics.url && (
            <a href={basics.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {basics.url}
            </a>
          )}
        </div>
        {basics.profiles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-0.5 text-xs text-gray-500">
            {basics.profiles.map((p, i) => (
              <span key={i}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {p.network || p.username}
                  </a>
                ) : (
                  <span>{p.network}{p.username ? `: ${p.username}` : ''}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {basics.summary && (
        <>
          <SectionTitle title="Resumen" />
          <MarkdownBlock content={basics.summary} />
        </>
      )}

      {/* Sections */}
      {SECTION_ORDER.map((key) => {
        const entries = (data[key] as SectionEntry[]).filter((e) => e.isActive);
        if (entries.length === 0) return null;
        const Renderer = SECTION_RENDERERS[key];
        return (
          <div key={key}>
            <SectionTitle title={SECTION_CONFIGS[key].title} />
            <Renderer entries={entries} />
          </div>
        );
      })}
    </div>
  );
}

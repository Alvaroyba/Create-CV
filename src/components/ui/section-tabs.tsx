'use client';

export interface SectionTabItem {
  key: string;
  label: string;
  count?: number;
}

export interface SectionTabsProps {
  sections: SectionTabItem[];
  activeSection: string;
  onChange: (key: string) => void;
}

export function SectionTabs({ sections, activeSection, onChange }: SectionTabsProps) {
  return (
    <nav className="sticky top-0 bg-white z-10 border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-hide" role="tablist">
        {sections.map((section) => {
          const isActive = section.key === activeSection;
          return (
            <button
              key={section.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(section.key)}
              className={`shrink-0 px-4 py-3 text-sm whitespace-nowrap transition-colors duration-200 border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
              {section.count != null && section.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-xs px-2 py-0.5">
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

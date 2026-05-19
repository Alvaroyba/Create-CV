import { z } from 'zod';
import { MAX_ENTRIES, MAX_FIELD_LENGTHS } from '@/lib/constants';

const dateField = z.string().regex(/^\d{4}(-\d{2})?$/).optional();
const urlField = z.union([z.string().url(), z.literal('')]).optional();
const markdownField = (max: number) => z.string().max(max).default('');

export const ProfileSchema = z.object({
  network: z.string().max(60).default(''),
  username: z.string().max(80).default(''),
  url: urlField,
});

export const LocationSchema = z.object({
  city: z.string().max(MAX_FIELD_LENGTHS.city).default(''),
  country: z.string().max(MAX_FIELD_LENGTHS.country).default(''),
});

export const BasicsSchema = z.object({
  name: z.string().max(MAX_FIELD_LENGTHS.name).default(''),
  label: z.string().max(MAX_FIELD_LENGTHS.label).default(''),
  email: z.string().email().optional(),
  phone: z.string().max(30).default(''),
  url: urlField,
  summary: markdownField(MAX_FIELD_LENGTHS.summary),
  location: LocationSchema.default({ city: '', country: '' }),
  profiles: z.array(ProfileSchema).default([]),
});

export const WorkSchema = z.object({
  id: z.string(),
  company: z.string().max(MAX_FIELD_LENGTHS.company).default(''),
  position: z.string().max(MAX_FIELD_LENGTHS.position).default(''),
  startDate: dateField,
  endDate: dateField,
  summary: markdownField(MAX_FIELD_LENGTHS.summary),
  highlights: z.array(z.string().max(MAX_FIELD_LENGTHS.highlight)).default([]),
  isActive: z.boolean().default(true),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().max(MAX_FIELD_LENGTHS.institution).default(''),
  area: z.string().max(MAX_FIELD_LENGTHS.area).default(''),
  studyType: z.string().max(MAX_FIELD_LENGTHS.studyType).default(''),
  startDate: dateField,
  endDate: dateField,
  score: z.string().max(MAX_FIELD_LENGTHS.score).default(''),
  courses: z.array(z.string().max(200)).default([]),
  isActive: z.boolean().default(true),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().max(MAX_FIELD_LENGTHS.skillName).default(''),
  level: z.string().max(MAX_FIELD_LENGTHS.skillLevel).default(''),
  keywords: z.array(z.string().max(80)).default([]),
  isActive: z.boolean().default(true),
});

export const LanguageSchema = z.object({
  id: z.string(),
  language: z.string().max(MAX_FIELD_LENGTHS.language).default(''),
  fluency: z.string().max(MAX_FIELD_LENGTHS.fluency).default(''),
  isActive: z.boolean().default(true),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().max(MAX_FIELD_LENGTHS.projectName).default(''),
  description: markdownField(MAX_FIELD_LENGTHS.summary),
  highlights: z.array(z.string().max(MAX_FIELD_LENGTHS.highlight)).default([]),
  keywords: z.array(z.string().max(80)).default([]),
  startDate: dateField,
  endDate: dateField,
  url: urlField,
  isActive: z.boolean().default(true),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().max(MAX_FIELD_LENGTHS.certName).default(''),
  issuer: z.string().max(MAX_FIELD_LENGTHS.issuer).default(''),
  date: dateField,
  url: urlField,
  isActive: z.boolean().default(true),
});

export const VolunteerSchema = z.object({
  id: z.string(),
  organization: z.string().max(MAX_FIELD_LENGTHS.orgName).default(''),
  position: z.string().max(MAX_FIELD_LENGTHS.position).default(''),
  startDate: dateField,
  endDate: dateField,
  summary: markdownField(MAX_FIELD_LENGTHS.summary),
  highlights: z.array(z.string().max(MAX_FIELD_LENGTHS.highlight)).default([]),
  isActive: z.boolean().default(true),
});

export const PublicationSchema = z.object({
  id: z.string(),
  name: z.string().max(MAX_FIELD_LENGTHS.pubName).default(''),
  publisher: z.string().max(MAX_FIELD_LENGTHS.publisher).default(''),
  releaseDate: dateField,
  url: urlField,
  summary: markdownField(MAX_FIELD_LENGTHS.summary),
  isActive: z.boolean().default(true),
});

export const CVDataSchema = z.object({
  basics: BasicsSchema,
  work: z.array(WorkSchema).max(MAX_ENTRIES).default([]),
  education: z.array(EducationSchema).max(MAX_ENTRIES).default([]),
  skills: z.array(SkillSchema).max(MAX_ENTRIES).default([]),
  languages: z.array(LanguageSchema).max(MAX_ENTRIES).default([]),
  projects: z.array(ProjectSchema).max(MAX_ENTRIES).default([]),
  certifications: z.array(CertificationSchema).max(MAX_ENTRIES).default([]),
  volunteer: z.array(VolunteerSchema).max(MAX_ENTRIES).default([]),
  publications: z.array(PublicationSchema).max(MAX_ENTRIES).default([]),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Volunteer = z.infer<typeof VolunteerSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type CVData = z.infer<typeof CVDataSchema>;

export type SectionEntry =
  | Work
  | Education
  | Skill
  | Language
  | Project
  | Certification
  | Volunteer
  | Publication;

export type SectionKey = Exclude<keyof CVData, 'basics'>;

export function createEmptyCVData(): CVData {
  return {
    basics: {
      name: '',
      label: '',
      phone: '',
      summary: '',
      location: { city: '', country: '' },
      profiles: [],
    },
    work: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    volunteer: [],
    publications: [],
  };
}

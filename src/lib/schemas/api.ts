import { z } from 'zod';
import { CVDataSchema } from './cv';

export const PdfOptionsSchema = z.object({
  templateId: z.string().default('default'),
  pageSize: z.enum(['letter', 'A4']).default('letter'),
  singlePage: z.boolean().default(false),
});

export const GeneratePdfRequestSchema = z.object({
  cvData: CVDataSchema,
  options: PdfOptionsSchema.default({ templateId: 'default', pageSize: 'letter', singlePage: false }),
});

export type PdfOptions = z.infer<typeof PdfOptionsSchema>;
export type GeneratePdfRequest = z.infer<typeof GeneratePdfRequestSchema>;

import { z } from 'zod'

export const aiSystemSchema = z.object({ name: z.string().trim().min(2).max(120), owner: z.string().trim().min(2).max(120), risk: z.enum(['High', 'Medium', 'Low']), status: z.string().trim().min(2).max(60), review: z.string().trim().min(2).max(40).optional() })
export const assessmentSchema = z.object({ aiSystemId: z.coerce.number().int().positive().optional(), name: z.string().trim().min(2).max(120), category: z.string().trim().min(2).max(80), score: z.coerce.number().min(0).max(10), owner: z.string().trim().min(2).max(120), findings: z.string().trim().max(2000).optional() })
export const vettingSchema = z.object({ name: z.string().trim().min(2).max(120), type: z.enum(['Internal use case', 'External vendor']), submitted: z.string().trim().min(2).max(120), due: z.string().trim().min(2).max(40).optional(), decision: z.enum(['Pending review', 'In review', 'Approved', 'Approved with conditions', 'Rejected']).optional() })
export const roleSchema = z.object({ name: z.string().trim().min(2).max(120), role: z.string().trim().min(2).max(100), area: z.string().trim().min(2).max(120), systems: z.string().trim().max(100).optional(), status: z.string().trim().max(40).optional() })
export const escalationSchema = z.object({ system: z.string().trim().min(2).max(120), summary: z.string().trim().min(5).max(1000), severity: z.enum(['High', 'Medium', 'Low']), owner: z.string().trim().min(2).max(120), due: z.string().trim().max(40).optional(), status: z.enum(['Open', 'In Review', 'Resolved']).optional(), resolution: z.string().trim().max(2000).optional() })
export function validate(schema, payload) {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) { const error = new Error(parsed.error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; ')); error.status = 422; throw error }
  return parsed.data
}

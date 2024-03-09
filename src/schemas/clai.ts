import { z } from 'zod'

const templates = z.array(z.object({
  template: z.string(),
  outDir: z.string()
}).optional())

const explanation = z.object({
  folder: z.string(),
  explanation: z.string()
}).optional()

export const claiConfig = z.object({
  overview: z.string(),
  explain: z.array(explanation),
  commands: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.string().optional()),
      templates,
      hooks: z.array(z.string().optional())
    })
  ),
  extensions: z.array(z.string()),
  includes: z.array(z.string())
})

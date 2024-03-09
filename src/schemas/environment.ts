import { z } from 'zod'

export const environmentSchema = z.object({
  OPEN_AI_SECRET_KEY: z.string()
})

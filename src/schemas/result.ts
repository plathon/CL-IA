import { z } from 'zod'

export const resultSchema = z.object({
  result: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      type: z.string(),
      explanation: z.string()
    })
  )
})

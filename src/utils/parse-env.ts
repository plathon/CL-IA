import 'dotenv/config'
import { environmentSchema } from '../schemas/environment'

const parsed = environmentSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsed.data

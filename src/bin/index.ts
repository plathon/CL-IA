#!/usr/bin/env node
import fs from 'fs'
import { exit } from 'process'
import { program } from 'commander'
import OpenAI from 'openai'
import { env } from '../utils/parse-env'
import { claiConfig } from '../schemas/clai'
import { readFilesRecursively } from '../utils/read-files-recursively'
import { commandPrompt } from '../prompts/command'

const openai = new OpenAI({ apiKey: env.OPEN_AI_SECRET_KEY })
const asyncFs = fs.promises

program
  .name('cl-ai')
  .description('A CLI tool for generating options')
  .version('0.0.1')

program
  .command('command')
  .description('standalone command')
  .argument('<string>', 'prompt to generate a the command')
  .option('-c, --config <string>', 'configuration file default: "./clai.json"', './clai.json')
  .action(async (str, opt) => {
    const configFile = opt.config as string
    try {
      const jsonConfig = await asyncFs.readFile(configFile, 'utf-8')
      const config = JSON.parse(jsonConfig)
      const safeConfigData = claiConfig.parse(config)

      const directoriesPath = safeConfigData.includes
      const fileExtensions = safeConfigData.extensions

      const code = readFilesRecursively(directoriesPath, fileExtensions)

      const result = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: commandPrompt.head },
          { role: 'system', content: `files of the project: ${JSON.stringify(code)}` },
          { role: 'system', content: commandPrompt.body },
          { role: 'system', content: safeConfigData.overview },
          { role: 'user', content: str }
        ],
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' }
      })

      const content = result.choices[0].message.content ?? ''
      console.log('result -> ', JSON.parse(content))
    } catch (err) {
      console.log('err -> ', err)
      exit(1)
    }
  })

program.parse(process.argv)

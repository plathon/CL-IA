#!/usr/bin/env node
import fs from 'fs'
import { exit } from 'process'
import { program } from 'commander'
import confirm from '@inquirer/confirm'
import OpenAI from 'openai'
import { env } from '../utils/parse-env'
import { claiConfig } from '../schemas/clai'
import { type resultSchema } from '../schemas/result'
import { readFilesRecursively } from '../utils/read-files-recursively'
import { commandPrompt } from '../prompts/command'
import { loading, stopLoading } from '../utils/loading'
import { type z } from 'zod'

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

      const loadingChatApiCall = loading()

      const result = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: commandPrompt.head },
          { role: 'system', content: `files of the project: ${JSON.stringify(code)}` },
          { role: 'system', content: `directories of the project: ${JSON.stringify(safeConfigData.explain)}` },
          { role: 'system', content: commandPrompt.body },
          { role: 'system', content: safeConfigData.overview },
          { role: 'user', content: str }
        ],
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' },
        temperature: 0.1
      })

      stopLoading(loadingChatApiCall)
      const resultContentString = result.choices[0].message.content ?? ''
      const resultContent: z.infer<typeof resultSchema> = JSON.parse(resultContentString)

      console.log('Plain ➜')
      resultContent.result.forEach(function (item, index) {
        console.log(`File: ${++index}`)
        console.log('path: ', item.path)
        console.log('explanation: ', item.explanation)
      })

      const answer = await confirm({ message: 'would you like to create this files?' })
      if (answer) {
        resultContent.result.forEach(async function (item) {
          await asyncFs.writeFile(item.path, item.content)
        })
      }
    } catch (err) {
      console.log('err -> ', err)
      exit(1)
    }
  })

program.parse(process.argv)

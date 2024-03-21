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
import { execPrompt } from '../prompts/exec'
import { loading, stopLoading } from '../utils/loading'
import { replaceVariables } from '../utils/replaceVariables'
import { type z } from 'zod'

const openai = new OpenAI({ apiKey: env.OPEN_AI_SECRET_KEY })
const asyncFs = fs.promises

program
  .name('cl-ai')
  .description('A CLI tool for generating options')
  .version('0.0.1')

program
  .command('command')
  .description('execute a standalone command')
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

      console.log(
        [
          { role: 'system', content: commandPrompt.head },
          { role: 'system', content: `files of the project: ${JSON.stringify(code)}` },
          { role: 'system', content: `directories of the project: ${JSON.stringify(safeConfigData.explain)}` },
          { role: 'system', content: commandPrompt.body },
          { role: 'system', content: safeConfigData.overview },
          { role: 'user', content: str }
        ]
      )
      // const loadingChatApiCall = loading()

      // const result = await openai.chat.completions.create({
      //   messages: [
      //     { role: 'system', content: commandPrompt.head },
      //     { role: 'system', content: `files of the project: ${JSON.stringify(code)}` },
      //     { role: 'system', content: `directories of the project: ${JSON.stringify(safeConfigData.explain)}` },
      //     { role: 'system', content: commandPrompt.body },
      //     { role: 'system', content: safeConfigData.overview },
      //     { role: 'user', content: str }
      //   ],
      //   model: 'gpt-4-turbo-preview',
      //   response_format: { type: 'json_object' },
      //   temperature: 0.1
      // })

      // stopLoading(loadingChatApiCall)
      // const resultContentString = result.choices[0].message.content ?? ''
      // const resultContent: z.infer<typeof resultSchema> = JSON.parse(resultContentString)

      // console.log('Plain ➜')
      // resultContent.result.forEach(function (item, index) {
      //   console.log(`File: ${++index}`)
      //   console.log('path: ', item.path)
      //   console.log('explanation: ', item.explanation)
      // })

      // const answer = await confirm({ message: 'would you like to create this files?' })
      // if (answer) {
      //   resultContent.result.forEach(async function (item) {
      //     await asyncFs.writeFile(item.path, item.content)
      //   })
      // }
    } catch (err) {
      console.log('err -> ', err)
      exit(1)
    }
  })

program
  .command('exec')
  .description('execute a pre-defined template command')
  .argument('<string>', 'command name')
  .option('-c, --config <string>', 'configuration file default: "./clai.json"', './clai.json')
  .option('-p, --param <string>', 'json parameter')
  .action(async (str, opt) => {
    const configFile = opt.config as string
    const paramOpt = opt.param as string

    try {
      const parsedParams = await JSON.parse(paramOpt) as Record<string, string>
      const jsonConfig = await asyncFs.readFile(configFile, 'utf-8')
      const config = JSON.parse(jsonConfig)
      const safeConfigData = claiConfig.parse(config)

      const commands = safeConfigData.commands
      const command = commands.find(command => command?.name === str)

      if (command === undefined) {
        throw new Error('command not found.')
      }

      const templates = await Promise.all(command.templates.map(async (template) => {
        if (template?.template === undefined || template.outFile === undefined) {
          throw new Error('undefined template name.')
        }
        const content = await asyncFs.readFile(`./.clai/templates/${command.name}/${template.template}`, 'utf-8')
        return { template: content, outFile: replaceVariables(template.outFile, parsedParams) }
      }))
      const loadingChatApiCall = loading()

      const result = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: execPrompt.head },
          { role: 'system', content: `templates: ${JSON.stringify(templates)}` },
          { role: 'system', content: `instructions: ${JSON.stringify(command.instructions)}` },
          { role: 'system', content: execPrompt.body },
          { role: 'system', content: `More context about the big picture of the app that you are building: ${safeConfigData.overview}` },
          { role: 'user', content: 'Create the necessary files based on provided templates. Each template represents a file to be generated, containing code relevant to the functionality of the app. Ensure that the variables within the templates are replaced with the corresponding values provided in a dictionary.' }
        ],
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' },
        temperature: 0.1
      })

      stopLoading(loadingChatApiCall)
      const resultContentString = result.choices[0].message.content ?? ''
      const resultContent: z.infer<typeof resultSchema> = JSON.parse(resultContentString)
      console.log('🚀 ~ .action ~ resultContent:', resultContent)

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

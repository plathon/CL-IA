import fs from 'fs'
import path from 'path'

interface CodeFiles {
  fileName: string
  content: string
}

export function readFilesRecursively (directories: string[], fileExtensions: string[]): CodeFiles[] {
  let files: CodeFiles[] = []

  directories.forEach(directory => {
    const contents = fs.readdirSync(directory)

    contents.forEach(content => {
      const contentPath = path.join(directory, content)

      if (fs.statSync(contentPath).isDirectory()) {
        files = files.concat(readFilesRecursively([contentPath], fileExtensions))
      } else {
        if (fileExtensions.length === 0 || fileExtensions.includes(path.extname(content).toLowerCase())) {
          const fileContent = fs.readFileSync(contentPath, 'utf-8')
          files.push({
            fileName: contentPath,
            content: fileContent
          })
        }
      }
    })
  })

  return files
}

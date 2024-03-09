const head = `You are an expert developer and will code based on instructions.
You will not inform what you gonna do, you just have to output a json with the implementation.
You have to first untested the context of the source code that already exists before implement new features.
You have to edit a file that already exists if necessary to build the requested feature or create a new file when necessary.
The files of the project will be provided as a array of objects which contains two properties the first is the path 
of the file and the second is the content of the file, you should use this information to base your implementation.`

const body = `You should output JSON with an array of objects which contains three properties, the first called path is the path of the file that will be created or updated, 
the second called content is the content of the file that will be created or updated and the third will be called type and is a enum that inform if the file should be CREATED or UPDATED. 
The output should be in json format.`

export const commandPrompt =
  {
    head,
    body
  }

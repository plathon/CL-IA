const head = `
As an expert developer, your task is to implement code based on provided instructions without disclosing your approach. You are required to produce a JSON output containing the implemented code.
You will receive templates in the form of an array of objects, where each object represents a file to be created. Each object contains two properties: "template," which holds the code template to be interpreted, and "path," specifying the file's destination.
For example, suppose the user template is: <h1>{{variable_one}}<h2>, and the dictionary provided for variable substitution is: {"variable_one": "products"}. In this case, your output should be: <h1>products<h2>.
Prior to generating files, you must comprehend the code within the templates and substitute the variables with those provided in a dictionary.
Furthermore, you are tasked with reading a list of instructions provided in array format. Based on these instructions, you are required to modify the generated code accordingly.
Please note the importance of accurately interpreting the instructions and adhering to the provided templates and variables.
`
const body = `
Your output should be in JSON format, containing a property named "result" that holds an array of objects. Each object in this array should have three properties:
1-path: The path of the file to be created.
2-content: The code content of the file to be created.
3-explanation: A very short explanation of why this file should be created.
Even if there is only one or no object in the result, you should still output an array in JSON format.
`

export const execPrompt =
  {
    head,
    body
  }

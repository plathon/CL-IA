# CL-AI

### A ai-powered code generator CLI to the modern age.

**cl-ai** is a command-line interface (CLI) tool designed to streamline code generation tasks using advanced language models, including GPT-3 and GPT-4. This tool empowers developers to swiftly produce high-quality code snippets, templates, and even entire functions with minimal effort.

## Features

1. **Efficient Code Generation:** Harnesses the power of cutting-edge language models to swiftly generate code snippets, reducing development time and effort.
2. **Customizable Templates:** Enables users to create and utilize custom code templates tailored to their specific project requirements.
3. **Natural Language Interface:** Offers an intuitive natural language interface, allowing users to describe their code requirements in plain English, which is then translated into functional code.
4. **Multi-Model Capabilities:** Leverages a diverse array of advanced language models for code generation, enabling users to benefit from the unique strengths of each model.

## Installation

```sh
npm i @plathon/cl-ai -g
```

## Setup

Create a **clai.json** in the root of your project.
Example:

```json
{
  "overview": "",
  "explain": [
    {
      "folder": "./src/bin",
      "explanation": ""
    }
  ],
  "commands": [
    {
      "name": "example",
      "args": ["name"],
      "templates": [
        {
          "template": "{{name}}-controller.ts",
          "outFile": "./src/controllers/{{name}}-controller.ts"
        },
        {
          "template": "{{name}}-view.ts",
          "outFile": "./src/views/{{name}}-view.ts"
        }
      ],
      "instructions": []
    }
  ],
  "extensions": [".ts"],
  "includes": ["./src/bin", "./src/schemas"]
}
```

## Usage

```sh
cl-ai --help
```

Talk to me on Twitter([@renanplathon](https://twitter.com/renanplathon))

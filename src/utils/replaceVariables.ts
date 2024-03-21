export function replaceVariables (str: string, variables: Record<string, string>): string {
  const regex: RegExp = /{{([^{}]+)}}/g

  return str.replace(regex, (match: string, varName: string) => {
    const trimmedVarName: string = varName.trim()
    return trimmedVarName in variables ? variables[trimmedVarName] : match
  })
}

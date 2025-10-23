export function parseMultipart(body: string, boundary: string): Array<{name: string, data: Buffer}> {
  const parts: Array<{name: string, data: Buffer}> = []
  const boundaryStr = `--${boundary}`
  const partsArray = body.split(boundaryStr)
  
  for (const part of partsArray) {
    if (part.trim() === '' || part.includes('--')) continue
    
    const headerEnd = part.indexOf('\r\n\r\n')
    if (headerEnd === -1) continue
    
    const headers = part.substring(0, headerEnd)
    const content = part.substring(headerEnd + 4, part.length - 2)
    
    const nameMatch = headers.match(/name="([^"]+)"/)
    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        data: Buffer.from(content, 'binary')
      })
    }
  }
  
  return parts
}
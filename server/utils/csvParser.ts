export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '')
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/^"(.*)"$/, '$1')
  )

  const result = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = parseCSVLine(line)
    
    if (values.length !== headers.length) continue
    
    const obj: any = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j].replace(/^"(.*)"$/, '$1')
    }
    result.push(obj)
  }
  
  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}
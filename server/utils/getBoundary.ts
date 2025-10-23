export function getBoundary(contentType: string | undefined): string {
  if (!contentType) {
    throw createError({ statusCode: 400, message: 'Invalid content type' })
  }
  
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)
  if (!boundaryMatch) {
    throw createError({ statusCode: 400, message: 'Invalid multipart form data' })
  }
  
  return boundaryMatch[1] || boundaryMatch[2]
}
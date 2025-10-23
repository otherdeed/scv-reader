import prisma from "../utils/db"
import { getBoundary } from "../utils/getBoundary"
import { parseMultipart } from "../utils/parseMultipart"

export default defineEventHandler(async (event) => {
  try {
    // Читаем сырое тело запроса
    const body = await readRawBody(event, 'utf8')
    
    if (!body) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }
    
    const boundary = getBoundary(event.node.req.headers['content-type'])
    const parts = parseMultipart(body, boundary)
    const filePart = parts.find(part => part.name === 'file')
    const fileNamePart = parts.find(part => part.name === 'fileName')
    
    if (!filePart) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }
    
    if (!fileNamePart) {
      throw createError({ statusCode: 400, message: 'File name is required' })
    }
    
    const requestedFileName = fileNamePart.data.toString('utf8').trim()
    
    if (!requestedFileName) {
      throw createError({ statusCode: 400, message: 'File name cannot be empty' })
    }
    
    // Проверяем уникальность имени файла
    const existingFile = await prisma.csvFile.findFirst({
      where: {
        fileName: requestedFileName
      }
    })
    
    if (existingFile) {
      throw createError({ 
        statusCode: 400, 
        message: `File with name "${requestedFileName}" already exists` 
      })
    }
    
    const csvText = filePart.data.toString('utf8')
    const data = parseCSV(csvText)
    
    if (data.length === 0) {
      throw createError({ statusCode: 400, message: 'CSV file is empty' })
    }
    
    const columns = Object.keys(data[0])
    const fileSize = Buffer.byteLength(csvText, 'utf8')
    
    // Создаем запись о файле с переданным именем
    const csvFile = await prisma.csvFile.create({
      data: {
        fileName: requestedFileName,
        rowCount: data.length,
        columns: JSON.stringify(columns),
        fileSize
      }
    })
    
    // Создаем данные батчами для производительности
    const batchSize = 1000
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(row => ({
        rowData: row,
        csvFileId: csvFile.id
      }))
      
      await prisma.csvData.createMany({
        data: batch
      })
    }
    
    return { 
      success: true, 
      rowCount: data.length,
      fileId: csvFile.id,
      fileName: requestedFileName,
      columns 
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    
    // Если ошибка уже создана с помощью createError, просто пробрасываем её
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to save CSV data' 
    })
  }
})
import prisma from "../utils/db"
import { formatFileSize } from "../utils/formatFileSize"

export default defineEventHandler(async () => {
  try {
    const files = await prisma.csvFile.findMany({
      select: {
        id: true,
        fileName: true,
        rowCount: true,
        columns: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const filesWithParsedColumns = files.map(file => ({
      ...file,
      columns: JSON.parse(file.columns),
      fileSizeFormatted: file.fileSize ? formatFileSize(file.fileSize) : null
    }))
    
    return {
      success: true,
      data: filesWithParsedColumns,
      total: files.length
    }
  } catch (error) {
    console.error('Get files error:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to fetch CSV files' 
    })
  }
})
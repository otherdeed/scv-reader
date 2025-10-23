import prisma from "../utils/db"

export default defineEventHandler(async (event) => {
  const {
    id,
    search,
    page = 1,
    limit = 15
  } = getQuery(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID parameter is required'
    })
  }

  const fileId = Number(id)
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const skip = (pageNum - 1) * limitNum

  if (isNaN(fileId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID must be a valid number'
    })
  }

  try {
    const file = await prisma.csvFile.findUnique({
      where: { id: fileId },
      select: { id: true, fileName: true, columns: true }
    })

    if (!file) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    const columns = JSON.parse(file.columns) as string[]

    if (!search || (typeof search === 'string' && search.trim() === '')) {
      const [data, total] = await Promise.all([
        prisma.csvData.findMany({
          where: { csvFileId: fileId },
          skip,
          take: limitNum,
          orderBy: { id: 'asc' }
        }),
        prisma.csvData.count({
          where: { csvFileId: fileId }
        })
      ])

      return {
        success: true,
        data: data,
        total: total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        fileInfo: {
          id: file.id,
          fileName: file.fileName,
          columns: columns,
          searchQuery: search
        }
      }
    }

    const searchTerm = `%${(search as string).toLowerCase()}%`
    
    const columnConditions = columns.map(col => 
      `json_extract("rowData", '$."${col}"') LIKE ?`
    ).join(' OR ')

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM "CsvData" 
      WHERE "csvFileId" = ? 
      AND (${columnConditions})
    `
    
    const countParams: any[] = [fileId, ...columns.map(() => searchTerm)]
    const countResult: any[] = await prisma.$queryRawUnsafe(countQuery, ...countParams)
    const total = Number(countResult[0].count)

    const dataQuery = `
      SELECT * 
      FROM "CsvData" 
      WHERE "csvFileId" = ? 
      AND (${columnConditions})
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `
    const dataParams: any[] = [fileId, ...columns.map(() => searchTerm), limitNum, skip]
    const data = await prisma.$queryRawUnsafe(dataQuery, ...dataParams)

    return {
      success: true,
      data: data,
      total: total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      fileInfo: {
        id: file.id,
        fileName: file.fileName,
        columns: columns,
        searchQuery: search
      }
    }

  } catch (error: any) {
    console.error('Search error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error: ' + error.message
    })
  }
})
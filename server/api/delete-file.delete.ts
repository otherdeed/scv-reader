import prisma from "../utils/db"

export default defineEventHandler(async (event) => {
  const {
    id
  } = getQuery(event)

  if( !id ) {
    throw createError({
      statusCode: 400,
      message: 'Id is reqired'
    })
  }
  try {
    const file = await prisma.csvFile.delete({where: {id: Number(id)}})

    return {
      success: true,
      data: file,
    }
  } catch (error) {
    console.error('Get files error:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to delete CSV files' 
    })
  }
})
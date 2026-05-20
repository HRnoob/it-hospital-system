import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    jwt.verify(token, JWT_SECRET)
    const { cardId, sourceColumn, destinationColumn, newPosition } = await request.json()

    // Update column and position
    await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        column: destinationColumn,
        position: newPosition,
      },
    })

    // Reorder positions in destination column
    const cardsInColumn = await prisma.kanbanCard.findMany({
      where: { column: destinationColumn },
      orderBy: { position: 'asc' },
    })

    for (let i = 0; i < cardsInColumn.length; i++) {
      await prisma.kanbanCard.update({
        where: { id: cardsInColumn[i].id },
        data: { position: i },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
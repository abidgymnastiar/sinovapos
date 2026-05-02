import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type SoldPerDay = {
  date: string
  sold: number
}

export async function GET() {
  try {
    const result = await prisma.$queryRaw<SoldPerDay[]>`
      SELECT 
        DATE(createdAt) as date,
        COALESCE(SUM(sold), 0) as sold
      FROM Product
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("API ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sold data",
      },
      { status: 500 }
    )
  }
}
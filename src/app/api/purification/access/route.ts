import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "يجب إنشاء حساب لاستخدام حاسبة التطهير"
      }, { status: 401 })
    }

    // Get current user with purificationCount
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        purificationCount: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ 
        error: "User not found",
        message: "المستخدم غير موجود"
      }, { status: 404 })
    }

    // Check if user has purification attempts remaining
    const currentCount = currentUser.purificationCount ?? 0
    if (currentCount <= 0) {
      return NextResponse.json({
        message: "لقد وصلت للحد الأقصى"
      }, { status: 402 })
    }

    // Atomic decrement with race condition protection
    // Only decrement if count is still > 0
    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        purificationCount: { gt: 0 } // Only update if still greater than 0
      },
      data: {
        purificationCount: { decrement: 1 }
      }
    })

    // If no rows updated, user ran out of purifications
    if (updatedUser.count === 0) {
      return NextResponse.json({
        message: "لقد وصلت للحد الأقصى"
      }, { status: 402 })
    }

    // Fetch updated count to return
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { purificationCount: true }
    })

    return NextResponse.json({ 
      success: true,
      purificationCount: finalUser?.purificationCount ?? 0,
    })

  } catch (error) {
    console.error("Error checking purification access:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: "حدث خطأ ما. يرجى المحاولة مرة أخرى"
    }, { status: 500 })
  }
}

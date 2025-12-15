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

    // Decrement purificationCount
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        purificationCount: currentCount - 1
      },
      select: {
        purificationCount: true
      }
    })

    return NextResponse.json({ 
      success: true,
      purificationCount: updatedUser.purificationCount,
    })

  } catch (error) {
    console.error("Error checking purification access:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: "حدث خطأ ما. يرجى المحاولة مرة أخرى"
    }, { status: 500 })
  }
}

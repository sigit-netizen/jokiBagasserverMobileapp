import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS status");

    return NextResponse.json({
      success: true,
      message: "Database connected",
      data: rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database NOT connected",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

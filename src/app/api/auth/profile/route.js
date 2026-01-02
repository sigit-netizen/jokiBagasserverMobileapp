// app/api/auth/users/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    let page = Number(searchParams.get("page")) || 1;
    let limit = Number(searchParams.get("limit")) || 10;

    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit)); // max 100 per halaman

    const offset = (page - 1) * limit;

    // Ambil data user dengan pagination
    const [rows] = await db.query(
      "SELECT id, nama, email FROM user ORDER BY id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    // Hitung total data
    const [[totalRow]] = await db.query("SELECT COUNT(*) AS total FROM user");
    const totalData = Number(totalRow.total);
    const totalPage = Math.ceil(totalData / limit);

    return NextResponse.json({
      success: true,
      data: rows, // ✅ Ubah dari `rows` ke `data`
      pagination: {
        page,
        limit,
        totalData,
        totalPage,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/auth/users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
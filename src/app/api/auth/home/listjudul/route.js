// app/api/auth/home/listjudul/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Ambil query param
    let page = Number(searchParams.get("page")) || 1;
    let limit = Number(searchParams.get("limit")) || 3;
    const search = searchParams.get("search") || "";

    // Validasi
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));

    const offset = (page - 1) * limit;

    // Query pencarian: hanya cocokkan judul
    const searchCondition = search ? "WHERE title LIKE ?" : "";
    const searchTerm = `%${search}%`;

    // Ambil data judul dengan pencarian dan pagination
    const [rows] = await db.query(
      `SELECT id, title, description FROM judul ${searchCondition} ORDER BY id ASC LIMIT ? OFFSET ?`,
      search ? [searchTerm, limit, offset] : [limit, offset]
    );

    // Hitung total data
    const [[totalRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM judul ${searchCondition}`,
      search ? [searchTerm] : []
    );
    const totalData = Number(totalRow.total);
    const totalPage = Math.ceil(totalData / limit);

    return NextResponse.json({
      success: true,
      data: rows, // ← pastikan ini adalah array
      pagination: {
        page,
        limit,
        totalData,
        totalPage,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/auth/home/listjudul:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
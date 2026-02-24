// app/api/auth/users/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

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
    const { data: rows, error, count } = await supabase
      .from("users")
      .select("id, nama, email", { count: "exact" })
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalData = count || 0;
    const totalPage = Math.ceil(totalData / limit);

    return NextResponse.json({
      success: true,
      data: rows,
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
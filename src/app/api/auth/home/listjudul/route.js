// app/api/auth/home/listjudul/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Ambil query param
    let page = Number(searchParams.get("page")) || 1;
    let limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";

    // Validasi
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));

    const offset = (page - 1) * limit;

    // Ambil data judul dengan pencarian dan pagination
    let query = supabase
      .from("judul")
      .select("*", { count: "exact" });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: rows, error, count } = await query
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
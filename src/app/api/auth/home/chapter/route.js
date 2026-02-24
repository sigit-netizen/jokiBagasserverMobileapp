import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/* =========================
   GET - LIST CHAPTER (WITH PAGINATION)
========================= */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const judulId = searchParams.get("judulId");

    if (!judulId) {
      return NextResponse.json(
        { success: false, message: "judulId wajib" },
        { status: 400 }
      );
    }

    // Pagination
    let page = Number(searchParams.get("page")) || 1;
    let limit = Number(searchParams.get("limit")) || 100;

    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));

    const offset = (page - 1) * limit;

    // Ambil data chapter dengan pagination
    const { data: rows, error, count } = await supabase
      .from("content")
      .select("id, chapter, isi", { count: "exact" })
      .eq("id_judul", judulId)
      .order("chapter", { ascending: true })
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   POST - TAMBAH CHAPTER
========================= */
export async function POST(request) {
  try {
    const { judulId, chapter, isi } = await request.json();

    if (!judulId || !chapter || !isi) {
      return NextResponse.json(
        { success: false, message: "Data chapter tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi: cek apakah judulId ada di tabel judul
    const { data: judulCheck, error: fetchError } = await supabase
      .from("judul")
      .select("id")
      .eq("id", judulId)
      .single();

    if (fetchError || !judulCheck) {
      return NextResponse.json(
        { success: false, message: `Judul dengan ID ${judulId} tidak ditemukan` },
        { status: 404 }
      );
    }

    // Cek duplicate chapter
    const { data: cekDuplicate } = await supabase
      .from("content")
      .select("id")
      .eq("id_judul", judulId)
      .eq("chapter", chapter)
      .single();

    if (cekDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Chapter ${chapter} sudah ada untuk judul ini`,
        },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from("content")
      .insert([{ id_judul: judulId, chapter: Number(chapter), isi }]);

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: false, message: "Chapter sudah ada" },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json(
      { success: true, message: "Chapter berhasil ditambahkan" },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    let limit = Number(searchParams.get("limit")) || 5; // default 5 chapter per page

    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit)); // max 100 per halaman

    const offset = (page - 1) * limit;

    // Ambil data chapter dengan pagination
    const [rows] = await db.query(
      "SELECT id, chapter, isi FROM content WHERE id_judul = ? ORDER BY chapter ASC LIMIT ? OFFSET ?",
      [judulId, limit, offset]
    );

    // Hitung total data
    const [[totalRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM content WHERE id_judul = ?",
      [judulId]
    );
    const totalData = Number(totalRow.total);
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
    const [judulCheck] = await db.query(
      "SELECT id FROM judul WHERE id = ?",
      [judulId]
    );

    if (judulCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: `Judul dengan ID ${judulId} tidak ditemukan` },
        { status: 404 }
      );
    }

    // Cek duplicate chapter
    const [cek] = await db.query(
      "SELECT id FROM content WHERE id_judul = ? AND chapter = ?",
      [judulId, chapter]
    );

    if (cek.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Chapter ${chapter} sudah ada untuk judul ini`,
        },
        { status: 409 }
      );
    }

    await db.query(
      "INSERT INTO content (id_judul, chapter, isi) VALUES (?, ?, ?)",
      [judulId, chapter, isi]
    );

    return NextResponse.json(
      { success: true, message: "Chapter berhasil ditambahkan" },
      { status: 201 }
    );

  } catch (error) {
    // safety net UNIQUE
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Chapter sudah ada" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
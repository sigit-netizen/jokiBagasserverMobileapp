import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // === Validasi kosong ===
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Judul dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    // === Cek judul sudah ada ===
    const [cek] = await db.query(
      "SELECT id FROM judul WHERE title = ?",
      [title]
    );

    if (cek.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Judul sudah ada, gunakan judul lain",
        },
        { status: 409 }
      );
    }

    // === Simpan data ===
    await db.query(
      "INSERT INTO judul (title, description) VALUES (?, ?)",
      [title, description]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Judul berhasil ditambahkan",
      },
      { status: 201 }
    );
  } catch (error) {
    // === Safety jika UNIQUE kena ===
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "Judul sudah ada, gunakan judul lain",
        },
        { status: 409 }
      );
    }

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

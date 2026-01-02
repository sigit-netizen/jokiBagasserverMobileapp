import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==========================
// GET — ambil isi chapter
// ==========================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.query(
      "SELECT id, isi FROM content WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Chapter tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0], // ← OBJECT
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ==========================
// PUT — edit isi chapter
// ==========================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { isi } = await request.json();

    if (!isi) {
      return NextResponse.json(
        { success: false, message: "Isi chapter wajib diisi" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "UPDATE content SET isi = ? WHERE id = ?",
      [isi, id]
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Chapter tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Isi chapter berhasil diperbarui",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ==========================
// DELETE — hapus chapter
// ==========================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.query(
      "DELETE FROM content WHERE id = ?",
      [id]
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Chapter tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chapter berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

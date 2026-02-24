import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

// ==========================
// GET — ambil isi chapter
// ==========================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: chapter, error } = await supabase
      .from("content")
      .select("id, isi")
      .eq("id", id)
      .single();

    if (error || !chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
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

    const { error } = await supabase
      .from("content")
      .update({ isi })
      .eq("id", id);

    if (error) throw error;

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

    const { error } = await supabase
      .from("content")
      .delete()
      .eq("id", id);

    if (error) throw error;

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

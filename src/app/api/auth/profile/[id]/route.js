import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import bcrypt from "bcryptjs";

// REGEX VALIDASI EMAIL
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================
   GET - PROFILE BY ID
========================= */
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const userId = Number(id);

    if (!userId || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, nama, email")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error di GET /api/auth/profile/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   PUT - UPDATE PROFILE BY ID
========================= */
export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const userId = Number(id);

    if (!userId || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama, email, password } = body;

    // Validasi input: setidaknya satu field harus diisi
    if (!nama && !email && !password) {
      return NextResponse.json(
        { success: false, message: "Setidaknya satu field (nama, email, password) harus diisi" },
        { status: 400 }
      );
    }

    // Validasi email jika diisi
    if (email && !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validasi password jika diisi
    if (password && password.length < 4) {
      return NextResponse.json(
        { success: false, message: "Password minimal 4 karakter" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan oleh user lain (jika email diisi)
    if (email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email sudah digunakan oleh user lain" },
          { status: 409 }
        );
      }
    }

    // Siapkan data yang akan di-update
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update data user
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Profile berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Error di PUT /api/auth/profile/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE - HAPUS USER BY ID
========================= */
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const userId = Number(id);

    if (!userId || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    // Hapus user
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error di DELETE /api/auth/profile/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

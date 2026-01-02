import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// REGEX VALIDASI EMAIL
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================
   GET - PROFILE BY ID
========================= */
export async function GET(request, { params }) {
  const { id } = await params; // ✅ Gunakan await params
  console.log("🚀 params.id (sekarang):", id); // 🔍 Debug log

  try {
    const userId = Number(id);

    if (!userId || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT id, nama, email FROM user WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = rows[0];

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
      const [existingUser] = await db.query(
        "SELECT id FROM user WHERE email = ? AND id != ?",
        [email, userId]
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          { success: false, message: "Email sudah digunakan oleh user lain" },
          { status: 409 }
        );
      }
    }

    // Siapkan field yang akan di-update
    const updates = [];
    const values = [];

    if (nama) {
      updates.push("nama = ?");
      values.push(nama);
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    // Tambahkan userId ke akhir values
    values.push(userId);

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diperbarui" },
        { status: 400 }
      );
    }

    // Update data user
    await db.query(
      `UPDATE user SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

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
  const { id } = await params; // ✅ Gunakan await params

  try {
    const userId = Number(id);

    if (!userId || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah user ada
    const [rows] = await db.query(
      "SELECT id FROM user WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus user
    await db.query("DELETE FROM user WHERE id = ?", [userId]);

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
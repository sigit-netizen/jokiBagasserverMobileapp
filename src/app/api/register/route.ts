import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// REGEX VALIDASI EMAIL
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // === Ambil JSON Request ===
    const body = await request.json();
    const { nama, email, password } = body;

    // === Validasi Kosong ===
    if (!nama || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    // === Validasi Email ===
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid",
        },
        { status: 400 }
      );
    }

    // === Validasi Password ===
    if (password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 4 karakter",
        },
        { status: 400 }
      );
    }

    // === Cek Email Sudah Ada ===
    const [cek]: any = await db.query(
      "SELECT id FROM user WHERE email = ?",
      [email]
    );

    if (cek.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User sudah terdaftar",
        },
        { status: 409 }
      );
    }

    // === Hash Password ===
    const hashedPassword = await bcrypt.hash(password, 10);

    // === Simpan User ===
    await db.query(
      "INSERT INTO user (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashedPassword]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          nama,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // === Tangkap Duplicate (Extra Safety) ===
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
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

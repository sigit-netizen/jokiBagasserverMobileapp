import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, password } = body;

    // === Validasi Input ===
    if (!nama || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    // === Cari User berdasarkan Nama ===
    const [rows]: any = await db.query(
      "SELECT id, nama, password FROM user WHERE nama = ?",
      [nama]
    );

    // ❌ Nama tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama tidak terdaftar",
        },
        { status: 404 }
      );
    }

    const user = rows[0];

    // === Bandingkan Password ===
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // ❌ Password salah
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password salah",
        },
        { status: 401 }
      );
    }

    // ✅ Login Berhasil
    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          id: user.id,
          nama: user.nama,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
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

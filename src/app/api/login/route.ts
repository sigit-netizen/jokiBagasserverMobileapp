import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
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
    const { data: user, error } = await supabase
      .from("users")
      .select("id, nama, password")
      .eq("nama", nama)
      .single();

    // ❌ Nama tidak ditemukan atau error
    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama tidak terdaftar",
        },
        { status: 404 }
      );
    }

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

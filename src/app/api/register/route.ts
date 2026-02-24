import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
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
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
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
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ nama, email, password: hashedPassword }]);

    if (insertError) {
      if (insertError.code === "23505") { // Unique violation in Postgres
        return NextResponse.json(
          {
            success: false,
            message: "Email sudah terdaftar",
          },
          { status: 409 }
        );
      }
      throw insertError;
    }

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

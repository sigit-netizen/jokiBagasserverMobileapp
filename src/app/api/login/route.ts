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

    // === 1. Cek Login Admin (Via Supabase Auth) ===
    // Karena form di depan hanya ada "Nama", asumsikan admin memasukkan Email di kotak "Nama"
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: nama, // Mencoba login dengan email
      password: password
    });

    if (!authError && authData.user) {
      // ✅ Cukup pastikan login Auth berhasil, langsung beri akses Admin
      return NextResponse.json(
        {
          success: true,
          message: "Login admin berhasil",
          data: {
            id: authData.user.id,
            nama: "Admin", // Boleh disesuaikan
            isAdmin: true,
          },
        },
        { status: 200 }
      );
    }

    // === 2. Cek Login User Biasa (Tabel 'users') ===
    // Jika authError terjadi (misal: "nama" diisi huruf biasa, bukan email)
    // Maka lanjut ngecek ke tabel users

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

    // === Bandingkan Password Normal ===
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

    // ✅ Normal User Login Berhasil
    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          id: user.id,
          nama: user.nama,
          isAdmin: false,
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

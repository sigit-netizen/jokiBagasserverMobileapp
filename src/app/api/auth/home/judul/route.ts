// app/api/auth/home/judul/route.ts (POST)
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;

    if (!title || !description || !image) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, dan gambar wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!image.type || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File yang diunggah bukan gambar" },
        { status: 400 }
      );
    }

    // Cek judul sudah ada
    const { data: existingJudul, error: checkError } = await supabase
      .from("judul")
      .select("id")
      .eq("title", title)
      .single();

    if (existingJudul) {
      return NextResponse.json(
        {
          success: false,
          message: "Judul sudah ada, gunakan judul lain",
        },
        { status: 409 }
      );
    }

    // Simpan gambar ke folder public
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public/uploads/novels"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/novels/${fileName}`;

    // Simpan data ke database
    const { error: insertError } = await supabase
      .from("judul")
      .insert([{ title, description, cover_url: imageUrl }]);

    if (insertError) {
      if (insertError.code === "23505") { // Postgres unique violation
        return NextResponse.json(
          {
            success: false,
            message: "Judul sudah ada, gunakan judul lain",
          },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Judul dan gambar berhasil ditambahkan",
        imageUrl,
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

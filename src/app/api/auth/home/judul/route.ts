// app/api/auth/home/judul/route.ts (POST)
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

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
    const [cekRows] = await db.query(
      "SELECT id FROM judul WHERE title = ?",
      [title]
    );

 if (Array.isArray(cekRows) && cekRows.length > 0) {
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
      "public/uploads/judul"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/judul/${fileName}`;

    // Simpan data ke database
    await db.query(
      "INSERT INTO judul (title, description, cover_url) VALUES (?, ?, ?)",
      [title, description, imageUrl]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Judul dan gambar berhasil ditambahkan",
        imageUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "Judul sudah ada, gunakan judul lain",
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
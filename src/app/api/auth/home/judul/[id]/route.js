import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";



export async function DELETE(request, context) {
    try {
        const { id } = await context.params; // ✅ WAJIB await

        await db.query("DELETE FROM judul WHERE id = ?", [id]);

        return NextResponse.json({
            success: true,
            message: "Judul berhasil dihapus",
        });
    } catch (error) {
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

export async function PUT(request, { params }) {
  try {
    // ✅ Gunakan await untuk mendapatkan nilai id dari params
    const { id } = await params;

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const image = formData.get("image"); // Bisa null jika tidak diupload

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Judul dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil data lama dari database
    const [oldRow] = await db.query("SELECT cover_url FROM judul WHERE id = ?", [id]);

    if (oldRow.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    let imageUrl = oldRow[0].cover_url; // Default: tetap pakai gambar lama

    if (image && image.size > 0) {
      // Validasi tipe file
      if (!image.type || !image.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "File yang diunggah bukan gambar" },
          { status: 400 }
        );
      }

      // Hapus gambar lama jika ada
      if (imageUrl) {
        const oldImagePath = path.join(process.cwd(), "public", imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Simpan gambar baru
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

      imageUrl = `/uploads/judul/${fileName}`;
    }

    // Update data ke database
    await db.query(
      "UPDATE judul SET title = ?, description = ?, cover_url = ? WHERE id = ?",
      [title, description, imageUrl, id]
    );

    return NextResponse.json({
      success: true,
      message: "Judul berhasil diperbarui",
      imageUrl,
    });
  } catch (error) {
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

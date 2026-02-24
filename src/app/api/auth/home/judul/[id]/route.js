import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(request, context) {
    try {
        const { id } = await context.params;

        const { error } = await supabase
          .from("judul")
          .delete()
          .eq("id", id);

        if (error) throw error;

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
    const { id } = await params;
    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const image = formData.get("image");

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Judul dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil data lama dari database
    const { data: oldRow, error: fetchError } = await supabase
      .from("judul")
      .select("cover_url")
      .eq("id", id)
      .single();

    if (fetchError || !oldRow) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    let imageUrl = oldRow.cover_url;

    if (image && image.size > 0) {
      if (!image.type || !image.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "File yang diunggah bukan gambar" },
          { status: 400 }
        );
      }

      if (imageUrl) {
        const oldImagePath = path.join(process.cwd(), "public", imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

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

      imageUrl = `/uploads/novels/${fileName}`;
    }

    // Update data ke database
    const { error: updateError } = await supabase
      .from("judul")
      .update({ title, description, cover_url: imageUrl })
      .eq("id", id);

    if (updateError) throw updateError;

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

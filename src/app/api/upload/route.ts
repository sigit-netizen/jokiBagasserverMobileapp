import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function POST(req: Request) {
  // Ambil form data
  const formData = await req.formData();

  const image = formData.get("image") as File | null;
  const pdf = formData.get("pdf") as File | null;

  if (!image || !pdf) {
    return NextResponse.json(
      { message: "Image dan PDF wajib diisi" },
      { status: 400 }
    );
  }

  // Folder upload
  const imageDir = path.join(process.cwd(), "public/uploads/images");
  const pdfDir = path.join(process.cwd(), "public/uploads/pdfs");

  await fs.mkdir(imageDir, { recursive: true });
  await fs.mkdir(pdfDir, { recursive: true });

  // Nama file unik
  const imageName = `${crypto.randomUUID()}-${image.name}`;
  const pdfName = `${crypto.randomUUID()}-${pdf.name}`;

  // Simpan image
  await fs.writeFile(
    path.join(imageDir, imageName),
    Buffer.from(await image.arrayBuffer())
  );

  // Simpan pdf
  await fs.writeFile(
    path.join(pdfDir, pdfName),
    Buffer.from(await pdf.arrayBuffer())
  );

  // URL absolut (penting buat mobile)
  const baseUrl = process.env.APP_URL;

  return NextResponse.json({
    image_url: `${baseUrl}/uploads/images/${imageName}`,
    pdf_url: `${baseUrl}/uploads/pdfs/${pdfName}`,
  });
}

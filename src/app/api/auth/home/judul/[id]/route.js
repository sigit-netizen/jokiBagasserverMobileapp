import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

export async function PUT(request, context) {
    try {
        const { id } = await context.params; // WAJIB await
        const body = await request.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { success: false, message: "Judul dan deskripsi wajib diisi" },
                { status: 400 }
            );
        }

        await db.query(
            "UPDATE judul SET title = ?, description = ? WHERE id = ?",
            [title, description, id]
        );

        return NextResponse.json({
            success: true,
            message: "Judul berhasil diperbarui",
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

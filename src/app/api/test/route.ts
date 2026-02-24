import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Supabase connected",
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase NOT connected",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

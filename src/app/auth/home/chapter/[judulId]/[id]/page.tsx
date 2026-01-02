"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditChapterPage() {
  const router = useRouter();
  const { judulId, id } = useParams<{
    judulId: string;
    id: string;
  }>();

  const chapterId = Number(id);

  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);

  // === ambil isi chapter ===
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `/api/auth/home/chapter/${chapterId}`
      );
      const data = await res.json();

      if (res.ok) {
        setIsi(data.data.isi);
      } else {
        alert("Chapter tidak ditemukan");
      }
    };

    fetchData();
  }, [chapterId]);

  // === simpan edit ===
  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/auth/home/chapter/${chapterId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isi }),
        }
      );

      if (!res.ok) {
        alert("Gagal menyimpan");
        return;
      }

      // ✅ balik ke halaman by judul
      router.push(`/auth/home/chapter/${judulId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">
        ✏️ Edit Isi Chapter
      </h1>

      <form onSubmit={simpan}>
        <textarea
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          rows={18}
          className="w-full border-2 border-amber-300 rounded p-3 mb-4 bg-amber-50 text-black"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/auth/home/chapter/${judulId}`)
            }
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

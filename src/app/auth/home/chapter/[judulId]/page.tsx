"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Chapter = {
  id: number;
  chapter: number;
  isi: string;
};

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams<{ judulId: string }>();

  const judulId = Number(params.judulId);

  const [list, setList] = useState<Chapter[]>([]);
  const [chapter, setChapter] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5;
  const [totalPage, setTotalPage] = useState(1);
  const [totalChapters, setTotalChapters] = useState(0); // tambahkan state ini

  // ===== FETCH LIST CHAPTER =====
  const fetchData = async (p = page) => {
    if (!judulId) return;

    setLoadingList(true);
    try {
      const url = new URL('/api/auth/home/chapter', window.location.origin);
      url.searchParams.set('judulId', String(judulId));
      url.searchParams.set('page', String(p));
      url.searchParams.set('limit', String(limit));

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setList(Array.isArray(data.data) ? data.data : []);
        setTotalPage(data.pagination?.totalPage || 1);
        setTotalChapters(data.pagination?.totalData || 0); // simpan total chapter
      } else {
        setList([]);
        setTotalChapters(0);
      }
    } catch (err) {
      console.error("Gagal fetch chapter:", err);
      setList([]);
      setTotalChapters(0);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [judulId, page]);

  // ===== TAMBAH CHAPTER =====
  const tambah = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapter || !isi) {
      alert("Nomor chapter dan isi wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/home/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judulId,
          chapter: Number(chapter),
          isi,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal menambah chapter");
        return;
      }

      setChapter("");
      setIsi("");
      fetchData(1); // reset ke page 1 setelah tambah
      setPage(1);
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // ===== HAPUS =====
  const hapus = async (id: number) => {
    if (!confirm("Hapus chapter ini?")) return;

    try {
      await fetch(`/api/auth/home/chapter/${id}`, {
        method: "DELETE",
      });
      fetchData(page); // reload current page
    } catch {
      alert("Gagal menghapus chapter");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.push("/auth/home/inputjudul")}
        className="bg-blue-500 mb-4 inline-flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 text-black"
      >
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-2">
        📖 Chapter Judul #{judulId}
      </h1>

      {/* ===== TOTAL CHAPTER ===== */}
      <p className="text-gray-600 mb-6">
        Total Chapter: {totalChapters}
      </p>

      {/* ===== FORM TAMBAH ===== */}
      <form
        onSubmit={tambah}
        className="bg-white p-5 rounded-lg border mb-8"
      >
        <input
          type="number"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Nomor Chapter"
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />

        <textarea
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          placeholder="Isi chapter"
          rows={4}
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}
        >
          {loading ? "Menyimpan..." : "➕ Tambah Chapter"}
        </button>
      </form>

      {/* ===== LIST CHAPTER ===== */}
      {loadingList ? (
        <p>Loading...</p>
      ) : (
        <>
          {list.length === 0 ? (
            <p className="text-center text-gray-500">Tidak ada chapter.</p>
          ) : (
            list.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-lg border mb-4"
              >
                <h3 className="font-semibold text-black">
                  Chapter {c.chapter}
                </h3>

                <p className="mt-2 whitespace-pre-line text-black">
                  {c.isi}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/auth/home/chapter/${judulId}/${c.id}`)
                    }
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => hapus(c.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {/* ===== PAGINATION ===== */}
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {page} / {totalPage}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
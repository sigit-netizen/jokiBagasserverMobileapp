"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Judul = {
  id: number;
  title: string;
  description: string;
};

export default function InputJudulPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState<Judul[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // pagination & search
  const [page, setPage] = useState(1);
  const limit = 3;
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState(""); // tambahkan state search

  // Modal edit
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ===== FETCH LIST (PAGINATION & SEARCH) =====
  const fetchList = async (p = page) => {
  setLoadingList(true);
  try {
    const url = new URL('/api/auth/home/listjudul', window.location.origin);
    url.searchParams.set('page', String(p));
    url.searchParams.set('limit', String(limit));
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.success) {
      // Pastikan data.data adalah array
      setList(Array.isArray(data.data) ? data.data : []);
      setTotalPage(data.pagination?.totalPage || 1);
    } else {
      setList([]); // Jika error, kosongkan list
    }
  } catch (err) {
    console.error("Gagal memuat data:", err);
    setList([]); // Jika error, kosongkan list
  } finally {
    setLoadingList(false);
  }
};

  useEffect(() => {
    fetchList(page);
  }, [page, search]); // tambahkan search ke dependency

  // ===== SUBMIT TAMBAH =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/home/judul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Terjadi kesalahan.");
        return;
      }

      setMessage("✅ Data berhasil disimpan");
      setTitle("");
      setDescription("");
      fetchList(1); // balik ke page 1
      setPage(1);
    } catch {
      setMessage("❌ Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus judul ini?")) return;
    try {
      await fetch(`/api/auth/home/judul/${id}`, { method: "DELETE" });
      fetchList(page);
    } catch {
      alert("Gagal menghapus data.");
    }
  };

  // ===== EDIT =====
  const openEdit = (item: Judul) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setShowModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editId) return;

    try {
      const res = await fetch(`/api/auth/home/judul/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal memperbarui data.");
        return;
      }

      setShowModal(false);
      fetchList(page);
    } catch {
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.push("/auth/user")}
        className="bg-blue-500 mb-4 inline-flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 text-black"
      >
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">➕ Input Judul Novel</h1>

      {/* FORM INPUT */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-lg border mb-8"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi"
          rows={3}
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      {/* SEARCH INPUT */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari judul atau deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded text-black bg-amber-50"
        />
      </div>

      {/* LIST */}
      {loadingList ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="space-y-4">
            {list.length === 0 ? (
              <p className="text-center text-gray-500">Judul tidak ditemukan.</p>
            ) : (
              list.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 border rounded"
                >
                  <h3 className="font-semibold text-black">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/auth/home/chapter/${item.id}`)
                      }
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      📖 Chapter
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {/* <div className="flex justify-between items-center mt-6">
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
          </div> */}
        </>
      )}

      {/* MODAL EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border p-2 mb-3 text-black"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full border p-2 mb-4 text-black"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 bg-gray-600 text-white rounded">
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
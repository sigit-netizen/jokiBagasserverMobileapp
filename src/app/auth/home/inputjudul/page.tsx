"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Judul = {
  id: number;
  title: string;
  description: string;
  cover_url?: string;
};

export default function InputJudulPage() {
  const router = useRouter();

  // State untuk tambah
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk daftar
  const [list, setList] = useState<Judul[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Pagination & search
  const [page, setPage] = useState(1);
  const limit = 3;
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");

  // Modal edit
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview untuk edit
    }
  };

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
        setList(Array.isArray(data.data) ? data.data : []);
        setTotalPage(data.pagination?.totalPage || 1);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setList([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page, search]);

  // ===== SUBMIT TAMBAH =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/auth/home/judul", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Terjadi kesalahan.");
        return;
      }

      setMessage("✅ Data berhasil disimpan");
      setTitle("");
      setDescription("");
      setImage(null);
      fetchList(1); // Balik ke halaman 1
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
      fetchList(page); // Refresh halaman saat ini
    } catch {
      alert("Gagal menghapus data.");
    }
  };

  // ===== EDIT =====
  const openEdit = (item: Judul) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setPreviewUrl(item.cover_url || null); // Tampilkan preview gambar lama
    setShowModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editId) return;

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editImage) formData.append("image", editImage);

    try {
      const res = await fetch(`/api/auth/home/judul/${editId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal memperbarui data.");
        return;
      }

      setShowModal(false);
      fetchList(page); // Refresh halaman saat ini
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
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi"
          rows={3}
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border rounded mb-3 text-black"
        />
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}

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
                  className="bg-white p-4 border rounded flex items-start gap-4"
                >
                  {/* Gambar di kiri */}
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={`Cover ${item.title}`}
                      className="w-24 h-24 object-cover rounded border shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded border shrink-0">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}

                  {/* Judul dan deskripsi di sebelah kanan gambar */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>

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
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              className="w-full border p-2 mb-4 text-black"
            />

            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}

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
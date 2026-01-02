"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  email: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [form, setForm] = useState({ nama: "", email: "", password: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 10;

  // Fetch users
  const fetchUsers = async (p: number = page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/profile?page=${p}&limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
        setTotalPage(data.pagination.totalPage);
      } else {
        setError(data.message || "Gagal memuat data");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // Open modal: tambah
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({ nama: "", email: "", password: "" });
    setShowModal(true);
  };

  // Open modal: edit
  const openEditModal = (user: User) => {
    setIsEditing(true);
    setCurrentId(user.id);
    setForm({ nama: user.nama, email: user.email, password: "" });
    setShowModal(true);
  };

  // Submit form (add or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `/api/auth/profile/${currentId}`
        : `/api/register`;

      const body: any = { nama: form.nama, email: form.email };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(isEditing ? "User berhasil diperbarui" : "User berhasil ditambahkan");
        setShowModal(false);
        fetchUsers(); // Refresh list
      } else {
        alert(data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data");
      console.error(err);
    }
  };

  // Delete user
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const res = await fetch(`/api/auth/profile/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("User berhasil dihapus");
        fetchUsers(); // Refresh list
      } else {
        alert(data.message || "Gagal menghapus user");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus user");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👥 Daftar User</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/auth/home/inputjudul")} // Ganti ke halaman novel kamu
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            📖 Buka Halaman Novel
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕ Tambah User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto text-black">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Nama</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Tidak ada user
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">{user.id}</td>
                  <td className="py-2 px-4 border">{user.nama}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-black">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 "
        >
          Prev
        </button>

        <span className="text-gray-700">
          Page {page} / {totalPage}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
          disabled={page === totalPage}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit User" : "Tambah User Baru"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  {isEditing ? "Password Baru (Opsional)" : "Password"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-black"
                  minLength={4}
                  placeholder={isEditing ? "Biarkan kosong jika tidak ganti" : ""}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
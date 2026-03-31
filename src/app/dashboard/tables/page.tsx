'use client';


import React, { useEffect, useState } from 'react';
import { MapPin, Heart, Plus, Edit, Trash2, X } from 'lucide-react';

type Vedaconsulting = {
  _id: string;
  name: string;
  email: string;
  contactNo: string;
  location: string;
  healthIssue: string;
  status?: string;
  createdAt: string;
};

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done'];

export default function VedaconsultingPage() {
  const [data, setData] = useState<Vedaconsulting[]>([]);
  const [filtered, setFiltered] = useState<Vedaconsulting[]>([]);
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNo: '',
    location: '',
    healthIssue: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all records
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/vedaconsulting');
      const result = await res.json();
      const arr = result.data || [];
      setData(arr);
      setFiltered(arr);
      const statusInit: Record<string, string> = {};
      arr.forEach((c: Vedaconsulting) => (statusInit[c._id] = c.status || 'Pending'));
      setStatusMap(statusInit);
    }
    fetchData();
  }, []);

  // Search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      data.filter((c) =>
        [c.name, c.email, c.contactNo, c.location, c.healthIssue].some((field) =>
          field.toLowerCase().includes(value)
        )
      )
    );
  };

  // Status change (local only)
  const handleStatusChange = (id: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  // Open modal for add/edit
  const openModal = (item?: Vedaconsulting) => {
    if (item) {
      setEditId(item._id);
      setForm({
        name: item.name,
        email: item.email,
        contactNo: item.contactNo,
        location: item.location,
        healthIssue: item.healthIssue
      });
    } else {
      setEditId(null);
      setForm({ name: '', email: '', contactNo: '', location: '', healthIssue: '' });
    }
    setShowModal(true);
    setError(null);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: '', email: '', contactNo: '', location: '', healthIssue: '' });
    setError(null);
  };

  // Add or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/vedaconsulting/${editId}` : '/api/vedaconsulting';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save');
      // Refresh data
      const refreshed = await fetch('/api/vedaconsulting').then(r => r.json());
      setData(refreshed.data);
      setFiltered(refreshed.data);
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    setLoading(true);
    try {
      await fetch(`/api/vedaconsulting/${id}`, { method: 'DELETE' });
      const refreshed = await fetch('/api/vedaconsulting').then(r => r.json());
      setData(refreshed.data);
      setFiltered(refreshed.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">🧑‍⚕️ Veda Consulting
        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
          onClick={() => openModal()}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </h1>

      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search by name, email, contact, location, health issue"
        className="mb-4 w-full px-4 py-2 border rounded-md shadow-sm dark:bg-[#1a2332] dark:text-white"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No records found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-white shadow border rounded-xl p-4 flex justify-between items-start dark:bg-[#1a2332] dark:border-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-lg dark:text-white">{c.name}</h2>
                  <span className="text-xs text-gray-400 ml-2">{c.email}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Contact: {c.contactNo}</span>
                  <span><MapPin className="inline h-4 w-4 mr-1" />{c.location}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{c.healthIssue}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <select
                  value={statusMap[c._id]}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  className="border px-2 py-1 rounded text-sm dark:bg-[#1a2332] dark:text-white"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <button
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={() => openModal(c)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                    onClick={() => handleDelete(c._id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for add/edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={closeModal}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Veda Consulting</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                type="email"
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter your E-mail ID"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="Contact No."
                value={form.contactNo}
                onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))}
                required
              />
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="Where do you belong to?"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
              />
              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Health Issue"
                value={form.healthIssue}
                onChange={e => setForm(f => ({ ...f, healthIssue: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editId ? 'Update' : 'Add')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

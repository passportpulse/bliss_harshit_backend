"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import { Plus, Edit, Trash2, Send, X } from 'lucide-react';

interface Newsletter {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterResponse {
  data: Newsletter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function NewsletterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Newsletter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchNewsletters();
    }
    // eslint-disable-next-line
  }, [user, currentPage]);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(newsletters);
    } else {
      setFiltered(
        newsletters.filter((n) =>
          n.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, newsletters]);

  const fetchNewsletters = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/newsletter?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data: NewsletterResponse = await response.json();
        setNewsletters(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } else {
        setNewsletters([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      setNewsletters([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoadingData(false);
    }
  };

  // Add/Edit modal logic
  const openModal = (item?: Newsletter) => {
    if (item) {
      setEditId(item.id);
      setForm({ email: item.email });
    } else {
      setEditId(null);
      setForm({ email: "" });
    }
    setShowModal(true);
    setFormError(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ email: "" });
    setFormError(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/newsletter/${editId}` : "/api/newsletter";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchNewsletters();
      closeModal();
    } catch (err: any) {
      setFormError(err.message || "Error");
    } finally {
      setFormLoading(false);
    }
  };
  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this email?")) return;
    setFormLoading(true);
    try {
      await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
      await fetchNewsletters();
    } finally {
      setFormLoading(false);
    }
  };
  // Send newsletter modal
  const openSendModal = () => {
    setSendModal(true);
    setSendSubject("");
    setSendMessage("");
    setSendStatus(null);
  };
  const closeSendModal = () => {
    setSendModal(false);
    setSendStatus(null);
  };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendStatus("Sending...");
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: sendSubject, message: sendMessage })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to send");
      setSendStatus("Sent successfully!");
    } catch (err: any) {
      setSendStatus(err.message || "Error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

    return (
    <div className="p-4 md:p-8 2xl:p-12 max-w-6xl mx-auto">

      {/* Header + Add/Edit/Delete/Send */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📰 Newsletter Subscribers
          <button
            className="ml-4 bg-blue-600 text-sm hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
            onClick={() => openModal()}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
          <button
            className="ml-2 bg-green-600 text-sm  hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
            onClick={openSendModal}
          >
            <Send className="h-4 w-4" /> Send to All
          </button>
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total: {totalCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm px-3 py-2">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Table with edit/delete */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Subscribed</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {loadingData ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((newsletter) => (
                <tr key={newsletter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{newsletter.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(newsletter.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(newsletter.updatedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 mr-2"
                      onClick={() => openModal(newsletter)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleDelete(newsletter.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No newsletter subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Newsletter Email</h2>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : (editId ? 'Update' : 'Add')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for send to all */}
      {sendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={closeSendModal}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Send Newsletter to All</h2>
            <form onSubmit={handleSend} className="space-y-3">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="Subject"
                value={sendSubject}
                onChange={e => setSendSubject(e.target.value)}
                required
              />
              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Message"
                value={sendMessage}
                onChange={e => setSendMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
                disabled={sendStatus === 'Sending...'}
              >
                {sendStatus === 'Sending...' ? 'Sending...' : 'Send'}
              </button>
              {sendStatus && <div className="mt-2 text-center text-sm text-blue-600">{sendStatus}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTestimonialPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", image: "", content: "", location: "", rating: 5 });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'rating' ? Number(value) : value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'testimonial');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to upload image');
      setForm(f => ({ ...f, image: data.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create testimonial");
      setSuccess(true);
  setForm({ name: "", image: "", content: "", location: "", rating: 5 });
      setTimeout(() => router.push("/dashboard/testimonials"), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Testimonial</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-[#1a2332] p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-3 py-2 border rounded" />
          {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
          {form.image && (
            <img src={form.image} alt="Preview" className="h-16 w-16 rounded-full object-cover mt-2" />
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input name="location" value={form.location} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Rating</label>
          <select name="rating" value={form.rating} onChange={handleChange} required className="w-full px-3 py-2 border rounded">
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Fair</option>
            <option value={1}>1 - Poor</option>
          </select>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Testimonial added!</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          <Link href="/dashboard/testimonials" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const testimonialId = params.id as string;
  const [form, setForm] = useState({ name: "", image: "", content: "", location: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const res = await fetch(`/api/testimonials/${testimonialId}`);
        if (!res.ok) throw new Error("Testimonial not found");
        const data = await res.json();
        setForm({ name: data.name, image: data.image, content: data.content, location: data.location });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (testimonialId) fetchTestimonial();
  }, [testimonialId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update testimonial");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/testimonials"), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Testimonial</h1>
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
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Testimonial updated!</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <Link href="/dashboard/testimonials" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({ title: "", image: "", link: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    fetch(`/api/banners/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          image: data.image || "",
          link: data.link || "",
        });
      })
      .catch(() => setError("Failed to fetch banner"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let imageUrl = form.image;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", "banner");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      const res = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to update banner");
      setSuccess(true);
      setFile(null);
      setPreview("");
      setTimeout(() => router.push("/dashboard/banners"), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Banner</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-[#1a2332] p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border rounded" />
          {(preview || form.image) && (
            <img src={preview || form.image} alt="Preview" className="mt-2 w-40 h-20 object-cover rounded border" />
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Link (optional)</label>
          <input name="link" value={form.link} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Banner updated!</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          <Link href="/dashboard/banners" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

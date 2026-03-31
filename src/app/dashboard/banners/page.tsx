"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Banner {
  _id: string;
  title: string;
  image: string;
  link?: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete banner");
      setBanners(banners.filter(b => b._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Link href="/dashboard/banners/new" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add Banner</Link>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(b => (
          <div key={b._id} className="bg-white dark:bg-[#1a2332] rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Image src={b.image} alt={b.title} width={128} height={64} className="rounded object-cover" />
              <div>
                <div className="font-semibold text-lg">{b.title}</div>
                {b.link && <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{b.link}</a>}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Link href={`/dashboard/banners/${b._id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
              <button onClick={() => handleDelete(b._id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

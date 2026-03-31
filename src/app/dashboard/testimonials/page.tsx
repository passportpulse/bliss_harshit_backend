"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Testimonial {
  _id: string;
  name: string;
  image: string;
  content: string;
  location: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      setTestimonials(testimonials.filter(t => t._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <Link href="/dashboard/testimonials/new" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add Testimonial</Link>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(t => (
          <div key={t._id} className="bg-white dark:bg-[#1a2332] rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {t.image ? (
                <Image src={t.image} alt={t.name} width={64} height={64} className="rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {t.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">{t.name}</div>
                <div className="text-sm text-gray-500">{t.location}</div>
              </div>
            </div>
            <div className="text-gray-700 dark:text-gray-200 italic">"{t.content}"</div>
            <div className="flex gap-2 mt-2">
              <Link href={`/dashboard/testimonials/${t._id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
              <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

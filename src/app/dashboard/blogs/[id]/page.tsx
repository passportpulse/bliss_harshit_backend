"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  title: string;
  slug: string;
  content: string;
  image: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { name: string; slug: string };
}

export default function BlogPreviewPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${blogId}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setBlog(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (blogId) fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Blog Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "The blog you're looking for doesn't exist."}</p>
        <Link href="/dashboard/blogs" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/blogs" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block">&larr; Back to Blogs</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{blog.title}</h1>
        {blog.category && (
          <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium mb-2">{blog.category.name}</span>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {blog.publishedAt ? `Published on ${new Date(blog.publishedAt).toLocaleDateString()}` : "Draft"}
        </div>
      </div>
      {blog.image && (
        <div className="mb-6">
          <Image src={blog.image} alt={blog.title} width={800} height={400} className="rounded-lg object-cover w-full h-64" />
        </div>
      )}
      <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}

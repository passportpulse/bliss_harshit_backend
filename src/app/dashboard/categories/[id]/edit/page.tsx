"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Save, Tag } from "lucide-react";
import Link from "next/link";
import { authenticatedFetch, handleApiResponse } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  subCategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count: {
    products: number;
  };
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchCategory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`);
      if (!res.ok) {
        throw new Error('Category not found');
      }
      const data = await res.json();
      setCategory(data);
      setFormData({
        name: data.name,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load category");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCategory = async () => {
      const resolvedParams = await params;
      await fetchCategory(resolvedParams.id);
    };
    loadCategory();
  }, [params, fetchCategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const resolvedParams = await params;
      const res = await authenticatedFetch(`/api/categories/${resolvedParams.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name.trim(),
        }),
      });

      await handleApiResponse(res);
      setSuccess(true);
      
      // Update the local category data
      if (category) {
        setCategory({
          ...category,
          name: formData.name.trim(),
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (error && !category) {
    return (
      
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Category Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/dashboard/categories"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Categories
          </Link>
        </div>
  
    );
  }

  return (
    
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/categories"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Category
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <p className="text-green-600 dark:text-green-400">
              Category updated successfully!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter category name"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Slug: {formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <Link
                    href="/dashboard/categories"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Category Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Information
              </h3>
              
              {category && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Name
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {category.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Slug
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {category.slug}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Products
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {category._count.products} products
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subcategories
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {category.subCategories.length} subcategories
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(category.createdAt)}
                    </p>
                  </div>

                  {category.subCategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subcategories
                      </label>
                      <div className="mt-2 space-y-1">
                        {category.subCategories.map((subcategory) => (
                          <div key={subcategory.id} className="text-sm text-gray-600 dark:text-gray-400">
                            • {subcategory.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  
  );
} 
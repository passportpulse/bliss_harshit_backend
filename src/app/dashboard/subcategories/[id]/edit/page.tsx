"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ProtectedLayout } from "@/components/Layouts/ProtectedLayout";
import { ArrowLeft, Save, FolderOpen } from "lucide-react";
import Link from "next/link";
import { authenticatedFetch, handleApiResponse } from "@/lib/api";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
  });

  const fetchSubcategory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/subcategories/${id}`);
      if (!res.ok) {
        throw new Error('Subcategory not found');
      }
      const data = await res.json();
      setSubcategory(data);
      setFormData({
        name: data.name,
        categoryId: data.categoryId,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load subcategory");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const result = await res.json();
      // Handle new pagination format
      const data = result.data || result;
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      await fetchSubcategory(resolvedParams.id);
      await fetchCategories();
    };
    loadData();
  }, [params, fetchSubcategory, fetchCategories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Subcategory name is required");
      return;
    }

    if (!formData.categoryId) {
      setError("Category is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
  const resolvedParams = await params;
  const res = await authenticatedFetch(`/api/subcategories/${resolvedParams.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name.trim(),
          categoryId: formData.categoryId,
        }),
      });

      await handleApiResponse(res);
      setSuccess(true);
      
      // Update the local subcategory data
      if (subcategory) {
        const selectedCategory = categories.find(c => c.id === formData.categoryId);
        setSubcategory({
          ...subcategory,
          name: formData.name.trim(),
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          categoryId: formData.categoryId,
          category: selectedCategory || subcategory.category,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update subcategory");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
   
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
  
    );
  }

  if (error && !subcategory) {
    return (
     
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Subcategory Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/categories"
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
            href="/categories"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Subcategory
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
              Subcategory updated successfully!
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
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter subcategory name"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Slug: {formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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
                    href="/categories"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Subcategory Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subcategory Information
              </h3>
              
              {subcategory && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Name
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {subcategory.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Slug
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {subcategory.slug}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parent Category
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {subcategory.category.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Products
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {subcategory._count.products} products
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  
  );
} 
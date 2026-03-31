"use client";

import React, { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/Layouts/ProtectedLayout";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { authenticatedFetch, handleApiResponse } from "@/lib/api";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
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

export default function SubCategoriesPage() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  async function fetchSubCategories() {
    try {
      const res = await fetch("/api/subcategories");
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      const result = await res.json();
      // Handle new pagination format
      setSubcategories(result.data || result);
    } catch (err: any) {
      setError(err?.message || "Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
      // Handle both paginated and non-paginated responses
      const categoriesData = result.data || result;
      
      // Ensure we have proper IDs (convert _id to id if needed)
      const formattedCategories = categoriesData.map((cat: any) => ({
        id: cat._id || cat.id,  // Use _id if available, otherwise fall back to id
        name: cat.name
      }));
      
      setCategories(formattedCategories);
      
      // Debug log to verify the data
      console.log('Fetched categories:', formattedCategories);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again later.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      setError("Name and category are required");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.categoryId  // Ensure we're sending 'category' not 'categoryId'
      };

      console.log('Sending payload:', payload); // Debug log

      const res = await authenticatedFetch("/api/subcategories", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('API Response:', result); // Debug log

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create subcategory');
      }

      setFormData({ name: "", categoryId: "" });
      setShowForm(false);
      fetchSubCategories();
    } catch (err: any) {
      console.error('Error creating subcategory:', err);
      setError(err?.message || "Failed to create subcategory. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const res = await authenticatedFetch(`/api/subcategories/${id}`, {
        method: "DELETE",
      });

      await handleApiResponse(res);
      fetchSubCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to delete subcategory");
    }
  }

  return (
 
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📂 Subcategories
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Subcategory
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-6 bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Subcategory
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter subcategory name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Subcategory
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : subcategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No subcategories found.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Subcategory
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-[#1a2332] dark:divide-gray-700">
                {subcategories.map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subcategory.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subcategory.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subcategory._count.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subcategory.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/subcategories/${subcategory.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(subcategory.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
  );
} 
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  ShoppingCart,
  Tag,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  FileText,
  HeadphonesIcon
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalVedaConsulting: number;
  totalBlogs: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalVedaConsulting: 0,
    totalBlogs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, vedaConsultingRes, blogsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/ecom/orders'),
          fetch('/api/vedaconsulting'),
          fetch('/api/blogs')
        ]);

        const productsResult = await productsRes.json();
        const ordersResult = await ordersRes.json();
        const vedaConsultingResult = await vedaConsultingRes.json();
        const blogsResult = await blogsRes.json();

        // Handle new pagination format
        const products = productsResult.data || productsResult;
        const orders = ordersResult.orders || ordersResult.data || ordersResult;
        const vedaConsulting = vedaConsultingResult.data || vedaConsultingResult;
        const blogs = blogsResult.data || blogsResult;

        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalVedaConsulting: Array.isArray(vedaConsulting) ? vedaConsulting.length : 0,
          totalBlogs: Array.isArray(blogs) ? blogs.length : 0
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      href: "/dashboard/products"
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
      href: "/dashboard/orders"
    },
    {
      title: "Veda Consulting",
      value: stats.totalVedaConsulting,
      icon: HeadphonesIcon,
      color: "bg-purple-500",
      href: "/dashboard/tables"
    },
    {
      title: "Blogs",
      value: stats.totalBlogs,
      icon: FileText,
      color: "bg-orange-500",
      href: "/dashboard/blogs"
    }
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: Plus,
      href: "/dashboard/products/create",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Add Category",
      description: "Create a new category",
      icon: Tag,
      href: "/dashboard/categories/new",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "View Products",
      description: "Manage all products",
      icon: Package,
      href: "/dashboard/products",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          E-commerce Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.email}! Here&apos;s an overview of your store.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link key={index} href={stat.href}>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className={`${action.color} text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-center justify-between mb-2">
                      <action.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-blue-100">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                    <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stats.totalOrders} Orders Received
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total customer orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stats.totalBlogs} Blog Posts Published
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Content is ready for readers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

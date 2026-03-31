"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Package, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/Layouts/ProtectedLayout";

interface Category {
  id: string;
  name: string;
}

interface UnitVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  note?: string;
}

interface Ingredient {
  id: string;
  name: string;
  description: string;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
}

interface ConsumptionInfo {
  dosage: string;
  bestTime: string;
  duration: string;
  note: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  categoryId: string;
  category?: Category;
  images: Array<{
    id: string;
    url: string;
    productId: string;
  }>;
  unitVariants: UnitVariant[];
  consumptionInfo: ConsumptionInfo;
  ingredients: Ingredient[];
  benefits: Benefit[];
  clinicalStudyNote?: string;
}

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [openSections, setOpenSections] = useState({
    consumption: true,
    ingredients: true,
    benefits: true
  });

  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing");
      setFetching(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (fetching) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error || !product) {
    return (
      <ProtectedLayout>
        <div className="p-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || "Product not found."}
                </p>
                <div className="mt-4">
                  <Link 
                    href="/dashboard/products" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                    Back to Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {product.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {product.description}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
        {/* Basic Product Information */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
              <span className="text-gray-900 dark:text-white">{product.category?.name || product.categoryId}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Price:</span>
              <span className="text-gray-900 dark:text-white">₹{product.price}</span>
            </div>
            {product.originalPrice && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Original Price:</span>
                <span className="text-gray-500 line-through">₹{product.originalPrice}</span>
              </div>
            )}
            {product.rating && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Rating:</span>
                <span className="text-yellow-500">{product.rating} / 5</span>
              </div>
            )}
            {product.reviewCount && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Reviews:</span>
                <span className="text-gray-900 dark:text-white">{product.reviewCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        {product.images && product.images.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Product Images</h2>
            <div className="flex flex-wrap gap-4">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={product.name}
                  className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          </div>
        )}

        {/* Unit Variants */}
        {product.unitVariants && product.unitVariants.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unit Variants</h2>
            <div className="flex flex-wrap gap-4">
              {product.unitVariants.map((variant) => (
                <div key={variant.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[200px]">
                  <div className="font-medium text-gray-900 dark:text-white">{variant.name}</div>
                  <div className="text-gray-700 dark:text-gray-300">₹{variant.price}</div>
                  {variant.originalPrice && (
                    <div className="text-gray-500 line-through">₹{variant.originalPrice}</div>
                  )}
                  {variant.note && (
                    <div className="text-xs text-gray-500 mt-1">{variant.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* How to Consume Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => toggleSection('consumption')}
              className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                How to consume?
              </h2>
              {openSections.consumption ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openSections.consumption && (
              <div className="p-6 space-y-4">
                <div>
                  <span className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage Instructions:</span>
                  <div className="text-gray-900 dark:text-white whitespace-pre-line">{product.consumptionInfo?.dosage}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Best Time to Take:</span>
                    <div className="text-gray-900 dark:text-white">{product.consumptionInfo?.bestTime}</div>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Duration:</span>
                    <div className="text-gray-900 dark:text-white">{product.consumptionInfo?.duration}</div>
                  </div>
                </div>
                {product.consumptionInfo?.note && (
                  <div>
                    <span className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Doctor Advice):</span>
                    <div className="text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {product.consumptionInfo.note}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Key Ingredients Section */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('ingredients')}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Product Key Ingredients
                </h2>
                {openSections.ingredients ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openSections.ingredients && (
                <div className="p-6 space-y-4">
                  {product.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">{ingredient.name}</div>
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{ingredient.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Benefits Section */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('benefits')}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Benefits
                </h2>
                {openSections.benefits ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openSections.benefits && (
                <div className="p-6 space-y-4">
                  {product.benefits.map((benefit) => (
                    <div key={benefit.id} className="mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">{benefit.title}</div>
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{benefit.description}</div>
                    </div>
                  ))}
                  {product.clinicalStudyNote && (
                    <div className="mt-4">
                      <span className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Clinical Study Note:</span>
                      <div className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        {product.clinicalStudyNote}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </ProtectedLayout>
  );
}

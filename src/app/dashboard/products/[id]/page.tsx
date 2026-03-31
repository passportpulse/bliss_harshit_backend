"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, Package, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

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
  faq: { question: string; answer: string; }[];
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  categoryId: string;
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  
  // Get the product ID from params
  const productId = params?.id as string;
  
  // Log the received params for debugging
  useEffect(() => {
    console.log('Route params:', params);
    console.log('Product ID:', productId);
  }, [params, productId]);
  
  if (!productId) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error: Product ID is missing. Please select a valid product to edit.
              </p>
              <div className="mt-4">
                <Link 
                  href="/dashboard/products" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  // Store the last fetched product for fallback
  const productRef = useRef<Product | null>(null);
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    consumption: true,
    ingredients: true,
    benefits: true
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    rating: "",
    reviewCount: "",
    categoryId: "",
    images: [""],
    unitVariants: [] as UnitVariant[],
    consumptionInfo: {
      dosage: "",
      bestTime: "",
      duration: "",
      note: ""
    } as ConsumptionInfo,
    ingredients: [] as Ingredient[],
    benefits: [] as Benefit[],
    clinicalStudyNote: "",
    faq: [ { question: "", answer: "" } ]
  });

  // FAQ handlers
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaq = [...formData.faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    setFormData(prev => ({ ...prev, faq: newFaq }));
  };

  const addFaq = () => {
    setFormData(prev => ({ ...prev, faq: [...(Array.isArray(prev.faq) ? prev.faq : []), { question: "", answer: "" }] }));
  };

  const removeFaq = (index: number) => {
    if (Array.isArray(formData.faq) && formData.faq.length > 1) {
      setFormData(prev => ({ ...prev, faq: (Array.isArray(prev.faq) ? prev.faq : []).filter((_, i) => i !== index) }));
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      // Handle new pagination format
      const data = result.data || result;
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      console.error('No product ID provided for fetching');
      setError('Product ID is missing');
      setFetching(false);
      return;
    }

    try {
      console.log('Fetching product with ID:', productId);
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch product (Status: ${response.status})`;
        console.error('Error fetching product:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const product: Product = await response.json();
      console.log('Fetched product:', product);
      // Log categories for debugging
      console.log('Categories:', categories);

      if (!product) {
        throw new Error('Product not found');
      }

      // Normalize categoryId to string
      let normalizedCategoryId = '';
      if (typeof product.categoryId === 'number') {
        normalizedCategoryId = String(product.categoryId);
      } else if (typeof product.categoryId === 'string') {
        normalizedCategoryId = product.categoryId;
      } else {
        normalizedCategoryId = '';
      }

      // Normalize consumptionInfo
      const ci = product.consumptionInfo || {};
      const normalizedConsumptionInfo = {
        dosage: typeof ci.dosage === 'string' ? ci.dosage : '',
        bestTime: typeof ci.bestTime === 'string' ? ci.bestTime : '',
        duration: typeof ci.duration === 'string' ? ci.duration : '',
        note: typeof ci.note === 'string' ? ci.note : ''
      };

      productRef.current = product;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
        rating: product.rating ? product.rating.toString() : '',
        reviewCount: product.reviewCount ? product.reviewCount.toString() : '',
        categoryId: normalizedCategoryId,
        images: Array.isArray(product.images) && product.images.length > 0
          ? product.images.map((img: any) => img.url || "")
          : [""],
        unitVariants: Array.isArray(product.unitVariants) ? product.unitVariants : [],
        consumptionInfo: normalizedConsumptionInfo,
        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
        benefits: Array.isArray(product.benefits) ? product.benefits : [],
        clinicalStudyNote: product.clinicalStudyNote || '',
        faq: Array.isArray(product.faq) && product.faq.length > 0 ? product.faq : [{ question: '', answer: '' }]
      });
      setError(null);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      const errorMessage = error.message || 'Failed to load product';
      setError(errorMessage);
      
      // Show more detailed error message
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        console.error(`Product with ID ${productId} not found`);
        setError('Product not found. It may have been deleted or moved.');
        // Redirect to products list after a short delay
        setTimeout(() => {
          router.push('/dashboard/products');
        }, 3000);
      } else if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
        console.error(`Invalid product ID format: ${productId}`);
        setError('Invalid product ID format. Please check the URL and try again.');
      } else {
        console.error('Unexpected error:', error);
        setError(`Error: ${errorMessage}. Please try again later.`);
      }
    } finally {
      setFetching(false);
    }
  }, [productId, router]);

  useEffect(() => {
    // Only fetch if we have a valid product ID
    if (productId) {
      fetchCategories();
      fetchProduct();
    } else {
      setFetching(false);
      setError('Product ID is missing');
    }
  }, [productId, fetchCategories, fetchProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  // Unit Variants handlers
  const handleUnitVariantChange = (index: number, field: keyof UnitVariant, value: string | number) => {
    const newVariants = [...formData.unitVariants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      unitVariants: newVariants
    }));
  };

  const addUnitVariant = () => {
    const newVariant: UnitVariant = {
      id: Date.now().toString(),
      name: "",
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      unitVariants: [...prev.unitVariants, newVariant]
    }));
  };

  const removeUnitVariant = (index: number) => {
    if (formData.unitVariants.length > 1) {
      const newVariants = formData.unitVariants.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        unitVariants: newVariants
      }));
    }
  };

  // Consumption Info handlers
  const handleConsumptionChange = (field: keyof ConsumptionInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      consumptionInfo: {
        ...prev.consumptionInfo,
        [field]: value
      }
    }));
  };

  // Ingredients handlers
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      description: ""
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  // Benefits handlers
  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const addBenefit = () => {
    const newBenefit: Benefit = {
      id: Date.now().toString(),
      title: "",
      description: ""
    };
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit]
    }));
  };

  const removeBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Map images to array of { url } objects for backend, preserve existing images if not changed
      const filteredImages = formData.images
        .map(url => (url && url.trim() !== '' ? { url } : null))
        .filter(Boolean);

      // If no images after filtering, try to preserve previous images from product
      if (filteredImages.length === 0 && productRef.current && Array.isArray(productRef.current.images)) {
        productRef.current.images.forEach((img: any) => {
          if (img.url) filteredImages.push({ url: img.url });
        });
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : undefined,
        categoryId: formData.categoryId,
        images: filteredImages,
        unitVariants: formData.unitVariants,
        consumptionInfo: formData.consumptionInfo,
        ingredients: formData.ingredients,
        benefits: formData.benefits,
        clinicalStudyNote: formData.clinicalStudyNote
      };
      console.log('Product update payload:', payload);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push('/dashboard/products');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Product
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update product information
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Product Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Count
                </label>
                <input
                  type="number"
                  name="reviewCount"
                  value={formData.reviewCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="127"
                />
              </div>
            </div>
          </div>

          {/* Unit Variants */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Unit Variants
            </h2>
            
            <div className="space-y-4">
              {formData.unitVariants.map((variant, index) => (
                <div key={variant.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Variant Name *
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleUnitVariantChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 100ml Bottle"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleUnitVariantChange(index, 'price', parseFloat(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        value={variant.originalPrice || ''}
                        onChange={(e) => handleUnitVariantChange(index, 'originalPrice', e.target.value ? parseFloat(e.target.value) : '')}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Note
                      </label>
                      <input
                        type="text"
                        value={variant.note || ''}
                        onChange={(e) => handleUnitVariantChange(index, 'note', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Lasts up to 3 weeks"
                      />
                    </div>
                  </div>
                  
                  {formData.unitVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnitVariant(index)}
                      className="mt-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove Variant
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addUnitVariant}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Unit Variant
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Product Images
            </h2>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {image && (
                    <img
                      src={image}
                      alt={`Product Image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      form.append('type', 'product');
                      try {
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          body: form
                        });
                        const data = await res.json();
                        if (data.url) {
                          handleImageChange(index, data.url);
                        } else {
                          alert(data.error || 'Failed to upload image');
                        }
                      } catch (err) {
                        alert('Failed to upload image');
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Image
              </button>
            </div>
          </div>

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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dosage Instructions *
                    </label>
                    <textarea
                      value={formData.consumptionInfo.dosage}
                      onChange={(e) => handleConsumptionChange('dosage', e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter dosage instructions..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Best Time to Take
                      </label>
                      <input
                        type="text"
                        value={formData.consumptionInfo.bestTime}
                        onChange={(e) => handleConsumptionChange('bestTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Morning and evening"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formData.consumptionInfo.duration}
                        onChange={(e) => handleConsumptionChange('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 2-3 weeks for best results"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note (Doctor Advice)
                    </label>
                    <textarea
                      value={formData.consumptionInfo.note}
                      onChange={(e) => handleConsumptionChange('note', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white bg-yellow-50 dark:bg-yellow-900/20"
                      placeholder="Important notes or doctor advice..."
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      This will be highlighted as important information
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Key Ingredients Section */}
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
                  <div className="space-y-4">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={ingredient.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Ingredient Name *
                            </label>
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="e.g., Ashwagandha"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description *
                            </label>
                            <textarea
                              value={ingredient.description}
                              onChange={(e) => handleIngredientChange(index, 'description', e.target.value)}
                              required
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Describe the benefits of this ingredient..."
                            />
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="mt-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Remove Ingredient
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Ingredient
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits Section */}
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
                  <div className="space-y-4">
                    {formData.benefits.map((benefit, index) => (
                      <div key={benefit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Benefit Title *
                            </label>
                            <input
                              type="text"
                              value={benefit.title}
                              onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="e.g., Pain Relief"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description *
                            </label>
                            <textarea
                              value={benefit.description}
                              onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                              required
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Describe the benefit..."
                            />
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="mt-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Remove Benefit
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Benefit
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clinical Study Note
                    </label>
                    <textarea
                      value={formData.clinicalStudyNote}
                      onChange={(e) => setFormData(prev => ({ ...prev, clinicalStudyNote: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white bg-blue-50 dark:bg-blue-900/20"
                      placeholder="Add clinical study information..."
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      This will be highlighted as clinical study information
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              FAQ (Frequently Asked Questions)
            </h2>
            <div className="space-y-4">
              {(Array.isArray(formData.faq) ? formData.faq : []).map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={e => handleFaqChange(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answer
                      </label>
                      <textarea
                        value={item.answer}
                        onChange={e => handleFaqChange(index, 'answer', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter answer"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="mt-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Remove FAQ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaq}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add FAQ
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard/products"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
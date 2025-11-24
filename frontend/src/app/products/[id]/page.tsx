'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency, getStockStatus } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProduct(params.id as string);
        if (response.success) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success('Added to cart!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative h-96 mb-4 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <div className={`mb-6 ${stockStatus.color} font-semibold`}>
            {stockStatus.label}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {product.specifications.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-3">
                {product.specifications.map((spec, index) => (
                  <div key={index}>
                    <dt className="text-sm text-gray-600">{spec.key}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
          </div>

          <div className="text-sm text-gray-600">
            SKU: {product.sku}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold">{review.userName}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
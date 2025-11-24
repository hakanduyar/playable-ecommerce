import { Request, Response } from 'express';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      sort = '-createdAt',
      isActive
    } = req.query;

    // Build filter
   const filter: any = {};

    if (isActive === 'all') {
  // Tüm ürünleri göster (admin için)
  // filter.isActive eklemiyoruz
} else if (isActive === 'false') {
  filter.isActive = false;
} else {
  // Varsayılan: sadece aktif ve stokta olan
  filter.isActive = true;
  filter.stock = { $gt: 0 };
}

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch products
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort as string)
      .limit(limitNum)
      .skip(skip);

    // Get total count
    const total = await Product.countDocuments(filter);

    sendSuccess(res, 200, products, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get products error:', error);
    sendError(res, 500, 'Error fetching products');
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { type = 'most-ordered', limit = 8 } = req.query;

    let products;

    if (type === 'most-ordered') {
      products = await Product.find({ isActive: true, stock: { $gt: 0 } })
        .populate('category', 'name slug')
        .sort({ totalOrders: -1 })
        .limit(Number(limit));
    } else if (type === 'top-rated') {
      products = await Product.find({ isActive: true, stock: { $gt: 0 }, averageRating: { $gte: 4 } })
        .populate('category', 'name slug')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(Number(limit));
    } else if (type === 'newest') {
      products = await Product.find({ isActive: true, stock: { $gt: 0 } })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(Number(limit));
    } else {
      products = await Product.find({ isActive: true, isFeatured: true, stock: { $gt: 0 } })
        .populate('category', 'name slug')
        .limit(Number(limit));
    }

    sendSuccess(res, 200, products);
  } catch (error) {
    console.error('Get featured products error:', error);
    sendError(res, 500, 'Error fetching featured products');
  }
};

// Get single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }]
    }).populate('category', 'name slug');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendSuccess(res, 200, product);
  } catch (error) {
    console.error('Get product error:', error);
    sendError(res, 500, 'Error fetching product');
  }
};

// Create product (Admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      images,
      stock,
      sku,
      specifications,
      isFeatured
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      compareAtPrice,
      category,
      images,
      stock,
      sku,
      specifications,
      isFeatured
    });

    await product.populate('category', 'name slug');

    sendSuccess(res, 201, product, 'Product created successfully');
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, 'Error creating product');
  }
};

// Update product (Admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendSuccess(res, 200, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    sendError(res, 500, 'Error updating product');
  }
};

// Bulk update products (Admin only)
export const bulkUpdateProducts = async (req: Request, res: Response) => {
  try {
    const { productIds, isActive } = req.body;

    await Product.updateMany(
      { _id: { $in: productIds } },
      { isActive }
    );

    sendSuccess(res, 200, null, `${productIds.length} products updated successfully`);
  } catch (error) {
    console.error('Bulk update products error:', error);
    sendError(res, 500, 'Error updating products');
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendSuccess(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    sendError(res, 500, 'Error deleting product');
  }
};

// Add review to product
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user?.userId
    );

    if (existingReview) {
      return sendError(res, 400, 'You have already reviewed this product');
    }

    // Add review
    product.reviews.push({
      user: req.user?.userId as any,
      userName: req.user?.email.split('@')[0] || 'Anonymous',
      rating,
      comment,
      createdAt: new Date()
    });

    // Calculate average rating
    (product as any).calculateAverageRating();
    await product.save();

    sendSuccess(res, 201, product, 'Review added successfully');
  } catch (error) {
    console.error('Add review error:', error);
    sendError(res, 500, 'Error adding review');
  }
};

// Get product statistics (Admin only)
export const getProductStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });

    sendSuccess(res, 200, {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    sendError(res, 500, 'Error fetching product statistics');
  }
};
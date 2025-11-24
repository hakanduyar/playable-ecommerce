import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return sendError(res, 404, `Product ${item.product} not found`);
      }

      if (!product.isActive) {
        return sendError(res, 400, `Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0],
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });

      // Update product stock and order count
      product.stock -= item.quantity;
      product.totalOrders += item.quantity;
      await product.save();
    }

    // Calculate tax and shipping
    const tax = subtotal * 0.18; // 18% tax
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + tax + shippingCost;

    // Create order
    const order = await Order.create({
      user: req.user?.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'paid', // Simulated payment
      orderStatus: 'pending',
      subtotal,
      tax,
      shippingCost,
      total,
      notes
    });

    sendSuccess(res, 201, order, 'Order created successfully');
  } catch (error) {
    console.error('Create order error:', error);
    sendError(res, 500, 'Error creating order');
  }
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { user: req.user?.userId };
    if (status) {
      filter.orderStatus = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    sendSuccess(res, 200, orders, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    sendError(res, 500, 'Error fetching orders');
  }
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to view this order');
    }

    sendSuccess(res, 200, order);
  } catch (error) {
    console.error('Get order error:', error);
    sendError(res, 500, 'Error fetching order');
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const filter: any = {};
    if (status) {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    sendSuccess(res, 200, orders, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    sendError(res, 500, 'Error fetching orders');
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus, paymentStatus },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    sendSuccess(res, 200, order, 'Order updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    sendError(res, 500, 'Error updating order');
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to cancel this order');
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return sendError(res, 400, 'Cannot cancel order in current status');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalOrders: -item.quantity }
      });
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'failed';
    await order.save();

    sendSuccess(res, 200, order, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    sendError(res, 500, 'Error cancelling order');
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Calculate total sales
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } }
    ]);

    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Sales trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, 200, {
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      recentOrders,
      statusDistribution,
      salesTrend
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    sendError(res, 500, 'Error fetching order statistics');
  }
};
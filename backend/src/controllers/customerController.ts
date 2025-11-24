import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

// Get all customers (Admin only)
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter: any = { role: 'customer' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await User.countDocuments(filter);

    sendSuccess(res, 200, customers, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    sendError(res, 500, 'Error fetching customers');
  }
};

// Get customer details with order history (Admin only)
export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id).select('-password');

    if (!customer) {
      return sendError(res, 404, 'Customer not found');
    }

    // Get customer's orders
    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate customer statistics
    const totalOrders = await Order.countDocuments({ user: id });
    const totalSpent = await Order.aggregate([
      { $match: { user: customer._id, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    sendSuccess(res, 200, {
      customer,
      orders,
      statistics: {
        totalOrders,
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    sendError(res, 500, 'Error fetching customer details');
  }
};

// Get customer statistics (Admin only)
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Get new customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thirtyDaysAgo }
    });

    sendSuccess(res, 200, {
      totalCustomers,
      newCustomers
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    sendError(res, 500, 'Error fetching customer statistics');
  }
};
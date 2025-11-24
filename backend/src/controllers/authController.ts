import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer'
    });

    // Generate token
    const token = generateToken({
userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    sendSuccess(res, 201, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token
    }, 'Registration successful');
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 500, 'Error during registration');
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken({
userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    sendSuccess(res, 200, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Error during login');
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 500, 'Error fetching profile');
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses
    }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 500, 'Error updating profile');
  }
};

// Add address
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    sendSuccess(res, 200, { addresses: user.addresses }, 'Address added successfully');
  } catch (error) {
    console.error('Add address error:', error);
    sendError(res, 500, 'Error adding address');
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

const address = user.addresses.find((addr: any) => addr._id?.toString() === addressId);
    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.street = street;
    address.city = city;
    address.state = state;
    address.zipCode = zipCode;
    address.country = country;
    address.isDefault = isDefault;

    await user.save();

    sendSuccess(res, 200, { addresses: user.addresses }, 'Address updated successfully');
  } catch (error) {
    console.error('Update address error:', error);
    sendError(res, 500, 'Error updating address');
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

user.addresses = user.addresses.filter((addr: any) => addr._id?.toString() !== addressId);
    await user.save();

    sendSuccess(res, 200, { addresses: user.addresses }, 'Address deleted successfully');
  } catch (error) {
    console.error('Delete address error:', error);
    sendError(res, 500, 'Error deleting address');
  }
};
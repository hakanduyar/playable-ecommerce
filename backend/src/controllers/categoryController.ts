import { Request, Response } from 'express';
import Category from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    sendSuccess(res, 200, categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 500, 'Error fetching categories');
  }
};

// Get category by ID or slug
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findOne({
      $or: [{ _id: id }, { slug: id }]
    });

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 200, category);
  } catch (error) {
    console.error('Get category error:', error);
    sendError(res, 500, 'Error fetching category');
  }
};

// Create category (Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.create({
      name,
      description,
      image
    });

    sendSuccess(res, 201, category, 'Category created successfully');
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 500, 'Error creating category');
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, image, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 200, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    sendError(res, 500, 'Error updating category');
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 200, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    sendError(res, 500, 'Error deleting category');
  }
};
const createHttpError = require("http-errors");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");

// 🟢 Add Category
const addCategory = async (req, res, next) => {
  try {
    const { categoryName, imageUrl } = req.body;

    if (!categoryName) {
      return next(createHttpError(400, "Please provide Category Name!"));
    }

    const isCategoryPresent = await Category.findOne({ categoryName });
    if (isCategoryPresent) {
      return next(createHttpError(400, "Category already exists!"));
    }

    // Validate image URL if provided
    if (imageUrl && !/^(http|https):\/\/[^ "]+$/.test(imageUrl)) {
      return next(createHttpError(400, "Invalid image URL format!"));
    }

    const newCategory = new Category({
      categoryName,
      imageUrl: imageUrl || "", // fallback to empty string
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully!",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// 🟢 Get All Categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// 🟢 Delete Category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid category ID!"));
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// 🟢 Update Category
const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, imageUrl } = req.body;

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(createHttpError(400, "Invalid Category ID!"));
    }

    // Validate categoryName
    if (!categoryName || categoryName.trim() === "") {
      return next(createHttpError(400, "Category name is required!"));
    }

    // Validate imageUrl if provided
    if (imageUrl && !/^(http|https):\/\/[^ "]+$/.test(imageUrl)) {
      return next(createHttpError(400, "Invalid image URL format!"));
    }

    const categoryToUpdate = await Category.findById(categoryId);
    if (!categoryToUpdate) {
      return next(createHttpError(404, "Category not found!"));
    }

    categoryToUpdate.categoryName = categoryName.trim();
    if (imageUrl !== undefined) {
      categoryToUpdate.imageUrl = imageUrl;
    }

    await categoryToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: categoryToUpdate,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    next(error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
};

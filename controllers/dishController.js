const mongoose = require("mongoose");
const { Decimal128 } = require("mongodb");
const createHttpError = require("http-errors");
const Dishes = require("../models/dishesModel");


const validateVariations = (variations) => {
    console.log("Validating variations:", variations);
    if (!Array.isArray(variations) || variations.length === 0) {
        return "Variations must be a non-empty array.";
    }

    const defaultCount = variations.filter(v => v.isDefault).length;
    if (defaultCount === 0) {
        return "You must set exactly one variation as the default price.";
    }
    if (defaultCount > 1) {
        return "Only one variation can be set as the default price.";
    }

    for (const v of variations) {
        if (!v.name || typeof v.name !== 'string' || v.name.trim() === '') {
            return "All variations must have a name.";
        }

        // ✅ Normalize price (handle Decimal128, string, or number)
        let price;
        if (v.price instanceof Decimal128) {
            price = parseFloat(v.price.toString());
        } else if (typeof v.price === "string") {
            price = parseFloat(v.price);
        } else {
            price = v.price;
        }

        if (typeof price !== "number" || isNaN(price) || price < 0) {
            return "All variation prices must be valid non-negative numbers.";
        }

        // ✅ Round to 3 decimals
        const rounded = Number(price.toFixed(3));
        if (Math.abs(price - rounded) > 1e-9) {
            return "All variation prices must have up to 3 decimal places.";
        }

        // ✅ Replace with rounded number for consistent saving
        v.price = rounded;
    }

    return null;
};


// ----------------------------------------------------
// Helper function to validate section
// ----------------------------------------------------
const validateSection = (section) => {
    const allowedSections = ["Kitchen", "Grill", null];
    if (section === undefined) return null; // optional
    if (!allowedSections.includes(section)) {
        return "Invalid section! Must be 'Kitchen', 'Grill', or null.";
    }
    return null;
};

// ----------------------------------------------------
// ADD DISH CONTROLLER
// ----------------------------------------------------
const addDish = async (req, res, next) => {
    try {
        const { dishName, variations, category, section } = req.body;

        console.log("Request Body:", req.body);

        // 1️⃣ Validate inputs
        if (!dishName || !category) {
            const error = createHttpError(400, "Please provide Dish Name and Category!");
            return next(error);
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            const error = createHttpError(400, "Invalid Category ID!");
            return next(error);
        }

        const variationError = validateVariations(variations);
        if (variationError) {
            const error = createHttpError(400, variationError);
            return next(error);
        }

        const sectionError = validateSection(section);
        if (sectionError) {
            const error = createHttpError(400, sectionError);
            return next(error);
        }

        // 2️⃣ Uniqueness check (dish name + category)
        const isDishPresent = await Dishes.findOne({
            dishName: { $regex: new RegExp(`^${dishName}$`, "i") },
            category,
        });

        if (isDishPresent) {
            const error = createHttpError(400, "Dish already exists in this category!");
            return next(error);
        }
        // Convert all variation prices to Decimal128 with 3 decimals
        const formattedVariations = variations.map(v => ({
            ...v,
            price: mongoose.Types.Decimal128.fromString(parseFloat(v.price).toFixed(3))
        }));

     

        const newDish = new Dishes({
            dishName,
            variations: formattedVariations,
            category,
            section: section || null,
        });

        await newDish.save();

        res.status(201).json({
            success: true,
            message: "Dish added successfully!",
            data: newDish,
        });

    } catch (error) {
        console.error("❌ Error adding dish:", error);
        return next(error);
    }
};



const getDishesByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            const error = createHttpError(400, "Invalid Category ID!");
            return next(error);
        }

        // use .lean() so we get plain JS objects we can mutate safely
        const dishes = await Dishes.find({ category: categoryId }).lean();

        // mutate dishes in-place to convert Decimal128 price -> number with 3 decimals
        for (const dish of dishes) {
            if (Array.isArray(dish.variations)) {
                for (const v of dish.variations) {
                    // defensive checks
                    if (v && v.price != null) {
                        // convert Decimal128 -> string -> float -> round to 3 decimals -> number
                        const asNum = parseFloat(v.price.toString ? v.price.toString() : v.price);
                        v.price = parseFloat(asNum.toFixed(3));
                    } else {
                        // ensure price exists and is numeric (optional: set to 0 or null per your rules)
                        v.price = null;
                    }
                }
            }
        }

        // keep data: dishes to avoid breaking downstream consumers
        res.status(200).json({ success: true, data: dishes });
    } catch (error) {
        console.error("Error fetching dishes:", error);
        return next(error);
    }
};




const getDishes = async (req, res, next) => {
    try {
        const dishes = await Dishes.find().lean();

        if (!dishes || dishes.length === 0) {
            const error = createHttpError(404, "No dishes found!");
            return next(error);
        }

        // mutate dishes in-place to convert Decimal128 price -> number with 3 decimals
        for (const dish of dishes) {
            if (Array.isArray(dish.variations)) {
                for (const v of dish.variations) {
                    if (v && v.price != null) {
                        const asNum = parseFloat(v.price.toString ? v.price.toString() : v.price);
                        v.price = parseFloat(asNum.toFixed(3));
                    } else {
                        v.price = null;
                    }
                }
            }
        }

        // keep data: dishes unchanged (same reference), but contents are formatted
        res.status(200).json({ success: true, data: dishes });
    } catch (error) {
        console.error("Error fetching dishes:", error);
        return next(error);
    }
};





const updateDish = async (req, res, next) => {
    try {
        const { dishId } = req.params;
        const { dishName, variations, category, section } = req.body;

        console.log("Request Body:", req.body);

        // 1️⃣ Validate IDs
        if (!mongoose.Types.ObjectId.isValid(dishId)) {
            return next(createHttpError(400, "Invalid Dish ID!"));
        }

        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            return next(createHttpError(400, "Invalid Category ID!"));
        }

        if (!dishName && !variations && !category && section === undefined) {
            return next(createHttpError(400, "Please provide at least one field to update!"));
        }

        // 2️⃣ Convert prices to Decimal128 before validation
        let formattedVariations = variations;
        if (Array.isArray(variations)) {
            formattedVariations = variations.map(v => {
                const priceFloat = parseFloat(v.price);
                if (isNaN(priceFloat) || priceFloat < 0) {
                    throw createHttpError(400, `Invalid price for variation: ${v.name || 'Unnamed Variation'}.`);
                }

                // Convert to Decimal128 for exact BHD precision
                const decimalPrice = mongoose.Types.Decimal128.fromString(priceFloat.toFixed(3));

                return {
                    ...v,
                    price: decimalPrice,
                };
            });

            // Reuse your validator (skip Number.isInteger now)
            const variationError = validateVariations(formattedVariations);
            if (variationError) {
                return next(createHttpError(400, variationError));
            }
        }

        // // 3️⃣ Validate section
        // const sectionError = validateSection(section);
        // if (sectionError) {
        //     return next(createHttpError(400, sectionError));
        // }

        // 4️⃣ Find and update dish
        const dishToUpdate = await Dishes.findById(dishId);
        if (!dishToUpdate) {
            return next(createHttpError(404, "Dish not found!"));
        }

        if (dishName) dishToUpdate.dishName = dishName;
        if (formattedVariations) dishToUpdate.variations = formattedVariations;
        if (category) dishToUpdate.category = category;
        if (section !== undefined) dishToUpdate.section = section || null;

        await dishToUpdate.save();

        // 5️⃣ Convert Decimal128 to float for response
        const safeDish = dishToUpdate.toObject();
        if (Array.isArray(safeDish.variations)) {
            for (const v of safeDish.variations) {
                if (v.price && v.price.toString) {
                    v.price = parseFloat(parseFloat(v.price.toString()).toFixed(3));
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Dish updated successfully!",
            data: safeDish,
        });

    } catch (error) {
        console.error("Error updating dish:", error);
        return next(error);
    }
};


// ----------------------------------------------------
// DELETE DISH CONTROLLER
// ----------------------------------------------------
const deleteDish = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, "Invalid id!");
            return next(error);
        }

        const Dish = await Dishes.findByIdAndDelete(id);
        if (!Dish) {
            const error = createHttpError(404, "Dish not found!");
            return next(error);
        }

        res.status(200).json({ success: true, message: "Dish deleted successfully!" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addDish,
    getDishes,
    getDishesByCategory,
    updateDish,
    deleteDish,
};

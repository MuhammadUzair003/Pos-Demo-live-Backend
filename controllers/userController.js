const createHttpError = require("http-errors");
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


require("dotenv").config();

const accessTokenSecret = process.env.JWT_SECRET;


const register = async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return next(createHttpError(400, "All fields are required"));
        }

     
        const isUserPresent = await User.findOne({ email }).select('+password');
        if (isUserPresent) {
            return next(createHttpError(400, "User already exists!"));
        }

        // Force role to always be "Cashier" for security
        const user = { name, phone, email, password, role: "Cashier" };
        const newUser = new User(user);
        await newUser.save();

  
        const responseData = newUser.toObject();
        delete responseData.password;

        res.status(201).json({
            success: true,
            message: "New user created successfully (default role: Cashier)",
            data: responseData, // SEND CLEAN DATA
        });
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(createHttpError(400, "All fields are required!"));
        }

        // This is crucial if you set `select: false` in your Mongoose schema.
        const isUserPresent = await User.findOne({ email }).select('+password');

        if (!isUserPresent) {
            return next(createHttpError(401, "Invalid Credentials"));
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isMatch) {
            return next(createHttpError(401, "Invalid Password"));
        }

        
        
        const accessToken = jwt.sign(
            { _id: isUserPresent._id, role: isUserPresent.role }, // ONLY ID AND ROLE
            accessTokenSecret,
            { expiresIn: '1d' }
        );

        
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true, // Prevents client-side JS access (XSS defense)
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        });
      


        
        const responseData = isUserPresent.toObject(); 
        delete responseData.password; 

        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            
            token: accessToken,
            data: responseData 
        });
    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
       
        const user = await User.findById(req.user._id);

        
        if (user && user.password) {
            const responseData = user.toObject();
            delete responseData.password;
            return res.status(200).json({ sucess: true, data: responseData });
        }

        res.status(200).json({ sucess: true, data: user });

    } catch (error) {
        next(error);
    }
}


const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production',
        });
       

        res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        next(error);
    }
}


const verifyAdminPasswordController = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return next(createHttpError(400, "Admin password required."));
        }

        //  FIX: Select password explicitly for comparison
        const adminUser = await User.findOne({ role: { $regex: /^admin$/i } }).select('+password');

        if (!adminUser) {
            return next(createHttpError(404, "Admin account not found."));
        }

        const isValidPassword = await bcrypt.compare(password, adminUser.password);

        if (!isValidPassword) {
            return next(createHttpError(401, "Invalid admin password."));
        }

        return res.status(200).json({
            success: true,
            message: "Password verified.",
        });
    } catch (error) {
        console.log("❌ ERROR in verifyAdminPasswordController:", error);
        next(error);
    }
};

module.exports = { register, login, getUserData, logout, verifyAdminPasswordController }
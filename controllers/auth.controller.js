import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Bio } from "../models/userbio.model.js";
import { populate } from "dotenv";

export const registerUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, gender, dateOfBirth } = req.body;

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            gender,
            dateOfBirth
        })

        await newUser.save();
        return res.status(201).json({
            success: true,
            message: "User created successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })

    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check the existing user with this email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email"
            })
        }

        const matchPassword = await bcrypt.compare(password, user.password)
        if (!matchPassword) {
            return res.status(404).json({
                message: "Invalid Password",
                success: false
            })
        }

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: "strict" }).json({
            success: true,
            message: `Welcome back ${user.firstname}`,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })

    }
}

export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)
            .populate({
                path: 'posts',
                options: { sort: { createdAt: -1 } },
                populate: [
                    {
                        path: 'user',
                        select: 'firstname lastname profilePicture'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'userId',
                            select: 'firstname lastname profilePicture'
                        }
                    }
                ],
            })
            .populate({ path: 'bio' })
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

export const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Profile picture is required",
                success: false
            })
        }
        const fileUri = getDataUri(file)
        //upload to cloudinary
        const result = await cloudinary.uploader.upload(fileUri);

        // update user document
        const user = await User.findByIdAndUpdate(userId, { profilePicture: result.secure_url }, { new: true })
        res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            profilePicture: user.profilePicture
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Something went wrong',
            success: false
        })

    }
}

export const updateCoverPhoto = async (req, res) => {
    try {
        const userId = req.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Cover picture is required",
                success: false
            })
        }
        const fileUri = getDataUri(file)
        //upload to cloudinary
        const result = await cloudinary.uploader.upload(fileUri);

        // update user document
        const user = await User.findByIdAndUpdate(userId, { coverPhoto: result.secure_url }, { new: true })
        res.status(200).json({
            success: true,
            message: "Cover photo updated successfully",
            coverPhoto: user.coverPhoto
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Something went wrong',
            success: false
        })

    }
}

export const updateIntro = async (req, res) => {
    try {
        const userId = req.id;
        const { bioText, liveIn, relationship, workplace, education, phone, hometown } = req.body;

        let bio = await Bio.findOne({ user: userId })

        if (!bio) {
            bio = new Bio({ user: userId });;
        }

        // update only provided fields
        if (bioText !== undefined) bio.bioText = bioText;
        if (liveIn !== undefined) bio.liveIn = liveIn;
        if (relationship !== undefined) bio.relationship = relationship;
        if (workplace !== undefined) bio.workplace = workplace;
        if (education !== undefined) bio.education = education;
        if (phone !== undefined) bio.phone = phone;
        if (hometown !== undefined) bio.hometown = hometown

        await bio.save();

        const user = await User.findById(userId);
        if (!user.bio || user.bio.toString() !== bio._id.toString()) {
            user.bio = bio._id;
            await user.save()
        }

        res.status(200).json({
            success: true,
            message: 'Bio updated successfully',
            bio
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error updating bio",
            error: error.message,
        })
    }
}
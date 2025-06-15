import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config({
  path: "C:\\Users\\ADMIN\\Desktop\\Backend-project\\.env"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (filepath) {
  try {
    if (!filepath) return new ApiError(400, "File not found");

    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto"
    });

    console.log("✅ File uploaded:", response.secure_url);

    fs.unlinkSync(filepath);

    return response; 
  } catch (error) {
    console.error("❌ Upload failed:", error.message);

    // ❗ Fix: fs.unlink is async; use fs.unlinkSync instead
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (unlinkErr) {
      console.error("❌ Failed to delete local file after error:", unlinkErr.message);
    }

    return null;
  }
};

export default uploadOnCloudinary;

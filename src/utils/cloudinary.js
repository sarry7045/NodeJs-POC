import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCludinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
    // Remove the locally saved file as the operation is failed
  }
};

export { uploadOnCludinary };

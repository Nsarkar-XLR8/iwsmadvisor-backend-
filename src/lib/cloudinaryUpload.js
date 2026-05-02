import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { cloudinaryApiKey, cloudinaryCloudName, cloudinarySecret } from "../core/config/config.js";

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinarySecret) {
  throw new Error(
    "Cloudinary environment variables are required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  );
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinarySecret,
});

// ✅ Helper — safely delete temp file without crashing
const deleteTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Could not delete temp file: ${filePath}`, err.message);
  }
};

export const cloudinaryUpload = async (filePath, public_id, folder) => {
  try {
    const extension = filePath.split(".").pop().toLowerCase();
    const isDocument = ["pdf", "docx", "doc", "xlsx", "xls", "ppt", "pptx"].includes(extension);

    const uploadImage = await cloudinary.uploader.upload(filePath, {
      resource_type: isDocument ? "raw" : "auto",
      public_id,
      folder,
    });

    // ✅ Safe delete after successful upload
    deleteTempFile(filePath);
    return uploadImage;

  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // ✅ Safe delete even on failure
    deleteTempFile(filePath);
    return "file upload failed";
  }
};

export default cloudinary;
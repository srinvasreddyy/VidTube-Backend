import multer from "multer";
import fs from "fs";
import path from "path";

// Define temp directory path
const tempDir = path.join(process.cwd(), "public", "temp");

// Check if the directory exists, if not create it
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // save to public/temp
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // preserve original file name
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

export default upload;

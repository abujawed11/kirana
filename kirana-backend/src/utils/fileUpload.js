import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configure upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ensure upload directory exists
export async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Initialize upload directory on module load
ensureUploadDir();

export async function uploadFile(file, filePath) {
  try {
    // Ensure the upload directory exists
    await ensureUploadDir();

    // Create full file path
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Ensure subdirectory exists
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });

    // Write file to disk
    await writeFile(fullPath, file.buffer);

    // Return the relative path (without domain/port)
    const relativePath = `/uploads/${filePath.replace(/\\/g, '/')}`;
    return relativePath;

  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filePath) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    await fs.promises.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Validate file type
export function isValidImageType(mimetype) {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  return allowedTypes.includes(mimetype);
}

// Generate unique filename
export function generateUniqueFileName(originalName, prefix = '') {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}_${random}${ext}`;
}
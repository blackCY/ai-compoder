import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { ValidationResult, UploadErrorCode } from 'lib/services/upload/types';

// Error messages
const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  FILE_TOO_LARGE: '文件大小超过限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
  TOO_MANY_FILES: '文件数量超过限制',
  EMPTY_FILE: '不能上传空文件',
  UPLOAD_FAILED: '上传失败',
  NETWORK_ERROR: '网络错误，请检查网络连接',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UPLOAD_CANCELLED: '上传已取消',
};

// Allowed file types and extensions
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates a file for upload
 * @param file - The file to validate
 * @returns Validation result with error details if invalid
 */
function validateFile(file: File): ValidationResult {
  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: ERROR_MESSAGES.EMPTY_FILE,
      },
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: ERROR_MESSAGES.FILE_TOO_LARGE,
      },
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: ERROR_MESSAGES.INVALID_FILE_TYPE,
      },
    };
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: ERROR_MESSAGES.INVALID_FILE_TYPE,
      },
    };
  }

  return { valid: true };
}

/**
 * POST /api/upload
 * Handles file uploads with validation and storage
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_FILE' as UploadErrorCode,
            message: ERROR_MESSAGES.EMPTY_FILE,
          },
        },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          url: `/uploads/${filename}`,
          filename,
          originalName: file.name,
          size: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR' as UploadErrorCode,
          message: ERROR_MESSAGES.SERVER_ERROR,
        },
      },
      { status: 500 }
    );
  }
}

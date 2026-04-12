import type { FileState } from './types';

/**
 * Generate a base64 preview for image files
 * @param file - The File object to generate preview for
 * @returns Promise resolving to base64 data URL or undefined for non-images
 */
export async function generateFilePreview(file: File): Promise<string | undefined> {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return undefined;
  }

  try {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch {
    return undefined;
  }
}

/**
 * Check if a file already exists in the file list
 * @param existingFiles - Array of existing FileState objects
 * @param newFile - The File to check for duplicates
 * @returns true if file with same name, size, and lastModified exists
 */
export function isDuplicateFile(existingFiles: FileState[], newFile: File): boolean {
  return existingFiles.some(
    (existing) =>
      existing.file.name === newFile.name &&
      existing.file.size === newFile.size &&
      existing.file.lastModified === newFile.lastModified
  );
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  // Handle negative bytes
  if (bytes < 0) {
    return '0 B';
  }

  // Zero bytes
  if (bytes === 0) {
    return '0 B';
  }

  // Bytes (less than 1 KB)
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  // Kilobytes
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  // Megabytes
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  // Gigabytes and above
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

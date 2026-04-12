import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Mock fs operations
vi.mock('fs/promises');
vi.mock('fs');

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when no file is provided', async () => {
    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: new FormData(),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBeDefined();
    expect(data.error.message).toBeDefined();
  });

  it('should return 400 for invalid file type', async () => {
    const formData = new FormData();
    const file = new File(['content'], 'test.exe', { type: 'application/exe' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('should return 400 for file too large', async () => {
    const formData = new FormData();
    // Create a file larger than 10MB
    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FILE_TOO_LARGE');
  });

  it('should return 400 for empty file', async () => {
    const formData = new FormData();
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EMPTY_FILE');
  });

  it('should return 200 and upload valid file', async () => {
    const formData = new FormData();
    const fileContent = 'test file content';
    const file = new File([fileContent], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Mock fs operations
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      url: expect.stringContaining('/uploads/'),
      filename: expect.stringMatching(/^[a-f0-9-]+\.jpg$/),
      originalName: 'test.jpg',
      size: fileContent.length,
      contentType: 'image/jpeg',
      uploadedAt: expect.any(String),
    });
  });

  it('should handle PDF files correctly', async () => {
    const formData = new FormData();
    const fileContent = 'test pdf content';
    const file = new File([fileContent], 'document.pdf', { type: 'application/pdf' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.contentType).toBe('application/pdf');
    expect(data.data.filename).toMatch(/\.pdf$/);
  });

  it('should reject files with invalid extensions', async () => {
    const formData = new FormData();
    const fileContent = 'test content';
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_FILE_TYPE');
  });
});

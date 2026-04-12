/**
 * Upload Service Tests
 * Tests for upload service functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { upload, uploadMultiple, validateFile } from '../uploadService';
import type { UploadOptions, UploadConstraints, UploadError } from '../types';

// Mock ProgressEvent for Node.js environment
class MockProgressEvent {
  public lengthComputable: boolean;
  public loaded: number;
  public total: number;

  constructor(
    public type: string,
    init?: { lengthComputable?: boolean; loaded?: number; total?: number }
  ) {
    this.lengthComputable = init?.lengthComputable ?? false;
    this.loaded = init?.loaded ?? 0;
    this.total = init?.total ?? 0;
  }
}

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  public static instances: MockXMLHttpRequest[] = [];
  public url = '';
  public method = '';
  public requestHeaders: Record<string, string> = {};
  public requestBody: FormData | null = null;
  public responseHeaders: Record<string, string> = {};

  private _readyState = 0;
  private _status = 0;
  private _statusText = '';
  private _responseText = '';
  private _response: unknown = null;

  public abortController: { abort: () => void } | null = null;

  // Event listeners
  public onload: ((event: MockProgressEvent) => void) | null = null;
  public onerror: ((event: MockProgressEvent) => void) | null = null;
  public onabort: ((event: MockProgressEvent) => void) | null = null;
  public upload: {
    addEventListener: (event: string, handler: (event: MockProgressEvent) => void) => void;
    progress?: ((event: MockProgressEvent) => void)[];
    load?: ((event: MockProgressEvent) => void)[];
    error?: ((event: MockProgressEvent) => void)[];
    abort?: ((event: MockProgressEvent) => void)[];
  } = {
    addEventListener: (event: string, handler: (event: MockProgressEvent) => void) => {
      const xhr = MockXMLHttpRequest.instances[MockXMLHttpRequest.instances.length - 1];
      if (!xhr.upload[event as keyof typeof xhr.upload]) {
        (xhr.upload[event as keyof typeof xhr.upload] as (event: MockProgressEvent) => void[]) = [];
      }
      const listeners = xhr.upload[event as keyof typeof xhr.upload] as (event: MockProgressEvent) => void[];
      listeners.push(handler);
    },
  };

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  get readyState(): number {
    return this._readyState;
  }

  get status(): number {
    return this._status;
  }

  get statusText(): string {
    return this._statusText;
  }

  get responseText(): string {
    return this._responseText;
  }

  get response(): unknown {
    return this._response;
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
    this._readyState = 1;
  }

  setRequestHeader(name: string, value: string): void {
    this.requestHeaders[name] = value;
  }

  send(data: FormData | null): void {
    this.requestBody = data;
    this._readyState = 2;
  }

  abort(): void {
    this._readyState = 0;
    if (this.onabort) {
      this.onabort(new MockProgressEvent('abort'));
    }
    if (this.upload.abort) {
      this.upload.abort.forEach((handler) => handler(new MockProgressEvent('abort')));
    }
  }

  addEventListener(
    event: string,
    handler: (event: MockProgressEvent) => void
  ): void {
    if (event === 'load') {
      this.onload = handler;
    } else if (event === 'error') {
      this.onerror = handler;
    } else if (event === 'abort') {
      this.onabort = handler;
    }
  }

  triggerUploadProgress(loaded = 50, total = 100): void {
    if (this.upload.progress) {
      this.upload.progress.forEach((handler) => {
        const event = new MockProgressEvent('progress', {
          lengthComputable: true,
          loaded,
          total,
        });
        handler(event);
      });
    }
  }

  triggerLoadSuccess(response: {
    success: boolean;
    data?: unknown;
    error?: unknown;
  }): void {
    this._readyState = 4;
    this._status = 200;
    this._statusText = 'OK';
    this._responseText = JSON.stringify(response);
    this._response = response;

    if (this.onload) {
      const event = new MockProgressEvent('load');
      this.onload(event);
    }
    if (this.upload.load) {
      this.upload.load.forEach((handler) => handler(new MockProgressEvent('load')));
    }
  }

  triggerLoadError(status = 500, responseText?: string): void {
    this._readyState = 4;
    this._status = status;
    this._statusText = 'Error';
    if (responseText) {
      this._responseText = responseText;
    }

    // In real XHR, even error responses trigger the 'load' event
    // The 'error' event is only for network failures
    if (this.onload) {
      const event = new MockProgressEvent('load');
      this.onload(event);
    }
  }

  triggerNetworkError(): void {
    this._readyState = 4;
    this._status = 0;

    // Trigger the actual 'error' event for network failures
    if (this.onerror) {
      const event = new MockProgressEvent('error');
      this.onerror(event);
    }
  }

  static reset(): void {
    MockXMLHttpRequest.instances = [];
  }
}

// Store original XMLHttpRequest
let OriginalXMLHttpRequest: typeof XMLHttpRequest;

describe('upload()', () => {
  let mockFile: File;
  let testOptions: UploadOptions;

  beforeEach(() => {
    // Save original XMLHttpRequest
    OriginalXMLHttpRequest = global.XMLHttpRequest;

    // Mock XMLHttpRequest
    // @ts-expect-error - Mocking XMLHttpRequest for testing
    global.XMLHttpRequest = MockXMLHttpRequest;

    // Create test file
    mockFile = new File(['test content'], 'test.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    testOptions = {
      onProgress: vi.fn(),
    };

    MockXMLHttpRequest.reset();
  });

  afterEach(() => {
    // Restore original XMLHttpRequest
    global.XMLHttpRequest = OriginalXMLHttpRequest;
    MockXMLHttpRequest.reset();
  });

  it('should create FormData with file', async () => {
    const promise = upload(mockFile, testOptions);

    // Wait for XHR to be created and send called
    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    expect(xhr).toBeDefined();
    expect(xhr.requestBody).toBeInstanceOf(FormData);

    const formData = xhr.requestBody as FormData;
    expect(formData.get('file')).toBe(mockFile);

    // Clean up
    xhr.triggerLoadSuccess({
      success: true,
      data: {
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        size: mockFile.size,
        contentType: mockFile.type,
        uploadedAt: new Date().toISOString(),
      },
    });

    await promise;
  });

  it('should call POST /api/upload', async () => {
    const promise = upload(mockFile, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('/api/upload');

    xhr.triggerLoadSuccess({
      success: true,
      data: {
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        size: mockFile.size,
        contentType: mockFile.type,
        uploadedAt: new Date().toISOString(),
      },
    });

    await promise;
  });

  it('should return UploadResponse on success', async () => {
    const promise = upload(mockFile, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    const expectedResponse = {
      url: '/uploads/test.jpg',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      size: mockFile.size,
      contentType: mockFile.type,
      uploadedAt: new Date().toISOString(),
    };

    xhr.triggerLoadSuccess({
      success: true,
      data: expectedResponse,
    });

    const response = await promise;
    expect(response).toEqual(expectedResponse);
  });

  it('should call onProgress with percentage during upload', async () => {
    const onProgress = vi.fn();
    const promise = upload(mockFile, { onProgress });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];

    // Simulate progress updates
    xhr.triggerUploadProgress(25, 100);
    await new Promise((resolve) => setTimeout(resolve, 10));

    xhr.triggerUploadProgress(50, 100);
    await new Promise((resolve) => setTimeout(resolve, 10));

    xhr.triggerUploadProgress(75, 100);
    await new Promise((resolve) => setTimeout(resolve, 10));

    xhr.triggerLoadSuccess({
      success: true,
      data: {
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        size: mockFile.size,
        contentType: mockFile.type,
        uploadedAt: new Date().toISOString(),
      },
    });

    await promise;

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 25);
    expect(onProgress).toHaveBeenNthCalledWith(2, 50);
    expect(onProgress).toHaveBeenNthCalledWith(3, 75);
  });

  it('should reject with UploadError on network error', async () => {
    const promise = upload(mockFile, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    xhr.triggerNetworkError();

    await expect(promise).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: expect.any(String),
    });
  });

  it('should reject with UploadError on server error', async () => {
    const promise = upload(mockFile, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    xhr.triggerLoadError(500);

    await expect(promise).rejects.toMatchObject({
      code: 'SERVER_ERROR',
      message: expect.any(String),
    });
  });

  it('should reject with UPLOAD_CANCELLED when aborted', async () => {
    const controller = new AbortController();
    const promise = upload(mockFile, { signal: controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 20));

    controller.abort();

    await expect(promise).rejects.toMatchObject({
      code: 'UPLOAD_CANCELLED',
      message: '上传已取消',
    });
  });

  it('should handle error response from server', async () => {
    const promise = upload(mockFile, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const xhr = MockXMLHttpRequest.instances[0];
    xhr._status = 400;
    xhr._responseText = JSON.stringify({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: '文件大小超过限制',
      },
    });

    xhr.triggerLoadError(400);

    await expect(promise).rejects.toMatchObject({
      code: 'FILE_TOO_LARGE',
      message: '文件大小超过限制',
    });
  });
});

describe('uploadMultiple()', () => {
  let mockFiles: File[];
  let testOptions: UploadOptions;

  beforeEach(() => {
    OriginalXMLHttpRequest = global.XMLHttpRequest;
    // @ts-expect-error - Mocking XMLHttpRequest for testing
    global.XMLHttpRequest = MockXMLHttpRequest;

    mockFiles = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
      new File(['content3'], 'file3.jpg', { type: 'image/jpeg' }),
    ];

    testOptions = {
      onProgress: vi.fn(),
    };

    MockXMLHttpRequest.reset();
  });

  afterEach(() => {
    global.XMLHttpRequest = OriginalXMLHttpRequest;
    MockXMLHttpRequest.reset();
  });

  it('should upload multiple files in parallel', async () => {
    const promise = uploadMultiple(mockFiles, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should have created 3 XHR instances
    expect(MockXMLHttpRequest.instances.length).toBe(3);

    // Complete all uploads
    for (let i = 0; i < 3; i++) {
      const xhr = MockXMLHttpRequest.instances[i];
      xhr.triggerLoadSuccess({
        success: true,
        data: {
          url: `/uploads/file${i + 1}.jpg`,
          filename: `file${i + 1}.jpg`,
          originalName: `file${i + 1}.jpg`,
          size: mockFiles[i].size,
          contentType: mockFiles[i].type,
          uploadedAt: new Date().toISOString(),
        },
      });
    }

    const responses = await promise;
    expect(responses).toHaveLength(3);
  });

  it('should handle partial failures with Promise.allSettled', async () => {
    const promise = uploadMultiple(mockFiles, testOptions);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // First succeeds
    MockXMLHttpRequest.instances[0].triggerLoadSuccess({
      success: true,
      data: {
        url: '/uploads/file1.jpg',
        filename: 'file1.jpg',
        originalName: 'file1.jpg',
        size: mockFiles[0].size,
        contentType: mockFiles[0].type,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Second fails
    MockXMLHttpRequest.instances[1].triggerLoadError();

    // Third succeeds
    MockXMLHttpRequest.instances[2].triggerLoadSuccess({
      success: true,
      data: {
        url: '/uploads/file3.jpg',
        filename: 'file3.jpg',
        originalName: 'file3.jpg',
        size: mockFiles[2].size,
        contentType: mockFiles[2].type,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Should return array with 2 successful responses
    const responses = await promise;
    expect(responses).toHaveLength(2);
  });
});

describe('validateFile()', () => {
  it('should accept valid file', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const constraints: UploadConstraints = {
      maxSize: 10 * 1024 * 1024, // 10MB
      accept: ['image/jpeg', 'image/png'],
    };

    const result = validateFile(file, constraints);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject oversized file', () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const constraints: UploadConstraints = {
      maxSize: 10 * 1024 * 1024, // 10MB
    };

    const result = validateFile(largeFile, constraints);

    expect(result.valid).toBe(false);
    expect(result.error).toMatchObject({
      code: 'FILE_TOO_LARGE',
      message: expect.any(String),
    });
  });

  it('should reject invalid file type', () => {
    const file = new File(['content'], 'test.exe', { type: 'application/exe' });
    const constraints: UploadConstraints = {
      accept: ['image/jpeg', 'image/png'],
    };

    const result = validateFile(file, constraints);

    expect(result.valid).toBe(false);
    expect(result.error).toMatchObject({
      code: 'INVALID_FILE_TYPE',
      message: expect.any(String),
    });
  });

  it('should accept file when accept constraint not provided', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const constraints: UploadConstraints = {
      maxSize: 10 * 1024 * 1024,
    };

    const result = validateFile(file, constraints);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept file when maxSize constraint not provided', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const constraints: UploadConstraints = {
      accept: ['image/jpeg'],
    };

    const result = validateFile(file, constraints);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept file when no constraints provided', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const constraints: UploadConstraints = {};

    const result = validateFile(file, constraints);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty file (size === 0)', () => {
    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const constraints: UploadConstraints = {
      maxSize: 10 * 1024 * 1024,
      accept: ['image/jpeg'],
    };

    const result = validateFile(emptyFile, constraints);

    expect(result.valid).toBe(false);
    expect(result.error).toMatchObject({
      code: 'EMPTY_FILE',
      message: expect.any(String),
    });
  });

  it('should check file size before type', () => {
    const emptyFile = new File([], 'test.exe', { type: 'application/exe' });
    const constraints: UploadConstraints = {
      maxSize: 10 * 1024 * 1024,
      accept: ['image/jpeg'],
    };

    const result = validateFile(emptyFile, constraints);

    // Should fail on empty file first, not type check
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('EMPTY_FILE');
  });
});

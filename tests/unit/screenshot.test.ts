import { getPNGDimensions, binaryToBase64, captureScreenshotResponse } from '../../src/utils/screenshot';
import { captureScreenshot } from '../../src/utils/adb';

// Mock captureScreenshot
jest.mock('../../src/utils/adb', () => ({
  captureScreenshot: jest.fn(),
}));

describe('Screenshot Utilities', () => {
  const mockCaptureScreenshot = captureScreenshot as jest.MockedFunction<typeof captureScreenshot>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPNGDimensions', () => {
    it('should correctly extract dimensions from PNG data', () => {
      // Create a minimal PNG with known dimensions (100x200)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
        0x49, 0x48, 0x44, 0x52, // IHDR chunk type
        0x00, 0x00, 0x00, 0x64, // Width: 100
        0x00, 0x00, 0x00, 0xC8, // Height: 200
        // Rest of PNG header (not needed for this test)
      ]);
      
      const dimensions = getPNGDimensions(pngData);
      
      expect(dimensions.width).toBe(100);
      expect(dimensions.height).toBe(200);
    });

    it('should throw error for invalid PNG data', () => {
      const invalidData = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      
      expect(() => getPNGDimensions(invalidData)).toThrow('Invalid PNG data');
    });

    it('should throw error for PNG data that is too short', () => {
      const shortData = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      
      expect(() => getPNGDimensions(shortData)).toThrow('Invalid PNG data');
    });
  });

  describe('binaryToBase64', () => {
    it('should correctly convert binary data to base64', () => {
      const binaryData = Buffer.from('Hello, World!', 'utf-8');
      const expectedBase64 = Buffer.from('Hello, World!', 'utf-8').toString('base64');
      
      const result = binaryToBase64(binaryData);
      
      expect(result).toBe(expectedBase64);
    });

    it('should handle empty buffer', () => {
      const emptyBuffer = Buffer.alloc(0);
      
      const result = binaryToBase64(emptyBuffer);
      
      expect(result).toBe('');
    });
  });

  describe('captureScreenshotResponse', () => {
    it('should capture screenshot and return formatted response', async () => {
      // Create a minimal PNG with known dimensions (100x200)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
        0x49, 0x48, 0x44, 0x52, // IHDR chunk type
        0x00, 0x00, 0x00, 0x64, // Width: 100
        0x00, 0x00, 0x00, 0xC8, // Height: 200
        // Rest of PNG header (not needed for this test)
      ]);
      
      mockCaptureScreenshot.mockReturnValue(pngData.toString('binary'));
      
      // Mock Date.now() to get consistent timestamp
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1634567890123);
      
      const result = await captureScreenshotResponse('emulator-5554');
      
      expect(result).toEqual({
        data: pngData.toString('base64'),
        format: 'png',
        width: 100,
        height: 200,
        deviceId: 'emulator-5554',
        timestamp: 1634567890123,
      });
      
      expect(mockCaptureScreenshot).toHaveBeenCalledWith('emulator-5554');
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should use default deviceId if not provided', async () => {
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
        0x49, 0x48, 0x44, 0x52, // IHDR chunk type
        0x00, 0x00, 0x00, 0x64, // Width: 100
        0x00, 0x00, 0x00, 0xC8, // Height: 200
      ]);
      
      mockCaptureScreenshot.mockReturnValue(pngData.toString('binary'));
      
      const result = await captureScreenshotResponse();
      
      expect(result.deviceId).toBe('default');
      expect(mockCaptureScreenshot).toHaveBeenCalledWith(undefined);
    });

    it('should throw error if screenshot capture fails', async () => {
      mockCaptureScreenshot.mockImplementation(() => {
        throw new Error('Failed to capture screenshot');
      });
      
      await expect(captureScreenshotResponse('emulator-5554')).rejects.toThrow(
        'Failed to capture screenshot: Failed to capture screenshot'
      );
    });
  });
});
import { captureScreenshot } from './adb';
import { ScreenshotResponse } from '../types';

// Get image dimensions from PNG data
export function getPNGDimensions(pngData: Buffer): { width: number; height: number } {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (pngData.length < 24 || pngData.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error('Invalid PNG data');
  }

  // Width is at bytes 8-11 (big-endian)
  const width = pngData.readUInt32BE(8);
  
  // Height is at bytes 12-15 (big-endian)
  const height = pngData.readUInt32BE(12);
  
  return { width, height };
}

// Convert binary data to base64
export function binaryToBase64(data: Buffer): string {
  return data.toString('base64');
}

// Capture screenshot and return formatted response
export async function captureScreenshotResponse(deviceId?: string): Promise<ScreenshotResponse> {
  try {
    // Capture screenshot as binary data
    const screenshotData = captureScreenshot(deviceId);
    const buffer = Buffer.from(screenshotData, 'binary');
    
    // Get image dimensions
    const { width, height } = getPNGDimensions(buffer);
    
    // Convert to base64
    const base64Data = binaryToBase64(buffer);
    
    // Return formatted response
    return {
      data: base64Data,
      format: 'png',
      width,
      height,
      deviceId: deviceId || 'default',
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`);
  }
}
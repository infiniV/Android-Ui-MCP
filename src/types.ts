import { z } from 'zod';

// Device information interfaces
export interface AndroidDevice {
  id: string;
  status: 'device' | 'offline' | 'unauthorized' | 'unknown';
  model?: string;
  product?: string;
  transportId?: string;
  usb?: string;
  productString?: string;
}

// Screenshot response interfaces
export interface ScreenshotResponse {
  data: string; // Base64 encoded image data
  format: 'png';
  width: number;
  height: number;
  deviceId: string;
  timestamp: number;
}

// Error handling interfaces
export interface ADBError {
  code: string;
  message: string;
  details?: any;
  suggestion?: string;
}

export class ADBCommandError extends Error implements ADBError {
  code: string;
  details?: any;
  suggestion?: string;

  constructor(code: string, message: string, details?: any, suggestion?: string) {
    super(message);
    this.name = 'ADBCommandError';
    this.code = code;
    this.details = details;
    this.suggestion = suggestion;
  }
}

export class ADBNotFoundError extends ADBCommandError {
  constructor() {
    super(
      'ADB_NOT_FOUND',
      'Android Debug Bridge (ADB) not found',
      null,
      'Please install Android SDK Platform Tools and ensure ADB is in your PATH'
    );
    this.name = 'ADBNotFoundError';
  }
}

export class DeviceNotFoundError extends ADBCommandError {
  constructor(deviceId: string) {
    super(
      'DEVICE_NOT_FOUND',
      `Device with ID '${deviceId}' not found`,
      { deviceId },
      'Please check if the device is connected and authorized'
    );
    this.name = 'DeviceNotFoundError';
  }
}

export class NoDevicesFoundError extends ADBCommandError {
  constructor() {
    super(
      'NO_DEVICES_FOUND',
      'No Android devices found',
      null,
      'Please connect an Android device or start an emulator and ensure USB debugging is enabled'
    );
    this.name = 'NoDevicesFoundError';
  }
}

export class ScreenshotCaptureError extends ADBCommandError {
  constructor(deviceId: string, originalError?: Error) {
    super(
      'SCREENSHOT_CAPTURE_FAILED',
      `Failed to capture screenshot from device '${deviceId}'`,
      { deviceId, originalError: originalError?.message },
      'Please ensure the device is connected and screen is unlocked'
    );
    this.name = 'ScreenshotCaptureError';
  }
}

// Tool input schemas
export const TakeScreenshotInputSchema = z.object({
  deviceId: z
    .string()
    .optional()
    .describe(
      'The ID of the Android device to capture a screenshot from. If not provided, uses the first available device.'
    ),
  format: z
    .enum(['png'])
    .default('png')
    .describe('The image format for the screenshot. Currently only PNG is supported.'),
});

export const ListDevicesInputSchema = z.object({});

// Tool output schemas
export const TakeScreenshotOutputSchema = z.object({
  data: z.string().describe('Base64 encoded image data'),
  format: z.string().describe('Image format (png)'),
  width: z.number().describe('Image width in pixels'),
  height: z.number().describe('Image height in pixels'),
  deviceId: z.string().describe('ID of the device the screenshot was taken from'),
  timestamp: z.number().describe('Unix timestamp when the screenshot was captured'),
});

export const ListDevicesOutputSchema = z.object({
  devices: z
    .array(
      z.object({
        id: z.string().describe('Device ID'),
        status: z.string().describe('Device status'),
        model: z.string().optional().describe('Device model'),
        product: z.string().optional().describe('Product name'),
        transportId: z.string().optional().describe('Transport ID'),
        usb: z.string().optional().describe('USB information'),
        productString: z.string().optional().describe('Product string'),
      })
    )
    .describe('List of connected Android devices'),
});

// MCP Tool schemas
export const TakeScreenshotToolSchema = {
  type: 'object' as const,
  properties: {
    deviceId: {
      type: 'string' as const,
      description:
        'The ID of the Android device to capture a screenshot from. If not provided, uses the first available device.',
    },
    format: {
      type: 'string' as const,
      enum: ['png'],
      default: 'png',
      description: 'The image format for the screenshot. Currently only PNG is supported.',
    },
  },
  required: [] as string[],
};

export const ListDevicesToolSchema = {
  type: 'object' as const,
  properties: {},
  required: [] as string[],
};

// Type exports
export type TakeScreenshotInput = z.infer<typeof TakeScreenshotInputSchema>;
export type ListDevicesInput = z.infer<typeof ListDevicesInputSchema>;
export type TakeScreenshotOutput = z.infer<typeof TakeScreenshotOutputSchema>;
export type ListDevicesOutput = z.infer<typeof ListDevicesOutputSchema>;

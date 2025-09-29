import { execSync } from 'child_process';

// Mock device list output
export const mockDeviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86 model:sdk_gphone_x86 transport_id:1
192.168.1.100:5555	device product:pixel model:pixel transport_id:2`;

// Mock empty device list output
export const mockEmptyDeviceListOutput = 'List of devices attached';

// Mock unauthorized device list output
export const mockUnauthorizedDeviceListOutput = `List of devices attached
192.168.1.100:5555	unauthorized product:pixel model:pixel transport_id:2`;

// Mock PNG screenshot data (minimal PNG with 100x200 dimensions)
export const mockScreenshotData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
  0x49, 0x48, 0x44, 0x52, // IHDR chunk type
  0x00, 0x00, 0x00, 0x64, // Width: 100
  0x00, 0x00, 0x00, 0xC8, // Height: 200
  0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
  // Rest of PNG data (simplified for testing)
]);

// Mock ADB version output
export const mockADBVersionOutput = 'Android Debug Bridge version 1.0.41';

// Mock implementation of execSync
export function mockExecSync(command: string, options?: any): Buffer {
  const cmd = command.replace('adb ', '');
  
  if (cmd === 'version') {
    return Buffer.from(mockADBVersionOutput);
  }
  
  if (cmd === 'devices -l') {
    return Buffer.from(mockDeviceListOutput);
  }
  
  if (cmd.startsWith('-s ') && cmd.includes('exec-out screencap -p')) {
    return mockScreenshotData;
  }
  
  if (cmd === 'exec-out screencap -p') {
    return mockScreenshotData;
  }
  
  // Throw error for unknown commands
  const error = new Error(`Command not found: ${command}`) as any;
  error.status = 1;
  error.stdout = '';
  throw error;
}

// Setup mock for execSync
export function setupADBMock() {
  const originalExecSync = execSync;
  
  // Replace execSync with our mock
  (execSync as any) = jest.fn(mockExecSync);
  
  // Return a function to restore the original
  return () => {
    (execSync as any) = originalExecSync;
  };
}

// Setup mock with custom responses
export function setupADBMockWithResponses(responses: Record<string, Buffer | string>) {
  const originalExecSync = execSync;
  
  (execSync as any) = jest.fn((command: string, options?: any) => {
    const cmd = command.replace('adb ', '');
    
    if (responses[cmd]) {
      const response = responses[cmd];
      return typeof response === 'string' ? Buffer.from(response) : response;
    }
    
    // Default to empty buffer for unknown commands
    return Buffer.from('');
  });
  
  // Return a function to restore the original
  return () => {
    (execSync as any) = originalExecSync;
  };
}
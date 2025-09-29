import { execSync, ExecSyncOptions } from 'child_process';
import {
  AndroidDevice,
  ADBCommandError,
  ADBNotFoundError,
  DeviceNotFoundError,
  NoDevicesFoundError,
  ScreenshotCaptureError,
} from '../types';

// Default timeout for ADB commands (5 seconds)
const DEFAULT_TIMEOUT = 5000;

// Check if ADB is available
export function checkADBInstalled(): boolean {
  try {
    execSync('adb version', { stdio: 'pipe', timeout: DEFAULT_TIMEOUT });
    return true;
  } catch (error) {
    return false;
  }
}

// Execute ADB command with error handling
export function executeADBCommand(command: string, options: ExecSyncOptions = {}): string {
  if (!checkADBInstalled()) {
    throw new ADBNotFoundError();
  }

  const execOptions: ExecSyncOptions = {
    stdio: 'pipe',
    timeout: DEFAULT_TIMEOUT,
    ...options,
  };

  try {
    const result = execSync(`adb ${command}`, execOptions);
    return result.toString('utf-8');
  } catch (error: any) {
    if (error.status === 1 && error.stdout) {
      // Some ADB commands return output on stderr even when successful
      return error.stdout.toString('utf-8');
    }
    throw new ADBCommandError('ADB_COMMAND_FAILED', `ADB command failed: ${error.message}`, {
      command,
      error: error.message,
    });
  }
}

// Execute ADB command that returns binary data
export function executeADBCommandBinary(command: string, options: ExecSyncOptions = {}): Buffer {
  if (!checkADBInstalled()) {
    throw new ADBNotFoundError();
  }

  const execOptions: ExecSyncOptions = {
    stdio: 'pipe',
    timeout: DEFAULT_TIMEOUT,
    ...options,
  };

  try {
    const result = execSync(`adb ${command}`, execOptions);
    return Buffer.isBuffer(result) ? result : Buffer.from(result);
  } catch (error: any) {
    if (error.status === 1 && error.stdout) {
      // Some ADB commands return output on stderr even when successful
      const output = error.stdout;
      return Buffer.isBuffer(output) ? output : Buffer.from(output);
    }
    throw new ADBCommandError('ADB_COMMAND_FAILED', `ADB command failed: ${error.message}`, {
      command,
      error: error.message,
    });
  }
}

// Parse device list from ADB output
export function parseDeviceList(output: string): AndroidDevice[] {
  const lines = output.trim().split('\n');
  const devices: AndroidDevice[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const device: AndroidDevice = {
      id: parts[0],
      status: parts[1] as AndroidDevice['status'],
    };

    // Parse additional device information
    for (let j = 2; j < parts.length; j++) {
      const part = parts[j];
      if (part.startsWith('model:')) {
        device.model = part.substring(6);
      } else if (part.startsWith('product:')) {
        device.product = part.substring(8);
      } else if (part.startsWith('transport_id:')) {
        device.transportId = part.substring(13);
      } else if (part.startsWith('usb:')) {
        device.usb = part.substring(4);
      } else if (part.startsWith('product_string:')) {
        device.productString = part.substring(15);
      }
    }

    devices.push(device);
  }

  return devices;
}

// Get list of connected devices
export function getConnectedDevices(): AndroidDevice[] {
  try {
    const output = executeADBCommand('devices -l');
    const devices = parseDeviceList(output);

    if (devices.length === 0) {
      throw new NoDevicesFoundError();
    }

    return devices;
  } catch (error) {
    if (error instanceof NoDevicesFoundError) {
      throw error;
    }
    throw new ADBCommandError('FAILED_TO_LIST_DEVICES', 'Failed to list connected devices', {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

// Get the first available device
export function getFirstAvailableDevice(): AndroidDevice {
  const devices = getConnectedDevices();
  const availableDevice = devices.find(device => device.status === 'device');

  if (!availableDevice) {
    throw new ADBCommandError('NO_AVAILABLE_DEVICES', 'No available devices found', { devices });
  }

  return availableDevice;
}

// Capture screenshot from a device
export function captureScreenshot(deviceId?: string): Buffer {
  let targetDeviceId: string;

  try {
    if (deviceId) {
      // Verify the device exists
      const devices = getConnectedDevices();
      const device = devices.find(d => d.id === deviceId);

      if (!device) {
        throw new DeviceNotFoundError(deviceId);
      }

      if (device.status !== 'device') {
        throw new ADBCommandError(
          'DEVICE_NOT_AVAILABLE',
          `Device '${deviceId}' is not available (status: ${device.status})`,
          { device }
        );
      }

      targetDeviceId = deviceId;
    } else {
      // Use the first available device
      const device = getFirstAvailableDevice();
      targetDeviceId = device.id;
    }

    // Capture screenshot using binary command execution
    const command = targetDeviceId
      ? `-s ${targetDeviceId} exec-out screencap -p`
      : 'exec-out screencap -p';
    const screenshotData = executeADBCommandBinary(command);

    if (!screenshotData || screenshotData.length === 0) {
      throw new ScreenshotCaptureError(targetDeviceId);
    }

    return screenshotData;
  } catch (error) {
    if (error instanceof ADBCommandError) {
      throw error;
    }
    throw new ScreenshotCaptureError(
      deviceId || 'unknown',
      error instanceof Error ? error : undefined
    );
  }
}

// Get device information
export function getDeviceInfo(deviceId: string): Partial<AndroidDevice> {
  try {
    const devices = getConnectedDevices();
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      throw new DeviceNotFoundError(deviceId);
    }

    return device;
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      throw error;
    }
    throw new ADBCommandError(
      'FAILED_TO_GET_DEVICE_INFO',
      `Failed to get device info for '${deviceId}'`,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

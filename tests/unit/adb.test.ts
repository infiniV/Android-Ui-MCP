import { execSync } from 'child_process';
import {
  checkADBInstalled,
  executeADBCommand,
  parseDeviceList,
  getConnectedDevices,
  getFirstAvailableDevice,
  captureScreenshot,
  getDeviceInfo,
} from '../../src/utils/adb';
import { ADBNotFoundError, DeviceNotFoundError, NoDevicesFoundError } from '../../src/types';

// Mock execSync
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('ADB Utilities', () => {
  const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkADBInstalled', () => {
    it('should return true if ADB is installed', () => {
      mockExecSync.mockReturnValue(Buffer.from('Android Debug Bridge version 1.0.41'));

      const result = checkADBInstalled();

      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('adb version', { stdio: 'pipe', timeout: 5000 });
    });

    it('should return false if ADB is not installed', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const result = checkADBInstalled();

      expect(result).toBe(false);
    });
  });

  describe('executeADBCommand', () => {
    it('should execute ADB command successfully', () => {
      mockExecSync.mockReturnValue(Buffer.from('List of devices attached'));

      const result = executeADBCommand('devices');

      expect(result).toBe('List of devices attached');
      expect(mockExecSync).toHaveBeenCalledWith('adb devices', { stdio: 'pipe', timeout: 5000 });
    });

    it('should throw ADBNotFoundError if ADB is not installed', () => {
      // Mock execSync to simulate ADB not found
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      expect(() => executeADBCommand('devices')).toThrow(ADBNotFoundError);
    });

    it('should throw ADBCommandError if command fails', () => {
      // First call for ADB version check succeeds
      mockExecSync.mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41'));
      // Second call for the actual command fails
      mockExecSync.mockImplementationOnce(() => {
        const error = new Error('Command failed') as any;
        error.status = 1;
        error.stdout = '';
        throw error;
      });

      expect(() => executeADBCommand('invalid-command')).toThrow(
        'ADB command failed: Command failed'
      );
    });

    it('should return stdout even if command returns error status 1', () => {
      // First call for ADB version check succeeds
      mockExecSync.mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41'));
      // Second call returns error with stdout
      const error = new Error('Command failed') as any;
      error.status = 1;
      error.stdout = Buffer.from('Some output');
      mockExecSync.mockImplementationOnce(() => {
        throw error;
      });

      const result = executeADBCommand('devices');

      expect(result).toBe('Some output');
    });
  });

  describe('parseDeviceList', () => {
    it('should parse device list correctly', () => {
      const output = `List of devices attached
emulator-5554	device product:sdk_gphone_x86 model:sdk_gphone_x86 device:generic_x86 transport_id:1
192.168.1.100:5555	unauthorized product:pixel model:pixel device:pixel transport_id:2`;

      const devices = parseDeviceList(output);

      expect(devices).toHaveLength(2);
      expect(devices[0]).toEqual({
        id: 'emulator-5554',
        status: 'device',
        product: 'sdk_gphone_x86',
        model: 'sdk_gphone_x86',
        transportId: '1',
      });
      expect(devices[1]).toEqual({
        id: '192.168.1.100:5555',
        status: 'unauthorized',
        product: 'pixel',
        model: 'pixel',
        transportId: '2',
      });
    });

    it('should return empty array for empty device list', () => {
      const output = 'List of devices attached';

      const devices = parseDeviceList(output);

      expect(devices).toHaveLength(0);
    });

    it('should handle malformed lines gracefully', () => {
      const output = `List of devices attached
emulator-5554	device
malformed-line
192.168.1.100:5555	unauthorized`;

      const devices = parseDeviceList(output);

      expect(devices).toHaveLength(2);
      expect(devices[0].id).toBe('emulator-5554');
      expect(devices[1].id).toBe('192.168.1.100:5555');
    });
  });

  describe('getConnectedDevices', () => {
    it('should return list of connected devices', () => {
      const output = `List of devices attached
emulator-5554	device product:sdk_gphone_x86 model:sdk_gphone_x86 transport_id:1`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(output)); // devices -l call

      const devices = getConnectedDevices();

      expect(devices).toHaveLength(1);
      expect(devices[0].id).toBe('emulator-5554');
      expect(mockExecSync).toHaveBeenCalledWith('adb devices -l', { stdio: 'pipe', timeout: 5000 });
    });

    it('should throw NoDevicesFoundError if no devices are connected', () => {
      const output = 'List of devices attached';

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(output)); // devices -l call

      expect(() => getConnectedDevices()).toThrow(NoDevicesFoundError);
    });

    it('should throw ADBCommandError if command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => getConnectedDevices()).toThrow('Failed to list connected devices');
    });
  });

  describe('getFirstAvailableDevice', () => {
    it('should return the first available device', () => {
      const output = `List of devices attached
emulator-5554	device product:sdk_gphone_x86
192.168.1.100:5555	unauthorized product:pixel`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(output)); // devices -l call

      const device = getFirstAvailableDevice();

      expect(device.id).toBe('emulator-5554');
      expect(device.status).toBe('device');
    });

    it('should throw ADBCommandError if no available devices', () => {
      const output = `List of devices attached
192.168.1.100:5555	unauthorized product:pixel`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(output)); // devices -l call

      expect(() => getFirstAvailableDevice()).toThrow('No available devices found');
    });
  });

  describe('captureScreenshot', () => {
    it('should capture screenshot from specified device', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;

      const screenshotOutput = 'fake-png-data'; // Simulate PNG data as string

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check for getConnectedDevices
        .mockReturnValueOnce(Buffer.from(deviceListOutput)) // devices -l call
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check for screenshot
        .mockReturnValueOnce(Buffer.from(screenshotOutput)); // screenshot capture

      const screenshot = captureScreenshot('emulator-5554');

      expect(screenshot).toBe(screenshotOutput);
      expect(mockExecSync).toHaveBeenCalledWith('adb devices -l', { stdio: 'pipe', timeout: 5000 });
      expect(mockExecSync).toHaveBeenCalledWith('adb -s emulator-5554 exec-out screencap -p', {
        stdio: 'pipe',
        timeout: 5000,
      });
    });

    it('should capture screenshot from first available device if no deviceId specified', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;

      const screenshotOutput = 'fake-png-data'; // Simulate PNG data as string

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check for getFirstAvailableDevice
        .mockReturnValueOnce(Buffer.from(deviceListOutput)) // devices -l call
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check for screenshot
        .mockReturnValueOnce(Buffer.from(screenshotOutput)); // screenshot capture

      const screenshot = captureScreenshot();

      expect(screenshot).toBe(screenshotOutput);
      expect(mockExecSync).toHaveBeenCalledWith('adb -s emulator-5554 exec-out screencap -p', {
        stdio: 'pipe',
        timeout: 5000,
      });
    });

    it('should throw DeviceNotFoundError if device does not exist', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(deviceListOutput)); // devices -l call

      expect(() => captureScreenshot('nonexistent-device')).toThrow(DeviceNotFoundError);
    });

    it('should throw ADBCommandError if device is not available', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	unauthorized product:sdk_gphone_x86`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(deviceListOutput)); // devices -l call

      expect(() => captureScreenshot('emulator-5554')).toThrow(
        "Device 'emulator-5554' is not available"
      );
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information for specified device', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86 model:sdk_gphone_x86 transport_id:1`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(deviceListOutput)); // devices -l call

      const deviceInfo = getDeviceInfo('emulator-5554');

      expect(deviceInfo).toEqual({
        id: 'emulator-5554',
        status: 'device',
        product: 'sdk_gphone_x86',
        model: 'sdk_gphone_x86',
        transportId: '1',
      });
    });

    it('should throw DeviceNotFoundError if device does not exist', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;

      mockExecSync
        .mockReturnValueOnce(Buffer.from('Android Debug Bridge version 1.0.41')) // ADB version check
        .mockReturnValueOnce(Buffer.from(deviceListOutput)); // devices -l call

      expect(() => getDeviceInfo('nonexistent-device')).toThrow(DeviceNotFoundError);
    });
  });
});

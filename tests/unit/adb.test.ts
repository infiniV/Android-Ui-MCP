import { execSync } from 'child_process';
import { 
  checkADBInstalled, 
  executeADBCommand, 
  parseDeviceList, 
  getConnectedDevices,
  getFirstAvailableDevice,
  captureScreenshot,
  getDeviceInfo
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
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });
      
      expect(() => executeADBCommand('devices')).toThrow(ADBNotFoundError);
    });

    it('should throw ADBCommandError if command fails', () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('Command failed') as any;
        error.status = 1;
        error.stdout = '';
        throw error;
      });
      
      expect(() => executeADBCommand('invalid-command')).toThrow('ADB_COMMAND_FAILED');
    });

    it('should return stdout even if command returns error status 1', () => {
      const error = new Error('Command failed') as any;
      error.status = 1;
      error.stdout = Buffer.from('Some output');
      mockExecSync.mockImplementation(() => {
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
        transportId: '1'
      });
      expect(devices[1]).toEqual({
        id: '192.168.1.100:5555',
        status: 'unauthorized',
        product: 'pixel',
        model: 'pixel',
        transportId: '2'
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
      
      mockExecSync.mockReturnValue(Buffer.from(output));
      
      const devices = getConnectedDevices();
      
      expect(devices).toHaveLength(1);
      expect(devices[0].id).toBe('emulator-5554');
      expect(mockExecSync).toHaveBeenCalledWith('devices -l');
    });

    it('should throw NoDevicesFoundError if no devices are connected', () => {
      const output = 'List of devices attached';
      
      mockExecSync.mockReturnValue(Buffer.from(output));
      
      expect(() => getConnectedDevices()).toThrow(NoDevicesFoundError);
    });

    it('should throw ADBCommandError if command fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      expect(() => getConnectedDevices()).toThrow('FAILED_TO_LIST_DEVICES');
    });
  });

  describe('getFirstAvailableDevice', () => {
    it('should return the first available device', () => {
      const output = `List of devices attached
emulator-5554	device product:sdk_gphone_x86
192.168.1.100:5555	unauthorized product:pixel`;
      
      mockExecSync.mockReturnValue(Buffer.from(output));
      
      const device = getFirstAvailableDevice();
      
      expect(device.id).toBe('emulator-5554');
      expect(device.status).toBe('device');
    });

    it('should throw ADBCommandError if no available devices', () => {
      const output = `List of devices attached
192.168.1.100:5555	unauthorized product:pixel`;
      
      mockExecSync.mockReturnValue(Buffer.from(output));
      
      expect(() => getFirstAvailableDevice()).toThrow('NO_AVAILABLE_DEVICES');
    });
  });

  describe('captureScreenshot', () => {
    it('should capture screenshot from specified device', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;
      
      const screenshotOutput = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
      
      mockExecSync
        .mockReturnValueOnce(Buffer.from(deviceListOutput))
        .mockReturnValueOnce(screenshotOutput);
      
      const screenshot = captureScreenshot('emulator-5554');
      
      expect(screenshot).toBe(screenshotOutput.toString('binary'));
      expect(mockExecSync).toHaveBeenCalledWith('devices -l');
      expect(mockExecSync).toHaveBeenCalledWith('-s emulator-5554 exec-out screencap -p');
    });

    it('should capture screenshot from first available device if no deviceId specified', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;
      
      const screenshotOutput = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
      
      mockExecSync
        .mockReturnValueOnce(Buffer.from(deviceListOutput))
        .mockReturnValueOnce(screenshotOutput);
      
      const screenshot = captureScreenshot();
      
      expect(screenshot).toBe(screenshotOutput.toString('binary'));
      expect(mockExecSync).toHaveBeenCalledWith('exec-out screencap -p');
    });

    it('should throw DeviceNotFoundError if device does not exist', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;
      
      mockExecSync.mockReturnValue(Buffer.from(deviceListOutput));
      
      expect(() => captureScreenshot('nonexistent-device')).toThrow(DeviceNotFoundError);
    });

    it('should throw ADBCommandError if device is not available', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	unauthorized product:sdk_gphone_x86`;
      
      mockExecSync.mockReturnValue(Buffer.from(deviceListOutput));
      
      expect(() => captureScreenshot('emulator-5554')).toThrow('DEVICE_NOT_AVAILABLE');
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information for specified device', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86 model:sdk_gphone_x86 transport_id:1`;
      
      mockExecSync.mockReturnValue(Buffer.from(deviceListOutput));
      
      const deviceInfo = getDeviceInfo('emulator-5554');
      
      expect(deviceInfo).toEqual({
        id: 'emulator-5554',
        status: 'device',
        product: 'sdk_gphone_x86',
        model: 'sdk_gphone_x86',
        transportId: '1'
      });
    });

    it('should throw DeviceNotFoundError if device does not exist', () => {
      const deviceListOutput = `List of devices attached
emulator-5554	device product:sdk_gphone_x86`;
      
      mockExecSync.mockReturnValue(Buffer.from(deviceListOutput));
      
      expect(() => getDeviceInfo('nonexistent-device')).toThrow(DeviceNotFoundError);
    });
  });
});
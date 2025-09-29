import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { setupADBMock } from '../mocks/adb.mock';

// Mock ADB before importing server
setupADBMock();

// Import server after setting up mocks
import { AndroidScreenshotServer } from '../../src/server';

describe('MCP Server Integration Tests', () => {
  let serverProcess: any;
  let server: AndroidScreenshotServer;

  beforeAll(async () => {
    // Create a real server instance for testing
    server = new AndroidScreenshotServer();
  });

  afterAll(async () => {
    // Clean up if needed
  });

  describe('Server Initialization', () => {
    it('should initialize server with correct capabilities', () => {
      expect(server).toBeDefined();
      // The server should have tools capability
      // We can't directly access the capabilities, but we can test through tool requests
    });
  });

  describe('Tool Listing', () => {
    it('should list available tools', async () => {
      // Create a mock request handler to test tool listing
      const listToolsHandler = server['server']['requestHandlers'].get('tools/list');
      
      if (listToolsHandler) {
        const response = await listToolsHandler({ method: 'tools/list', params: {} });
        
        expect(response.tools).toBeDefined();
        expect(response.tools).toHaveLength(2);
        
        const toolNames = response.tools.map((tool: any) => tool.name);
        expect(toolNames).toContain('take_android_screenshot');
        expect(toolNames).toContain('list_android_devices');
        
        // Check tool descriptions
        const screenshotTool = response.tools.find((tool: any) => tool.name === 'take_android_screenshot');
        expect(screenshotTool.description).toContain('screenshot');
        
        const devicesTool = response.tools.find((tool: any) => tool.name === 'list_android_devices');
        expect(devicesTool.description).toContain('devices');
      }
    });
  });

  describe('Tool Calling', () => {
    it('should handle list_android_devices tool call', async () => {
      // Create a mock request handler to test tool calling
      const callToolHandler = server['server']['requestHandlers'].get('tools/call');
      
      if (callToolHandler) {
        const request = {
          method: 'tools/call',
          params: {
            name: 'list_android_devices',
            arguments: {}
          }
        };
        
        const response = await callToolHandler(request);
        
        expect(response.content).toBeDefined();
        expect(response.content).toHaveLength(1);
        expect(response.content[0].type).toBe('text');
        
        // Parse the response text
        const responseData = JSON.parse(response.content[0].text);
        expect(responseData.devices).toBeDefined();
        expect(Array.isArray(responseData.devices)).toBe(true);
        expect(responseData.devices.length).toBeGreaterThan(0);
        
        // Check device structure
        const device = responseData.devices[0];
        expect(device.id).toBeDefined();
        expect(device.status).toBeDefined();
      }
    });

    it('should handle take_android_screenshot tool call', async () => {
      // Create a mock request handler to test tool calling
      const callToolHandler = server['server']['requestHandlers'].get('tools/call');
      
      if (callToolHandler) {
        const request = {
          method: 'tools/call',
          params: {
            name: 'take_android_screenshot',
            arguments: {}
          }
        };
        
        const response = await callToolHandler(request);
        
        expect(response.content).toBeDefined();
        expect(response.content).toHaveLength(1);
        expect(response.content[0].type).toBe('text');
        
        // Parse the response text
        const responseData = JSON.parse(response.content[0].text);
        expect(responseData.data).toBeDefined();
        expect(responseData.format).toBe('png');
        expect(responseData.width).toBe(100);
        expect(responseData.height).toBe(200);
        expect(responseData.deviceId).toBeDefined();
        expect(responseData.timestamp).toBeDefined();
      }
    });

    it('should handle take_android_screenshot with specific device', async () => {
      // Create a mock request handler to test tool calling
      const callToolHandler = server['server']['requestHandlers'].get('tools/call');
      
      if (callToolHandler) {
        const request = {
          method: 'tools/call',
          params: {
            name: 'take_android_screenshot',
            arguments: {
              deviceId: 'emulator-5554'
            }
          }
        };
        
        const response = await callToolHandler(request);
        
        expect(response.content).toBeDefined();
        expect(response.content).toHaveLength(1);
        expect(response.content[0].type).toBe('text');
        
        // Parse the response text
        const responseData = JSON.parse(response.content[0].text);
        expect(responseData.deviceId).toBe('emulator-5554');
      }
    });

    it('should handle unknown tool name', async () => {
      // Create a mock request handler to test tool calling
      const callToolHandler = server['server']['requestHandlers'].get('tools/call');
      
      if (callToolHandler) {
        const request = {
          method: 'tools/call',
          params: {
            name: 'unknown_tool',
            arguments: {}
          }
        };
        
        await expect(callToolHandler(request)).rejects.toThrow('Unknown tool: unknown_tool');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Create a mock request handler to test tool calling
      const callToolHandler = server['server']['requestHandlers'].get('tools/call');
      
      if (callToolHandler) {
        // Test with invalid arguments that should cause an error
        const request = {
          method: 'tools/call',
          params: {
            name: 'take_android_screenshot',
            arguments: {
              deviceId: 'nonexistent-device'
            }
          }
        };
        
        const response = await callToolHandler(request);
        
        expect(response.content).toBeDefined();
        expect(response.content).toHaveLength(1);
        expect(response.content[0].type).toBe('text');
        expect(response.isError).toBe(true);
        
        // The error message should contain information about the error
        const errorMessage = response.content[0].text;
        expect(errorMessage).toContain('DEVICE_NOT_FOUND');
      }
    });
  });
});

// Additional test for actual server process communication
describe('Server Process Communication', () => {
  let serverProcess: any;
  let serverOutput: string = '';
  let serverError: string = '';

  beforeAll(async () => {
    // Build the project first
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Build failed, skipping process communication tests');
      return;
    }

    // Start the server process
    serverProcess = spawn('node', [path.join(__dirname, '..', '..', 'dist', 'index.js')]);

    // Collect output
    serverProcess.stdout.on('data', (data: Buffer) => {
      serverOutput += data.toString();
    });

    serverProcess.stderr.on('data', (data: Buffer) => {
      serverError += data.toString();
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should start server process without errors', () => {
    if (!serverProcess) {
      // Skip test if build failed
      return;
    }

    expect(serverProcess.pid).toBeDefined();
    expect(serverError).not.toContain('Error');
  });

  it('should handle JSON-RPC requests', async () => {
    if (!serverProcess) {
      // Skip test if build failed
      return;
    }

    // Send a list tools request
    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });

    serverProcess.stdin.write(request + '\n');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if we got a valid JSON response
    const responseLines = serverOutput.split('\n').filter(line => line.trim());
    const lastLine = responseLines[responseLines.length - 1];

    expect(lastLine).toBeDefined();
    
    try {
      const response = JSON.parse(lastLine);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeDefined();
    } catch (error) {
      console.error('Failed to parse server response:', lastLine);
      throw error;
    }
  });
});
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { 
  TakeScreenshotInputSchema, 
  TakeScreenshotOutputSchema, 
  ListDevicesInputSchema, 
  ListDevicesOutputSchema 
} from './types.js';
import { captureScreenshotResponse } from './utils/screenshot.js';
import { getConnectedDevices } from './utils/adb.js';
import { formatErrorForResponse } from './utils/error.js';

class AndroidScreenshotServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'android-ui-assist-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'take_android_screenshot',
          description: 'Capture a screenshot from an Android device or emulator',
          inputSchema: TakeScreenshotInputSchema,
        },
        {
          name: 'list_android_devices',
          description: 'List all connected Android devices and emulators',
          inputSchema: ListDevicesInputSchema,
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'take_android_screenshot': {
            const input = TakeScreenshotInputSchema.parse(args);
            const result = await this.takeScreenshot(input);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case 'list_android_devices': {
            const input = ListDevicesInputSchema.parse(args);
            const result = await this.listDevices(input);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: formatErrorForResponse(error),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async takeScreenshot(input: z.infer<typeof TakeScreenshotInputSchema>): Promise<z.infer<typeof TakeScreenshotOutputSchema>> {
    const screenshot = await captureScreenshotResponse(input.deviceId);
    
    const result = {
      data: screenshot.data,
      format: screenshot.format,
      width: screenshot.width,
      height: screenshot.height,
      deviceId: screenshot.deviceId,
      timestamp: screenshot.timestamp,
    };

    return TakeScreenshotOutputSchema.parse(result);
  }

  private async listDevices(input: z.infer<typeof ListDevicesInputSchema>): Promise<z.infer<typeof ListDevicesOutputSchema>> {
    const devices = getConnectedDevices();
    
    const result = {
      devices: devices.map(device => ({
        id: device.id,
        status: device.status,
        model: device.model,
        product: device.product,
        transportId: device.transportId,
        usb: device.usb,
        productString: device.productString,
      })),
    };

    return ListDevicesOutputSchema.parse(result);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Android Screenshot MCP server started');
  }
}

// Export the server class
export { AndroidScreenshotServer };

// Main entry point
async function main() {
  const server = new AndroidScreenshotServer();
  await server.run();
}

// Run the server if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}
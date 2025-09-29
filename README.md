# Android UI Assist MCP Server

An MCP (Model Context Protocol) server that captures screenshots from Android devices and emulators for AI agent visual analysis.

## Features

- 📸 Capture screenshots from Android devices and emulators
- 📱 List connected Android devices with detailed information
- 🔧 Easy integration with Claude Code and other MCP clients
- 🐳 Docker support for containerized deployment
- 🛡️ Comprehensive error handling with user-friendly messages
- ⚡ Optimized for performance with timeout handling

## Prerequisites

- Node.js 18 or higher
- Android SDK Platform Tools (ADB)
- Connected Android device or running emulator with USB debugging enabled

## Installation

### Option 1: NPM Package (Recommended)

```bash
npm install -g android-ui-assist-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/your-username/android-ui-assist-mcp.git
cd android-ui-assist-mcp
npm install
npm run build
```

### Option 3: Docker

```bash
docker build -t android-ui-assist-mcp -f docker/Dockerfile .
```

## Setup

### 1. Install ADB

Make sure Android Debug Bridge (ADB) is installed and available in your PATH.

**Windows:**
- Install Android Studio or Android SDK Platform Tools
- Add the SDK platform-tools directory to your PATH

**macOS:**
```bash
brew install android-platform-tools
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install android-tools-adb
```

### 2. Enable USB Debugging on Android Device

1. Go to Settings > About phone
2. Tap "Build number" 7 times to enable Developer options
3. Go back to Settings > Developer options
4. Enable "USB debugging"
5. Connect your device to your computer via USB
6. When prompted, allow USB debugging on your device

### 3. Verify ADB Connection

```bash
adb devices
```

You should see your device listed with "device" status.

## Usage with Claude Code

Add the server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "android-ui-assist-mcp"
    }
  }
}
```

Or if using from source:

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "node",
      "args": ["/path/to/android-ui-assist-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### take_android_screenshot

Capture a screenshot from an Android device or emulator.

**Parameters:**
- `deviceId` (optional): The ID of the Android device to capture from. If not provided, uses the first available device.
- `format` (optional): Image format (currently only PNG is supported).

**Example:**
```json
{
  "name": "take_android_screenshot",
  "arguments": {}
}
```

**Response:**
```json
{
  "data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "png",
  "width": 1080,
  "height": 1920,
  "deviceId": "emulator-5554",
  "timestamp": 1634567890123
}
```

### list_android_devices

List all connected Android devices and emulators.

**Parameters:**
- None

**Example:**
```json
{
  "name": "list_android_devices",
  "arguments": {}
}
```

**Response:**
```json
{
  "devices": [
    {
      "id": "emulator-5554",
      "status": "device",
      "model": "sdk_gphone_x86",
      "product": "sdk_gphone_x86",
      "transportId": "2"
    }
  ]
}
```

## Docker Usage

### Using Docker Compose

```bash
cd docker
docker-compose up -d
```

### Using Docker Directly

```bash
docker run -it --rm \
  -v /tmp/android-adb:/tmp/android-adb:ro \
  -v /usr/bin/adb:/usr/bin/adb:ro \
  android-ui-assist-mcp
```

## Development

### Project Structure

```
android-ui-assist-mcp/
├── src/
│   ├── server.ts           # Main MCP server implementation
│   ├── types.ts            # TypeScript interfaces and types
│   ├── utils/
│   │   ├── adb.ts          # ADB command utilities
│   │   ├── screenshot.ts  # Screenshot processing utilities
│   │   └── error.ts        # Error handling utilities
│   └── index.ts            # Entry point
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── mocks/              # Mock implementations
├── docker/                 # Docker configuration
└── docs/                   # Documentation
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Troubleshooting

### ADB Not Found

If you get an "ADB not found" error:
1. Verify ADB is installed
2. Check that ADB is in your PATH
3. On Windows, try restarting your command prompt

### No Devices Found

If no devices are listed:
1. Check that your device is connected via USB
2. Verify USB debugging is enabled
3. Try reconnecting the device
4. Check for authorization prompts on your device

### Device Unauthorized

If your device shows as "unauthorized":
1. Disconnect and reconnect the USB cable
2. Check for USB debugging authorization prompt on your device
3. Revoke USB debugging authorizations in Developer options and try again

### Screenshot Capture Failed

If screenshot capture fails:
1. Ensure the device screen is unlocked
2. Check that the device is properly connected
3. Try manually capturing a screenshot with `adb exec-out screencap -p > screenshot.png`

## Performance Considerations

- ADB commands have a 5-second timeout to prevent hanging
- Screenshots are processed efficiently to minimize memory usage
- The server is designed to handle multiple rapid requests

## Security

- The server only communicates via stdio, reducing attack surface
- No sensitive data is logged
- ADB commands are executed with minimal privileges

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information
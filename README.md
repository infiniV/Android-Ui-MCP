<div align="center">

# 📱 Android UI Assist MCP Server

[![npm version](https://badge.fury.io/js/android-ui-assist-mcp.svg)](https://badge.fury.io/js/android-ui-assist-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)

**🚀 AI-powered Android UI analysis through Model Context Protocol (MCP)**

_Capture screenshots and analyze Android device interfaces with Claude Desktop, Gemini CLI, and GitHub Copilot_

</div>

---

## ✨ Features

- 📸 **Screenshot Capture** - Get real-time screenshots from Android devices/emulators
- 📱 **Device Management** - List and manage connected Android devices
- 🤖 **AI Integration** - Works with Claude Desktop, Gemini CLI & GitHub Copilot
- 🐳 **Docker Support** - Containerized deployment for any environment
- 🛡️ **Error Handling** - Comprehensive error handling with helpful suggestions
- ⚡ **Performance** - Optimized for speed with 5-second timeout handling
- 🔒 **Security** - Stdio communication with minimal privileges

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g android-ui-assist-mcp

# Or clone from source
git clone https://github.com/yourusername/android-ui-assist-mcp
cd android-ui-assist-mcp
npm install && npm run build
```

**Prerequisites:**

- Android Debug Bridge (ADB) installed
- Android device/emulator connected
- Node.js 18+ and npm

**Quick Test:**

```bash
# Check connected devices
adb devices

# Run MCP server
android-ui-assist-mcp
```

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation Options](#-installation-options)
- [AI Platform Integration](#-ai-platform-integration)
  - [Claude Desktop](#-claude-desktop-integration)
  - [Gemini CLI](#-gemini-cli-integration)
  - [GitHub Copilot](#-github-copilot-integration)
- [Docker Deployment](#-docker-deployment)
- [Usage Examples](#-usage-examples)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)

---

## 🔧 Prerequisites

### Required Software

| Component   | Version | Installation                                                                               |
| ----------- | ------- | ------------------------------------------------------------------------------------------ |
| **Node.js** | 18.0+   | [Download](https://nodejs.org)                                                             |
| **npm**     | 8.0+    | Included with Node.js                                                                      |
| **ADB**     | Latest  | [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools) |

### Android Device Setup

1. **Enable Developer Options**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging**
   - Settings > Developer Options > USB Debugging ✓
3. **Verify Connection**
   ```bash
   adb devices
   # Should show: device_id    device
   ```

---

## 📦 Installation Options

### Option 1: NPM Global Install (Recommended)

```bash
npm install -g android-ui-assist-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/yourusername/android-ui-assist-mcp
cd android-ui-assist-mcp
npm install
npm run build
```

### Option 3: Docker (See [Docker Section](#-docker-deployment))

---

## 🤖 AI Platform Integration

### 🎯 Claude Desktop Integration

**Step 1: Install Claude Desktop**

- Download from [Claude Desktop](https://claude.ai/download)
- Install and create account

**Step 2: Configure MCP Server**

Create/edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "npx",
      "args": ["android-ui-assist-mcp"],
      "timeout": 10000
    }
  }
}
```

**For local development:**

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "node",
      "args": ["d:\\projects\\android-ui-assist-mcp\\dist\\index.js"],
      "timeout": 10000
    }
  }
}
```

**Step 3: Restart Claude Desktop**

- Close Claude completely
- Reopen Claude Desktop
- Look for 🔌 icon indicating MCP connection

**Step 4: Test Integration**
In Claude chat:

```
Can you take a screenshot of my Android device and analyze the UI?
```

---

### 🔮 Gemini CLI Integration

**Step 1: Install Gemini CLI**

```bash
npm install -g @google/generative-ai-cli
gemini auth login
```

**Step 2: Configure MCP Server**

Edit `~/.gemini/settings.json` (or `%USERPROFILE%\.gemini\settings.json` on Windows):

```json
{
  "mcp": {
    "servers": [
      {
        "name": "android-ui-assist",
        "command": "npx",
        "args": ["android-ui-assist-mcp"],
        "transport": "stdio",
        "timeout": 10000
      }
    ]
  }
}
```

**For local development:**

```json
{
  "mcp": {
    "servers": [
      {
        "name": "android-ui-assist",
        "command": "node",
        "args": ["d:\\projects\\android-ui-assist-mcp\\dist\\index.js"],
        "transport": "stdio",
        "timeout": 10000
      }
    ]
  }
}
```

**Step 3: Verify Connection**

```bash
gemini mcp list
# Should show: android-ui-assist ✓ Connected
```

**Step 4: Test Integration**

```bash
gemini chat --mcp
# In chat: "Take a screenshot of my Android device"
```

---

### 🐙 GitHub Copilot Integration

> **Note:** GitHub Copilot MCP integration is currently in preview. Features may change.

**Step 1: Enable MCP in VS Code**

- Install GitHub Copilot extension
- Enable experimental MCP features in settings

**Step 2: Configure Workspace**

Create `.vscode/settings.json` in your project:

```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "typescript": true
  },
  "mcp.servers": {
    "android-ui-assist": {
      "command": "npx",
      "args": ["android-ui-assist-mcp"],
      "timeout": 10000
    }
  }
}
```

**Step 3: Test Integration**

- Open VS Code in your project
- Use Copilot Chat: `@android-ui-assist take screenshot`

---

## 🐳 Docker Deployment

### Quick Docker Setup

**Step 1: Build Image**

```bash
cd docker
docker-compose up --build -d
```

**Step 2: Configure AI Platform**

For Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "docker",
      "args": ["exec", "android-ui-assist-mcp", "node", "/app/dist/index.js"],
      "timeout": 15000
    }
  }
}
```

### Manual Docker Build

```bash
# Build image
docker build -t android-ui-assist-mcp .

# Run with ADB access
docker run -it --rm \
  --privileged \
  -v /dev/bus/usb:/dev/bus/usb \
  android-ui-assist-mcp
```

### Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'
services:
  android-ui-assist-mcp:
    build: .
    container_name: android-ui-assist-mcp
    privileged: true
    volumes:
      - /dev/bus/usb:/dev/bus/usb
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## 💡 Usage Examples

### Basic Screenshot Capture

```typescript
// In any AI chat (Claude, Gemini, Copilot)
'Take a screenshot of my Android device';
"Show me what's currently on my phone screen";
'Capture the current app interface';
```

### Device Management

```typescript
'List all connected Android devices';
'Show device information for my phone';
'Which Android devices are available?';
```

### UI Analysis Workflows

```typescript
'Take a screenshot and analyze the UI accessibility';
'Capture the screen and suggest UX improvements';
'Screenshot the current app and identify UI patterns';
```

### Advanced Usage

```typescript
// With specific device ID
'Take a screenshot from device emulator-5554';

// Combined operations
'List devices, then take a screenshot from the first one';
```

---

## 🔍 Available MCP Tools

| Tool                      | Description                | Parameters            |
| ------------------------- | -------------------------- | --------------------- |
| `take_android_screenshot` | Captures device screenshot | `deviceId` (optional) |
| `list_android_devices`    | Lists connected devices    | None                  |

### Tool Schemas

**Screenshot Tool:**

```typescript
{
  name: "take_android_screenshot",
  description: "Capture a screenshot from an Android device or emulator",
  inputSchema: {
    type: "object",
    properties: {
      deviceId: {
        type: "string",
        description: "Optional device ID. If not provided, uses the first available device"
      }
    }
  }
}
```

**Device List Tool:**

```typescript
{
  name: "list_android_devices",
  description: "List all connected Android devices and emulators with detailed information",
  inputSchema: {
    type: "object",
    properties: {}
  }
}
```

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

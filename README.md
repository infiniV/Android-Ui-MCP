# Android UI Assist MCP Server

[![npm version](https://badge.fury.io/js/android-ui-assist-mcp.svg)](https://badge.fury.io/js/android-ui-assist-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)

Model Context Protocol server for capturing Android device screenshots and device management for AI analysis. Supports Claude Desktop, Gemini CLI, and GitHub Copilot integration.

## Features

- Screenshot capture from Android devices and emulators
- Connected device listing and management
- MCP protocol integration with major AI platforms
- Docker deployment support
- Comprehensive error handling with timeout management
- Secure stdio communication

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [AI Agent Configuration](#ai-agent-configuration)
- [Docker Deployment](#docker-deployment)
- [Available Tools](#available-tools)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Prerequisites

| Component | Version | Installation                                                                               |
| --------- | ------- | ------------------------------------------------------------------------------------------ |
| Node.js   | 18.0+   | [Download](https://nodejs.org)                                                             |
| npm       | 8.0+    | Included with Node.js                                                                      |
| ADB       | Latest  | [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools) |

### Android Device Setup

1. Enable Developer Options: Settings > About Phone > Tap "Build Number" 7 times
2. Enable USB Debugging: Settings > Developer Options > USB Debugging
3. Verify connection: `adb devices`

## Installation

### NPM Installation

```bash
npm install -g android-ui-assist-mcp
```

### From Source

```bash
git clone https://github.com/yourusername/android-ui-assist-mcp
cd android-ui-assist-mcp
npm install && npm run build
```

## AI Agent Configuration

### Claude Desktop

Create or edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

For local development:

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

Restart Claude Desktop to apply configuration.

### Gemini CLI

Install and configure:

```bash
npm install -g @google/generative-ai-cli
gemini auth login
```

**Method 1: Command Line Configuration**

```bash
# For NPM installation
gemini mcp add android-ui-assist npx android-ui-assist-mcp

# For local development
gemini mcp add android-ui-assist node "/path/to/android-ui-assist-mcp/dist/index.js"
```

**Method 2: Configuration File**

Create `~/.gemini/settings.json` (Windows: `%USERPROFILE%\.gemini\settings.json`):

```json
{
  "mcpServers": {
    "android-ui-assist": {
      "command": "npx",
      "args": ["android-ui-assist-mcp"]
    }
  }
}
```

For local development:

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

Verify: `gemini mcp list`

### GitHub Copilot (VS Code)

Create `.vscode/settings.json` in your project:

```json
{
  "github.copilot.enable": {
    "*": true
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

## Docker Deployment

### Docker Compose

```bash
cd docker
docker-compose up --build -d
```

Configure AI platform for Docker:

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
docker build -t android-ui-assist-mcp .
docker run -it --rm --privileged -v /dev/bus/usb:/dev/bus/usb android-ui-assist-mcp
```

## Available Tools

| Tool                      | Description                | Parameters            |
| ------------------------- | -------------------------- | --------------------- |
| `take_android_screenshot` | Captures device screenshot | `deviceId` (optional) |
| `list_android_devices`    | Lists connected devices    | None                  |

### Tool Schemas

**take_android_screenshot**

```json
{
  "name": "take_android_screenshot",
  "description": "Capture a screenshot from an Android device or emulator",
  "inputSchema": {
    "type": "object",
    "properties": {
      "deviceId": {
        "type": "string",
        "description": "Optional device ID. If not provided, uses the first available device"
      }
    }
  }
}
```

**list_android_devices**

```json
{
  "name": "list_android_devices",
  "description": "List all connected Android devices and emulators with detailed information",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

## Usage

Request screenshots or device information through your AI agent:

- "Take a screenshot of my Android device"
- "List connected Android devices"
- "Capture screen from device emulator-5554"

## Troubleshooting

### ADB Issues

- **ADB not found**: Verify ADB is installed and in PATH
- **No devices**: Check USB connection and debugging authorization
- **Device unauthorized**: Disconnect/reconnect USB, check device authorization prompt
- **Screenshot failed**: Ensure device is unlocked and properly connected

### Connection Issues

- Verify `adb devices` shows your device as "device" status
- Restart ADB server: `adb kill-server && adb start-server`
- Check USB debugging permissions on device

## Development

### Build Commands

```bash
npm run build     # Production build
npm test          # Run tests
npm run lint      # Code linting
npm run format    # Code formatting
```

### Project Structure

```
src/
├── server.ts         # MCP server implementation
├── types.ts          # Type definitions
├── utils/
│   ├── adb.ts        # ADB command utilities
│   ├── screenshot.ts # Screenshot processing
│   └── error.ts      # Error handling
└── index.ts          # Entry point
```

## Performance

- 5-second timeout on ADB operations
- In-memory screenshot processing
- Stdio communication for security
- Minimal privilege execution

## License

MIT License - see LICENSE file for details.

# Android UI Assist MCP Server - AI Coding Agent Instructions

## Project Overview

This is an **MCP (Model Context Protocol) server** that captures Android device/emulator screenshots for AI agent visual analysis. The server uses native ADB commands wrapped in TypeScript to provide screenshot and device listing tools to AI agents through the MCP protocol.

## Architecture & Big Picture

### Core Components

- **MCP Server (`src/server.ts`)**: Main server implementing MCP protocol with StdioServerTransport
- **ADB Utilities (`src/utils/adb.ts`)**: Native ADB command wrappers with comprehensive error handling
- **Screenshot Processing (`src/utils/screenshot.ts`)**: PNG processing and base64 encoding
- **Type System (`src/types.ts`)**: Zod schemas for validation + custom error classes

### Key Design Decisions

- **Native ADB over libraries**: Uses `execSync` with ADB CLI for maximum compatibility and reliability
- **Custom error hierarchy**: Specific error classes (ADBNotFoundError, DeviceNotFoundError, etc.) with user-friendly suggestions
- **Timeout handling**: All ADB commands have 5-second timeouts to prevent hanging
- **Base64 image transport**: Screenshots encoded as base64 for MCP compatibility

## Critical Development Workflows

### Building & Testing

```bash
# Development build
npm run build

# Distribution build with packaging
npm run build:dist  # Creates ./package/ for npm publishing

# Testing
npm test           # Jest with ts-jest
npm run test:watch
npm run test:coverage  # Uses nyc for coverage
```

### MCP Integration Testing

The server communicates via stdio. To test manually:

```bash
# Run server directly
npm run dev

# Or test built version
node dist/index.js
```

### Docker Development

```bash
cd docker && docker-compose up -d
```

Note: Docker setup requires ADB access from container - see Dockerfile for volume mounts.

## Project-Specific Patterns

### Error Handling Convention

All ADB operations use custom error classes with structured error codes and user suggestions:

```typescript
// Pattern used throughout codebase
throw new DeviceNotFoundError(deviceId);
// Results in user-friendly message with actionable suggestion
```

### Zod Schema Pattern

All MCP tool inputs/outputs use Zod schemas for validation:

```typescript
// Input validation + output validation + MCP tool schema
export const TakeScreenshotInputSchema = z.object({...});
export const TakeScreenshotToolSchema = { type: 'object', properties: {...} };
```

### ADB Command Wrapper Pattern

All ADB commands follow this pattern in `src/utils/adb.ts`:

```typescript
// 1. Check ADB availability 2. Execute with timeout 3. Parse output 4. Throw specific errors
```

### Test Organization

- **Unit tests** (`tests/unit/`): Mock execSync, test pure functions
- **Integration tests** (`tests/integration/`): Test full MCP server workflow
- **Mocks** (`tests/mocks/`): Reusable mock implementations

## Integration Points & Dependencies

### External Dependencies

- **@modelcontextprotocol/sdk**: Core MCP protocol implementation
- **zod**: Runtime validation and type inference
- **ADB (Android Debug Bridge)**: Required system dependency

### MCP Tool Interface

Two tools exposed to AI agents:

1. `take_android_screenshot`: Captures device screenshots (optional deviceId)
2. `list_android_devices`: Lists connected devices with detailed info

### Screenshot Data Flow

`ADB screencap` → `Binary PNG` → `PNG dimension parsing` → `Base64 encoding` → `MCP response`

## Key Files for AI Agents

### Start Here

- `src/server.ts` - MCP server implementation and tool handlers
- `src/types.ts` - Complete type system and error classes
- `README.md` - User-facing documentation and setup

### Core Logic

- `src/utils/adb.ts` - All ADB command wrappers and device management
- `src/utils/screenshot.ts` - PNG processing and response formatting
- `tests/unit/adb.test.ts` - Comprehensive test patterns and mocking examples

### Build & Deploy

- `scripts/build.js` - Distribution packaging logic
- `jest.config.json` - Test configuration with ts-jest
- `docker/Dockerfile` - Containerization approach

## Common Debugging Commands

```bash
# Check ADB connectivity
adb devices -l

# Manual screenshot test
adb exec-out screencap -p > test.png

# Test MCP server tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

## Performance Considerations

- ADB operations timeout at 5 seconds
- Screenshots processed in-memory (no temp files)
- Memory target: <50MB for typical operations
- PNG dimension parsing avoids loading full image into memory

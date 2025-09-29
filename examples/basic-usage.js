#!/usr/bin/env node

/**
 * Basic usage example for Android UI Assist MCP Server
 * 
 * This example demonstrates how to use the MCP server directly
 * without an MCP client for testing purposes.
 */

const { spawn } = require('child_process');
const path = require('path');

// Path to the built server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

class MCPClient {
    constructor(serverPath) {
        this.serverPath = serverPath;
        this.requestId = 0;
        this.pendingRequests = new Map();
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.process = spawn('node', [this.serverPath]);

            this.process.stdout.on('data', (data) => {
                this.handleMessage(data.toString());
            });

            this.process.stderr.on('data', (data) => {
                console.error('Server error:', data.toString());
            });

            this.process.on('error', (error) => {
                reject(error);
            });

            this.process.on('close', (code) => {
                console.log(`Server exited with code ${code}`);
            });

            // Wait a bit for the server to start
            setTimeout(resolve, 1000);
        });
    }

    handleMessage(message) {
        try {
            const data = JSON.parse(message);

            if (data.id && this.pendingRequests.has(data.id)) {
                const { resolve } = this.pendingRequests.get(data.id);
                this.pendingRequests.delete(data.id);
                resolve(data);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    }

    async sendRequest(method, params = {}) {
        const id = ++this.requestId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });

            this.process.stdin.write(JSON.stringify(request) + '\n');

            // Set a timeout
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error(`Request ${id} timed out`));
                }
            }, 10000);
        });
    }

    async listTools() {
        const response = await this.sendRequest('tools/list');
        return response.result.tools;
    }

    async callTool(name, arguments_ = {}) {
        const response = await this.sendRequest('tools/call', {
            name,
            arguments: arguments_
        });

        if (response.result) {
            return JSON.parse(response.result.content[0].text);
        }

        throw new Error(response.result?.content[0]?.text || 'Unknown error');
    }

    async stop() {
        if (this.process) {
            this.process.kill();
        }
    }
}

async function main() {
    console.log('Android UI Assist MCP Server - Basic Usage Example');
    console.log('====================================================');

    const client = new MCPClient(serverPath);

    try {
        // Start the server
        console.log('Starting server...');
        await client.start();
        console.log('Server started successfully');

        // List available tools
        console.log('\nListing available tools...');
        const tools = await client.listTools();
        console.log('Available tools:');
        tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description}`);
        });

        // List connected devices
        console.log('\nListing connected devices...');
        const devices = await client.callTool('list_android_devices');
        console.log('Connected devices:');
        if (devices.devices.length === 0) {
            console.log('No devices found. Please connect an Android device or start an emulator.');
        } else {
            devices.devices.forEach(device => {
                console.log(`- ID: ${device.id}`);
                console.log(`  Status: ${device.status}`);
                if (device.model) console.log(`  Model: ${device.model}`);
                if (device.product) console.log(`  Product: ${device.product}`);
            });
        }

        // Take a screenshot if devices are available
        if (devices.devices.length > 0) {
            console.log('\nCapturing screenshot...');
            const screenshot = await client.callTool('take_android_screenshot');
            console.log('Screenshot captured successfully:');
            console.log(`- Format: ${screenshot.format}`);
            console.log(`- Dimensions: ${screenshot.width}x${screenshot.height}`);
            console.log(`- Device ID: ${screenshot.deviceId}`);
            console.log(`- Timestamp: ${new Date(screenshot.timestamp).toISOString()}`);
            console.log(`- Data size: ${Math.round(screenshot.data.length * 0.75)} bytes (base64)`);

            // Save screenshot to file for verification
            const fs = require('fs');
            const screenshotPath = path.join(__dirname, 'screenshot.png');
            fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
            console.log(`\nScreenshot saved to: ${screenshotPath}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.stop();
    }
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { MCPClient };
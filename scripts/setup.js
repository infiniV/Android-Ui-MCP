#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Android UI Assist MCP Server - Setup Script');
console.log('=============================================');

// Function to execute a command and handle errors
function executeCommand(command, errorMessage) {
    try {
        console.log(`Executing: ${command}`);
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Error: ${errorMessage}`);
        console.error(error.message);
        return false;
    }
}

// Function to check if a command exists
function commandExists(command) {
    try {
        execSync(`${command} --version`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

// Function to prompt user for confirmation
function promptUser(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

async function main() {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

    if (majorVersion < 18) {
        console.error(`Error: Node.js version 18 or higher is required. Current version: ${nodeVersion}`);
        process.exit(1);
    }

    console.log(`✓ Node.js version ${nodeVersion} is compatible`);

    // Check if npm is available
    if (!commandExists('npm')) {
        console.error('Error: npm is not installed or not in PATH');
        process.exit(1);
    }

    console.log('✓ npm is available');

    // Install dependencies
    console.log('\nInstalling dependencies...');
    if (!executeCommand('npm install', 'Failed to install dependencies')) {
        process.exit(1);
    }

    console.log('✓ Dependencies installed successfully');

    // Build the project
    console.log('\nBuilding the project...');
    if (!executeCommand('npm run build', 'Failed to build the project')) {
        process.exit(1);
    }

    console.log('✓ Project built successfully');

    // Check if ADB is available
    console.log('\nChecking for ADB (Android Debug Bridge)...');
    if (!commandExists('adb')) {
        console.warn('Warning: ADB is not installed or not in PATH');
        console.warn('Please install Android SDK Platform Tools and ensure ADB is in your PATH');

        const shouldContinue = await promptUser('Do you want to continue anyway? (y/n): ');
        if (!shouldContinue) {
            process.exit(1);
        }
    } else {
        console.log('✓ ADB is available');

        // Check if any devices are connected
        try {
            const devicesOutput = execSync('adb devices', { encoding: 'utf8' });
            const devices = devicesOutput.split('\n').filter(line => line.includes('\tdevice'));

            if (devices.length === 0) {
                console.warn('Warning: No Android devices are connected or authorized');
                console.warn('Please connect an Android device or start an emulator with USB debugging enabled');

                const shouldContinue = await promptUser('Do you want to continue anyway? (y/n): ');
                if (!shouldContinue) {
                    process.exit(1);
                }
            } else {
                console.log(`✓ Found ${devices.length} connected Android device(s)`);
            }
        } catch (error) {
            console.warn('Warning: Could not check for connected devices');
            console.warn(error.message);
        }
    }

    // Create global symlink (optional)
    console.log('\nCreating global symlink...');
    const shouldCreateSymlink = await promptUser('Do you want to create a global symlink for android-ui-assist-mcp? (y/n): ');

    if (shouldCreateSymlink) {
        if (executeCommand('npm link', 'Failed to create global symlink')) {
            console.log('✓ Global symlink created successfully');
            console.log('You can now run the server with: android-ui-assist-mcp');
        } else {
            console.warn('Warning: Failed to create global symlink');
            console.warn('You may need to run this script with administrator privileges');
        }
    }

    // Setup complete
    console.log('\n=============================================');
    console.log('Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Connect an Android device or start an emulator');
    console.log('2. Enable USB debugging on the device');
    console.log('3. Add the server to your Claude Code configuration:');
    console.log('   {');
    console.log('     "mcpServers": {');
    console.log('       "android-ui-assist": {');
    console.log('         "command": "android-ui-assist-mcp"');
    console.log('       }');
    console.log('     }');
    console.log('   }');
    console.log('\nFor more information, see the README.md file');
}

// Run the setup
main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
});
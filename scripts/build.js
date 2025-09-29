#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Android UI Assist MCP Server - Build Script');
console.log('============================================');

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

// Function to copy directory recursively
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Clean previous build
console.log('\nCleaning previous build...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
console.log('✓ Previous build cleaned');

// Install dependencies
console.log('\nInstalling dependencies...');
if (!executeCommand('npm ci --only=production', 'Failed to install dependencies')) {
    process.exit(1);
}
console.log('✓ Dependencies installed');

// Build TypeScript
console.log('\nBuilding TypeScript...');
if (!executeCommand('npx tsc', 'Failed to build TypeScript')) {
    process.exit(1);
}
console.log('✓ TypeScript built successfully');

// Copy package.json to dist
console.log('\nCopying package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove dev dependencies and scripts for distribution
delete packageJson.devDependencies;
delete packageJson.scripts;
delete packageJson.jest;
delete packageJson.eslintConfig;
delete packageJson.prettier;
delete packageJson.husky;

// Add bin field if not exists
if (!packageJson.bin) {
    packageJson.bin = {
        'android-ui-assist-mcp': 'index.js'
    };
}

// Update main field
packageJson.main = 'index.js';

// Write to dist
fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('✓ package.json copied and updated');

// Copy README.md
console.log('\nCopying README.md...');
if (fs.existsSync('README.md')) {
    fs.copyFileSync('README.md', path.join('dist', 'README.md'));
    console.log('✓ README.md copied');
} else {
    console.warn('Warning: README.md not found');
}

// Copy LICENSE
console.log('\nCopying LICENSE...');
if (fs.existsSync('LICENSE')) {
    fs.copyFileSync('LICENSE', path.join('dist', 'LICENSE'));
    console.log('✓ LICENSE copied');
} else {
    console.warn('Warning: LICENSE not found');
}

// Create a .npmignore file
console.log('\nCreating .npmignore...');
const npmignoreContent = `# Source files
src/
tests/
examples/
docs/
scripts/
docker/

# Build files
tsconfig.json
.eslintrc.json
.prettierrc
jest.config.json

# Development files
.gitignore
.gitattributes
.npmignore
.nycrc
CHANGELOG.md
CONTRIBUTING.md
IMPLEMENTATION_PLAN.md

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
`;

fs.writeFileSync(path.join('dist', '.npmignore'), npmignoreContent);
console.log('✓ .npmignore created');

// Create a distribution package
console.log('\nCreating distribution package...');
if (fs.existsSync('package')) {
    fs.rmSync('package', { recursive: true, force: true });
}

// Copy dist to package
copyDir('dist', 'package');
console.log('✓ Distribution package created');

console.log('\n============================================');
console.log('Build completed successfully!');
console.log('\nDistribution package created in ./package/');
console.log('To publish to npm, run:');
console.log('cd package && npm publish');
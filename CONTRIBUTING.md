# Contributing to Android UI Assist MCP Server

Thank you for your interest in contributing to the Android UI Assist MCP Server! This document provides guidelines and instructions for contributors.

## Code of Conduct

This project follows a standard code of conduct. Please be respectful and inclusive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- A clear and descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Environment information (OS, Node.js version, ADB version)
- Any relevant error messages or screenshots

### Suggesting Features

To suggest a new feature, please create an issue on GitHub with:

- A clear and descriptive title
- A detailed description of the proposed feature
- The use case or problem it would solve
- Any potential implementation ideas

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run linting and formatting (`npm run lint` and `npm run format`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a pull request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/android-ui-assist-mcp.git
   cd android-ui-assist-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script:
   ```bash
   npm run setup
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing TypeScript configuration
- Use strict type checking
- Avoid `any` types whenever possible

### Code Style

- Follow the ESLint configuration
- Use Prettier for code formatting
- Run `npm run lint` and `npm run format` before committing

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants
- Use descriptive names that clearly indicate purpose

### Comments and Documentation

- Add JSDoc comments for all public functions and classes
- Include parameter descriptions and return types
- Add inline comments for complex logic

## Testing

### Unit Tests

- Write unit tests for all new utility functions
- Use Jest for testing
- Mock external dependencies
- Aim for high code coverage

### Integration Tests

- Write integration tests for new MCP tools
- Test the full request/response cycle
- Mock ADB commands for consistent testing

### Test Coverage

- Maintain at least 80% code coverage
- Use `.nycrc` configuration for coverage reporting
- Check coverage reports in the `coverage` directory

## Pull Request Guidelines

- Keep pull requests focused on a single feature or fix
- Include a clear description of changes
- Reference any related issues
- Update documentation as needed
- Ensure all tests pass
- Follow the coding standards

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run tests and ensure they pass
4. Build the project (`npm run build`)
5. Create a release on GitHub
6. Publish to npm (`cd package && npm publish`)

## Getting Help

If you need help with contributing, please:

- Check the documentation
- Search existing issues and discussions
- Create a new issue with the "question" label

Thank you for contributing to the Android UI Assist MCP Server!
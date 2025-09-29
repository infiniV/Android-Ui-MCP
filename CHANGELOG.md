# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of Android UI Assist MCP Server
- Support for capturing screenshots from Android devices and emulators
- Support for listing connected Android devices with detailed information
- Comprehensive error handling with user-friendly error messages
- Docker support for containerized deployment
- Unit and integration tests
- Documentation and examples

## [1.0.0] - 2023-09-28

### Added
- Initial release
- `take_android_screenshot` tool for capturing screenshots
- `list_android_devices` tool for listing connected devices
- Support for multiple connected devices
- PNG format screenshots with metadata (dimensions, timestamp)
- Device information including model, product, and transport ID
- Comprehensive error handling for ADB operations
- Docker and Docker Compose support
- Setup and build scripts
- Documentation and examples
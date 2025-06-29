# Copilot Instructions for PageTurner App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React Native cross-platform mobile application project with the following specific requirements:

## Project Overview
- **App Name**: PageTurner
- **Purpose**: Control an e-reader (bigme b751c) via Bluetooth connection
- **Platform**: Cross-platform (iOS & Android)
- **Framework**: React Native with TypeScript

## Core Features
1. **Bluetooth Device Discovery**: Scan and display available Bluetooth devices
2. **Device Connection**: Connect specifically to bigme b751c e-reader
3. **Volume Key Control**: Intercept volume up/down keys and convert them to left/right arrow signals
4. **Page Navigation**: Send left/right arrow key signals via Bluetooth to control page turning

## Technical Stack
- React Native 0.80.0 with TypeScript
- react-native-ble-plx for Bluetooth functionality
- react-native-permissions for permission management
- react-native-volume-manager for volume key interception
- react-native-vector-icons for UI icons

## Development Guidelines
- Use TypeScript for all components and services
- Implement proper error handling for Bluetooth operations
- Follow React Native best practices for cross-platform compatibility
- Ensure proper permission handling for Bluetooth and volume key access
- Create modular components for Bluetooth management and UI

## Key Components to Implement
1. BluetoothService: Handle device discovery, connection, and data transmission
2. VolumeKeyListener: Monitor volume key presses and convert to navigation signals
3. DeviceListScreen: Display and manage Bluetooth device connections
4. MainScreen: Primary interface showing connection status and controls

## Platform-Specific Considerations
- Android: Requires BLUETOOTH, BLUETOOTH_ADMIN, and ACCESS_COARSE_LOCATION permissions
- iOS: Requires NSBluetoothAlwaysUsageDescription and volume key handling permissions
- Handle platform differences in volume key detection and Bluetooth API usage

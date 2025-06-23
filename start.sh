#!/bin/bash

# 🚀 React Native Dev Launcher for britto-rn

# --------------------------
# CONFIGURATION
# --------------------------
PROJECT_DIR=$(pwd)
ADB_PATH=$(which adb)
RN_CLI=$(which npx)

# --------------------------
# 1. Start Metro Bundler (in background)
# --------------------------
echo "🌀 Starting Metro Bundler..."
$RN_CLI react-native start --reset-cache &
METRO_PID=$!

sleep 3

# --------------------------
# 2. Connect emulator to Metro
# --------------------------
echo "🔗 Setting up ADB reverse port (8081)..."
$ADB_PATH reverse tcp:8081 tcp:8081

# --------------------------
# 3. Build and Run App
# --------------------------
echo "📱 Building and Installing App to Emulator..."
$RN_CLI react-native run-android

# --------------------------
# 4. Launch Developer Menu (optional)
# --------------------------
echo "📂 If app doesn't reload, open Dev Menu using:"
echo "    adb shell input keyevent 82  (or press Ctrl+M in emulator)"

# Optionally, wait for Metro Bundler to finish (if you want to keep the script running)
# wait $METRO_PID

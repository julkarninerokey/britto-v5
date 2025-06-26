#!/bin/bash

# 🚀 React Native iOS Dev Launcher for britto-rn

# This script will open two VS Code terminals:
# 1. Metro Bundler (foreground)
# 2. iOS build/run command

# Open a new VS Code terminal and run Metro Bundler
osascript -e 'tell application "Visual Studio Code" to activate'
code --new-window .

osascript -e 'tell application "System Events" to keystroke "`" using {control down, shift down}'

osascript -e 'tell application "System Events" to keystroke "npx react-native start --reset-cache\n"'
sleep 2

# Open a split terminal and run iOS build
osascript -e 'tell application "System Events" to keystroke "`" using {control down, shift down}'
sleep 1
osascript -e 'tell application "System Events" to keystroke "npx react-native run-ios\n"'

# Info
osascript -e 'display notification "Metro and iOS build started in split VS Code terminals." with title "React Native iOS Dev Launcher"'
echo "🌀 Metro Bundler and 🍏 iOS build started in split VS Code terminals."
echo "📂 If app doesn't reload, shake the simulator or press Cmd+D for the dev menu."

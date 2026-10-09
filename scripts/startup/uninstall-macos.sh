#!/bin/sh
# Removes the Falta LaunchAgent. Leaves the repo where it is.
set -eu
PLIST="$HOME/Library/LaunchAgents/io.github.if12is.falta.plist"
UID_NUM=$(id -u)
launchctl bootout "gui/${UID_NUM}/io.github.if12is.falta" 2>/dev/null || true
if [ -f "$PLIST" ]; then
  rm -f "$PLIST"
  echo "Removed: $PLIST"
else
  echo "No LaunchAgent at $PLIST"
fi

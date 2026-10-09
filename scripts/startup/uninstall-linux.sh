#!/bin/sh
# Removes the Falta autostart entry. Leaves the repo where it is.
set -eu
DIR="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
DESKTOP="$DIR/falta.desktop"
if [ -f "$DESKTOP" ]; then
  rm -f "$DESKTOP"
  echo "Removed: $DESKTOP"
else
  echo "No autostart entry at $DESKTOP"
fi

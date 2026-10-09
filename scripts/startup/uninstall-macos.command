#!/bin/sh
DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
sh "$DIR/uninstall-macos.sh"
status=$?
printf '\nPress Enter to close.\n'
read -r _ || true
exit "$status"

#!/bin/sh
DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
sh "$DIR/install-macos.sh"
status=$?
printf '\n'
if [ "$status" -eq 0 ]; then
  printf 'Done. You can close this window.\n'
else
  printf 'Install did not finish. Read the message above.\n'
fi
printf 'Press Enter to close.\n'
read -r _ || true
exit "$status"

#!/usr/bin/env bash
# Generates sample audio files for testing s2t.
# Requires: macOS (uses say command) + ffmpeg

set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)/input"
mkdir -p "$DIR"

generate() {
  local name="$1"
  local text="$2"
  local voice="${3:-Samantha}"

  local aiff="$DIR/${name}.aiff"
  local mp3="$DIR/${name}.mp3"

  echo "Generating ${name}.mp3..."
  say -v "$voice" -o "$aiff" "$text"
  ffmpeg -i "$aiff" -codec:a libmp3lame -qscale:a 2 "$mp3" -y -loglevel error
  rm "$aiff"
  echo "  → $mp3"
}

generate "hello" "Hello. This is a test of the speak2text CLI tool. The transcription should capture this sentence accurately."
generate "numbers" "One, two, three, four, five. Testing number recognition: 2026, 42, 3.14."
generate "multilingual" "This sample contains some Finnish words: hyvää päivää, kiitos, tervetuloa." "Samantha"

echo ""
echo "Done. Try: s2t transcribe samples/hello.mp3"

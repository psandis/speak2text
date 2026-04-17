# speak2text

Speech-to-text CLI tool. Transcribes audio and video files using OpenAI Whisper, Grok, or Gemini. Stores transcripts locally in SQLite.

## Features

- Transcribe any audio or video file to text
- Multiple output formats: plain text, SRT subtitles, JSON with timestamps
- Multiple provider support: OpenAI Whisper (default), Grok, Gemini
- Local transcript history in SQLite
- Audio preprocessing via ffmpeg for best accuracy

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript | Language |
| Commander | CLI framework |
| better-sqlite3 | Local transcript storage |
| ffmpeg | Audio preprocessing |
| OpenAI / Grok / Gemini SDKs | Transcription providers |
| Vitest | Testing |
| Biome | Lint & format |
| pnpm | Package manager |

## Requirements

- Node.js 22+
- pnpm
- ffmpeg installed and available in PATH
- API key for your chosen provider

### Install ffmpeg

**macOS**
```
brew install ffmpeg
```

**Linux (Debian/Ubuntu)**
```
sudo apt install ffmpeg
```

**Windows**
```
winget install ffmpeg
```

## Installation

```
pnpm add -g speak2text
```

## Configuration

```
s2t config set openai.key YOUR_KEY
s2t config set grok.key YOUR_KEY
s2t config set gemini.key YOUR_KEY
s2t config set provider openai
```

## Usage

### Transcribe a file

```
s2t transcribe audio.mp3
s2t transcribe audio.mp3 --format srt
s2t transcribe audio.mp3 --format json
s2t transcribe audio.mp3 --provider gemini
s2t transcribe audio.mp3 --out ./transcripts/
```

### Manage transcripts

```
s2t list
s2t show <id>
s2t export <id> --format srt
s2t delete <id>
```

## Output Formats

| Format | Description |
|--------|-------------|
| `txt` | Plain text (default) |
| `srt` | SRT subtitles with timestamps |
| `json` | Full JSON with timestamps, confidence, and metadata |

## Providers

| Provider | Flag | Notes |
|----------|------|-------|
| OpenAI Whisper | `--provider openai` | Default. Best price/accuracy balance. $0.006/min |
| Grok | `--provider grok` | Real-time optimized. $0.05/min |
| Gemini | `--provider gemini` | Multi-speaker detection |

## Supported Formats

Any format supported by ffmpeg: mp3, mp4, m4a, wav, ogg, flac, webm, mkv, mov, avi.

## Storage

Transcripts are stored locally in SQLite:

- **macOS/Linux:** `~/.local/share/speak2text/transcripts.db`
- **Windows:** `%APPDATA%\speak2text\transcripts.db`

## License

See MIT

# speak2text

Speech-to-text CLI tool. Drop audio or video files into `input/`, run `s2t transcribe`, get transcripts in `output/`. Powered by OpenAI Whisper.

## How It Works

1. Put any audio or video file in `input/`
2. Run `s2t transcribe`
3. Transcripts appear in `output/`

**Supported natively** (sent directly to OpenAI): mp3, mp4, m4a, wav, webm

**Requires ffmpeg** (converted to mp3 first): mkv, avi, mov, flac, ogg, and any other format

Video files are always stripped to audio only — no video is uploaded.

## Example

```
$ s2t transcribe
Transcribing 1 file(s)...
  chile_promo.mp3 — transcribing...
  ✓ output/chile_promo.txt [19dee66d]

Done.
```

Output:
```
September 11, 1973, a military coup overthrows the government in Chile, ending the longest
democratic tradition in Latin America. It was a bloody, bloody coup. Chileans who lived
through the coup and years of repression reflect on its meaning for us today.
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript | Language |
| Commander | CLI framework |
| better-sqlite3 | Local transcript history |
| OpenAI Whisper API | Transcription |
| ffmpeg | Audio conversion (optional, only for unsupported formats) |
| Vitest | Testing |
| Biome | Lint & format |
| pnpm | Package manager |

## Requirements

- Node.js 22+
- pnpm
- OpenAI API key (or Grok / Gemini)
- ffmpeg — only if using unsupported formats (mkv, avi, flac, ogg...)

### Install ffmpeg (if needed)

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

Store your API key in `~/.speak2text/.env`:

```
OPENAI_API_KEY=your-key-here
```

Or set the default provider:

```
s2t config set provider openai
```

Other providers:

```
GROK_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

## Usage

### Transcribe all files in input/

```
s2t transcribe
```

### Transcribe a specific file

```
s2t transcribe path/to/audio.mp3
```

### Options

```
s2t transcribe --format srt
s2t transcribe --format json
s2t transcribe --provider gemini
s2t transcribe --language fi
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
| OpenAI Whisper | `--provider openai` | Default. $0.006/min |
| Grok | `--provider grok` | OpenAI-compatible API |
| Gemini | `--provider gemini` | OpenAI-compatible API |

## Storage

Transcripts are stored locally in SQLite:

- **macOS/Linux:** `~/.speak2text/transcripts.db`

Config and API keys:

- **macOS/Linux:** `~/.speak2text/.env`

## Roadmap

- v0.2.0 — `--translate` flag: transcribe and translate to English in one step

## License

See MIT

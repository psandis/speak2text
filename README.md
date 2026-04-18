# speak2text

[![npm](https://img.shields.io/npm/v/speak2text?style=flat-square)](https://www.npmjs.com/package/speak2text)

speak2text CLI tool. Drop audio or video files into `input/`, run `s2t transcribe`, get transcripts in `output/`. Powered by OpenAI Whisper.

## Installation

```
pnpm add -g speak2text
```

## Requirements

- Node.js 22+
- OpenAI API key (or Grok / Gemini)
- ffmpeg - only needed for unsupported formats (mkv, avi, flac, ogg...)

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

## Configuration

Create `~/.speak2text/.env` and add your API key:

```
OPENAI_API_KEY=your-key-here
```

Other providers:

```
GROK_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

Set default provider (OpenAI is default):

```
s2t config set provider openai
```

## How It Works

1. Put any audio or video file in `input/`
2. Run `s2t transcribe`
3. Transcripts appear in `output/`

Files sent directly to OpenAI: mp3, mp4, m4a, wav, webm

Other formats (mkv, avi, flac, ogg...) are converted to mp3 via ffmpeg first. If ffmpeg cannot process the file, an error is shown.

## Usage

### Transcribe

```
s2t transcribe
```

Processes all files in `input/`, writes transcripts to `output/`.

```
$ s2t transcribe
Transcribing 1 file(s)...
  chile_promo.mp3 - transcribing...
  ✓ output/chile_promo.txt [19dee66d]

Done.
```

Output:
```
September 11, 1973, a military coup overthrows the government in Chile, ending the longest
democratic tradition in Latin America. It was a bloody, bloody coup.
```

Transcribe a single file:

```
s2t transcribe path/to/audio.mp3
```

### Options

```
s2t transcribe --format srt
s2t transcribe --format json
s2t transcribe --language fi
s2t transcribe --translate fi
s2t transcribe --translate en
s2t transcribe --provider gemini
s2t transcribe --out my-transcript.txt
s2t transcribe --out transcripts/
```

### Translation

```
s2t transcribe --translate fi
s2t transcribe --translate en
s2t transcribe --translate sv
```

`--translate en` uses Whisper's native translation endpoint - one call, fast and cheap.

`--translate <other>` transcribes first, then translates via GPT-4o-mini.

Translation requires OpenAI provider.

**Example - English audio translated to Finnish:**

```
$ s2t transcribe --translate fi
Transcribing 1 file(s)...
  chile_promo.mp3 - transcribing...
  ✓ output/chile_promo.txt [acc2fb12]

Done.
```

Output:
```
11. syyskuuta 1973 sotilasvallankaappaus kaataa hallituksen Chilessä, mikä päättää
Latinalaisen Amerikan pisimmän demokraattisen perinteen. Se oli verinen, verinen vallankaappaus.
```

### Manage transcripts

```
s2t list
s2t show <id>
s2t export <id> --format srt
s2t delete <id>
```

### List supported languages

```
s2t languages
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
- **macOS/Linux config:** `~/.speak2text/.env`

## Supported Languages

99 languages supported. Use the code with `--language` or `--translate`.

| Code | Language | Code | Language | Code | Language |
|------|----------|------|----------|------|----------|
| af | Afrikaans | hi | Hindi | pt | Portuguese |
| am | Amharic | hr | Croatian | ro | Romanian |
| ar | Arabic | ht | Haitian Creole | ru | Russian |
| as | Assamese | hu | Hungarian | sa | Sanskrit |
| az | Azerbaijani | haw | Hawaiian | sd | Sindhi |
| ba | Bashkir | hy | Armenian | si | Sinhala |
| be | Belarusian | id | Indonesian | sk | Slovak |
| bg | Bulgarian | is | Icelandic | sl | Slovenian |
| bn | Bengali | it | Italian | sn | Shona |
| bo | Tibetan | ja | Japanese | so | Somali |
| br | Breton | jw | Javanese | sq | Albanian |
| bs | Bosnian | ka | Georgian | sr | Serbian |
| ca | Catalan | kk | Kazakh | su | Sundanese |
| cs | Czech | km | Khmer | sv | Swedish |
| cy | Welsh | kn | Kannada | sw | Swahili |
| da | Danish | ko | Korean | ta | Tamil |
| de | German | la | Latin | te | Telugu |
| el | Greek | lb | Luxembourgish | tg | Tajik |
| en | English | ln | Lingala | th | Thai |
| es | Spanish | lo | Lao | tk | Turkmen |
| et | Estonian | lt | Lithuanian | tl | Tagalog |
| eu | Basque | lv | Latvian | tr | Turkish |
| fa | Persian | mg | Malagasy | tt | Tatar |
| fi | Finnish | mi | Maori | uk | Ukrainian |
| fo | Faroese | mk | Macedonian | ur | Urdu |
| fr | French | ml | Malayalam | uz | Uzbek |
| gl | Galician | mn | Mongolian | vi | Vietnamese |
| gu | Gujarati | mr | Marathi | yi | Yiddish |
| ha | Hausa | ms | Malay | yo | Yoruba |
| he | Hebrew | mt | Maltese | yue | Cantonese |
| nn | Nynorsk | my | Myanmar | zh | Chinese |
| no | Norwegian | ne | Nepali | | |
| oc | Occitan | nl | Dutch | | |
| pa | Punjabi | ps | Pashto | | |

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript | Language |
| Commander | CLI framework |
| better-sqlite3 | Local transcript history |
| OpenAI Whisper API | Transcription |
| ffmpeg | Converts unsupported formats before transcription (optional) |
| Vitest | Testing |
| Biome | Lint & format |
| pnpm | Package manager |

## License

See MIT

# SecureDNA Screening UI

A modern, privacy-preserving web interface for SecureDNA sequence screening using WebAssembly.

## Features

- **Browser-based screening** - All screening happens in your browser using WASM
- **Privacy-first** - No plaintext DNA sequences leave your browser
- **Dual view modes**
  - Summary View: Clean, deduplicated organism display
  - Structured View: API-faithful display with duplicate detection
- **Credential storage** - Save tokens and credentials securely in browser localStorage
- **Collapsible sections** - Hit regions are foldable for better readability
- **Rich visualization** - Color-coded tags, organism types, and regulatory classifications

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **WebAssembly** for client-side screening
- **lucide-react** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Load Credentials**
   - Upload your `.st` token file
   - Upload your `.priv` keypair file
   - Enter your passphrase
   - Optionally click "Save in Browser" to persist credentials

2. **Configure Servers** (optional)
   - Keyservers (default: `1.ks.prod.securedna.org,2.ks.prod.securedna.org,3.ks.prod.securedna.org`)
   - HDB Server (default: `1.db.prod.securedna.org`)

3. **Screen a Sequence**
   - Paste or type your DNA sequence (ATCG format or FASTA)
   - Click "Screen Sequence"
   - View results in Summary or Structured mode

## View Modes

### Summary View
Shows deduplicated organisms with:
- Primary Match (most likely organism)
- Alternative Matches (other potential matches)

### Structured View
Shows all organisms exactly as returned by the API:
- Most Likely Organism
- All Organisms from API (with index numbers)
- Duplicate detection badges:
  - "📊 Also most likely" - organism appears in both sections
  - "⚠️ Has differences" - duplicate has different metadata

## Project Structure

```
securedna-screening-ui/
├── src/
│   ├── components/
│   │   └── ScreeningResults.tsx  # Results visualization
│   ├── types/
│   │   └── api.ts                 # TypeScript type definitions
│   ├── wasm/                      # WASM module files
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## WASM Module

The screening logic runs entirely in the browser using a WebAssembly module. Place your WASM files in `src/wasm/`:
- `screening_wasm.js` - JavaScript bindings
- `screening_wasm_bg.wasm` - WebAssembly binary

## Browser Storage

When "Save in Browser" is enabled, the following are stored in localStorage:
- `securedna_token` - Your screening token
- `securedna_keypair` - Your private keypair
- `securedna_passphrase` - Your passphrase
- `securedna_keyservers` - Configured keyserver domains
- `securedna_hdb` - Configured HDB server

**Note:** File inputs cannot be pre-populated for security reasons, but the data is loaded into memory and ready to use.

## License

See the main SecureDNA repository for licensing information.

## Related Projects

- [SecureDNA](https://github.com/SecureDNA) - Main SecureDNA organization

# Notion Parser

A tool for parsing Notion exports into structured JSON for vector databases.

## Features
- Parse Notion HTML exports
- Generate summaries and tags using GPT-4
- Structured JSON output
- Progress tracking and cost estimation
- Chunked processing for large exports

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```
3. Set up environment variables:
   - Create `.env` in backend directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`

## Development
- Frontend: `npm run dev`
- Backend: `npm run dev`

## Contributing
See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines. 
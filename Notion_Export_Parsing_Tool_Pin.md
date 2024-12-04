
# Project Pin: Notion Export Parsing Tool

## Project Goals
- Parse Notion exports into structured JSON for AI integrations.
- Store each process for reviewing summaries and articles in a batch.
- Enable JSON file downloads and display cost estimates for each batch in `history.vue`.

## Technical Stack
- **Backend**: Node.js, Express, TypeScript, OpenAI API
- **Frontend**: Vue 3, Vite, Tailwind CSS, TypeScript

## Key Objectives for Current Phase
1. Store batch processes, including summaries and articles.
2. Update `history.vue` to allow:
   - JSON file downloads.
   - Displaying cost estimates for each batch process.
3. Refine error handling and logging across frontend and backend.

## Development Tips
- Use TDD: Write tests for each feature before implementing.
- Log extensively: Track every stage of batch storage and retrieval.
- Commit frequently: Break tasks into small milestones.

# Project Pin: Notion Export Parsing Tool

## Project Goals
- Parse Notion exports into structured JSON for AI integrations.
- Store each process for reviewing summaries and articles in a batch.
- Enable comprehensive batch history review and management.

## Technical Stack
- **Backend**: Node.js, Express, TypeScript, OpenAI API
- **Frontend**: Vue 3, Vite, Tailwind CSS, TypeScript

## Key Objectives for Current Phase
1. ✅ Store batch processes with metadata
   - Processing time
   - Cost estimates
   - Token usage
   - Document count

2. ✅ Basic history.vue implementation
   - Display batch list
   - Show processing stats
   - Basic metadata viewing

3. 🔄 Enhance History Features
   - Add detailed batch view
     - Show full document summaries
     - Display all processed documents
     - Show tags and metadata
   - Enable JSON downloads for historical batches
   - Add batch comparison capabilities
   - Implement batch search/filter

4. Refine Error Handling
   - Improve error logging
   - Add retry mechanisms
   - Implement batch recovery

## Development Tips
- Use TDD: Write tests for each feature before implementing.
- Log extensively: Track every stage of batch storage and retrieval.
- Commit frequently: Break tasks into small milestones.
- Document all new features in both code and user documentation.

## Next Steps
1. Create detailed batch view component
2. Implement batch selection and preview
3. Add download functionality for historical batches
4. Add search and filtering capabilities

## Notes
- Keep UI consistent between active processing and history views
- Ensure all data is properly persisted
- Maintain performance with large history lists

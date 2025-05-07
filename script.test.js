import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { convertTrelloToMarkdown } from './script.js';

describe('Trello to Markdown conversion', () => {
    it('should convert Trello JSON to markdown correctly', () => {
        // Read the sample JSON file
        const sampleJson = JSON.parse(fs.readFileSync('./sample.json', 'utf8'));
        
        // Convert to markdown
        const markdown = convertTrelloToMarkdown(sampleJson);
        
        // Expected markdown structure
        const expectedMarkdown = `# Test Board

Test board description

## Table of Contents

- [To Do](#to-do)
- [Done](#done)

---

## To Do {#to-do}

### Test Card

Test card description

#### Test Checklist

- [x] Test Item 1
- [ ] Test Item 2

**Labels:** Important

**Due:** 3/20/2024

---

## Done {#done}

`;

        // Compare the generated markdown with expected markdown
        expect(markdown).toBe(expectedMarkdown);
    });

    it('should handle empty JSON gracefully', () => {
        const emptyJson = {};
        const markdown = convertTrelloToMarkdown(emptyJson);
        expect(markdown).toBe('');
    });

    it('should handle JSON with only board name', () => {
        const simpleJson = { name: 'Simple Board' };
        const markdown = convertTrelloToMarkdown(simpleJson);
        expect(markdown).toBe('# Simple Board\n\n');
    });
}); 
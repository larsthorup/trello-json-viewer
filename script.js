// Configure marked if it's available (browser environment)
if (typeof marked !== 'undefined') {
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true
    });
}

// Browser-specific code
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const jsonInput = document.getElementById('jsonInput');
        const markdownOutput = document.getElementById('markdownOutput');
        const preview = document.getElementById('preview');

        // Focus the input field
        jsonInput.focus();

        jsonInput.addEventListener('input', () => {
            try {
                const jsonData = JSON.parse(jsonInput.value);
                const markdown = convertTrelloToMarkdown(jsonData);
                markdownOutput.value = markdown;
                preview.innerHTML = marked.parse(markdown);
            } catch (error) {
                if (jsonInput.value.trim() !== '') {
                    markdownOutput.value = 'Invalid JSON';
                    preview.innerHTML = '<p style="color: red;">Invalid JSON</p>';
                } else {
                    markdownOutput.value = '';
                    preview.innerHTML = '';
                }
            }
        });
    });
}

export function convertTrelloToMarkdown(data) {
    let markdown = '';

    // Add board name
    if (data.name) {
        markdown += `# ${data.name}\n\n`;
    }

    // Add board description if exists
    if (data.desc) {
        markdown += `${data.desc}\n\n`;
    }

    // Create a map of checklists by their ID for quick lookup
    const checklistsById = {};
    if (data.checklists) {
        data.checklists.forEach(checklist => {
            checklistsById[checklist.id] = checklist;
        });
    }

    // Process lists and cards
    if (data.lists && data.cards) {
        // Sort lists by position
        const sortedLists = [...data.lists].sort((a, b) => a.pos - b.pos);
        
        // Generate table of contents
        markdown += '## Table of Contents\n\n';
        sortedLists.forEach(list => {
            if (!list.closed) {
                // Create a URL-friendly anchor from the list name
                const anchor = list.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                markdown += `- [${list.name}](#${anchor})\n`;
            }
        });
        markdown += '\n---\n\n';
        
        // Sort cards by position within each list
        const cardsByList = data.cards.reduce((acc, card) => {
            if (!acc[card.idList]) {
                acc[card.idList] = [];
            }
            acc[card.idList].push(card);
            return acc;
        }, {});

        // Generate markdown for each list and its cards
        sortedLists.forEach(list => {
            if (!list.closed) {
                // Create a URL-friendly anchor from the list name
                const anchor = list.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                markdown += `## ${list.name} {#${anchor}}\n\n`;
                
                const cards = cardsByList[list.id] || [];
                cards.sort((a, b) => a.pos - b.pos);
                
                cards.forEach(card => {
                    if (!card.closed) {
                        // Add card name
                        markdown += `### ${card.name}\n\n`;
                        
                        // Add card description
                        if (card.desc) {
                            markdown += `${card.desc}\n\n`;
                        }
                        
                        // Add checklists
                        if (data.checklists) {
                            const cardChecklists = data.checklists.filter(checklist => checklist.idCard === card.id);
                            cardChecklists.forEach(checklist => {
                                markdown += `#### ${checklist.name}\n\n`;
                                checklist.checkItems.forEach(item => {
                                    const checkbox = item.state === 'complete' ? '[x]' : '[ ]';
                                    markdown += `- ${checkbox} ${item.name}\n`;
                                });
                                markdown += '\n';
                            });
                        }
                        
                        // Add labels
                        if (card.labels && card.labels.length > 0) {
                            markdown += '**Labels:** ';
                            markdown += card.labels.map(label => label.name).join(', ');
                            markdown += '\n\n';
                        }
                        
                        // Add due date
                        if (card.due) {
                            const dueDate = new Date(card.due);
                            markdown += `**Due:** ${dueDate.toLocaleDateString()}\n\n`;
                        }
                        
                        markdown += '---\n\n';
                    }
                });
            }
        });
    }

    return markdown;
} 
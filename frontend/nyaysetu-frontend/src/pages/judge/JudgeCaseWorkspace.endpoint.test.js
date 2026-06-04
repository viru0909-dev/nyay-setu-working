import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const source = readFileSync(join(__dirname, 'JudgeCaseWorkspace.jsx'), 'utf8');

describe('JudgeCaseWorkspace API endpoints', () => {
  it('posts order notices to the versioned cases endpoint', () => {
    expect(source).toContain('/api/v1/cases/${caseId}/order-notice');
    expect(source).not.toContain('/api/cases/${caseId}/order-notice');
  });
});

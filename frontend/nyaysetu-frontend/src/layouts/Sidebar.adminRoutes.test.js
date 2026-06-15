import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const source = readFileSync(join(__dirname, 'Sidebar.jsx'), 'utf8');

describe('admin sidebar routes', () => {
  it('only links to registered admin routes', () => {
    const adminStart = source.indexOf('ADMIN: [');
    const techAdminStart = source.indexOf('TECH_ADMIN:', adminStart);
    const adminMenu = source.slice(adminStart, techAdminStart);

    expect(adminMenu).toContain("path: '/admin'");
    expect(adminMenu).not.toContain("path: '/admin/users'");
    expect(adminMenu).not.toContain("path: '/admin/cases'");
    expect(adminMenu).not.toContain("path: '/admin/judges'");
    expect(adminMenu).not.toContain("path: '/admin/reports'");
    expect(adminMenu).not.toContain("path: '/admin/settings'");
    expect(adminMenu).not.toContain("path: '/admin/profile'");
  });
});

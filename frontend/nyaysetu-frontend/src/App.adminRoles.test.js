import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const source = readFileSync(join(__dirname, 'App.jsx'), 'utf8');

describe('admin route authorization', () => {
  it('allows every role that authRedirect sends to the admin dashboard', () => {
    const routeStart = source.indexOf('path="/admin/*"');
    const routeEnd = source.indexOf('<Route index element={<AdminDashboard />} />', routeStart);
    const adminRoute = source.slice(routeStart, routeEnd);

    expect(adminRoute).toContain("'ADMIN'");
    expect(adminRoute).toContain("'TECH_ADMIN'");
    expect(adminRoute).toContain("'TECHNICAL_TEAM'");
    expect(adminRoute).toContain("'SUPER_JUDGE'");
  });
});

# Secure Payroll Management & Audit System — Local VS Code project

## Requirements
Install Node.js 20+ and VS Code.

## Setup
1. Extract this ZIP.
2. Open the extracted `secure-payroll-vscode` folder in VS Code.
3. Copy `.env.example` to `.env`.
4. Fill in your Supabase project URL, publishable key, and service-role key. Keep the service-role key private; it is server-only.
5. In Supabase Dashboard → SQL Editor, run the complete `supabase/schema.sql` file.
6. In VS Code Terminal, run:

```bash
npm install
npm run dev
```

7. Keep the terminal open and visit **http://localhost:5173**.

Sign in using an existing Supabase Auth email/password account. The local app provides an overview, employee creation, draft payroll runs, payroll status updates, and audit history.

## Troubleshooting
- If you change `.env`, stop and restart `npm run dev`.
- If a database table is missing, run `supabase/schema.sql`.
- If login fails, confirm the user exists under Supabase Authentication and use the correct password.
- API is at http://localhost:4000; frontend is at http://localhost:5173.

## Security and scope
The service-role key is never sent to the browser and must not be committed or shared. This is a local development starter, not a production-ready payroll platform. Before production, add robust server-side roles and approval controls, validated statutory tax/deduction calculations for your jurisdiction, backups, monitoring, rate limiting, and a security review. The current sample uses gross salary as net pay and does not calculate statutory deductions.

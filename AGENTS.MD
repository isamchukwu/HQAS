# AGENTS.md

## Project
HQAS - HERRYCON QUOTATION SYSTEM.

## Product rules
- Quote prefix must remain HQAS
- Currency is NGN only for Batch 1
- Pricing formula must remain:
  - line amount = quantity * unit_price
  - grand total = subtotal + tax_amount - discount_amount
- Final quotes should be treated as locked
- Do not add AI extraction yet unless explicitly asked

## Engineering rules
- Prefer minimal, safe changes
- Keep the existing Next.js + Supabase structure
- Reuse existing validation files where possible
- Keep UI mobile-friendly
- Do not remove working code unless necessary
- After every change, run lint and report issues
- Summarize changed files

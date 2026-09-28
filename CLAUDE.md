# SALES READY! — CLAUDE & AGENT GUIDELINES

Proyek: **Sales Ready! — Ngobrol Bareng Praktisi**
Teknologi: **Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Neon PostgreSQL, Drizzle ORM, Zod, Playwright**

Lihat detail lengkap di [AGENTS.md](file:///c:/Users/HP/Desktop/mjs/websales/AGENTS.md).

---

## Command Shortcuts & Workflow

```bash
# Development
npm run dev

# Type check & Lint
npm run type-check
npm run lint

# Database Migrations (Drizzle + Neon)
npx drizzle-kit generate
npx drizzle-kit migrate
npx drizzle-kit studio

# Testing (Playwright)
npx playwright test
```

---

## Ringkasan Standar Proyek (Wajib Dipatuhi)

1. **Anti-AI Slop**:
   - Dilarang memakai gradien ungu-ke-biru generik, font Inter-only, dan 3 kartu berjejer dengan icon template.
   - Gunakan pendekatan visual editorial yang hangat, terstruktur, tipografi berbobot, dan foto asli Pak Dito.
2. **Form Pendaftaran (3-Step + Confirmation)**:
   - Step 01: Data Diri (Nama, WhatsApp wajib, Domisili, Email opsional).
   - Step 02: Profil (Status peserta & Pengalaman sales).
   - Step 03: Tujuan & Pertanyaan ke Pak Dito (Maksimal 500 karakter).
   - Step 04: Konfirmasi Ringkasan Data sebelum final submit.
   - Success Page: Status "Menunggu Konfirmasi" + Tombol Chat Admin WhatsApp.
3. **Database Neon + Drizzle**:
   - Cukup 1 tabel utama: `participants`.
   - Normalisasi nomor WhatsApp ke format `628...` untuk mencegah duplikasi.
4. **Prinsip Kerja Senior Engineer**:
   - Siklus: `Planner → Builder → Tester → Reviewer → Security → UI Critic → Performance Reviewer`.
   - Wajib verifikasi dan uji kode sebelum mengklaim pekerjaan selesai.

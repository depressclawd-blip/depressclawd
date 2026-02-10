# Setup Supabase – Whitelist (step by step)

Karena gue ga bisa akses akun Supabase lu, lu yang jalanin di browser. Urutannya:

---

## Step 1: Buat project

1. Buka **[supabase.com/dashboard](https://supabase.com/dashboard)** (login kalau belum).
2. Klik **"New project"**.
3. Isi:
   - **Organization** — pilih yang ada (atau buat baru).
   - **Name** — misal: `depressclawd`.
   - **Database Password** — bikin password kuat, **simpan** (buat recovery).
   - **Region** — pilih yang paling deket (e.g. Singapore).
4. Klik **"Create new project"**, tunggu sampai status **Ready**.

---

## Step 2: Buat tabel `whitelist`

1. Di menu kiri klik **"SQL Editor"**.
2. Lu udah di halaman new query (atau klik tombol **"+ New"** di atas area editor).
3. Di area editor yang kosong (yang ada tulisan "just start typing"), **paste** script di bawah ini (semua sekaligus).
4. Klik tombol hijau **"Run"** di kanan bawah (atau Cmd+Enter).

```sql
-- Tabel whitelist: 1 wallet hanya boleh sekali (unique)
create table public.whitelist (
  id uuid default gen_random_uuid() primary key,
  wallet text not null unique,
  x_username text,
  created_at timestamptz default now()
);

-- Keamanan: aktifkan RLS
alter table public.whitelist enable row level security;

-- Siapa saja (anon) boleh INSERT — buat form Apply di website
create policy "Allow insert for anon"
  on public.whitelist for insert
  to anon with check (true);

-- Supaya bisa baca dari dashboard / nanti dari backend
create policy "Allow read for service role"
  on public.whitelist for select
  to service_role using (true);
```

5. Harus keluar **"Success"**. Kalau error (misal tabel sudah ada), baca pesannya.

---

## Step 3: Ambil URL & Anon Key

1. Di menu kiri klik **Settings** (ikon gerigi).
2. Klik **"API"**.
3. Di bagian **Project URL**:
   - Klik icon copy.
   - Nilainya kira‑kira: `https://xxxxxxxxxxxx.supabase.co`
4. Di bagian **Project API keys**:
   - Copy **"anon" "public"** (jangan yang "service_role").
   - Nilainya panjang, dimulai kira‑kira: `eyJhbGci...`

---

## Step 4: Isi `.env` di project

1. Di folder project DepressClawd, buat file **`.env`** (kalau belum ada).
2. Isi persis seperti di bawah, **ganti** dengan nilai dari Step 3:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

3. Simpan file.

---

## Step 5: Tes dari website

1. Di terminal: `npm run dev`.
2. Buka website → connect wallet → buka **Apply** → isi X Username → **SUBMIT**.
3. Harus muncul pesan hijau: **"Submitted. You're on the whitelist."**
4. Cek di Supabase: **Table Editor** → pilih tabel **`whitelist`** → harus ada 1 baris baru (wallet + x_username).

Kalau step 2–4 bener, Supabase-nya udah keatur; gue cuma ga bisa login dan klik di dashboard lu, jadi step 1–4 harus lu jalanin sendiri.

# Push ke GitHub (depressclawd-blip) — jalanin satu per satu

Remote sudah benar: `https://depressclawd-blip@github.com/depressclawd-blip/depressclawd.git`

---

## Step 1: Hapus kredensial GitHub dari cache (biar nggak pakai clobotherobo)

Jalankan di terminal, lalu **tekan Enter 2 kali** (baris kosong + Enter):

```bash
git credential-osxkeychain erase
host=github.com
protocol=https

```

(Ctrl+D atau ketik baris kosong lalu Enter untuk tutup input.)

---

## Step 2: Pastikan PAT depressclawd-blip sudah siap

- Login GitHub sebagai **depressclawd-blip**
- Buka: https://github.com/settings/tokens
- **Generate new token (classic)** → centang **repo** → Generate
- **Copy** token (hanya muncul sekali)

---

## Step 3: Push

```bash
cd /Users/Dev/DepressClawd
git push -u origin main
```

Saat diminta:
- **Username:** `depressclawd-blip` (bisa sudah keisi otomatis)
- **Password:** **paste PAT** (bukan password login GitHub)

---

## Kalau masih 403

Coba paksa pakai PAT di URL (ganti YOUR_PAT dengan token lu):

```bash
git remote set-url origin https://depressclawd-blip:YOUR_PAT@github.com/depressclawd-blip/depressclawd.git
git push -u origin main
```

**Penting:** Setelah berhasil push, hapus PAT dari URL biar nggak ke-commit:

```bash
git remote set-url origin https://depressclawd-blip@github.com/depressclawd-blip/depressclawd.git
```

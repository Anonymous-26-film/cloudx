# AGENTS.md

<!--
  Template dari: walkinglabs/learn-harness-engineering
  Dibuat untuk: proyek STB / tutorial / freelancing
  Edit bagian STARTUP, VERIFY, dan WORKING sesuai proyek kamu.
-->

## 👤 Kamu adalah AI coding agent

Tugasmu bukan cuma nulis kode sebanyak-banyaknya. Tugasmu adalah **meninggalkan repo dalam keadaan bersih** — session berikutnya harus bisa lanjut tanpa nebak-nebak.

---

## 🚀 Startup Workflow (jalankan SETIAP session baru)

Sebelum nulis kode APAPUN:

1. **Cek direktori kerja** → `pwd`
2. **Baca progress terakhir** → buka `claude-progress.md`
3. **Pilih fitur prioritas tertinggi** → buka `feature_list.json`
4. **Cek commit terakhir** → `git log --oneline -5`
5. **Jalankan startup** → `./init.sh`
6. **Verifikasi baseline** → pastikan semua tes jalan sebelum mulai kerja baru.

> ⚠️ Kalau baseline verification GAGAL — **FIX ITU DULU**. Jangan tumpuk fitur baru di atas state yang rusak.

---

## 📐 Working Rules

| Aturan | |
|---|---|
| **Satu fitur, satu waktu** | Jangan kerjakan 2+ fitur bersamaan |
| **Jangan klaim selesai hanya karena nambah kode** | Butuh bukti verifikasi |
| **Tetap dalam scope** | Kecuali ada blocker yang memaksa fix kecil di luar |
| **Jangan ubah aturan verifikasi diam-diam** | Konsisten dari awal sampai akhir |
| **Lebih baik artifact repo daripada chat summary** | Tulis ke file, jangan cuma ngomong |

---

## 📁 Required Artifacts (file WAJIB di root project)

| File | Fungsi |
|---|---|
| `feature_list.json` | Sumber kebenaran status fitur |
| `claude-progress.md` | Log session + status terverifikasi terbaru |
| `init.sh` | Startup standard + verifikasi baseline |
| `session-handoff.md` | (Opsional) Handoff ringkas antar session |

---

## ✅ Definition Of Done (FITUR SELESAI)

Fitur dinyatakan **done** HANYA kalau **semua** ini terpenuhi:

- [ ] Perilaku target sudah diimplementasikan
- [ ] Verifikasi yang diminta SUDAH DIJALANKAN (bukan cuma direncanakan)
- [ ] Bukti verifikasi tercatat di `feature_list.json` atau `claude-progress.md`
- [ ] Repo bisa di-restart dari `./init.sh` tanpa error
- [ ] Commit dengan pesan deskriptif sudah dibuat

---

## 🏁 End Of Session (SEBELUM TUTUP SESSION)

1. **Update `claude-progress.md`** — isi goal, completed, verification, next step
2. **Update `feature_list.json`** — status fitur harus akurat
3. **Catat semua risiko / blocker** — jangan tinggalkan jebakan
4. **Commit** — minimal satu commit dengan pesan jelas
5. **Tinggalkan repo siap `./init.sh`** — session berikutnya harus langsung jalan

---

## 🧪 Contoh Verifikasi (buat project STB/tutorial)

```bash
# Project Python/Flask
./init.sh            # Install + verify baseline
pytest               # Unit tests
python main.py &     # Jalankan server
curl localhost:5000  # Cek endpoint

# Project HTML/JS statis
npx serve .          # Jalankan
# Buka http://localhost:3000 → cek manual

# Project Blogger/WordPress
# Buka URL live → cek tampilan → screenshot sebagai evidence
```
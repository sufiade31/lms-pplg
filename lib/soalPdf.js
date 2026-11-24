// Membaca file PDF soal dan mengubahnya menjadi daftar soal assessment.
// Hanya untuk PDF berisi teks (bukan hasil scan/foto).
//
// Format yang dikenali:
//   1. Pertanyaan ...            (nomor diikuti titik atau kurung)
//   A. opsi   B. opsi  ...        (opsi A-D, boleh satu per baris atau berderet)
//   Kunci: B                      (opsional, di bawah soal)
//   KUNCI JAWABAN                 (opsional, bagian di akhir: 1. B  2. C  3. A ...)
// Soal tanpa opsi dianggap esai.

const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const HURUF = 'ABCDE';

const bersih = (t) => String(t).replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();

// ---------- 1. membaca teks dari PDF (per baris) ----------
function muatPdfJs() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Hanya bisa dipakai di browser.'));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (window.__pdfjsMuat) return window.__pdfjsMuat;
  window.__pdfjsMuat = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PDFJS_URL;
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(window.pdfjsLib);
    };
    s.onerror = () => {
      window.__pdfjsMuat = null;
      reject(new Error('Pembaca PDF gagal dimuat. Pastikan komputer terhubung ke internet, lalu coba lagi.'));
    };
    document.head.appendChild(s);
  });
  return window.__pdfjsMuat;
}

// pdf = dokumen PDF dari pdf.js. Hasil: teks dengan satu baris per baris di halaman.
export async function ekstrakTeksPdf(pdf) {
  const hasil = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const halaman = await pdf.getPage(n);
    const isi = await halaman.getTextContent();
    const kelompok = [];
    for (const it of isi.items) {
      if (!it.str && !it.hasEOL) continue;
      const x = it.transform[4], y = it.transform[5];
      let g = kelompok.find((k) => Math.abs(k.y - y) < 3);
      if (!g) { g = { y, bagian: [] }; kelompok.push(g); }
      g.bagian.push({ x, lebar: it.width || 0, str: it.str });
    }
    kelompok.sort((a, b) => b.y - a.y);
    for (const g of kelompok) {
      g.bagian.sort((a, b) => a.x - b.x);
      let baris = '';
      let akhir = null;
      for (const b of g.bagian) {
        if (akhir !== null && b.x - akhir > 2 && !baris.endsWith(' ') && !b.str.startsWith(' ')) baris += ' ';
        baris += b.str;
        akhir = b.x + b.lebar;
      }
      hasil.push(baris);
    }
    hasil.push('');
  }
  return hasil.join('\n');
}

// ---------- 2. mengubah teks menjadi soal ----------
export function parseSoal(teks) {
  const semua = String(teks).split(/\r?\n/).map(bersih);
  const info = { pg: 0, esai: 0, tanpaKunci: 0, opsiLebih: 0 };

  // pisahkan bagian "kunci jawaban" di akhir
  let baris = semua.filter(Boolean);
  const inlineKunci = /^(?:kunci(?:\s+jawaban)?|jawaban(?:\s+yang)?(?:\s+benar)?)\s*[:=]\s*\(?([A-Ea-e])\)?(?![A-Za-z])/i;
  let kunciTeks = '';
  const idxKunci = baris.findIndex((l) => /^(kunci\s+jawaban|kunci|jawaban)\b/i.test(l) && !inlineKunci.test(l));
  if (idxKunci > 0) {
    kunciTeks = baris.slice(idxKunci).join(' ').replace(/^(kunci\s+jawaban|kunci|jawaban)\s*[:\-]?\s*/i, '');
    baris = baris.slice(0, idxKunci);
  }
  const kunciPeta = {};
  if (kunciTeks) {
    const re = /(\d{1,3})\s*[.):\-–=]?\s*([A-Ea-e])(?![A-Za-z])/g;
    let m;
    while ((m = re.exec(kunciTeks))) kunciPeta[Number(m[1])] = HURUF.indexOf(m[2].toUpperCase());
  }

  const soalRe = /^(\d{1,3})\s*[.)]\s*(.+)$/;
  const opsiRe = /^\(?([A-Ea-e])\s*[.)]\s*(.+)$/;
  const judulBagian = /^(?:[A-Za-z][.)]\s*)?(?:pilihan\s+ganda|esai|essay|uraian|isian|petunjuk|bagian)\b/i;
  const nomorHalaman = /^(?:\d{1,3}|(?:halaman|hal\.?)\s*\d+(?:\s*(?:dari|\/)\s*\d+)?)$/i;

  const daftar = [];
  let cur = null;
  let last = 'tanya';
  let nomorTerakhir = 0;

  const tutup = () => { if (cur) { daftar.push(cur); cur = null; } };

  for (const l of baris) {
    if (nomorHalaman.test(l)) continue;
    if (judulBagian.test(l) && l.length < 70 && !(cur && cur.opsi.length === 0 && cur.tanya.length < 5)) { tutup(); continue; }

    const mk = cur && l.match(inlineKunci);
    if (mk) { cur.benar = HURUF.indexOf(mk[1].toUpperCase()); continue; }

    // opsi yang urutannya sesuai (A, lalu B, lalu C, ...)
    const mo = cur && l.match(opsiRe);
    if (mo && mo[1].toUpperCase() === HURUF[cur.opsi.length]) {
      // beberapa opsi dalam satu baris: "A. xx B. yy C. zz"
      const potong = mo[1].toUpperCase() === 'A' ? l.split(/\s+(?=[B-E]\s*[.)]\s)/) : [l];
      for (const p of potong) {
        const m2 = p.match(opsiRe);
        if (m2 && m2[1].toUpperCase() === HURUF[cur.opsi.length]) { cur.opsi.push(m2[2].trim()); last = cur.opsi.length - 1; }
        else if (cur.opsi.length) { cur.opsi[cur.opsi.length - 1] += ' ' + p; }
      }
      continue;
    }

    const ms = l.match(soalRe);
    if (ms) {
      const n = Number(ms[1]);
      if (!cur || n === nomorTerakhir + 1 || n === 1) {
        tutup();
        cur = { nomor: n, tanya: ms[2].trim(), opsi: [], benar: -1 };
        nomorTerakhir = n;
        last = 'tanya';
        continue;
      }
    }

    if (cur) {
      if (last === 'tanya') cur.tanya += ' ' + l;
      else cur.opsi[last] += ' ' + l;
    }
  }
  tutup();

  const soal = daftar.map((s, i) => {
    if (s.opsi.length >= 2) {
      let benar = s.benar >= 0 ? s.benar : (kunciPeta[s.nomor] !== undefined ? kunciPeta[s.nomor] : -1);
      if (s.opsi.length > 4) info.opsiLebih++;
      const opsi = [...s.opsi.slice(0, 4), '', '', '', ''].slice(0, 4);
      if (benar >= 4 || (benar >= 0 && !opsi[benar])) benar = -1;
      if (benar < 0) info.tanpaKunci++;
      info.pg++;
      return { tipe: 'pg', poin: 10, tanya: s.tanya.trim(), opsi, benar };
    }
    info.esai++;
    const tanya = [s.tanya, ...s.opsi].join(' ').trim();
    return { tipe: 'esai', poin: 10, tanya, opsi: ['', '', '', ''], benar: -1 };
  });
  return { soal, info };
}

// ---------- 3. dipakai dari halaman guru ----------
export async function bacaSoalDariPdf(file) {
  if (!file) throw new Error('Pilih file PDF dulu.');
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw new Error('File harus berformat PDF.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Ukuran PDF maksimal 8 MB.');
  const pdfjs = await muatPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  let pdf;
  try { pdf = await pdfjs.getDocument({ data }).promise; }
  catch { throw new Error('PDF tidak bisa dibuka. Pastikan filenya tidak rusak atau diberi kata sandi.'); }
  const teks = await ekstrakTeksPdf(pdf);
  if (teks.replace(/\s/g, '').length < 20) {
    throw new Error('PDF ini berupa gambar atau hasil scan, jadi teksnya tidak bisa dibaca otomatis. Gunakan PDF yang teksnya bisa diblok, atau ketik soal manual.');
  }
  const hasil = parseSoal(teks);
  if (hasil.soal.length === 0) {
    throw new Error('Tidak ada soal yang dikenali. Pastikan soal bernomor (1. 2. 3.) dan opsi berhuruf (A. B. C. D.).');
  }
  return hasil;
}
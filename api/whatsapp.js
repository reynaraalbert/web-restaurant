import clientPromise from './_db.js';

// ─────────────────────────────────────────
//  CONFIG — isi via Vercel Environment Variables
//  FONNTE_TOKEN    : token device dari fonnte.com
//  ANTHROPIC_KEY   : API key dari console.anthropic.com
//  WEBHOOK_SECRET  : bebas, string rahasia untuk verifikasi
// ─────────────────────────────────────────
const FONNTE_TOKEN   = process.env.FONNTE_TOKEN;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// Estimasi menit per status
const ESTIMASI = {
  menunggu:   '15–25 menit',
  diproses:   '10–15 menit',
  selesai:    '0 menit (sudah selesai!)',
  dibatalkan: '—',
};

// ─────────────────────────────────────────
//  KIRIM PESAN via Fonnte
// ─────────────────────────────────────────
async function kirimWA(target, pesan) {
  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      Authorization: FONNTE_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target, message: pesan, countryCode: '62' }),
  });
  return res.json();
}

// ─────────────────────────────────────────
//  CARI PESANAN — by nomor pesanan atau nomor HP
// ─────────────────────────────────────────
async function cariPesanan(db, query) {
  const col = db.collection('pesanan');

  // Coba match nomorPesanan (ORD-xxxxx)
  const byNomor = await col.findOne({
    nomorPesanan: { $regex: query.replace(/\s/g, ''), $options: 'i' },
  });
  if (byNomor) return byNomor;

  // Coba match nama pelanggan (pesanan terbaru)
  const byNama = await col
    .find({ namaPelanggan: { $regex: query, $options: 'i' } })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();
  if (byNama.length) return byNama[0];

  return null;
}

// ─────────────────────────────────────────
//  FORMAT PESANAN jadi teks ringkas
// ─────────────────────────────────────────
function formatPesanan(p) {
  const items = (p.items || [])
    .map(i => `  • ${i.emoji || ''} ${i.name || i.nama} x${i.jumlah || i.qty || 1}`)
    .join('\n');
  const statusLabel = {
    menunggu:   '⏳ Menunggu diproses',
    diproses:   '🔄 Sedang diproses',
    selesai:    '✅ Selesai',
    dibatalkan: '❌ Dibatalkan',
  }[p.status] || p.status;

  const tgl = p.createdAt
    ? new Date(p.createdAt).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    `🧾 *${p.nomorPesanan}*\n` +
    `📅 ${tgl}\n` +
    `👤 ${p.namaPelanggan || 'Pelanggan'}\n` +
    `🪑 Meja ${p.nomorMeja || '—'}\n\n` +
    `*Pesanan:*\n${items}\n\n` +
    `💰 Total: *Rp ${Number(p.totalHarga || 0).toLocaleString('id-ID')}*\n` +
    `📌 Status: ${statusLabel}\n` +
    `⏱ Estimasi: ${ESTIMASI[p.status] || '—'}`
  );
}

// ─────────────────────────────────────────
//  AMBIL MENU dari DB (untuk konteks AI)
// ─────────────────────────────────────────
async function getMenuRingkas(db) {
  const menus = await db.collection('menu')
    .find({ tersedia: true })
    .project({ nama: 1, harga: 1, kategori: 1, jumlahStok: 1 })
    .toArray();
  return menus
    .map(m => `${m.nama} (${m.kategori}) - Rp ${Number(m.harga).toLocaleString('id-ID')}${m.jumlahStok <= 5 && m.jumlahStok > 0 ? ' ⚠️ stok hampir habis' : ''}`)
    .join('\n');
}

// ─────────────────────────────────────────
//  DETEKSI INTENT pesan masuk (tanpa AI dulu)
// ─────────────────────────────────────────
function detectIntent(teks) {
  const t = teks.toLowerCase();
  if (/\b(ord-\d+)\b/.test(t) || /status|pesanan|cek|nomor|order/.test(t)) return 'cek_pesanan';
  if (/menu|daftar|ada apa|jual|tersedia|harga/.test(t)) return 'tanya_menu';
  if (/estimasi|kapan|selesai|lama|berapa lama|tunggu/.test(t)) return 'tanya_estimasi';
  if (/konfirmasi|terima|sudah|oke|ok|siap/.test(t)) return 'konfirmasi';
  return 'umum';
}

// ─────────────────────────────────────────
//  BALAS dengan Claude AI
// ─────────────────────────────────────────
async function balasDenganAI(db, pengirim, pesanUser, pesananContext) {
  const menuRingkas = await getMenuRingkas(db);

  const systemPrompt = `Kamu adalah asisten WhatsApp untuk Waroeng Makan Cak Lie, warung makan rumahan di Indonesia.
Tugasmu: balas pesan pelanggan dengan ramah, singkat, dan informatif. Gunakan bahasa Indonesia santai.
Selalu tambahkan emoji yang relevan. Jangan terlalu panjang — maksimal 5 kalimat.

INFO WARUNG:
- Nama: Waroeng Makan Cak Lie
- Jam buka: 07.00–21.00 setiap hari
- Pesan via website atau WA ini

ESTIMASI MASAK:
- Menunggu: 15–25 menit
- Sedang diproses: 10–15 menit lagi
- Selesai: siap diambil/diantar

MENU TERSEDIA HARI INI:
${menuRingkas}

${pesananContext ? `KONTEKS PESANAN PELANGGAN INI:\n${pesananContext}` : ''}

Kalau ditanya soal pesanan dan kamu tidak punya datanya, minta mereka kirim nomor pesanan (format ORD-xxxxx).
Jangan pernah membuat nomor pesanan palsu atau informasi yang tidak ada.`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: pesanUser }],
    }),
  });

  const data = await resp.json();
  return data?.content?.[0]?.text || 'Maaf, ada gangguan sementara. Silakan coba lagi ya! 🙏';
}

// ─────────────────────────────────────────
//  HANDLER UTAMA
// ─────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verifikasi secret (opsional tapi disarankan)
  if (WEBHOOK_SECRET && req.query.secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fonnte mengirim data via POST
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Webhook aktif ✅' });
  }

  const body = req.body;

  // Fonnte format: { device, sender, message, ... }
  const pengirim = body.sender || body.from || '';
  const pesan    = (body.message || body.text || '').trim();

  // Skip pesan kosong atau dari diri sendiri
  if (!pesan || !pengirim) return res.status(200).json({ ok: true });

  console.log(`[WA] ${pengirim}: ${pesan}`);

  try {
    const client = await clientPromise;
    const db = client.db('warung-makan');

    const intent = detectIntent(pesan);
    let balasan = '';

    // ── CEK PESANAN / STATUS ──
    if (intent === 'cek_pesanan' || intent === 'tanya_estimasi') {
      // Ekstrak nomor ORD jika ada
      const ordMatch = pesan.match(/ORD-\d+/i);
      const query    = ordMatch ? ordMatch[0] : pengirim.replace('@s.whatsapp.net', '');
      const pesanan  = await cariPesanan(db, query);

      if (pesanan) {
        const info = formatPesanan(pesanan);
        if (intent === 'tanya_estimasi') {
          balasan =
            `⏱ *Estimasi Pesanan ${pesanan.nomorPesanan}*\n\n` +
            `Status saat ini: ${pesanan.status}\n` +
            `Estimasi selesai: *${ESTIMASI[pesanan.status] || '—'}*\n\n` +
            `Terima kasih sudah menunggu ya! 🙏`;
        } else {
          balasan = `Halo! Ini info pesanan kamu:\n\n${info}`;
        }
      } else {
        balasan =
          `Halo! 👋 Maaf, pesanan tidak ditemukan.\n\n` +
          `Kirimkan nomor pesanan kamu ya (contoh: *ORD-1234567890*)\n` +
          `Bisa dilihat di struk/invoice yang diterima setelah pesan. 🧾`;
      }

    // ── KONFIRMASI PESANAN ──
    } else if (intent === 'konfirmasi') {
      const ordMatch = pesan.match(/ORD-\d+/i);
      if (ordMatch) {
        const pesanan = await cariPesanan(db, ordMatch[0]);
        if (pesanan) {
          balasan =
            `✅ Pesanan *${pesanan.nomorPesanan}* sudah kami terima!\n\n` +
            `${formatPesanan(pesanan)}\n\n` +
            `Kami akan segera memprosesnya. Estimasi: *${ESTIMASI[pesanan.status]}* 🍽️`;
        } else {
          balasan = await balasDenganAI(db, pengirim, pesan, null);
        }
      } else {
        balasan =
          `Halo! Terima kasih sudah menghubungi Waroeng Makan Cak Lie 🍛\n\n` +
          `Untuk konfirmasi pesanan, sertakan nomor pesanan kamu ya (format: *ORD-xxxxx*)`;
      }

    // ── TANYA MENU ──
    } else if (intent === 'tanya_menu') {
      balasan = await balasDenganAI(db, pengirim, pesan, null);

    // ── PESAN UMUM → AI ──
    } else {
      // Coba cari pesanan terbaru dari nomor ini sebagai konteks
      const nomorBersih = pengirim.replace('@s.whatsapp.net', '').replace('62', '0');
      const pesananTerakhir = await db.collection('pesanan')
        .find({ $or: [{ noHP: nomorBersih }, { noHP: pengirim }] })
        .sort({ createdAt: -1 }).limit(1).toArray();

      const ctx = pesananTerakhir[0] ? formatPesanan(pesananTerakhir[0]) : null;
      balasan = await balasDenganAI(db, pengirim, pesan, ctx);
    }

    // Kirim balasan
    if (balasan && FONNTE_TOKEN) {
      await kirimWA(pengirim, balasan);
    }

    return res.status(200).json({ ok: true, intent, replied: !!balasan });

  } catch (err) {
    console.error('[WA Webhook Error]', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
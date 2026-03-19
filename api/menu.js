import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

function getDefaultMenuSeed(now) {
  return [
    { nama: 'Nasi Putih', harga: 3000, kategori: 'Nasi', deskripsi: 'Nasi putih pulen, dimasak dengan air sumur alami.', emoji: '🍚', tersedia: true, jumlahStok: 50, createdAt: now, updatedAt: now },
    { nama: 'Nasi Kuning', harga: 5000, kategori: 'Nasi', deskripsi: 'Nasi kuning khas, harum kunyit & santan, gurih lezat.', emoji: '🌕', tersedia: true, jumlahStok: 50, createdAt: now, updatedAt: now },
    { nama: 'Nasi Uduk', harga: 6000, kategori: 'Nasi', deskripsi: 'Nasi uduk Betawi, dimasak dengan santan & daun pandan.', emoji: '🥣', tersedia: true, jumlahStok: 50, createdAt: now, updatedAt: now },
    { nama: 'Nasi Goreng', harga: 12000, kategori: 'Nasi', deskripsi: 'Nasi goreng bumbu merah spesial, tersedia telur & ayam.', emoji: '🍳', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Nasi Tim Ayam', harga: 14000, kategori: 'Nasi', deskripsi: 'Nasi lembut dikukus bersama ayam cincang & kaldu.', emoji: '🍲', tersedia: false, jumlahStok: 0, createdAt: now, updatedAt: now },
    { nama: 'Ayam Goreng', harga: 10000, kategori: 'Lauk-Pauk', deskripsi: 'Ayam goreng rempah, garing di luar, juicy di dalam.', emoji: '🍗', tersedia: true, jumlahStok: 40, createdAt: now, updatedAt: now },
    { nama: 'Ayam Bakar', harga: 12000, kategori: 'Lauk-Pauk', deskripsi: 'Ayam bakar bumbu kecap manis & rempah pilihan.', emoji: '🔥', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Ikan Goreng', harga: 8000, kategori: 'Lauk-Pauk', deskripsi: 'Ikan kembung segar, digoreng kering bumbu kunyit.', emoji: '🐟', tersedia: true, jumlahStok: 25, createdAt: now, updatedAt: now },
    { nama: 'Tempe Orek', harga: 5000, kategori: 'Lauk-Pauk', deskripsi: 'Tempe orek kering manis pedas, tahan hingga 2 hari.', emoji: '🟫', tersedia: true, jumlahStok: 60, createdAt: now, updatedAt: now },
    { nama: 'Tahu Goreng', harga: 3000, kategori: 'Lauk-Pauk', deskripsi: 'Tahu pong goreng, crispy luar lembut dalam.', emoji: '🟡', tersedia: true, jumlahStok: 60, createdAt: now, updatedAt: now },
    { nama: 'Telur Balado', harga: 5000, kategori: 'Lauk-Pauk', deskripsi: 'Telur rebus dimasak bumbu balado merah pedas.', emoji: '🥚', tersedia: true, jumlahStok: 40, createdAt: now, updatedAt: now },
    { nama: 'Rendang Daging', harga: 20000, kategori: 'Lauk-Pauk', deskripsi: 'Rendang sapi empuk, dimasak lama dengan santan & rempah.', emoji: '🥩', tersedia: false, jumlahStok: 0, createdAt: now, updatedAt: now },
    { nama: 'Sambal Goreng', harga: 8000, kategori: 'Lauk-Pauk', deskripsi: 'Campuran kentang, hati, & udang dalam balutan sambal.', emoji: '🌶️', tersedia: true, jumlahStok: 35, createdAt: now, updatedAt: now },
    { nama: 'Sayur Lodeh', harga: 5000, kategori: 'Sayur', deskripsi: 'Sayuran mix dimasak santan tipis, kuah gurih segar.', emoji: '🥦', tersedia: true, jumlahStok: 40, createdAt: now, updatedAt: now },
    { nama: 'Tumis Kangkung', harga: 5000, kategori: 'Sayur', deskripsi: 'Kangkung segar ditumis bawang putih & terasi pedas.', emoji: '🥬', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Capcay', harga: 7000, kategori: 'Sayur', deskripsi: 'Capcay kuah bening, penuh sayuran segar bergizi.', emoji: '🫑', tersedia: true, jumlahStok: 25, createdAt: now, updatedAt: now },
    { nama: 'Urap-Urap', harga: 6000, kategori: 'Sayur', deskripsi: 'Sayur rebus dengan parutan kelapa berbumbu kencur.', emoji: '🌿', tersedia: false, jumlahStok: 0, createdAt: now, updatedAt: now },
    { nama: 'Gudeg Jogja', harga: 8000, kategori: 'Sayur', deskripsi: 'Nangka muda dimasak santan kental, manis gurih khas Jogja.', emoji: '🫙', tersedia: true, jumlahStok: 20, createdAt: now, updatedAt: now },
    { nama: 'Paket Nasi + 1 Lauk', harga: 13000, kategori: 'Paket', deskripsi: 'Nasi putih + 1 lauk pilihan. Ekonomis untuk makan siang.', emoji: '🎁', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Paket Nasi + 2 Lauk + Sayur', harga: 22000, kategori: 'Paket', deskripsi: 'Nasi + 2 lauk + 1 sayur + es teh. Lengkap & kenyang!', emoji: '🍱', tersedia: true, jumlahStok: 20, createdAt: now, updatedAt: now },
    { nama: 'Paket Keluarga (4 Porsi)', harga: 75000, kategori: 'Paket', deskripsi: '4x nasi + 4x lauk + 2 sayur + 4 minuman. Cocok keluarga.', emoji: '👨‍👩‍👧‍👦', tersedia: true, jumlahStok: 10, createdAt: now, updatedAt: now },
    { nama: 'Paket Catering (10 Box)', harga: 170000, kategori: 'Paket', deskripsi: '10 box makan siang, nasi + 2 lauk + sayur. Min. pesan H-1.', emoji: '📦', tersedia: true, jumlahStok: 5, createdAt: now, updatedAt: now },
    { nama: 'Paket Sarapan', harga: 12000, kategori: 'Paket', deskripsi: 'Nasi uduk + lauk + teh hangat. Tersedia mulai 06.00.', emoji: '🌅', tersedia: false, jumlahStok: 0, createdAt: now, updatedAt: now },
    { nama: 'Es Teh Manis', harga: 3000, kategori: 'Minuman', deskripsi: 'Teh tubruk asli seduh, disajikan dengan es batu besar.', emoji: '🧋', tersedia: true, jumlahStok: 100, createdAt: now, updatedAt: now },
    { nama: 'Teh Hangat', harga: 2000, kategori: 'Minuman', deskripsi: 'Teh hangat manis, cocok untuk pagi & sore.', emoji: '☕', tersedia: true, jumlahStok: 100, createdAt: now, updatedAt: now },
    { nama: 'Es Jeruk', harga: 5000, kategori: 'Minuman', deskripsi: 'Jeruk peras segar, manis-segar menyegarkan.', emoji: '🍊', tersedia: true, jumlahStok: 50, createdAt: now, updatedAt: now },
    { nama: 'Es Campur', harga: 7000, kategori: 'Minuman', deskripsi: 'Minuman segar cincau, kolang-kaling & sirup rose.', emoji: '🍨', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Jus Alpukat', harga: 10000, kategori: 'Minuman', deskripsi: 'Jus alpukat kental tanpa air, full susu & madu.', emoji: '🥑', tersedia: false, jumlahStok: 0, createdAt: now, updatedAt: now },
    { nama: 'Air Putih', harga: 3000, kategori: 'Minuman', deskripsi: 'Air minum kemasan, tersedia botol 330ml & 600ml.', emoji: '💧', tersedia: true, jumlahStok: 200, createdAt: now, updatedAt: now },
    { nama: 'Gorengan Mix', harga: 5000, kategori: 'Camilan', deskripsi: 'Bakwan, risol, pisang goreng — 5 pcs per porsi, fresh!', emoji: '🧆', tersedia: true, jumlahStok: 50, createdAt: now, updatedAt: now },
    { nama: 'Tempe Mendoan', harga: 4000, kategori: 'Camilan', deskripsi: 'Tempe tipis lebar dibalut tepung tipis, renyah & gurih.', emoji: '🫓', tersedia: true, jumlahStok: 40, createdAt: now, updatedAt: now },
    { nama: 'Pisang Goreng', harga: 5000, kategori: 'Camilan', deskripsi: 'Pisang kepok goreng crispy, bisa request topping.', emoji: '🍌', tersedia: true, jumlahStok: 35, createdAt: now, updatedAt: now },
    { nama: 'Ubi Goreng', harga: 4000, kategori: 'Camilan', deskripsi: 'Ubi cilembu manis, digoreng hingga kecokelatan sempurna.', emoji: '🟠', tersedia: true, jumlahStok: 30, createdAt: now, updatedAt: now },
    { nama: 'Kerupuk', harga: 2000, kategori: 'Camilan', deskripsi: 'Kerupuk udang & kerupuk putih, gratis untuk pelanggan dine-in.', emoji: '🥨', tersedia: true, jumlahStok: 200, createdAt: now, updatedAt: now },
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = await clientPromise;
  const db = client.db('warung-makan');
  const col = db.collection('menu');

  try {
    // GET
    if (req.method === 'GET') {
      const { id, kategori } = req.query;
      if (id) {
        const item = await col.findOne({ _id: new ObjectId(id) });
        if (!item) return res.status(404).json({ error: 'Menu tidak ditemukan' });
        return res.status(200).json(item);
      }
      const totalMenu = await col.countDocuments();
      if (totalMenu === 0) {
        await col.insertMany(getDefaultMenuSeed(new Date()));
      }
      const filter = {};
      if (kategori && kategori !== 'semua') filter.kategori = kategori;
      const menus = await col.find(filter).sort({ createdAt: -1 }).toArray();
      // Cache selama 60 detik di Edge / CDN Vercel
      res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(menus);
    }

    // POST - Tambah menu
    if (req.method === 'POST') {
      const { nama, harga, kategori, deskripsi, gambar, tersedia, emoji, jumlahStok } = req.body;
      if (!nama || !harga || !kategori) {
        return res.status(400).json({ error: 'Nama, harga, dan kategori wajib diisi' });
      }
      const stokAwal = jumlahStok !== undefined ? Number(jumlahStok) : 50;
      const doc = {
        nama, harga: Number(harga), kategori,
        emoji: emoji || '',
        deskripsi: deskripsi || '',
        gambar: gambar || '',
        tersedia: tersedia !== false,
        jumlahStok: stokAwal,
        createdAt: new Date(), updatedAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return res.status(201).json({ message: 'Menu berhasil ditambahkan', _id: result.insertedId, ...doc });
    }

    // PUT - Update menu (termasuk set jumlahStok langsung)
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
      fields.updatedAt = new Date();
      if (fields.harga !== undefined) fields.harga = Number(fields.harga);
      if (fields.jumlahStok !== undefined) {
        fields.jumlahStok = Number(fields.jumlahStok);
        // Otomatis update tersedia berdasarkan stok
        if (fields.jumlahStok <= 0) fields.tersedia = false;
        else fields.tersedia = true;
      }
      const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: fields });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Menu tidak ditemukan' });
      return res.status(200).json({ message: 'Menu berhasil diupdate' });
    }

    // PATCH - Tambah stok (increment)
    if (req.method === 'PATCH') {
      const { id, tambahStok } = req.body;
      if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
      const menu = await col.findOne({ _id: new ObjectId(id) });
      if (!menu) return res.status(404).json({ error: 'Menu tidak ditemukan' });
      const stokBaru = Math.max(0, (menu.jumlahStok || 0) + Number(tambahStok || 0));
      await col.updateOne({ _id: new ObjectId(id) }, {
        $set: { jumlahStok: stokBaru, tersedia: stokBaru > 0, updatedAt: new Date() }
      });
      return res.status(200).json({ message: 'Stok berhasil diperbarui', jumlahStok: stokBaru });
    }

    // DELETE - Hapus menu
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
      const result = await col.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Menu tidak ditemukan' });
      return res.status(200).json({ message: 'Menu berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
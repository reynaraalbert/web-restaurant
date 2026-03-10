import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = await clientPromise;
  const db = client.db('warung-makan');
  const col = db.collection('pesanan');

  try {
    // GET
    if (req.method === 'GET') {
      const { id, status, meja } = req.query;
      if (id) {
        const item = await col.findOne({ _id: new ObjectId(id) });
        if (!item) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        return res.status(200).json(item);
      }
      const filter = {};
      if (status) filter.status = status;
      if (meja) filter.nomorMeja = meja;
      const data = await col.find(filter).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    // POST - Buat pesanan baru
    if (req.method === 'POST') {
      const { nomorMeja, items, namaPelanggan, catatan } = req.body;
      if (!nomorMeja || !items || items.length === 0) {
        return res.status(400).json({ error: 'Nomor meja dan items wajib diisi' });
      }
      const totalHarga = items.reduce((t, i) => t + (Number(i.harga) * Number(i.jumlah)), 0);
      const nomorPesanan = `ORD-${Date.now()}`;
      const doc = {
        nomorPesanan,
        nomorMeja: String(nomorMeja),
        namaPelanggan: namaPelanggan || 'Pelanggan',
        items,
        totalHarga,
        catatan: catatan || '',
        status: 'menunggu',
        statusPembayaran: 'belum_bayar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return res.status(201).json({ message: 'Pesanan berhasil dibuat', _id: result.insertedId, ...doc });
    }

    // PUT - Update pesanan
    if (req.method === 'PUT') {
      const { id, status, statusPembayaran, catatan, items } = req.body;
      if (!id) return res.status(400).json({ error: 'ID pesanan wajib diisi' });

      const update = { updatedAt: new Date() };
      const validStatus = ['menunggu', 'diproses', 'selesai', 'dibatalkan'];
      if (status) {
        if (!validStatus.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
        update.status = status;
      }
      if (statusPembayaran) update.statusPembayaran = statusPembayaran;
      if (catatan !== undefined) update.catatan = catatan;
      if (items && items.length > 0) {
        update.items = items;
        update.totalHarga = items.reduce((t, i) => t + (Number(i.harga) * Number(i.jumlah)), 0);
      }

      const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      return res.status(200).json({ message: 'Pesanan berhasil diupdate' });
    }

    // DELETE - Hapus pesanan
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
      const result = await col.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      return res.status(200).json({ message: 'Pesanan berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
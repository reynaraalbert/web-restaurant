import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
      const filter = {};
      if (kategori && kategori !== 'semua') filter.kategori = kategori;
      const menus = await col.find(filter).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(menus);
    }

    // POST - Tambah menu
    if (req.method === 'POST') {
      const { nama, harga, kategori, deskripsi, gambar, tersedia, emoji } = req.body;
      if (!nama || !harga || !kategori) {
        return res.status(400).json({ error: 'Nama, harga, dan kategori wajib diisi' });
      }
      const doc = {
        nama,
        harga: Number(harga),
        kategori,
        emoji: emoji || '',
        deskripsi: deskripsi || '',
        gambar: gambar || '',
        tersedia: tersedia !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return res.status(201).json({ message: 'Menu berhasil ditambahkan', _id: result.insertedId, ...doc });
    }

    // PUT - Update menu
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
      fields.updatedAt = new Date();
      if (fields.harga !== undefined) fields.harga = Number(fields.harga);
      const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: fields });
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Menu tidak ditemukan' });
      return res.status(200).json({ message: 'Menu berhasil diupdate' });
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

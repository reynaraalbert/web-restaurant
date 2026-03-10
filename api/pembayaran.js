import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = await clientPromise;
  const db = client.db('warung-makan');
  const pembayaranCol = db.collection('pembayaran');
  const pesananCol = db.collection('pesanan');

  try {
    // GET
    if (req.method === 'GET') {
      const { id, pesananId } = req.query;
      if (id) {
        const item = await pembayaranCol.findOne({ _id: new ObjectId(id) });
        return res.status(200).json(item);
      }
      if (pesananId) {
        const item = await pembayaranCol.findOne({ pesananId });
        return res.status(200).json(item || null);
      }
      const data = await pembayaranCol.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    // POST - Proses pembayaran
    if (req.method === 'POST') {
      const { pesananId, metodePembayaran, jumlahBayar } = req.body;
      if (!pesananId || !metodePembayaran || jumlahBayar === undefined) {
        return res.status(400).json({ error: 'pesananId, metodePembayaran, jumlahBayar wajib diisi' });
      }

      const pesanan = await pesananCol.findOne({ _id: new ObjectId(pesananId) });
      if (!pesanan) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      if (pesanan.statusPembayaran === 'sudah_bayar') {
        return res.status(400).json({ error: 'Pesanan sudah dibayar' });
      }

      const nomorTransaksi = `TRX-${Date.now()}`;
      const doc = {
        nomorTransaksi,
        pesananId,
        nomorPesanan: pesanan.nomorPesanan,
        nomorMeja: pesanan.nomorMeja,
        items: pesanan.items,
        totalHarga: pesanan.totalHarga,
        metodePembayaran,
        jumlahBayar: Number(jumlahBayar),
        kembalian: Number(jumlahBayar) - pesanan.totalHarga,
        status: 'berhasil',
        createdAt: new Date(),
      };

      await pembayaranCol.insertOne(doc);
      await pesananCol.updateOne(
        { _id: new ObjectId(pesananId) },
        { $set: { statusPembayaran: 'sudah_bayar', status: 'selesai', updatedAt: new Date() } }
      );

      return res.status(201).json({ message: 'Pembayaran berhasil', ...doc });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
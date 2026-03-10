import clientPromise from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('warung-makan');
    const pesananCol = db.collection('pesanan');
    const pembayaranCol = db.collection('pembayaran');

    const [pesananResult, pembayaranResult] = await Promise.all([
      pesananCol.deleteMany({}),
      pembayaranCol.deleteMany({}),
    ]);

    return res.status(200).json({
      message: 'Riwayat berhasil dikosongkan',
      deleted: {
        pesanan: pesananResult.deletedCount,
        pembayaran: pembayaranResult.deletedCount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}

import clientPromise from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' });

  try {
    const client = await clientPromise;
    const db = client.db('warung-makan');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalMenu, menuTersedia,
      totalPesanan, pesananMenunggu, pesananDiproses, pesananSelesai,
      pendapatanResult, pesananHariIni, pembayaranTerbaru
    ] = await Promise.all([
      db.collection('menu').countDocuments(),
      db.collection('menu').countDocuments({ tersedia: true }),
      db.collection('pesanan').countDocuments(),
      db.collection('pesanan').countDocuments({ status: 'menunggu' }),
      db.collection('pesanan').countDocuments({ status: 'diproses' }),
      db.collection('pesanan').countDocuments({ status: 'selesai' }),
      db.collection('pembayaran').aggregate([
        { $match: { status: 'berhasil', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$totalHarga' } } }
      ]).toArray(),
      db.collection('pesanan').find({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }).limit(10).toArray(),
      db.collection('pembayaran').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    return res.status(200).json({
      ringkasan: {
        totalMenu, menuTersedia,
        totalPesanan, pesananMenunggu, pesananDiproses, pesananSelesai,
        pendapatanHariIni: pendapatanResult[0]?.total || 0,
      },
      pesananHariIni,
      pembayaranTerbaru,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
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
    const now = new Date();

    const todayStart    = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart     = new Date(now.getFullYear(), 0, 1);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd  = new Date(todayStart);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd  = new Date(monthStart);
    const days7Ago      = new Date(todayStart); days7Ago.setDate(days7Ago.getDate() - 6);
    const months12Ago   = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const col = db.collection('pesanan');

    const omsetPipeline = (matchExtra) => [
      { $match: { status: 'selesai', ...matchExtra } },
      { $group: { _id: null, total: { $sum: '$totalHarga' }, count: { $sum: 1 } } }
    ];

    const [
      totalMenu, menuTersedia,
      totalPesanan, pesananMenunggu, pesananDiproses, pesananSelesai,
      statHariIni, statKemarin,
      statBulanIni, statBulanLalu,
      statTahunIni,
      chart7Hari, chart12Bulan,
      pesananTerbaru,
    ] = await Promise.all([
      db.collection('menu').countDocuments(),
      db.collection('menu').countDocuments({ tersedia: true }),
      col.countDocuments(),
      col.countDocuments({ status: 'menunggu' }),
      col.countDocuments({ status: 'diproses' }),
      col.countDocuments({ status: 'selesai' }),

      col.aggregate(omsetPipeline({ createdAt: { $gte: todayStart } })).toArray(),
      col.aggregate(omsetPipeline({ createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } })).toArray(),
      col.aggregate(omsetPipeline({ createdAt: { $gte: monthStart } })).toArray(),
      col.aggregate(omsetPipeline({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } })).toArray(),
      col.aggregate(omsetPipeline({ createdAt: { $gte: yearStart } })).toArray(),

      col.aggregate([
        { $match: { status: 'selesai', createdAt: { $gte: days7Ago } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Jakarta' } },
          omset: { $sum: '$totalHarga' }, pesanan: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray(),

      col.aggregate([
        { $match: { status: 'selesai', createdAt: { $gte: months12Ago } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Jakarta' } },
          omset: { $sum: '$totalHarga' }, pesanan: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray(),

      col.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    const ex  = (arr) => ({ omset: arr[0]?.total || 0, count: arr[0]?.count || 0 });
    const pct = (n, p) => p === 0 ? (n > 0 ? 100 : 0) : Math.round(((n - p) / p) * 100);

    const hariIni   = ex(statHariIni);
    const kemarin   = ex(statKemarin);
    const bulanIni  = ex(statBulanIni);
    const bulanLalu = ex(statBulanLalu);
    const tahunIni  = ex(statTahunIni);

    const chartHarian = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart); d.setDate(d.getDate() - i);
      const key   = d.toISOString().slice(0, 10);
      const found = chart7Hari.find(x => x._id === key);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      chartHarian.push({ key, label, omset: found?.omset || 0, pesanan: found?.pesanan || 0 });
    }

    const chartBulanan = [];
    for (let i = 11; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const found = chart12Bulan.find(x => x._id === key);
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      chartBulanan.push({ key, label, omset: found?.omset || 0, pesanan: found?.pesanan || 0 });
    }

    return res.status(200).json({
      ringkasan: { totalMenu, menuTersedia, totalPesanan, pesananMenunggu, pesananDiproses, pesananSelesai },
      statistik: {
        hariIni:  { ...hariIni,  trendOmset: pct(hariIni.omset,  kemarin.omset),  trendPesanan: pct(hariIni.count,  kemarin.count) },
        bulanIni: { ...bulanIni, trendOmset: pct(bulanIni.omset,  bulanLalu.omset), trendPesanan: pct(bulanIni.count,  bulanLalu.count) },
        tahunIni,
      },
      chartHarian,
      chartBulanan,
      pesananTerbaru,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
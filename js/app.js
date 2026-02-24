// ============================================
//   WARUNG MBOK SRI – JavaScript Utama
// ============================================

// ---- DATA MENU ----
const menus = [
  // NASI
  { id: 1, nama: "Nasi Kuning", emoji: "🍲", kat: "nasi", harga: 5000, desc: "Nasi kuning khas, dimasak dengan santan & kunyit, harum dan gurih.", stok: true },
  { id: 2, nama: "Nasi Biasa", emoji: "🥣", kat: "nasi", harga: 3000, desc: "Nasi putih pulen, cocok jadi teman lauk apa saja.", stok: true },
  { id: 3, nama: "Nasi Uduk", emoji: "🍚", kat: "nasi", harga: 5000, desc: "Nasi gurih santan, lengkap dengan bawang goreng & kering tempe.", stok: true },
  { id: 4, nama: "Nasi Daun Jeruk", emoji: "🌿", kat: "nasi", harga: 5000, desc: "Nasi wangi dimasak dengan daun jeruk, aroma segar khas citrus.", stok: true },

  // LAUK
  { id: 5, nama: "Ayam Bakar", emoji: "🍗", kat: "lauk", harga: 25000, desc: "Ayam kampung berbumbu kecap & rempah, dibakar sempurna.", stok: true },
  { id: 6, nama: "Tempe Goreng", emoji: "🟫", kat: "lauk", harga: 5000, desc: "Tempe tebal, garing di luar, lembut di dalam.", stok: true },
  { id: 7, nama: "Ikan Goreng", emoji: "🐟", kat: "lauk", harga: 20000, desc: "Ikan nila segar, digoreng crispy dengan bumbu kunyit.", stok: true },
  { id: 8, nama: "Telur Dadar", emoji: "🍳", kat: "lauk", harga: 8000, desc: "Telur dadar tipis renyah, favorit anak-anak.", stok: true },

  // SAYUR
  { id: 9, nama: "Sayur Lodeh", emoji: "🥬", kat: "sayur", harga: 10000, desc: "Sayuran dalam kuah santan bumbu kunyit yang lembut.", stok: true },
  { id: 10, nama: "Capcay Kuah", emoji: "🥦", kat: "sayur", harga: 15000, desc: "Aneka sayuran segar dalam kuah kaldu gurih.", stok: true },
  { id: 11, nama: "Tumis Kangkung", emoji: "🌱", kat: "sayur", harga: 12000, desc: "Kangkung segar ditumis bawang putih & cabai rawit.", stok: false },

  // MINUMAN
  { id: 12, nama: "Es Teh Manis", emoji: "🍵", kat: "minuman", harga: 5000, desc: "Teh manis segar, disajikan dingin.", stok: true },
  { id: 13, nama: "Es Jeruk", emoji: "🍊", kat: "minuman", harga: 8000, desc: "Jeruk peras segar, manis asam menyegarkan.", stok: true },
  { id: 14, nama: "Jus Alpukat", emoji: "🥑", kat: "minuman", harga: 15000, desc: "Alpukat matang diblender susu + cokelat. Creamy!", stok: true },
  { id: 15, nama: "Air Mineral", emoji: "💧", kat: "minuman", harga: 4000, desc: "Air mineral botol 600ml.", stok: true },

  // CAMILAN
  { id: 16, nama: "Mendoan", emoji: "🟡", kat: "camilan", harga: 8000, desc: "Tempe mendoan khas Banyumas, tipis & setengah matang.", stok: true },
  { id: 17, nama: "Bakwan Jagung", emoji: "🌽", kat: "camilan", harga: 6000, desc: "Goreng renyah berisi jagung manis & sayuran.", stok: true },
  { id: 18, nama: "Kerupuk", emoji: "🍘", kat: "camilan", harga: 3000, desc: "Kerupuk udang renyah, pelengkap makan.", stok: true },

  // PAKET
  { id: 19, nama: "Paket Hemat A", emoji: "🍱", kat: "paket", harga: 13000, desc: "Nasi Biasa + Ayam Bakar. Paket paling terjangkau, kenyang & nikmat!", stok: true },
  { id: 20, nama: "Paket Hemat B", emoji: "🥡", kat: "paket", harga: 15000, desc: "Nasi Kuning + Tempe Goreng + Telur Dadar. Trio favorit sehari-hari.", stok: true },
  { id: 21, nama: "Paket Komplit", emoji: "🍛", kat: "paket", harga: 20000, desc: "Nasi Uduk + Ayam Bakar + Sayur Lodeh + Es Teh Manis. Lengkap & puas!", stok: true },
  { id: 22, nama: "Paket Ikan", emoji: "🐠", kat: "paket", harga: 18000, desc: "Nasi Daun Jeruk + Ikan Goreng + Tumis Kangkung. Segar & sehat.", stok: true },
  { id: 23, nama: "Paket Keluarga", emoji: "👨‍👩‍👧", kat: "paket", harga: 45000, desc: "Nasi (4 porsi) + Ayam Bakar (2) + Ikan Goreng + Sayur Lodeh + 4 Es Teh. Untuk 4 orang!", stok: true },
];

// ---- STATE ----
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let kategoriAktif = "semua";

// ---- UTILS ----
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function simpanKeranjang() {
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
}

function tampilToast(pesan) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = pesan;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function updateBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const total = keranjang.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.background = total > 0 ? "#f9a8c9" : "rgba(255,255,255,0.3)";
}

// ---- MENU PAGE ----
function renderMenu(daftar) {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (daftar.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted); grid-column:1/-1">Menu tidak ditemukan.</p>`;
    return;
  }

  daftar.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.style.animationDelay = `${i * 0.07}s`;

    // Badge spesial untuk paket
    const paketBadge = m.kat === "paket"
      ? `<span class="badge-paket">🏷️ PAKET</span>`
      : "";

    card.innerHTML = `
      <div class="card-emoji">${m.emoji}${paketBadge}</div>
      <div class="card-body">
        <div class="card-name">${m.nama}</div>
        <div class="card-desc">${m.desc}</div>
        <div class="card-footer">
          <div class="card-price">${formatRupiah(m.harga)}</div>
          ${m.stok
        ? `<button class="btn-add" onclick="tambahKeranjang(${m.id})">+ Keranjang</button>`
        : `<span class="badge-habis">Habis</span>`}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterMenu() {
  const query = (document.getElementById("searchInput")?.value || document.getElementById("searchInputMobile")?.value || "").toLowerCase();
  const filtered = menus.filter(m => {
    const cocoKat = kategoriAktif === "semua" || m.kat === kategoriAktif;
    const cocoSearch = m.nama.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query);
    return cocoKat && cocoSearch;
  });
  renderMenu(filtered);
}

function tambahKeranjang(id) {
  const menu = menus.find(m => m.id === id);
  if (!menu) return;
  const ada = keranjang.find(k => k.id === id);
  if (ada) {
    ada.qty++;
  } else {
    keranjang.push({ id, nama: menu.nama, emoji: menu.emoji, harga: menu.harga, qty: 1 });
  }
  simpanKeranjang();
  updateBadge();
  tampilToast(`✅ ${menu.nama} ditambahkan!`);
}

// ---- CART PAGE ----
function renderKeranjang() {
  const container = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  const emptyMsg = document.getElementById("emptyMsg");
  if (!container) return;

  Array.from(container.children).forEach(el => {
    if (el.id !== "emptyMsg") el.remove();
  });

  if (keranjang.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (summary) summary.style.display = "none";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (summary) summary.style.display = "block";

  keranjang.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.style.animationDelay = `${i * 0.08}s`;
    div.innerHTML = `
      <div class="item-emoji">${item.emoji}</div>
      <div class="item-info">
        <div class="item-name">${item.nama}</div>
        <div class="item-price">${formatRupiah(item.harga)} / porsi</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="ubahQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="ubahQty(${item.id}, 1)">+</button>
      </div>
      <div style="font-weight:700; min-width:80px; text-align:right">${formatRupiah(item.harga * item.qty)}</div>
      <button class="btn-hapus" onclick="hapusItem(${item.id})" title="Hapus">🗑️</button>
    `;
    container.appendChild(div);
  });

  hitungTotal();
}

function ubahQty(id, delta) {
  const item = keranjang.find(k => k.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) keranjang = keranjang.filter(k => k.id !== id);
  simpanKeranjang();
  updateBadge();
  renderKeranjang();
}

function hapusItem(id) {
  keranjang = keranjang.filter(k => k.id !== id);
  simpanKeranjang();
  updateBadge();
  renderKeranjang();
  tampilToast("🗑️ Item dihapus dari keranjang");
}

function hitungTotal() {
  const ongkir = 5000;
  const subtotal = keranjang.reduce((s, i) => s + i.harga * i.qty, 0);
  const total = subtotal + ongkir;
  const el = id => document.getElementById(id);
  if (el("subtotal")) el("subtotal").textContent = formatRupiah(subtotal);
  if (el("ongkir")) el("ongkir").textContent = formatRupiah(ongkir);
  if (el("totalHarga")) el("totalHarga").textContent = formatRupiah(total);
}

// ---- METODE PEMBAYARAN ----
function pilihBayar(card) {
  // Hapus selected dari semua kartu
  document.querySelectorAll(".pay-card").forEach(c => c.classList.remove("selected"));
  // Tutup semua panel detail
  document.querySelectorAll(".pay-detail").forEach(d => d.classList.remove("open"));

  // Aktifkan kartu yang diklik
  card.classList.add("selected");
  const val = card.dataset.value;
  document.getElementById("metodePembayaran").value = val;

  // Buka panel detail yang sesuai
  const panel = document.getElementById("detail-" + val);
  if (panel) panel.classList.add("open");
}

function salinRek(norek) {
  navigator.clipboard.writeText(norek).then(() => {
    tampilToast("✅ Nomor rekening disalin!");
    // Highlight tombol salin
    document.querySelectorAll(".btn-copy").forEach(btn => {
      if (btn.getAttribute("onclick")?.includes(norek)) {
        btn.textContent = "✓ Disalin";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Salin";
          btn.classList.remove("copied");
        }, 2000);
      }
    });
  }).catch(() => {
    // Fallback manual copy
    tampilToast("📋 " + norek);
  });
}

// ---- PESAN VIA WHATSAPP ----
function kirimPesanan() {
  const nama = document.getElementById("namaCustomer")?.value.trim();
  const hp = document.getElementById("noHp")?.value.trim();
  const alamat = document.getElementById("alamat")?.value.trim();
  const bayar = document.getElementById("metodePembayaran")?.value;

  if (!nama || !hp || !alamat || !bayar) {
    tampilToast("⚠️ Lengkapi semua form dulu ya!");
    return;
  }
  if (keranjang.length === 0) { tampilToast("Keranjang kosong!"); return; }

  const noWarung = "6288213066069";
  const ongkir = 5000;
  const subtotal = keranjang.reduce((s, i) => s + i.harga * i.qty, 0);
  const total = subtotal + ongkir;

  let pesanWA = `🍛 PESANAN BARU – Warung Mbok Sri 🍛\n\n`;
  pesanWA += ` Nama Customer : ${nama}\n`;
  pesanWA += ` No. HP        : ${hp}\n`;
  pesanWA += ` Alamat        : ${alamat}\n`;
  pesanWA += ` Pembayaran    : ${bayar}\n\n`;
  pesanWA += ` Detail Pesanan:\n`;
  keranjang.forEach(item => {
    pesanWA += `• ${item.emoji} ${item.nama} x${item.qty} = ${formatRupiah(item.harga * item.qty)}\n`;
  });
  pesanWA += `\n💰 Subtotal : ${formatRupiah(subtotal)}`;
  pesanWA += `\n🚚 Ongkir   : ${formatRupiah(ongkir)}`;
  pesanWA += `\n✅ *TOTAL   : ${formatRupiah(total)}*`;

  window.open(`https://wa.me/${noWarung}?text=${encodeURIComponent(pesanWA)}`, "_blank");
}

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  updateBadge();

  const menuGrid = document.getElementById("menuGrid");
  if (menuGrid) {
    renderMenu(menus);

    document.querySelectorAll(".cat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        kategoriAktif = btn.dataset.cat;
        filterMenu();
      });
    });

    document.getElementById("searchInput")?.addEventListener("input", filterMenu);
  }

  const cartItems = document.getElementById("cartItems");
  if (cartItems) renderKeranjang();
});

// ---- BURGER MENU ----
function initBurger() {
  const btn = document.getElementById("burgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  const overlay = document.getElementById("mobileOverlay");
  const close = document.getElementById("drawerClose");
  const menuLink = document.getElementById("drawerMenuLink");
  if (!btn || !drawer) return;

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
    overlay.style.display = "block";
    btn.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    btn.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { overlay.style.display = "none"; }, 300);
  }

  btn.addEventListener("click", () => drawer.classList.contains("open") ? closeDrawer() : openDrawer());
  overlay.addEventListener("click", closeDrawer);
  if (close) close.addEventListener("click", closeDrawer);
  if (menuLink) menuLink.addEventListener("click", closeDrawer);

  const searchMobile = document.getElementById("searchInputMobile");
  if (searchMobile) {
    searchMobile.addEventListener("input", (e) => {
      const desktop = document.getElementById("searchInput");
      if (desktop) desktop.value = e.target.value;
      filterMenu();
    });
  }
}

// ---- CART BADGE PULSE ----
function updateBadgePulse() {
  const total = keranjang.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge").forEach(badge => {
    badge.textContent = total;
    total > 0 ? badge.classList.add("has-item") : badge.classList.remove("has-item");
  });
}

const _origUpdateBadge = updateBadge;
window.updateBadge = function () {
  _origUpdateBadge();
  const badgeMobile = document.getElementById("cartBadgeMobile");
  if (badgeMobile) badgeMobile.textContent = keranjang.reduce((s, i) => s + i.qty, 0);
  updateBadgePulse();
};

document.addEventListener("DOMContentLoaded", () => {
  initBurger();
  updateBadgePulse();
});
#!/usr/bin/env node

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
const readline = require('readline');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (p) => new Promise((res) => rl.question(p, res));

const defaultBadges = [
  { id: 'first_buyer', name: 'Pembeli Pertama', description: 'Melakukan pembelian pertama di UMKMotion', icon: '🛒', color: '#10B981', category: 'beginner', rarity: 'common', points: 100 },
  { id: 'explorer', name: 'Penjelajah UMKM', description: 'Mengunjungi 5 UMKM berbeda', icon: '🗺️', color: '#3B82F6', category: 'exploration', rarity: 'common', points: 150 },
  { id: 'big_spender', name: 'Belanja Besar', description: 'Berbelanja dengan total Rp 100.000+', icon: '💰', color: '#F59E0B', category: 'spending', rarity: 'uncommon', points: 200 },
  { id: 'shopaholic', name: 'Shopaholic', description: 'Melakukan 20 transaksi dalam sebulan', icon: '🛍️', color: '#EC4899', category: 'spending', rarity: 'rare', points: 500 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Suka berbelanja di akhir pekan', icon: '🎯', color: '#8B5CF6', category: 'timing', rarity: 'uncommon', points: 120 },
  { id: 'reviewer', name: 'Reviewer Aktif', description: 'Memberikan 10 review produk', icon: '⭐', color: '#F59E0B', category: 'engagement', rarity: 'uncommon', points: 250 },
  { id: 'collector', name: 'Kolektor Favorit', description: 'Mengumpulkan 10 produk favorit', icon: '❤️', color: '#EF4444', category: 'engagement', rarity: 'common', points: 100 },
  { id: 'sharer', name: 'Social Sharer', description: 'Membagikan 3 UMKM ke media sosial', icon: '📱', color: '#06B6D4', category: 'social', rarity: 'common', points: 75 },
  { id: 'loyal_user', name: 'User Setia', description: 'Login 7 hari berturut-turut', icon: '🏆', color: '#DC2626', category: 'loyalty', rarity: 'rare', points: 300 },
  { id: 'veteran', name: 'Veteran UMKMotion', description: 'Menggunakan platform selama 6 bulan', icon: '🎖️', color: '#7C2D12', category: 'loyalty', rarity: 'epic', points: 1000 },
  { id: 'foodie', name: 'Si Suka Jajan', description: 'Membeli 15 produk makanan/minuman', icon: '🍜', color: '#F97316', category: 'foodie', rarity: 'uncommon', points: 200 },
  { id: 'fashionista', name: 'Fashionista', description: 'Membeli 10 produk fashion', icon: '👗', color: '#EC4899', category: 'fashion', rarity: 'uncommon', points: 200 },
  { id: 'craft_lover', name: 'Pecinta Kerajinan', description: 'Membeli 8 produk kerajinan', icon: '🎨', color: '#8B5CF6', category: 'craft', rarity: 'uncommon', points: 200 },
  { id: 'promo_hunter', name: 'Si Suka Promo', description: 'Menggunakan 10 voucher promo', icon: '🎫', color: '#10B981', category: 'promo', rarity: 'rare', points: 350 },
  { id: 'early_bird', name: 'Early Bird', description: 'Berbelanja sebelum jam 9 pagi sebanyak 5 kali', icon: '🌅', color: '#F59E0B', category: 'timing', rarity: 'uncommon', points: 150 },
  { id: 'night_owl', name: 'Night Owl', description: 'Berbelanja setelah jam 9 malam sebanyak 5 kali', icon: '🦉', color: '#6366F1', category: 'timing', rarity: 'uncommon', points: 150 },
  { id: 'local_hero', name: 'Local Hero', description: 'Mendukung 25 UMKM lokal', icon: '🏠', color: '#059669', category: 'community', rarity: 'epic', points: 750 },
  { id: 'trendsetter', name: 'Trendsetter', description: 'Membeli produk trending pertama kali', icon: '🔥', color: '#DC2626', category: 'special', rarity: 'legendary', points: 1500 }
];

async function addBadge() {
  console.log('\n=== Tambah Badge Baru ===');
  const badge = {
    id: await question('ID Badge: '),
    name: await question('Nama Badge: '),
    description: await question('Deskripsi: '),
    icon: await question('Icon (emoji): '),
    color: await question('Warna (hex): '),
    category: await question('Kategori: '),
    rarity: await question('Rarity (common/uncommon/rare/epic/legendary): '),
    points: parseInt(await question('Poin yang diberikan: ')),
    isActive: true,
    createdAt: new Date()
  };
  try { await addDoc(collection(db, 'badges'), badge); console.log('✅ Badge ditambahkan!'); }
  catch (e) { console.error('❌ Error:', e); }
}

async function listBadges() {
  console.log('\n=== Daftar Badge ===');
  try {
    const snap = await getDocs(collection(db, 'badges'));
    if (snap.empty) return console.log('Tidak ada badge.');
    const categories = {};
    snap.forEach((d) => {
      const b = d.data();
      (categories[b.category] ||= []).push(b);
    });
    Object.keys(categories).forEach((cat) => {
      console.log(`\n📂 ${cat.toUpperCase()}`);
      categories[cat].forEach((b) => {
        const icon = { common:'⚪',uncommon:'🟢',rare:'🔵',epic:'🟣',legendary:'🟡' }[b.rarity] || '⚪';
        console.log(`   ${b.icon} ${b.name} ${icon}`);
        console.log(`      ${b.description}`);
        console.log(`      Poin: ${b.points} | ID: ${b.id}`);
      });
    });
  } catch (e) { console.error('❌ Error:', e); }
}

async function seedDefaultBadges() {
  console.log('\n=== Menambahkan Badge Default ===');
  try {
    for (const b of defaultBadges) {
      await addDoc(collection(db, 'badges'), { ...b, isActive: true, createdAt: new Date() });
      console.log(`✅ Badge "${b.name}" ditambahkan`);
    }
    console.log('\n🎉 Semua badge default berhasil ditambahkan!');
  } catch (e) { console.error('❌ Error:', e); }
}

async function showBadgeStats() {
  console.log('\n=== Statistik Badge ===');
  try {
    const snap = await getDocs(collection(db, 'badges'));
    if (snap.empty) return console.log('Tidak ada badge.');
    const stats = { total:0, categories:{}, rarities:{ common:0,uncommon:0,rare:0,epic:0,legendary:0 } };
    snap.forEach((d)=>{ const b=d.data(); stats.total++; stats.categories[b.category]=(stats.categories[b.category]||0)+1; if (stats.rarities[b.rarity]!=null) stats.rarities[b.rarity]++; });
    console.log(`📊 Total Badge: ${stats.total}`);
    console.log('\n📂 Per Kategori:'); Object.entries(stats.categories).forEach(([k,v])=>console.log(`   ${k}: ${v}`));
    console.log('\n⭐ Per Rarity:'); Object.entries(stats.rarities).forEach(([k,v])=> v>0 && console.log(`   ${k}: ${v}`));
  } catch (e) { console.error('❌ Error:', e); }
}

async function main() {
  console.log('🏆 UMKMotion Badge CLI');
  console.log('======================');
  while (true) {
    console.log('\nPilih aksi:');
    console.log('1. Tambah badge baru');
    console.log('2. Lihat semua badge');
    console.log('3. Statistik badge');
    console.log('4. Seed badge default');
    console.log('5. Keluar');
    const c = await question('\nPilihan Anda: ');
    switch (c) {
      case '1': await addBadge(); break;
      case '2': await listBadges(); break;
      case '3': await showBadgeStats(); break;
      case '4': await seedDefaultBadges(); break;
      case '5': console.log('👋'); rl.close(); process.exit(0);
      default: console.log('❌ Pilihan tidak valid');
    }
  }
}

main().catch(console.error);

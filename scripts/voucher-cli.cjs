#!/usr/bin/env node

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
const readline = require('readline');
const crypto = require('crypto');

// Firebase config - use env vars
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

const generateVoucherCode = (length = 8) => crypto.randomBytes(length).toString('hex').toUpperCase().substring(0, length);

const defaultVouchers = [
  {
    code: 'WELCOME10', title: 'Selamat Datang', description: 'Diskon 10% untuk pengguna baru',
    type: 'percentage', value: 10, minPurchase: 50000, maxDiscount: 25000, pointsCost: 0,
    category: 'welcome', validFrom: new Date(), validUntil: new Date(Date.now()+30*24*60*60*1000),
    usageLimit: 1000, usedCount: 0, isActive: true
  },
  {
    code: 'CASHBACK5K', title: 'Cashback Rp 5.000', description: 'Cashback Rp 5.000 untuk pembelian minimal Rp 75.000',
    type: 'cashback', value: 5000, minPurchase: 75000, maxDiscount: 5000, pointsCost: 250,
    category: 'cashback', validFrom: new Date(), validUntil: new Date(Date.now()+60*24*60*60*1000),
    usageLimit: 500, usedCount: 0, isActive: true
  }
];

async function addVoucher() {
  console.log('\n=== Tambah Voucher Baru ===');
  const voucher = {
    code: (await question('Kode Voucher (auto jika kosong): ')) || generateVoucherCode(),
    title: await question('Judul Voucher: '),
    description: await question('Deskripsi: '),
    type: await question('Tipe (percentage/fixed/cashback/free_shipping): '),
    value: parseFloat(await question('Nilai (%/nominal): ')),
    minPurchase: parseInt(await question('Minimal Pembelian (Rp): ')),
    maxDiscount: parseInt(await question('Maks Diskon (Rp): ')),
    pointsCost: parseInt(await question('Biaya Poin: ')),
    category: await question('Kategori: '),
    usageLimit: parseInt(await question('Batas Penggunaan: ')),
    isActive: true,
    usedCount: 0,
    createdAt: new Date()
  };
  voucher.validFrom = new Date();
  const validDays = parseInt(await question('Berlaku berapa hari: '));
  voucher.validUntil = new Date(Date.now() + validDays*24*60*60*1000);

  try {
    await addDoc(collection(db, 'vouchers'), voucher);
    console.log(`✅ Voucher ${voucher.code} berhasil ditambahkan!`);
  } catch (e) { console.error('❌ Error:', e); }
}

async function listVouchers() {
  console.log('\n=== Daftar Voucher ===');
  try {
    const snap = await getDocs(collection(db, 'vouchers'));
    if (snap.empty) return console.log('Tidak ada voucher.');
    snap.forEach((d) => {
      const v = d.data();
      const validUntil = v.validUntil?.toDate ? v.validUntil.toDate() : new Date(v.validUntil);
      const isExpired = validUntil < new Date();
      console.log(`\n🎫 ${v.code} - ${v.title}`);
      console.log(`   ${v.description}`);
      console.log(`   Tipe: ${v.type} | Nilai: ${v.value}`);
      console.log(`   Min: Rp ${v.minPurchase?.toLocaleString?.() || v.minPurchase}`);
      console.log(`   Poin: ${v.pointsCost} | Usage: ${v.usedCount}/${v.usageLimit}`);
      console.log(`   Berlaku s/d: ${validUntil.toLocaleDateString()} | ${isExpired?'❌ Expired':'✅ Aktif'}`);
    });
  } catch (e) { console.error('❌ Error:', e); }
}

async function generateBulkVouchers() {
  console.log('\n=== Generate Voucher Massal ===');
  const count = parseInt(await question('Jumlah voucher: '));
  const prefix = (await question('Prefix (opsional): ')) || '';
  const title = await question('Judul voucher: ');
  const description = await question('Deskripsi: ');
  const type = await question('Tipe (percentage/fixed/cashback): ');
  const value = parseFloat(await question('Nilai: '));
  const minPurchase = parseInt(await question('Minimal pembelian: '));
  const pointsCost = parseInt(await question('Biaya poin: '));
  const validDays = parseInt(await question('Berlaku hari: '));

  try {
    for (let i=0;i<count;i++) {
      const code = prefix + generateVoucherCode(6);
      const voucher = {
        code, title: `${title} #${i+1}`, description, type, value, minPurchase,
        maxDiscount: type==='percentage'? minPurchase*(value/100): value,
        pointsCost, category: 'bulk', validFrom: new Date(), validUntil: new Date(Date.now()+validDays*24*60*60*1000),
        usageLimit: 1, usedCount: 0, isActive: true, createdAt: new Date()
      };
      await addDoc(collection(db, 'vouchers'), voucher);
      console.log(`✅ Voucher ${code} dibuat`);
    }
    console.log(`\n🎉 ${count} voucher berhasil dibuat!`);
  } catch (e) { console.error('❌ Error:', e); }
}

async function seedDefaultVouchers() {
  console.log('\n=== Menambahkan Voucher Default ===');
  try {
    for (const v of defaultVouchers) {
      await addDoc(collection(db, 'vouchers'), { ...v, createdAt: new Date() });
      console.log(`✅ Voucher "${v.code}" ditambahkan`);
    }
  } catch (e) { console.error('❌ Error:', e); }
}

async function main() {
  console.log('🎫 UMKMotion Voucher CLI');
  console.log('========================');
  while (true) {
    console.log('\nPilih aksi:');
    console.log('1. Tambah voucher baru');
    console.log('2. Lihat semua voucher');
    console.log('3. Generate voucher massal');
    console.log('4. Seed voucher default');
    console.log('5. Keluar');
    const c = await question('\nPilihan Anda: ');
    switch (c) {
      case '1': await addVoucher(); break;
      case '2': await listVouchers(); break;
      case '3': await generateBulkVouchers(); break;
      case '4': await seedDefaultVouchers(); break;
      case '5': console.log('👋'); rl.close(); process.exit(0);
      default: console.log('❌ Pilihan tidak valid');
    }
  }
}

main().catch(console.error);

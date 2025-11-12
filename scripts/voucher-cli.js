#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');
const readline = require('readline');
const crypto = require('crypto');

// Firebase config - ganti dengan config Anda
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateVoucherCode(length = 8) {
  return crypto.randomBytes(length).toString('hex').toUpperCase().substring(0, length);
}

// Template voucher default
const defaultVouchers = [
  {
    code: 'WELCOME10',
    title: 'Selamat Datang',
    description: 'Diskon 10% untuk pengguna baru',
    type: 'percentage',
    value: 10,
    minPurchase: 50000,
    maxDiscount: 25000,
    pointsCost: 0,
    category: 'welcome',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
    usageLimit: 1000,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'CASHBACK5K',
    title: 'Cashback Rp 5.000',
    description: 'Cashback Rp 5.000 untuk pembelian minimal Rp 75.000',
    type: 'cashback',
    value: 5000,
    minPurchase: 75000,
    maxDiscount: 5000,
    pointsCost: 250,
    category: 'cashback',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 hari
    usageLimit: 500,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'FREESHIP',
    title: 'Gratis Ongkir',
    description: 'Gratis ongkos kirim untuk semua pembelian',
    type: 'free_shipping',
    value: 0,
    minPurchase: 25000,
    maxDiscount: 15000,
    pointsCost: 150,
    category: 'shipping',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 hari
    usageLimit: 300,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'WEEKEND25',
    title: 'Weekend Special 25%',
    description: 'Diskon 25% khusus weekend (Sabtu-Minggu)',
    type: 'percentage',
    value: 25,
    minPurchase: 100000,
    maxDiscount: 50000,
    pointsCost: 400,
    category: 'weekend',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 hari
    usageLimit: 200,
    usedCount: 0,
    isActive: true,
    weekendOnly: true
  },
  {
    code: 'LOYALTY15',
    title: 'Loyalty Member 15%',
    description: 'Diskon 15% untuk member loyal (minimal 5 transaksi)',
    type: 'percentage',
    value: 15,
    minPurchase: 60000,
    maxDiscount: 30000,
    pointsCost: 300,
    category: 'loyalty',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 hari
    usageLimit: 150,
    usedCount: 0,
    isActive: true,
    requiresLoyaltyLevel: 'silver'
  }
];

async function addVoucher() {
  console.log('\n=== Tambah Voucher Baru ===');
  
  const voucher = {
    code: await question('Kode Voucher (kosongkan untuk auto-generate): ') || generateVoucherCode(),
    title: await question('Judul Voucher: '),
    description: await question('Deskripsi: '),
    type: await question('Tipe (percentage/fixed/cashback/free_shipping): '),
    value: parseFloat(await question('Nilai (% atau nominal): ')),
    minPurchase: parseInt(await question('Minimal Pembelian (Rp): ')),
    maxDiscount: parseInt(await question('Maksimal Diskon (Rp): ')),
    pointsCost: parseInt(await question('Biaya Poin (0 jika gratis): ')),
    category: await question('Kategori: '),
    usageLimit: parseInt(await question('Batas Penggunaan: ')),
    validDays: parseInt(await question('Berlaku berapa hari: ')),
    isActive: true,
    usedCount: 0,
    createdAt: new Date()
  };

  // Set tanggal berlaku
  voucher.validFrom = new Date();
  voucher.validUntil = new Date(Date.now() + voucher.validDays * 24 * 60 * 60 * 1000);
  delete voucher.validDays;

  try {
    await addDoc(collection(db, 'vouchers'), voucher);
    console.log(`✅ Voucher ${voucher.code} berhasil ditambahkan!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function listVouchers() {
  console.log('\n=== Daftar Voucher ===');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'vouchers'));
    
    if (querySnapshot.empty) {
      console.log('Tidak ada voucher ditemukan.');
      return;
    }

    querySnapshot.forEach((doc) => {
      const voucher = doc.data();
      const validUntil = voucher.validUntil.toDate();
      const isExpired = validUntil < new Date();
      
      console.log(`\n🎫 ${voucher.code} - ${voucher.title}`);
      console.log(`   Deskripsi: ${voucher.description}`);
      console.log(`   Tipe: ${voucher.type} | Nilai: ${voucher.value}`);
      console.log(`   Min. Pembelian: Rp ${voucher.minPurchase.toLocaleString()}`);
      console.log(`   Biaya Poin: ${voucher.pointsCost}`);
      console.log(`   Penggunaan: ${voucher.usedCount}/${voucher.usageLimit}`);
      console.log(`   Berlaku sampai: ${validUntil.toLocaleDateString()}`);
      console.log(`   Status: ${voucher.isActive && !isExpired ? '✅ Aktif' : '❌ Nonaktif/Expired'}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function generateBulkVouchers() {
  console.log('\n=== Generate Voucher Massal ===');
  
  const count = parseInt(await question('Jumlah voucher: '));
  const prefix = await question('Prefix kode (opsional): ') || '';
  const title = await question('Judul voucher: ');
  const description = await question('Deskripsi: ');
  const type = await question('Tipe (percentage/fixed/cashback): ');
  const value = parseFloat(await question('Nilai: '));
  const minPurchase = parseInt(await question('Minimal pembelian: '));
  const pointsCost = parseInt(await question('Biaya poin: '));
  const validDays = parseInt(await question('Berlaku berapa hari: '));

  try {
    for (let i = 0; i < count; i++) {
      const code = prefix + generateVoucherCode(6);
      
      const voucher = {
        code,
        title: `${title} #${i + 1}`,
        description,
        type,
        value,
        minPurchase,
        maxDiscount: type === 'percentage' ? minPurchase * (value / 100) : value,
        pointsCost,
        category: 'bulk',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
        usageLimit: 1,
        usedCount: 0,
        isActive: true,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'vouchers'), voucher);
      console.log(`✅ Voucher ${code} dibuat`);
    }
    
    console.log(`\n🎉 ${count} voucher berhasil dibuat!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function seedDefaultVouchers() {
  console.log('\n=== Menambahkan Voucher Default ===');
  
  try {
    for (const voucher of defaultVouchers) {
      await addDoc(collection(db, 'vouchers'), {
        ...voucher,
        createdAt: new Date()
      });
      console.log(`✅ Voucher "${voucher.code}" ditambahkan`);
    }
    console.log('\n🎉 Semua voucher default berhasil ditambahkan!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🎫 UMKMotion Voucher CLI');
  console.log('=========================');
  
  while (true) {
    console.log('\nPilih aksi:');
    console.log('1. Tambah voucher baru');
    console.log('2. Lihat semua voucher');
    console.log('3. Generate voucher massal');
    console.log('4. Seed voucher default');
    console.log('5. Keluar');
    
    const choice = await question('\nPilihan Anda: ');
    
    switch (choice) {
      case '1':
        await addVoucher();
        break;
      case '2':
        await listVouchers();
        break;
      case '3':
        await generateBulkVouchers();
        break;
      case '4':
        await seedDefaultVouchers();
        break;
      case '5':
        console.log('👋 Sampai jumpa!');
        rl.close();
        process.exit(0);
      default:
        console.log('❌ Pilihan tidak valid');
    }
  }
}

main().catch(console.error);

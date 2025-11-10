#!/usr/bin/env node

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');
const readline = require('readline');

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

// Template misi default
const defaultMissions = [
  {
    id: 'first_purchase',
    title: 'Pembelian Pertama',
    description: 'Lakukan pembelian pertama di platform UMKMotion',
    type: 'purchase',
    target: 1,
    points: 100,
    badge: 'first_buyer',
    category: 'beginner',
    isActive: true,
    difficulty: 'easy'
  },
  {
    id: 'visit_5_umkm',
    title: 'Penjelajah UMKM',
    description: 'Kunjungi 5 UMKM berbeda dalam seminggu',
    type: 'visit',
    target: 5,
    points: 150,
    badge: 'explorer',
    category: 'exploration',
    isActive: true,
    difficulty: 'medium'
  },
  {
    id: 'spend_100k',
    title: 'Belanja Besar',
    description: 'Belanja dengan total minimal Rp 100.000',
    type: 'spending',
    target: 100000,
    points: 200,
    badge: 'big_spender',
    category: 'spending',
    isActive: true,
    difficulty: 'medium'
  },
  {
    id: 'review_10_products',
    title: 'Reviewer Aktif',
    description: 'Berikan review untuk 10 produk berbeda',
    type: 'review',
    target: 10,
    points: 250,
    badge: 'reviewer',
    category: 'engagement',
    isActive: true,
    difficulty: 'hard'
  },
  {
    id: 'daily_login_7',
    title: 'Loyal User',
    description: 'Login setiap hari selama 7 hari berturut-turut',
    type: 'login',
    target: 7,
    points: 300,
    badge: 'loyal_user',
    category: 'loyalty',
    isActive: true,
    difficulty: 'hard'
  },
  {
    id: 'share_3_umkm',
    title: 'Social Sharer',
    description: 'Bagikan 3 UMKM ke media sosial',
    type: 'share',
    target: 3,
    points: 75,
    badge: 'sharer',
    category: 'social',
    isActive: true,
    difficulty: 'easy'
  },
  {
    id: 'favorite_10_products',
    title: 'Kolektor Favorit',
    description: 'Tambahkan 10 produk ke daftar favorit',
    type: 'favorite',
    target: 10,
    points: 100,
    badge: 'collector',
    category: 'engagement',
    isActive: true,
    difficulty: 'medium'
  },
  {
    id: 'weekend_shopper',
    title: 'Weekend Shopper',
    description: 'Belanja di akhir pekan (Sabtu/Minggu) sebanyak 3 kali',
    type: 'weekend_purchase',
    target: 3,
    points: 120,
    badge: 'weekend_warrior',
    category: 'timing',
    isActive: true,
    difficulty: 'medium'
  }
];

async function addMission() {
  console.log('\n=== Tambah Misi Baru ===');
  
  const mission = {
    id: await question('ID Misi: '),
    title: await question('Judul Misi: '),
    description: await question('Deskripsi: '),
    type: await question('Tipe (purchase/visit/spending/review/login/share/favorite): '),
    target: parseInt(await question('Target (angka): ')),
    points: parseInt(await question('Poin Reward: ')),
    badge: await question('Badge ID: '),
    category: await question('Kategori: '),
    difficulty: await question('Kesulitan (easy/medium/hard): '),
    isActive: true,
    createdAt: new Date()
  };

  try {
    await addDoc(collection(db, 'missions'), mission);
    console.log('✅ Misi berhasil ditambahkan!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function listMissions() {
  console.log('\n=== Daftar Misi ===');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'missions'));
    
    if (querySnapshot.empty) {
      console.log('Tidak ada misi ditemukan.');
      return;
    }

    querySnapshot.forEach((doc) => {
      const mission = doc.data();
      console.log(`\n📋 ${mission.title}`);
      console.log(`   ID: ${mission.id}`);
      console.log(`   Deskripsi: ${mission.description}`);
      console.log(`   Target: ${mission.target} | Poin: ${mission.points}`);
      console.log(`   Badge: ${mission.badge} | Kategori: ${mission.category}`);
      console.log(`   Status: ${mission.isActive ? '✅ Aktif' : '❌ Nonaktif'}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function seedDefaultMissions() {
  console.log('\n=== Menambahkan Misi Default ===');
  
  try {
    for (const mission of defaultMissions) {
      await addDoc(collection(db, 'missions'), {
        ...mission,
        createdAt: new Date()
      });
      console.log(`✅ Misi "${mission.title}" ditambahkan`);
    }
    console.log('\n🎉 Semua misi default berhasil ditambahkan!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🎮 UMKMotion Mission CLI');
  console.log('========================');
  
  while (true) {
    console.log('\nPilih aksi:');
    console.log('1. Tambah misi baru');
    console.log('2. Lihat semua misi');
    console.log('3. Seed misi default');
    console.log('4. Keluar');
    
    const choice = await question('\nPilihan Anda: ');
    
    switch (choice) {
      case '1':
        await addMission();
        break;
      case '2':
        await listMissions();
        break;
      case '3':
        await seedDefaultMissions();
        break;
      case '4':
        console.log('👋 Sampai jumpa!');
        rl.close();
        process.exit(0);
      default:
        console.log('❌ Pilihan tidak valid');
    }
  }
}

main().catch(console.error);

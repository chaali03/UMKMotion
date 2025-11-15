import React, { useState } from 'react';
import { 
  User, 
  History, 
  DollarSign, 
  Store, 
  Settings, 
  LogOut,
  Edit2,
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  MessageCircle,
  Calendar,
  Clock,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  sold: number;
  status: 'active' | 'inactive';
}

interface ConsultHistory {
  id: number;
  consultantName: string;
  consultantImage: string;
  specialty: string;
  date: string;
  duration: string;
  topics: string[];
  status: 'completed' | 'scheduled';
  rating?: number;
}

const UMKMProfilePage: React.FC = () => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [activeMenu, setActiveMenu] = useState('profile');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '0812-3456-7890',
    location: 'Jakarta Selatan, DKI Jakarta',
    businessName: 'Warung Nasi Budi',
    bio: 'Pemilik Warung Nasi Budi yang telah berdiri sejak 2018. Menyediakan berbagai menu masakan tradisional Indonesia dengan cita rasa autentik. Kami berkomitmen memberikan pelayanan terbaik dan makanan berkualitas untuk pelanggan kami.',
    joinDate: 'Januari 2023',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop'
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Nasi Goreng Special',
      price: 25000,
      stock: 50,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop',
      sold: 234,
      status: 'active'
    },
    {
      id: 2,
      name: 'Ayam Bakar Madu',
      price: 35000,
      stock: 30,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=300&fit=crop',
      sold: 189,
      status: 'active'
    },
    {
      id: 3,
      name: 'Es Teh Manis',
      price: 5000,
      stock: 100,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop',
      sold: 456,
      status: 'active'
    },
    {
      id: 4,
      name: 'Sate Ayam (10 tusuk)',
      price: 30000,
      stock: 0,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=300&h=300&fit=crop',
      sold: 167,
      status: 'inactive'
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Makanan',
    image: ''
  });

  const consultHistory: ConsultHistory[] = [
    {
      id: 1,
      consultantName: 'Dr. Budi Santoso',
      consultantImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
      specialty: 'Manajemen Keuangan UMKM',
      date: '15 Nov 2024',
      duration: '45 menit',
      topics: ['Pembukuan', 'Cash Flow', 'Laporan Keuangan'],
      status: 'completed',
      rating: 5
    },
    {
      id: 2,
      consultantName: 'Siti Nurhaliza',
      consultantImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
      specialty: 'Digital Marketing & Branding',
      date: '10 Nov 2024',
      duration: '60 menit',
      topics: ['Social Media', 'Content Strategy', 'Instagram Marketing'],
      status: 'completed',
      rating: 5
    },
    {
      id: 3,
      consultantName: 'Ahmad Wijaya',
      consultantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      specialty: 'Strategi Bisnis & Ekspansi',
      date: '20 Nov 2024',
      duration: '30 menit',
      topics: ['Business Plan', 'Market Analysis'],
      status: 'scheduled'
    },
    {
      id: 4,
      consultantName: 'Dewi Lestari',
      consultantImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      specialty: 'Legalitas & Perizinan UMKM',
      date: '5 Nov 2024',
      duration: '40 menit',
      topics: ['NIB', 'Izin Usaha', 'PIRT'],
      status: 'completed',
      rating: 4
    }
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const product: Product = {
      id: products.length + 1,
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
      sold: 0,
      status: 'active'
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', stock: '', category: 'Makanan', image: '' });
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleUpdateStock = (id: number, change: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p
    ));
  };

  const profileCompletion = [
    { label: 'Setup akun', percentage: 10, completed: true },
    { label: 'Upload foto profil', percentage: 10, completed: true },
    { label: 'Informasi pribadi', percentage: 15, completed: true },
    { label: 'Lokasi usaha', percentage: 15, completed: true },
    { label: 'Deskripsi bisnis', percentage: 20, completed: false },
    { label: 'Informasi toko', percentage: 30, completed: false }
  ];

  const totalCompletion = profileCompletion
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.percentage, 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (totalCompletion / 100) * circumference;

  // Render Profile Content
  const renderProfileContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Photo Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img 
                src={profileData.profileImage} 
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full border-3 border-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-gray-900 mb-1">Upload foto baru</div>
              <div className="text-sm text-gray-500 leading-relaxed">
                Minimal 800×800 px disarankan.<br/>
                Format JPG atau PNG diperbolehkan
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
            <button 
              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
              className="flex items-center gap-2 text-orange-500 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>

          {isEditingPersonal ? (
            <>
              <div className="grid grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Nomor Telepon</label>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-600 font-medium mb-2">Lokasi</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditingPersonal(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                >
                  <X size={16} />
                  Batal
                </button>
                <button 
                  onClick={() => setIsEditingPersonal(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition"
                >
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Lengkap</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Email</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nomor Telepon</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Lokasi</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Usaha</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.businessName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Bergabung Sejak</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.joinDate}</div>
              </div>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Deskripsi Bisnis</h3>
            <button 
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-2 text-orange-500 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>

          {isEditingBio ? (
            <>
              <textarea 
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[120px] resize-y"
                placeholder="Ceritakan tentang bisnis Anda..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsEditingBio(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                >
                  <X size={16} />
                  Batal
                </button>
                <button 
                  onClick={() => setIsEditingBio(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition"
                >
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-700 leading-relaxed text-sm">
              {profileData.bio}
            </p>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Completion Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Kelengkapan Profil</h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-orange-500">
                {totalCompletion}%
              </div>
            </div>
          </div>

          <div className="space-y-0">
            {profileCompletion.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {item.completed && '✓'}
                  </div>
                  <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  item.completed ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {item.completed ? `✓ ${item.percentage}%` : `+${item.percentage}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Statistik Toko</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-500 mb-1">24</div>
              <div className="text-sm text-gray-600">Produk Aktif</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-500 mb-1">156</div>
              <div className="text-sm text-gray-600">Total Penjualan</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-500 mb-1">4.8</div>
              <div className="text-sm text-gray-600">Rating Toko</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-500 mb-1">89</div>
              <div className="text-sm text-gray-600">Ulasan Positif</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Store Content
  const renderStoreContent = () => (
    <div className="space-y-6">
      {/* Store Header Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="text-orange-500" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{products.length}</div>
          <div className="text-sm text-gray-600">Total Produk</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{products.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Produk Aktif</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{products.reduce((sum, p) => sum + p.sold, 0)}</div>
          <div className="text-sm text-gray-600">Total Terjual</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
              products.reduce((sum, p) => sum + (p.price * p.sold), 0)
            )}
          </div>
          <div className="text-sm text-gray-600">Total Pendapatan</div>
        </div>
      </div>

      {/* Products Management */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Kelola Produk</h3>
              <p className="text-sm text-gray-600 mt-1">Tambah, edit, atau hapus produk Anda</p>
            </div>
            <button 
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              <Plus size={20} />
              Tambah Produk
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddProduct && (
          <div className="p-6 bg-orange-50 border-b border-orange-100">
            <h4 className="font-bold text-gray-900 mb-4">Tambah Produk Baru</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Contoh: Nasi Goreng"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>Makanan</option>
                  <option>Minuman</option>
                  <option>Snack</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="25000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  placeholder="50"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddProduct}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Simpan Produk
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="p-6">
          <div className="grid gap-4">
            {products.filter(p => 
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((product) => (
              <div key={product.id} className="flex items-center gap-6 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">
                        {product.category}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-orange-500 text-lg">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span>Stok: <strong className={product.stock === 0 ? 'text-red-500' : 'text-gray-900'}>{product.stock}</strong></span>
                    <span>Terjual: <strong className="text-gray-900">{product.sold}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateStock(product.id, -1)}
                        disabled={product.stock === 0}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{product.stock}</span>
                      <button
                        onClick={() => handleUpdateStock(product.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 transition"
                      >
                        +
                      </button>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      <Edit size={16} />
                      Edit
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      <Eye size={16} />
                      Lihat
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium ml-auto"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render History Content
  const renderHistoryContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Riwayat Konsultasi</h3>
          <p className="text-sm text-gray-600 mt-1">Lihat semua riwayat konsultasi dengan konsultan kami</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {consultHistory.map((consult) => (
              <div key={consult.id} className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition">
                <div className="flex gap-4">
                  <img 
                    src={consult.consultantImage} 
                    alt={consult.consultantName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{consult.consultantName}</h4>
                        <p className="text-sm text-orange-500 font-semibold">{consult.specialty}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        consult.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {consult.status === 'completed' ? 'Selesai' : 'Dijadwalkan'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        {consult.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {consult.duration}
                      </span>
                      {consult.rating && (
                        <span className="flex items-center gap-1.5 text-yellow-500 font-semibold">
                          ⭐ {consult.rating}.0
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {consult.topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold">
                        <MessageCircle size={16} />
                        Lihat Detail
                      </button>
                      {consult.status === 'completed' && !consult.rating && (
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                          ⭐ Beri Rating
                        </button>
                      )}
                      {consult.status === 'scheduled' && (
                        <button className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-semibold">
                          <Calendar size={16} />
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {consultHistory.length}
              </div>
              <div className="text-sm text-gray-600">Total Konsultasi</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {consultHistory.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {consultHistory.filter(c => c.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Dijadwalkan</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {(consultHistory.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / consultHistory.filter(c => c.rating).length || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Rating Rata-rata</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg flex flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Store size={24} className="text-white" />
          </div>
          <div className="text-2xl font-bold">
            UMKM<span className="text-orange-500">otion</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-3 px-3">Menu Utama</div>
          
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'profile'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User size={20} />
            Profil
          </button>

          <button
            onClick={() => setActiveMenu('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'history'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={20} />
            Riwayat
          </button>

          <button
            onClick={() => setActiveMenu('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'pricing'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign size={20} />
            Pricing
          </button>

          <button
            onClick={() => setActiveMenu('store')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'store'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store size={20} />
            Toko Anda
          </button>

          <button
            onClick={() => setActiveMenu('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'settings'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            Pengaturan
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {activeMenu === 'profile' && 'Edit Profil'}
            {activeMenu === 'history' && 'Riwayat Konsultasi'}
            {activeMenu === 'pricing' && 'Paket Pricing'}
            {activeMenu === 'store' && 'Toko Anda'}
            {activeMenu === 'settings' && 'Pengaturan'}
          </h1>
        </div>

        {activeMenu === 'profile' && renderProfileContent()}
        {activeMenu === 'store' && renderStoreContent()}
        {activeMenu === 'history' && renderHistoryContent()}
        {activeMenu === 'pricing' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pricing Coming Soon</h3>
            <p className="text-gray-600">Halaman pricing akan segera hadir</p>
          </div>
        )}
        {activeMenu === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Settings size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pengaturan Coming Soon</h3>
            <p className="text-gray-600">Halaman pengaturan akan segera hadir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UMKMProfilePage;
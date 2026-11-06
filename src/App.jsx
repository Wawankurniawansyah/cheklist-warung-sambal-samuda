import React, { useState, useEffect } from 'react';

// =========================================================================
// KONFIGURASI FIREBASE CLOUD DATABASE (Warung Sambal Samuda)
// =========================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCeAfwtro-qbH_ZcnMraFOXeu1kysm-Rm8",
  authDomain: "cheklist-warung-samuda.firebaseapp.com",
  projectId: "cheklist-warung-sambal-samuda",
  storageBucket: "cheklist-warung-sambal-samuda.firebasestorage.app",
  messagingSenderId: "190654796294",
  appId: "1:190654796294:web:c6e7c2999b8a2eb668e987",
  measurementId: "G-ECHVHC57L4"
};

const FALLBACK_STORAGE_KEY = 'wss_firebase_cloud_reports_v14';
const ATTENDANCE_KEY = 'wss_attendance_synced_v14';
const QUESTIONS_STORAGE_KEY = 'wss_custom_questions_v14';
const CATEGORIES_STORAGE_KEY = 'wss_custom_categories_v14';

// Daftar Kategori / Area Default per Form
const DEFAULT_FORM_CATEGORIES = {
  opening_lobi: ['Lobi', 'Bar', 'Parkir', 'Taman', 'Toilet', 'Musholah'],
  closing_lobi: ['Lobi', 'Bar', 'Parkir', 'Taman', 'Toilet', 'Musholah'],
  opening_kitchen: ['General', 'Kebersihan', 'Peralatan', 'Suhu', 'Bahan Baku', 'Preparation', 'Operasional'],
  closing_kitchen: ['Operasional', 'Bahan Baku', 'Preparation', 'Waste', 'Kebersihan', 'Peralatan', 'Stok', 'Keamanan']
};

// Pertanyaan SOP Resmi Berdasarkan Dokumen Warung Sambal Samuda
const DEFAULT_SOP_QUESTIONS = {
  opening_lobi: [
    { id: 'ol_1', text: 'Lantai bersih, kering, dan tidak licin', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_2', text: 'Meja & kursi bersih, tertata rapi', category: 'Lobi', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_3', text: 'Kaca dan pintu masuk bersih, bebas noda/sidik jari', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_4', text: 'Pencahayaan/lampu berfungsi normal', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_5', text: 'AC/kipas angin berfungsi normal', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_6', text: 'Sound system/musik berfungsi (jika digunakan)', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_7', text: 'Meja reception/kasir bersih dan siap operasional', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_8', text: 'Tidak ada sampah atau barang tertinggal', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_9', text: 'Dekorasi & signage rapi, tidak rusak', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_10', text: 'Meja bar & counter bersih dan sudah disanitasi', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_11', text: 'Peralatan bar (shaker, gelas, alat seduh, dll) bersih & siap pakai', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_12', text: 'Stok minuman & bahan dicek, FIFO/FEFO diterapkan', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_13', text: 'Es batu tersedia dan dalam kondisi bersih', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_14', text: 'Sink bar bersih, air mengalir lancar', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_15', text: 'Chiller/kulkas bar berfungsi normal, suhu sesuai standar', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_16', text: 'Label bahan (tanggal buka/EXP) lengkap dan terbaca', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_17', text: 'Alat pembayaran/POS berfungsi normal', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_18', text: 'Area parkir bersih dari sampah dan kotoran', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_19', text: 'Marka/rambu parkir terlihat jelas', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_20', text: 'Penerangan area parkir berfungsi normal', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_21', text: 'Akses jalan masuk/keluar tidak terhalang', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_22', text: 'CCTV area parkir berfungsi (jika tersedia)', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_23', text: 'Petugas/security parkir siap bertugas', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_24', text: 'Taman bersih dari sampah, putung rokok dan daun kering berlebih', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_25', text: 'Tanaman terawat, tidak layu atau rusak', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_26', text: 'Jalur pejalan kaki bersih dan tidak licin', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_27', text: 'Lampu taman sudah dimatikan', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_28', text: 'Area kolam bersih dari sampah dan kotoran', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_29', text: 'Taman disiram', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_30', text: 'Lantai toilet bersih, kering, dan tidak licin', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_31', text: 'Kloset & wastafel bersih dan sudah disanitasi', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_32', text: 'Sabun cuci tangan dan tisu tersedia', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_33', text: 'Tempat sampah tersedia dan tidak penuh', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_34', text: 'Cermin bersih, bebas noda', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_35', text: 'Air mengalir lancar, tidak ada kebocoran', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_36', text: 'Pengharum ruangan/exhaust fan berfungsi normal', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_37', text: 'Pintu & kunci toilet berfungsi normal', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_38', text: 'Lantai musholah bersih, kering, dan tidak licin', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_39', text: 'Karpet/sajadah bersih dan tertata rapi', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_40', text: 'Mukena & sarung bersih dan tersedia', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_41', text: "Al-Qur'an dan perlengkapan ibadah tertata rapi", category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_42', text: 'Tempat wudhu bersih, air mengalir lancar', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_43', text: 'Sandal/rak sandal tertata rapi', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_44', text: 'Pencahayaan musholah berfungsi normal', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  closing_lobi: [
    { id: 'cl_1', text: 'Lantai disapu dan dipel', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_2', text: 'Meja & kursi dirapikan dan dibersihkan', category: 'Lobi', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_3', text: 'Sampah dibuang, tempat sampah dikosongkan', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_4', text: 'Kaca dan pintu masuk dibersihkan dari noda', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_5', text: 'Lampu dimatikan sesuai jadwal (kecuali lampu keamanan)', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_6', text: 'AC/kipas angin dimatikan', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_7', text: 'Meja kasir/reception ditutup rapi, uang/kas diamankan', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_8', text: 'Laci kasir dipastikan terkunci', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_9', text: 'Tidak ada barang berharga tertinggal di area lobi', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_10', text: 'Peralatan bar dicuci bersih dan disimpan pada tempatnya', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_11', text: 'Sisa bahan/minuman disimpan sesuai standar & diberi label', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_12', text: 'Counter & meja bar dibersihkan dan disanitasi', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_13', text: 'Sampah dibuang, tempat sampah dikosongkan', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_14', text: 'Chiller bar berfungsi dan tetap menyala', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_15', text: 'Kran air bar dipastikan tertutup', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_16', text: 'Kasir/POS bar di-closing, uang/kas diamankan', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_17', text: 'Peralatan listrik bar yang tidak diperlukan dimatikan', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_18', text: 'Area parkir dipastikan kosong dari kendaraan tertinggal', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_19', text: 'Sampah di area parkir dibersihkan', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_20', text: 'Palang/portal parkir dirantai dan dikunci', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_21', text: 'Lampu parkir diatur sesuai kebutuhan keamanan malam', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_22', text: 'Tidak ada barang mencurigakan/tertinggal di area parkir', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_23', text: 'CCTV dipastikan tetap menyala & merekam', category: 'Parkir', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_24', text: 'Taman dibersihkan dari sampah pengunjung', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_25', text: 'Lampu taman diatur sesuai kebutuhan keamanan malam', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_26', text: 'Gazebo / Tempat istirahat karyawan dirapikan kembali', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_27', text: 'Tidak ada barang tertinggal milik pengunjung', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_28', text: 'Keran/selang air taman dipastikan tertutup rapat', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_29', text: 'Pastikan tidak ada api/rokok menyala tertinggal di taman', category: 'Taman', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_30', text: 'Toilet dibersihkan dan disanitasi ulang', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_31', text: 'Sampah dibuang, tempat sampah dikosongkan', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_32', text: 'Persediaan sabun & tisu dicek untuk kebutuhan besok', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_33', text: 'Lampu toilet dimatikan (kecuali diperlukan untuk keamanan)', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_34', text: 'Kran air dipastikan tertutup rapat, tidak ada kebocoran', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_35', text: 'Kaca dan wastafel toilet bersih dan bebas dari noda', category: 'Toilet', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_36', text: 'Lantai musholah disapu dan dipel', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_37', text: 'Karpet/sajadah dirapikan kembali', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_38', text: 'Mukena & sarung dirapikan dan disimpan', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_39', text: 'Sampah dibuang, tempat sampah dikosongkan', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_40', text: 'Tempat wudhu dibersihkan, kran air dipastikan tertutup', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_41', text: 'Sandal/rak sandal dirapikan', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_42', text: 'Lampu musholah dimatikan (kecuali diperlukan untuk keamanan)', category: 'Musholah', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  opening_kitchen: [
    { id: 'ok_1', text: 'Team lengkap, briefing selesai, uniform & hygiene sesuai standar', category: 'General', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_2', text: 'Area kitchen (lantai, meja kerja, sink, tempat sampah, saluran air) bersih', category: 'Kebersihan', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_3', text: 'Tidak ada tanda-tanda hama', category: 'Kebersihan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_4', text: 'Kompor, gas, rice cooker/warmer berfungsi normal & tidak bocor', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_5', text: 'Chiller & freezer berfungsi normal', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_6', text: 'Pisau, cutting board, container, alat preparation siap pakai', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_7', text: 'Suhu chiller sesuai standar (lihat Form Suhu Chiller & Freezer)', category: 'Suhu', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_8', text: 'Suhu freezer sesuai standar (lihat Form Suhu Chiller & Freezer)', category: 'Suhu', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_9', text: 'Bahan baku tersedia, kondisi fisik/aroma/warna baik, EXP terkontrol', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_10', text: 'FIFO/FEFO diterapkan; bahan tidak layak dipisahkan & dicatat sebagai waste', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_11', text: 'Preparation sesuai marketlist, forecast, resep & gramasi', category: 'Preparation', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_12', text: 'Label preparation lengkap (nama, tanggal/jam, EXP/holding time)', category: 'Preparation', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_13', text: 'Jumlah nasi sesuai buffer (weekday/weekend), batch tercatat', category: 'Preparation', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_14', text: 'Station siap untuk operasional', category: 'Operasional', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  closing_kitchen: [
    { id: 'ck_1', text: 'Seluruh pesanan berjalan sudah selesai, tidak ada pekerjaan tertinggal', category: 'Operasional', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_2', text: 'Bahan sisa dicek, dipisahkan (layak/tidak layak), FIFO/FEFO diterapkan', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_3', text: 'Bahan yang dibuka diberi label & disimpan sesuai Dry Storage/Chiller/Freezer', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_4', text: 'Container tertutup rapat; tidak ada bahan rusak/basi/expired disimpan', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_5', text: 'Sisa nasi putih & nasi uduk dihitung dan dicatat', category: 'Preparation', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_6', text: 'Waste (bahan & nasi) dicatat lengkap di Form Pencatatan Waste', category: 'Waste', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_7', text: 'Area kerja, kompor, rice cooker/warmer, sink, alat, lantai dibersihkan', category: 'Kebersihan', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_8', text: 'Tempat sampah dikosongkan; peralatan kering & tersimpan pada tempatnya', category: 'Kebersihan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_9', text: 'Pintu chiller/freezer tertutup rapat; suhu closing dicatat', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_10', text: 'Bahan tersusun rapi, tidak diletakkan langsung di lantai', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_11', text: 'Stok kritis / hampir habis / slow moving dicek & dilaporkan ke Store Manager (PIC)', category: 'Stok', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_12', text: 'Kompor & gas mati/tertutup; listrik tidak perlu dimatikan; air ditutup', category: 'Keamanan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_13', text: 'Chiller & freezer tetap menyala; pintu storage tertutup', category: 'Keamanan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_14', text: 'Tidak ada sumber panas/api tertinggal, tidak ada kebocoran air/gas', category: 'Keamanan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_15', text: 'Kitchen siap ditinggalkan', category: 'Operasional', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [currentMasterPin, setCurrentMasterPin] = useState(() => {
    return localStorage.getItem('wss_admin_pin') || '1234';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [changePinForm, setChangePinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  
  const [showQuestionEditorModal, setShowQuestionEditorModal] = useState(false);
  const [editingCategoryTab, setEditingCategoryTab] = useState('opening_lobi');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ text: '', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true });
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SOP_QUESTIONS;
  });

  const [formCategories, setFormCategories] = useState(() => {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_FORM_CATEGORIES;
  });
  
  const [headers, setHeaders] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    diisiOleh: '',
    diperiksaOleh: ''
  });

  const [attendance, setAttendance] = useState({
    hadirCount: 0,
    sakitList: [''],
    izinList: [''],
    alphaList: [''],
    isSubmitted: false
  });

  const [checklistData, setChecklistData] = useState({});
  const [historyReports, setHistoryReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(String(msg));
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const savedReports = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (savedReports) {
      try { setHistoryReports(JSON.parse(savedReports)); } catch (e) {}
    }

    const savedPin = localStorage.getItem('wss_admin_pin');
    if (savedPin) setCurrentMasterPin(savedPin);

    const savedAttendance = localStorage.getItem(ATTENDANCE_KEY);
    if (savedAttendance) {
      try { setAttendance(JSON.parse(savedAttendance)); } catch (e) {}
    }

    const savedQuestions = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (savedQuestions) {
      try { setQuestions(JSON.parse(savedQuestions)); } catch (e) {}
    }

    const savedCats = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (savedCats) {
      try { setFormCategories(JSON.parse(savedCats)); } catch (e) {}
    }
  }, []);

  const persistReportsToCloud = (newReports) => {
    setHistoryReports(newReports);
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(newReports));
  };

  const handleVerifyAdminPin = () => {
    if (adminPinInput === currentMasterPin) {
      setIsAdminLoggedIn(true);
      setShowPinModal(false);
      setAdminPinInput('');
      showToast("Mode Admin berhasil diaktifkan!");
    } else {
      alert("PIN Admin Salah!");
    }
  };

  const handleChangeAdminPin = () => {
    if (changePinForm.oldPin !== currentMasterPin) {
      alert("PIN Lama tidak sesuai!");
      return;
    }
    if (!changePinForm.newPin || changePinForm.newPin.length < 4) {
      alert("PIN Baru minimal 4 karakter!");
      return;
    }
    if (changePinForm.newPin !== changePinForm.confirmPin) {
      alert("Konfirmasi PIN Baru tidak cocok!");
      return;
    }

    setCurrentMasterPin(changePinForm.newPin);
    localStorage.setItem('wss_admin_pin', changePinForm.newPin);
    setShowChangePinModal(false);
    setChangePinForm({ oldPin: '', newPin: '', confirmPin: '' });
    showToast("PIN Admin berhasil diperbarui!");
  };

  const handleAddNewCategory = () => {
    const catName = newCategoryInput.trim();
    if (!catName) {
      alert("Nama area/kategori tidak boleh kosong!");
      return;
    }
    const currentCats = formCategories[editingCategoryTab] || [];
    if (currentCats.includes(catName)) {
      alert("Kategori tersebut sudah ada dalam daftar!");
      return;
    }

    const updatedCats = {
      ...formCategories,
      [editingCategoryTab]: [...currentCats, catName]
    };
    setFormCategories(updatedCats);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCats));
    setNewCategoryInput('');
    setQuestionForm(prev => ({ ...prev, category: catName }));
    showToast(`Area "${catName}" berhasil ditambahkan!`);
  };

  const handleSaveQuestionItem = () => {
    if (!questionForm.text.trim()) {
      alert("Teks pertanyaan tidak boleh kosong!");
      return;
    }

    const currentCatList = [...(questions[editingCategoryTab] || [])];

    if (editingQuestionId) {
      const updatedList = currentCatList.map(q => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            text: questionForm.text,
            category: questionForm.category,
            requirePhoto: questionForm.requirePhoto,
            requireNoteOnNotOk: questionForm.requireNoteOnNotOk
          };
        }
        return q;
      });
      const updatedAll = { ...questions, [editingCategoryTab]: updatedList };
      setQuestions(updatedAll);
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedAll));
      showToast("Pertanyaan berhasil diperbarui!");
    } else {
      const newId = `q_${Date.now()}`;
      const newItem = {
        id: newId,
        text: questionForm.text,
        category: questionForm.category,
        requirePhoto: questionForm.requirePhoto,
        requireNoteOnNotOk: questionForm.requireNoteOnNotOk,
        isActive: true
      };
      const updatedList = [...currentCatList, newItem];
      const updatedAll = { ...questions, [editingCategoryTab]: updatedList };
      setQuestions(updatedAll);
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedAll));
      showToast("Pertanyaan baru berhasil ditambahkan!");
    }

    const availableCats = formCategories[editingCategoryTab] || ['General'];
    setQuestionForm({ text: '', category: availableCats[0], requirePhoto: false, requireNoteOnNotOk: true });
    setEditingQuestionId(null);
  };

  const handleStartEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      text: q.text,
      category: q.category || (formCategories[editingCategoryTab]?.[0] || 'General'),
      requirePhoto: !!q.requirePhoto,
      requireNoteOnNotOk: q.requireNoteOnNotOk !== false
    });
  };

  const handleDeleteQuestion = (qId) => {
    if (!window.confirm("Hapus permanen pertanyaan SOP ini?")) return;
    const updatedList = (questions[editingCategoryTab] || []).filter(q => q.id !== qId);
    const updatedAll = { ...questions, [editingCategoryTab]: updatedList };
    setQuestions(updatedAll);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedAll));
    showToast("Pertanyaan berhasil dihapus.");
  };

  const handleMoveQuestion = (index, direction) => {
    const list = [...(questions[editingCategoryTab] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updatedAll = { ...questions, [editingCategoryTab]: list };
    setQuestions(updatedAll);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedAll));
  };

  const handleAddNameRow = (type) => {
    setAttendance(prev => ({
      ...prev,
      [`${type}List`]: [...prev[`${type}List`], '']
    }));
  };

  const handleNameChange = (type, index, value) => {
    const list = [...attendance[`${type}List`]];
    list[index] = value;
    setAttendance(prev => ({
      ...prev,
      [`${type}List`]: list
    }));
  };

  const handleRemoveNameRow = (type, index) => {
    const list = attendance[`${type}List`].filter((_, i) => i !== index);
    setAttendance(prev => ({
      ...prev,
      [`${type}List`]: list.length > 0 ? list : ['']
    }));
  };

  const handleSaveAttendance = () => {
    const updated = { ...attendance, isSubmitted: true };
    setAttendance(updated);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
    showToast("Daftar Kehadiran Berhasil Disimpan!");
  };

  const handleResetAttendance = () => {
    if (window.confirm("Buka kembali form daftar kehadiran untuk diedit?")) {
      const updated = { ...attendance, isSubmitted: false };
      setAttendance(updated);
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
      showToast("Daftar kehadiran dapat diedit kembali.");
    }
  };

  const handleStatusChange = (formId, itemId, status) => {
    const isFOH = formId.includes('lobi');
    if (isFOH && !attendance.isSubmitted) {
      alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
      return;
    }

    const currentForm = { ...(checklistData[formId] || {}) };
    currentForm[itemId] = {
      ...(currentForm[itemId] || {}),
      status: status
    };

    setChecklistData({ ...checklistData, [formId]: currentForm });
  };

  const handleItemNoteChange = (formId, itemId, note) => {
    setChecklistData({
      ...checklistData,
      [formId]: {
        ...(checklistData[formId] || {}),
        [itemId]: {
          ...(checklistData[formId]?.[itemId] || {}),
          note: note
        }
      }
    });
  };

  const handlePhotoUpload = (formId, itemId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        setChecklistData(prev => ({
          ...prev,
          [formId]: {
            ...(prev[formId] || {}),
            [itemId]: {
              ...(prev[formId]?.[itemId] || {}),
              photo: compressedBase64
            }
          }
        }));
        showToast("Foto bukti berhasil diamankan!");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReport = async (formId, title, docNo) => {
    const allQuestions = questions[formId] || [];
    const currentQuestions = allQuestions.filter(q => q.isActive !== false);
    const currentAnswers = checklistData[formId] || {};

    for (let q of currentQuestions) {
      const ans = currentAnswers[q.id] || {};
      if (q.requirePhoto && !ans.photo) {
        alert(`PENGINGAT: Item "${q.text}" wajib menyertakan foto bukti kamera!`);
        return;
      }
      if (q.requireNoteOnNotOk !== false && ans.status === 'NOT_OK' && (!ans.note || !String(ans.note).trim())) {
        alert(`PENGINGAT: Item "${q.text}" berstatus Tidak OK, wajib mengisi Catatan dan Tindak Lanjut!`);
        return;
      }
    }

    if (!headers.diisiOleh.trim()) {
      alert("Harap isi nama petugas pada form identitas terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    const itemsSummary = currentQuestions.map(q => ({
      id: String(q.id || ''),
      text: String(q.text || ''),
      category: String(q.category || ''),
      status: String(currentAnswers[q.id]?.status || 'OK'),
      note: String(currentAnswers[q.id]?.note || ''),
      photo: currentAnswers[q.id]?.photo || null
    }));

    const reportId = `WSS_FIREBASE_REP_${Date.now()}`;
    const newReport = {
      id: reportId,
      form_id: formId,
      form_title: title,
      document_no: docNo,
      timestamp: new Date().toLocaleString('id-ID'),
      timestamp_raw: Date.now(),
      headers: { ...headers },
      attendance: formId.includes('lobi') ? { ...attendance } : null,
      items: itemsSummary
    };

    try {
      const updatedReports = [newReport, ...historyReports];
      persistReportsToCloud(updatedReports);
      setChecklistData(prev => ({ ...prev, [formId]: {} }));
      showToast("Laporan Berhasil Disimpan ke Firebase Database!");
      setActiveTab('home');
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Gagal menyimpan ke database Firebase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = (reportId) => {
    if (!isAdminLoggedIn) {
      alert("Hanya Admin yang berhak menghapus riwayat laporan!");
      return;
    }
    if (window.confirm("Hapus permanen laporan dan foto bukti ini dari database Firebase?")) {
      const updated = historyReports.filter(r => r.id !== reportId);
      persistReportsToCloud(updated);
      showToast("Laporan berhasil dihapus.");
    }
  };

  const getFormStats = (formId) => {
    const allQuestions = questions[formId] || [];
    const currentQuestions = allQuestions.filter(q => q.isActive !== false);
    const currentAnswers = checklistData[formId] || {};
    let ok = 0, notOk = 0;

    currentQuestions.forEach(q => {
      const st = currentAnswers[q.id]?.status;
      if (st === 'OK') ok++;
      else if (st === 'NOT_OK') notOk++;
    });

    const total = currentQuestions.length;
    const filled = ok + notOk;
    const progress = total > 0 ? Math.round((filled / total) * 100) : 0;

    return { total, ok, notOk, filled, progress };
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const isFormSubmittedToday = (formId) => {
    return historyReports.some(rep => rep.form_id === formId && rep.headers?.tanggal === todayDateStr);
  };

  const todayReports = historyReports.filter(rep => rep.headers?.tanggal === todayDateStr);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef2f2', fontFamily: 'Arial, sans-serif', paddingBottom: '50px' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, backgroundColor: '#7f1d1d', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '12px 18px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* HEADER UTAMA SESUAI GAMBAR LOGO & TULISAN PEDASNYA DASSS!!!!! */}
      <header style={{ backgroundColor: '#7f1d1d', color: '#fff', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #991b1b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="https://raw.githubusercontent.com/username/repo/main/images/image_d8fbb9.png" 
              alt="Logo Sambal Samuda" 
              style={{ height: '45px', objectFit: 'contain' }} 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WARUNG SAMBAL SAMUDA</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#fca5a5', fontWeight: 700, letterSpacing: '0.5px' }}>PEDASNYA DASSS!!!!!</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdminLoggedIn && (
              <button
                onClick={() => setShowQuestionEditorModal(true)}
                style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#fef08a', color: '#7f1d1d', border: 'none', cursor: 'pointer' }}
              >
                ⚙️ Kelola Pertanyaan
              </button>
            )}

            <button
              onClick={() => setActiveTab('history')}
              style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: activeTab === 'history' ? '#fef08a' : '#991b1b', color: activeTab === 'history' ? '#7f1d1d' : '#fca5a5', border: 'none', cursor: 'pointer' }}
            >
              📁 Riwayat Arsip
            </button>

            {isAdminLoggedIn ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setShowChangePinModal(true)}
                  style={{ fontSize: '12px', padding: '7px 10px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#fef08a', color: '#7f1d1d', border: 'none', cursor: 'pointer' }}
                >
                  Ubah PIN
                </button>
                <button
                  onClick={() => { setIsAdminLoggedIn(false); showToast("Keluar Mode Admin"); }}
                  style={{ fontSize: '12px', padding: '7px 10px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#450a0a', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#991b1b', color: '#fca5a5', border: '1px solid #b91c1c', cursor: 'pointer' }}
              >
                🔒 Admin Mode
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SUB HEADER */}
      {activeTab !== 'home' && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #fecaca', position: 'sticky', top: '65px', zIndex: 30 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveTab('home')}
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f1d1d', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Kembali ke Beranda Utama
            </button>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#7f1d1d', textTransform: 'uppercase' }}>
              {activeTab === 'history' && 'Arsip Laporan & Foto Firebase'}
              {activeTab === 'opening_lobi' && 'FOH — Opening Lobi, Bar & Area Umum'}
              {activeTab === 'closing_lobi' && 'FOH — Closing Lobi, Bar & Area Umum'}
              {activeTab === 'opening_kitchen' && 'BOH — Opening Kitchen'}
              {activeTab === 'closing_kitchen' && 'BOH — Closing Kitchen'}
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1100px', margin: '24px auto', padding: '0 20px' }}>

        {/* ==================== BERANDA UTAMA ==================== */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* HERO BANNER MENARIK */}
            <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', borderRadius: '24px', padding: '28px 32px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(127,29,29,0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '120px', opacity: '0.08', pointerEvents: 'none' }}>🌶️</div>
              <div style={{ maxWidth: '700px', position: 'relative', zIndex: 10 }}>
                <span style={{ fontSize: '11px', fontWeight: 900, backgroundColor: '#fef08a', color: '#7f1d1d', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Sistem Operasional Harian
                </span>
                <h2 style={{ margin: '12px 0 8px 0', fontSize: '24px', fontWeight: 900, color: '#fff' }}>Dashboard Checklist FOH & BOH</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5', lineHeight: '1.5' }}>
                  Lakukan absensi staf terlebih dahulu, lalu pilih unit form opening atau closing yang ingin diperiksa. Data otomatis tersimpan ke Cloud Database Firebase.
                </p>
              </div>
            </div>

            {/* BOX 1: ABSENSI KARYAWAN (TAMPIL DINAMIS SESUAI STATUS SIMPAN) */}
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(127,29,29,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fef2f2', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#7f1d1d', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>👥</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#7f1d1d' }}>Daftar Kehadiran Seluruh Karyawan</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#991b1b' }}>Wajib diinput dan disimpan sebelum mengisi checklist FOH</p>
                  </div>
                </div>
                {attendance.isSubmitted ? (
                  <span style={{ padding: '6px 14px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 900, borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✨ Absensi Tersimpan
                  </span>
                ) : (
                  <span style={{ padding: '6px 14px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: 900, borderRadius: '999px' }}>
                    ⚠️ Belum Disimpan
                  </span>
                )}
              </div>

              {attendance.isSubmitted ? (
                /* KARTU RINGKASAN EKSKLUSIF SETELAH KLIK SIMPAN (FORM INPUT DI-HIDE) */
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🎉</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#065f46' }}>Absensi Hari Ini Telah Dikunci & Tersimpan</span>
                    </div>
                    <button
                      onClick={handleResetAttendance}
                      style={{ fontSize: '12px', fontWeight: 900, backgroundColor: '#fff', color: '#047857', border: '1px solid #34d399', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                      ✏️ Edit Data Kehadiran
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#047857', display: 'block', fontWeight: 'bold' }}>Total Hadir</span>
                      <strong style={{ fontSize: '16px', color: '#065f46' }}>{attendance.hadirCount} Orang</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', fontWeight: 'bold' }}>Sakit</span>
                      <span style={{ fontSize: '12px', color: '#450a0a', fontWeight: 'bold' }}>{attendance.sakitList.filter(Boolean).length > 0 ? attendance.sakitList.filter(Boolean).join(', ') : 'Tidak ada'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#d97706', display: 'block', fontWeight: 'bold' }}>Izin</span>
                      <span style={{ fontSize: '12px', color: '#450a0a', fontWeight: 'bold' }}>{attendance.izinList.filter(Boolean).length > 0 ? attendance.izinList.filter(Boolean).join(', ') : 'Tidak ada'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#7f1d1d', display: 'block', fontWeight: 'bold' }}>Alpha</span>
                      <span style={{ fontSize: '12px', color: '#450a0a', fontWeight: 'bold' }}>{attendance.alphaList.filter(Boolean).length > 0 ? attendance.alphaList.filter(Boolean).join(', ') : 'Tidak ada'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* FORM INPUT UTAMA (MUNCUL KETIKA BELUM DISIMPAN ATAU SAAT DI-EDIT) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#7f1d1d', marginBottom: '8px' }}>
                      Jumlah Karyawan Hadir Hari Ini *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={attendance.hadirCount}
                      onChange={(e) => setAttendance({ ...attendance, hadirCount: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', maxWidth: '220px', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                      placeholder="Contoh: 8"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* SAKIT */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#dc2626' }}>Karyawan Sakit</span>
                        <button type="button" onClick={() => handleAddNameRow('sakit')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                      </div>
                      {attendance.sakitList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange('sakit', idx, e.target.value)}
                            placeholder={`Nama sakit #${idx + 1}`}
                            style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.sakitList.length > 1 && (
                            <button type="button" onClick={() => handleRemoveNameRow('sakit', idx)} style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* IZIN */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#d97706' }}>Karyawan Izin</span>
                        <button type="button" onClick={() => handleAddNameRow('izin')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#d97706', border: '1px solid #fcd34d', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                      </div>
                      {attendance.izinList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange('izin', idx, e.target.value)}
                            placeholder={`Nama izin #${idx + 1}`}
                            style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.izinList.length > 1 && (
                            <button type="button" onClick={() => handleRemoveNameRow('izin', idx)} style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* ALPHA */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#7f1d1d' }}>Tanpa Keterangan (Alpha)</span>
                        <button type="button" onClick={() => handleAddNameRow('alpha')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#7f1d1d', border: '1px solid #fca5a5', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                      </div>
                      {attendance.alphaList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange('alpha', idx, e.target.value)}
                            placeholder={`Nama alpha #${idx + 1}`}
                            style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.alphaList.length > 1 && (
                            <button type="button" onClick={() => handleRemoveNameRow('alpha', idx)} style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    >
                      💾 Simpan Kehadiran
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* GRID FOH & BOH */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* FOH */}
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(127,29,29,0.04)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fef2f2', paddingBottom: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#7f1d1d', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>🏢</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#7f1d1d' }}>FOH (Front of House)</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#991b1b' }}>Lobi, Bar, Parkir, Taman, Toilet & Musholah</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Opening Lobi */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>SOP-LOBI-001</span>
                          {isFormSubmittedToday('opening_lobi') && (
                            <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '999px' }}>✓ Sudah Diinput Hari Ini</span>
                          )}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#450a0a' }}>Opening Lobi, Bar & Area Umum</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('opening_lobi');
                        }}
                        style={{ backgroundColor: attendance.isSubmitted ? '#7f1d1d' : '#cbd5e1', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, cursor: attendance.isSubmitted ? 'pointer' : 'not-allowed', boxShadow: attendance.isSubmitted ? '0 2px 4px rgba(127,29,29,0.2)' : 'none' }}
                      >
                        {attendance.isSubmitted ? 'Buka →' : 'Terkunci'}
                      </button>
                    </div>

                    {/* Closing Lobi */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>SOP-LOBI-002</span>
                          {isFormSubmittedToday('closing_lobi') && (
                            <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '999px' }}>✓ Sudah Diinput Hari Ini</span>
                          )}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#450a0a' }}>Closing Lobi, Bar & Area Umum</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('closing_lobi');
                        }}
                        style={{ backgroundColor: attendance.isSubmitted ? '#7f1d1d' : '#cbd5e1', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, cursor: attendance.isSubmitted ? 'pointer' : 'not-allowed', boxShadow: attendance.isSubmitted ? '0 2px 4px rgba(127,29,29,0.2)' : 'none' }}
                      >
                        {attendance.isSubmitted ? 'Buka →' : 'Terkunci'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOH */}
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(127,29,29,0.04)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fef2f2', paddingBottom: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#7f1d1d', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>🍳</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#7f1d1d' }}>BOH (Back of House)</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#991b1b' }}>Area Kitchen, Preparation & Storage</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Opening Kitchen */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>SOP-KTN-001</span>
                          {isFormSubmittedToday('opening_kitchen') && (
                            <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '999px' }}>✓ Sudah Diinput Hari Ini</span>
                          )}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#450a0a' }}>Opening Kitchen</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('opening_kitchen')}
                        style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 4px rgba(127,29,29,0.2)' }}
                      >
                        Buka →
                      </button>
                    </div>

                    {/* Closing Kitchen */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>SOP-KTN-002</span>
                          {isFormSubmittedToday('closing_kitchen') && (
                            <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '999px' }}>✓ Sudah Diinput Hari Ini</span>
                          )}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#450a0a' }}>Closing Kitchen</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('closing_kitchen')}
                        style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 4px rgba(127,29,29,0.2)' }}
                      >
                        Buka →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT LAPORAN HARI INI DI BAGIAN BAWAH BERANDA */}
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(127,29,29,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fef2f2', paddingBottom: '14px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#7f1d1d' }}>📋 Ringkasan Hasil Input Hari Ini ({todayDateStr})</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#7f1d1d', fontSize: '12px', fontWeight: 900, padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Lihat Semua Arsip →
                </button>
              </div>

              {todayReports.length === 0 ? (
                <div style={{ backgroundColor: '#fef2f2', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px dashed #fca5a5' }}>
                  <p style={{ margin: 0, color: '#991b1b', fontSize: '12px', fontWeight: 'bold' }}>Belum ada laporan checklist yang diinput untuk hari ini.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todayReports.map(rep => (
                    <div key={rep.id} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>{rep.document_no}</span>
                          <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold' }}>{rep.timestamp}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#450a0a' }}>{rep.form_title}</h4>
                        <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#7f1d1d' }}>Petugas: <strong>{rep.headers?.diisiOleh}</strong></p>
                      </div>
                      <button
                        onClick={() => setSelectedReport(rep)}
                        style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        Detail & Foto
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== FORM CHECKLIST AKTIF ==================== */}
        {activeTab !== 'home' && activeTab !== 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #fecaca' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#7f1d1d', textTransform: 'uppercase' }}>
                {activeTab === 'opening_lobi' && 'CHECKLIST OPENING — LOBI, BAR & AREA UMUM'}
                {activeTab === 'closing_lobi' && 'CHECKLIST CLOSING — LOBI, BAR & AREA UMUM'}
                {activeTab === 'opening_kitchen' && 'CHECKLIST OPENING KITCHEN'}
                {activeTab === 'closing_kitchen' && 'CHECKLIST CLOSING KITCHEN'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '14px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '4px' }}>Tanggal</label>
                  <input
                    type="date"
                    value={headers.tanggal}
                    onChange={(e) => setHeaders({ ...headers, tanggal: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '4px' }}>Diisi Oleh (Petugas) *</label>
                  <input
                    type="text"
                    placeholder="Nama petugas..."
                    value={headers.diisiOleh}
                    onChange={(e) => setHeaders({ ...headers, diisiOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '4px' }}>Diperiksa Oleh (Manager/PIC)</label>
                  <input
                    type="text"
                    placeholder="Nama PIC..."
                    value={headers.diperiksaOleh}
                    onChange={(e) => setHeaders({ ...headers, diperiksaOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div style={{ backgroundColor: '#7f1d1d', color: '#fff', padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                  <span>Total: <strong style={{ color: '#fef08a' }}>{getFormStats(activeTab).total}</strong></span>
                  <span>OK: <strong style={{ color: '#86efac' }}>{getFormStats(activeTab).ok}</strong></span>
                  <span>Tidak: <strong style={{ color: '#fca5a5' }}>{getFormStats(activeTab).notOk}</strong></span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#fef08a' }}>
                  Progress: {getFormStats(activeTab).progress}%
                </div>
              </div>
            </div>

            {/* DAFTAR PERTANYAAN DIKELOMPOKKAN BERDASARKAN KATEGORI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(() => {
                const currentCatList = (questions[activeTab] || []).filter(q => q.isActive !== false);
                
                const grouped = currentCatList.reduce((acc, q) => {
                  const cat = q.category || 'Umum';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(q);
                  return acc;
                }, {});

                return Object.entries(grouped).map(([categoryName, items]) => (
                  <div key={categoryName} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #fecaca', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    
                    {/* SEKAT KATEGORI */}
                    <div style={{ backgroundColor: '#7f1d1d', color: '#fef08a', padding: '10px 16px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📍 Area / Kategori: {categoryName}</span>
                      <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{items.length} Item</span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((q) => {
                        const currentAns = checklistData[activeTab]?.[q.id] || {};
                        const originalIndex = currentCatList.findIndex(item => item.id === q.id);

                        return (
                          <div key={q.id} style={{ backgroundColor: '#fef2f2', borderRadius: '14px', padding: '14px', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: '#7f1d1d', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                                  {originalIndex + 1}
                                </span>
                                <div>
                                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: q.requirePhoto ? '#fef3c7' : '#fff', color: q.requirePhoto ? '#92400e' : '#7f1d1d', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                                      {q.requirePhoto ? '📷 Wajib Foto' : 'Foto Opsional'}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#450a0a' }}>{q.text}</p>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(activeTab, q.id, 'OK')}
                                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid', backgroundColor: currentAns.status === 'OK' ? '#059669' : '#fff', color: currentAns.status === 'OK' ? '#fff' : '#7f1d1d', borderColor: currentAns.status === 'OK' ? '#059669' : '#fca5a5', cursor: 'pointer' }}
                                >
                                  ✓ OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(activeTab, q.id, 'NOT_OK')}
                                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid', backgroundColor: currentAns.status === 'NOT_OK' ? '#dc2626' : '#fff', color: currentAns.status === 'NOT_OK' ? '#fff' : '#7f1d1d', borderColor: currentAns.status === 'NOT_OK' ? '#dc2626' : '#fca5a5', cursor: 'pointer' }}
                                >
                                  ✕ Tidak
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: q.requirePhoto ? '1fr auto' : '1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid #fca5a5' }}>
                              <input
                                type="text"
                                placeholder="Catatan & tindak lanjut..."
                                value={currentAns.note || ''}
                                onChange={(e) => handleItemNoteChange(activeTab, q.id, e.target.value)}
                                style={{ backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                              />

                              {q.requirePhoto && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <label style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '8px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    📷 {currentAns.photo ? 'Ganti Foto' : 'Ambil Foto'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={(e) => handlePhotoUpload(activeTab, q.id, e.target.files[0])}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                  {currentAns.photo && (
                                    <img src={currentAns.photo} alt="Bukti" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #fca5a5' }} />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  const docNo = activeTab.includes('lobi') ? 'SOP-LOBI-001' : 'SOP-KTN-001';
                  const title = activeTab === 'opening_lobi' ? 'Opening Lobi, Bar & Area Umum' :
                                activeTab === 'closing_lobi' ? 'Closing Lobi, Bar & Area Umum' :
                                activeTab === 'opening_kitchen' ? 'Opening Kitchen' : 'Closing Kitchen';
                  handleSubmitReport(activeTab, title, docNo);
                }}
                style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                {isSubmitting ? 'Menyimpan...' : '🚀 Simpan & Arsipkan ke Firebase'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB RIWAYAT ==================== */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #fecaca' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#7f1d1d' }}>Arsip Laporan & Foto Bukti Firebase</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#991b1b' }}>Semua laporan tersimpan aman di database cloud.</p>
            </div>

            {historyReports.length === 0 ? (
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '40px', textAlign: 'center', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', fontWeight: 'bold' }}>
                Belum ada laporan SOP tersimpan di database.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyReports.map(rep => (
                  <div key={rep.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>{rep.document_no}</span>
                        <span style={{ fontSize: '11px', color: '#991b1b' }}>{rep.timestamp}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#450a0a' }}>{rep.form_title}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>Petugas: <strong>{rep.headers?.diisiOleh}</strong> | Tanggal: <strong>{rep.headers?.tanggal}</strong></p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedReport(rep)}
                        style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Lihat Detail & Foto
                      </button>
                      {isAdminLoggedIn && (
                        <button
                          onClick={() => handleDeleteHistory(rep.id)}
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL KELOLA PERTANYAAN & TAMBAH AREA DENGAN DROPDOWN */}
      {showQuestionEditorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fef2f2', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#7f1d1d' }}>⚙️ Kelola Area & Pertanyaan SOP</h3>
              <button onClick={() => setShowQuestionEditorModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #fef2f2', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
              {[
                { key: 'opening_lobi', label: 'Opening Lobi' },
                { key: 'closing_lobi', label: 'Closing Lobi' },
                { key: 'opening_kitchen', label: 'Opening Kitchen' },
                { key: 'closing_kitchen', label: 'Closing Kitchen' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setEditingCategoryTab(tab.key);
                    setEditingQuestionId(null);
                    const cats = formCategories[tab.key] || ['General'];
                    setQuestionForm({ text: '', category: cats[0], requirePhoto: false, requireNoteOnNotOk: true });
                  }}
                  style={{ backgroundColor: editingCategoryTab === tab.key ? '#fef08a' : '#fef2f2', color: editingCategoryTab === tab.key ? '#7f1d1d' : '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FORM TAMBAH AREA / KATEGORI BARU */}
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 900, color: '#92400e' }}>➕ Tambah Area / Kategori Baru untuk Form Ini</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nama area baru (contoh: Gudang Utama)..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #fcd34d', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                />
                <button type="button" onClick={handleAddNewCategory} style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Tambah Area
                </button>
              </div>
            </div>

            {/* FORM TAMBAH / EDIT PERTANYAAN */}
            <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '14px', border: '1px solid #fecaca', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 900, color: '#450a0a' }}>{editingQuestionId ? '✏️ Edit Pertanyaan SOP' : '➕ Tambah Pertanyaan Baru'}</h4>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '4px' }}>Pilih Area / Kategori:</label>
                <select
                  value={questionForm.category}
                  onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                >
                  {(formCategories[editingCategoryTab] || ['General']).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '4px' }}>Teks Pertanyaan:</label>
                <input
                  type="text"
                  placeholder="Tulis teks pertanyaan..."
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <input type="checkbox" checked={questionForm.requirePhoto} onChange={(e) => setQuestionForm({ ...questionForm, requirePhoto: e.target.checked })} /> Wajib Lampirkan Foto Bukti
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {editingQuestionId && (
                  <button onClick={() => { setEditingQuestionId(null); const cats = formCategories[editingCategoryTab] || ['General']; setQuestionForm({ text: '', category: cats[0], requirePhoto: false, requireNoteOnNotOk: true }); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
                )}
                <button onClick={handleSaveQuestionItem} style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>
                  {editingQuestionId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {(questions[editingCategoryTab] || []).map((q, qIndex) => (
                <div key={q.id} style={{ backgroundColor: '#fff', border: '1px solid #fecaca', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button onClick={() => handleMoveQuestion(qIndex, 'up')} disabled={qIndex === 0} style={{ border: 'none', background: '#fef2f2', cursor: 'pointer', fontSize: '9px', borderRadius: '4px' }}>▲</button>
                      <button onClick={() => handleMoveQuestion(qIndex, 'down')} disabled={qIndex === (questions[editingCategoryTab] || []).length - 1} style={{ border: 'none', background: '#fef2f2', cursor: 'pointer', fontSize: '9px', borderRadius: '4px' }}>▼</button>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{q.category}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#450a0a' }}>{q.text}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleStartEditQuestion(q)} style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN ADMIN */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', maxWidth: '320px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: '#7f1d1d' }}>🔒 Masukkan PIN Admin</h3>
            <input
              type="password"
              placeholder="PIN (Default: 1234)"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: '100%', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowPinModal(false)} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleVerifyAdminPin} style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>Masuk</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH PIN */}
      {showChangePinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', maxWidth: '340px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: '#7f1d1d' }}>🔑 Ubah PIN Admin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input type="password" placeholder="PIN Lama" value={changePinForm.oldPin} onChange={(e) => setChangePinForm({ ...changePinForm, oldPin: e.target.value })} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
              <input type="password" placeholder="PIN Baru (min 4 karakter)" value={changePinForm.newPin} onChange={(e) => setChangePinForm({ ...changePinForm, newPin: e.target.value })} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
              <input type="password" placeholder="Konfirmasi PIN Baru" value={changePinForm.confirmPin} onChange={(e) => setChangePinForm({ ...changePinForm, confirmPin: e.target.value })} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowChangePinModal(false)} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleChangeAdminPin} style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LAPORAN */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fef2f2', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>{selectedReport.document_no}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 900, color: '#7f1d1d' }}>{selectedReport.form_title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '16px', fontSize: '11px' }}>
              <div><span style={{ color: '#991b1b', display: 'block' }}>Tanggal</span><strong>{selectedReport.headers?.tanggal}</strong></div>
              <div><span style={{ color: '#991b1b', display: 'block' }}>Petugas</span><strong>{selectedReport.headers?.diisiOleh}</strong></div>
              <div><span style={{ color: '#991b1b', display: 'block' }}>PIC</span><strong>{selectedReport.headers?.diperiksaOleh || '-'}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(selectedReport.items || []).map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{item.category}</span>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#450a0a' }}>{idx + 1}. {item.text}</p>
                    {item.note && <p style={{ margin: '4px 0 0 0', color: '#991b1b', fontSize: '11px' }}>Catatan: {item.note}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: item.status === 'OK' ? '#d1fae5' : '#fee2e2', color: item.status === 'OK' ? '#065f46' : '#991b1b' }}>
                      {item.status === 'OK' ? '✓ OK' : '✕ Tidak'}
                    </span>
                    {item.photo && (
                      <a href={item.photo} target="_blank" rel="noopener noreferrer">
                        <img src={item.photo} alt="Bukti" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #fca5a5' }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedReport(null)} style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

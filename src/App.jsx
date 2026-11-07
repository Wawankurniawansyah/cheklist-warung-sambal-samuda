import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  ClipboardCheck, Calendar, Users, FolderArchive, Lock, Unlock, 
  Settings, Key, Plus, Trash2, ArrowUp, ArrowDown, Camera, Check, 
  X, AlertTriangle, Building2, UtensilsCrossed, ChevronRight, RefreshCw, Cloud, Database,
  LayoutDashboard, ShieldCheck, CheckCircle2, FileText, PieChart, Sparkles, LogOut, Edit3, Layers
} from 'lucide-react';

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

// Inisialisasi Firebase Firestore
let db = null;
try {
  const app = initializeApp(FIREBASE_CONFIG);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [currentMasterPin, setCurrentMasterPin] = useState('1234');
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  
  const [selectedEditorTab, setSelectedEditorTab] = useState('opening_lobi');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState('Lobi');
  const [newQRequirePhoto, setNewQRequirePhoto] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [questions, setQuestions] = useState(DEFAULT_SOP_QUESTIONS);
  const [formCategories, setFormCategories] = useState(DEFAULT_FORM_CATEGORIES);
  
  const [headers, setHeaders] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    diisiOleh: '',
    diperiksaOleh: ''
  });

  const [attendance, setAttendance] = useState({
    hadirCount: '',
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
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (msg) => {
    setToastMessage(String(msg));
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!document.getElementById('instant-tailwind-style')) {
      const style = document.createElement('style');
      style.id = 'instant-tailwind-style';
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    setIsSyncingCloud(true);

    const unsubReports = onSnapshot(collection(db, "wss_sop_reports"), (snapshot) => {
      const cloudData = [];
      snapshot.forEach((docSnap) => {
        cloudData.push({ ...docSnap.data(), firestore_id: docSnap.id });
      });
      cloudData.sort((a, b) => (b.timestamp_raw || 0) - (a.timestamp_raw || 0));
      setHistoryReports(cloudData);
      setIsSyncingCloud(false);
    }, (error) => {
      console.error("Error listening reports:", error);
      setIsSyncingCloud(false);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const unsubAttendance = onSnapshot(doc(db, "wss_system_master", `attendance_${todayStr}`), (docSnap) => {
      if (docSnap.exists()) {
        setAttendance(docSnap.data());
      }
    }, (error) => {
      console.error("Error listening attendance:", error);
    });

    const unsubMaster = onSnapshot(doc(db, "wss_system_master", "config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.questions) setQuestions(data.questions);
        if (data.formCategories) setFormCategories(data.formCategories);
        if (data.adminPin) setCurrentMasterPin(data.adminPin);
      } else {
        setDoc(doc(db, "wss_system_master", "config"), {
          questions: DEFAULT_SOP_QUESTIONS,
          formCategories: DEFAULT_FORM_CATEGORIES,
          adminPin: '1234'
        }).catch(err => console.error("Init master error:", err));
      }
    }, (error) => {
      console.error("Error listening master config:", error);
    });

    return () => {
      unsubReports();
      unsubAttendance();
      unsubMaster();
    };
  }, []);

  const updateCloudMasterConfig = async (updatedQuestions, updatedCategories) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "wss_system_master", "config"), {
        questions: updatedQuestions || questions,
        formCategories: updatedCategories || formCategories,
        adminPin: currentMasterPin
      }, { merge: true });
    } catch (e) {
      console.error("Gagal update cloud master:", e);
    }
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

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const currentList = [...(questions[selectedEditorTab] || [])];
    if (editingQuestionId) {
      const idx = currentList.findIndex(q => q.id === editingQuestionId);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          text: newQText,
          category: newQCategory,
          requirePhoto: newQRequirePhoto
        };
      }
    } else {
      const newId = `q_${Date.now()}`;
      currentList.push({
        id: newId,
        text: newQText,
        category: newQCategory,
        requirePhoto: newQRequirePhoto,
        requireNoteOnNotOk: true,
        isActive: true
      });
    }

    const updatedQuestions = { ...questions, [selectedEditorTab]: currentList };
    setQuestions(updatedQuestions);
    updateCloudMasterConfig(updatedQuestions, null);

    setEditingQuestionId(null);
    setNewQText('');
    showToast("Pertanyaan SOP berhasil disimpan!");
  };

  const handleDeleteQuestion = (qId) => {
    if (!window.confirm("Hapus pertanyaan ini?")) return;
    const currentList = (questions[selectedEditorTab] || []).filter(q => q.id !== qId);
    const updatedQuestions = { ...questions, [selectedEditorTab]: currentList };
    setQuestions(updatedQuestions);
    updateCloudMasterConfig(updatedQuestions, null);
    showToast("Pertanyaan dihapus.");
  };

  const handleMoveQuestion = (index, direction) => {
    const list = [...(questions[selectedEditorTab] || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedQuestions = { ...questions, [selectedEditorTab]: list };
    setQuestions(updatedQuestions);
    updateCloudMasterConfig(updatedQuestions, null);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const upperCat = newCategoryInput.trim();
    const currentCats = formCategories[selectedEditorTab] || [];
    if (currentCats.includes(upperCat)) {
      alert("Kategori tersebut sudah ada!");
      return;
    }
    const updatedCats = { ...formCategories, [selectedEditorTab]: [...currentCats, upperCat] };
    setFormCategories(updatedCats);
    updateCloudMasterConfig(null, updatedCats);
    setNewCategoryInput('');
    showToast("Kategori baru berhasil ditambahkan!");
  };

  const handleDeleteReportFromCloud = async (firestoreId) => {
    if (!isAdminLoggedIn) return;
    if (!window.confirm("Yakin ingin menghapus permanen laporan ini?")) return;

    try {
      if (db && firestoreId) {
        await deleteDoc(doc(db, "wss_sop_reports", firestoreId));
        showToast("Laporan berhasil dihapus!");
      }
    } catch (e) {
      console.error("Gagal hapus laporan:", e);
    }
  };

  const handleSaveAttendance = async () => {
    if (!attendance.hadirCount) {
      alert("Harap isi jumlah karyawan hadir!");
      return;
    }
    const updatedAttendance = { ...attendance, isSubmitted: true, updatedAt: Date.now() };
    setAttendance(updatedAttendance);

    try {
      if (db) {
        const todayStr = new Date().toISOString().split('T')[0];
        await setDoc(doc(db, "wss_system_master", `attendance_${todayStr}`), updatedAttendance);
      }
      showToast("Data kehadiran berhasil disimpan ke Cloud!");
    } catch (e) {
      console.error("Gagal simpan absensi ke cloud:", e);
      alert("Gagal menyimpan absensi ke server cloud.");
    }
  };

  const handlePhotoCapture = (qId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 350;
        const MAX_HEIGHT = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.45);
        setChecklistData(prev => ({
          ...prev,
          [qId]: { ...(prev[qId] || {}), photo: compressedDataUrl }
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAnswerChange = (qId, field, value) => {
    setChecklistData(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { status: 'OK' }), [field]: value }
    }));
  };

  const handleSubmitChecklistForm = async () => {
    if (!headers.diisiOleh.trim()) { alert("Nama Petugas / PIC wajib diisi!"); return; }
    if (!headers.diperiksaOleh.trim()) { alert("Nama Pemeriksa wajib diisi!"); return; }
    
    // HANYA FOH YANG WAJIB CEK ABSENSI KARYAWAN
    if (activeTab.includes('lobi') && !attendance.isSubmitted) {
      alert("Untuk Form FOH, harap isi dan simpan Daftar Kehadiran Karyawan terlebih dahulu di Dashboard Utama!");
      return;
    }

    const currentQList = questions[activeTab] || [];
    for (let q of currentQList) {
      const ans = checklistData[q.id];
      if (!ans || !ans.status) { alert(`Pertanyaan "${q.text}" belum dijawab!`); return; }
      if (ans.status === 'Tidak' && (!ans.note || !ans.note.trim())) { alert(`Pertanyaan bernilai "Tidak" wajib mengisi Catatan!`); return; }
      if (q.requirePhoto && !ans.photo) { alert(`Pertanyaan "${q.text}" wajib menyertakan bukti foto!`); return; }
    }

    setIsSubmitting(true);
    try {
      const reportPayload = {
        formType: activeTab,
        formTitle: getFormTitle(activeTab),
        headers,
        attendance: activeTab.includes('lobi') ? attendance : { isSubmitted: false },
        checklistData,
        timestamp_readable: new Date().toLocaleString('id-ID'),
        timestamp_raw: Date.now(),
        dateStr: headers.tanggal
      };

      if (db) await addDoc(collection(db, "wss_sop_reports"), reportPayload);

      showToast("Laporan berhasil disimpan ke Database Cloud!");
      setChecklistData({});
      setActiveTab('dashboard');
    } catch (e) {
      console.error("Gagal simpan laporan:", e);
      alert("Gagal menyimpan ke server cloud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = (key) => {
    switch(key) {
      case 'opening_lobi': return 'Checklist Opening — FOH (Lobi & Bar)';
      case 'closing_lobi': return 'Checklist Closing — FOH (Lobi & Bar)';
      case 'opening_kitchen': return 'Checklist Opening — BOH (Kitchen)';
      case 'closing_kitchen': return 'Checklist Closing — BOH (Kitchen)';
      default: return key;
    }
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayReports = historyReports.filter(r => r.headers?.tanggal === todayDateStr);
  const totalReportsCount = historyReports.length;
  const fohCount = historyReports.filter(r => r.formType?.includes('lobi')).length;
  const bohCount = historyReports.filter(r => r.formType?.includes('kitchen')).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 selection:bg-rose-600 selection:text-white">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check size={16} className="text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* HEADER UTAMA */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white m-0 leading-tight">WARUNG SAMBAL SAMUDA</h1>
              <p className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wider uppercase m-0">SOP Digital Control System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSyncingCloud && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/20 font-medium">
                <RefreshCw size={12} className="animate-spin text-amber-400" /> Sync Cloud
              </span>
            )}

            {isAdminLoggedIn ? (
              <button 
                onClick={() => setIsAdminLoggedIn(false)}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Unlock size={14} /> Admin Aktif
              </button>
            ) : (
              <button 
                onClick={() => setShowPinModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Lock size={14} /> Login Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGASI TABS */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-[65px] z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-2 py-2">
          {[
            { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard size={16} /> },
            { id: 'foh', label: 'FOH (Lobi & Bar)', icon: <Building2 size={16} /> },
            { id: 'boh', label: 'BOH (Kitchen)', icon: <UtensilsCrossed size={16} /> },
            { id: 'history', label: 'Arsip Cloud', icon: <FolderArchive size={16} /> },
            ...(isAdminLoggedIn ? [{ id: 'admin_panel', label: 'Panel Editor SOP', icon: <ShieldCheck size={16} /> }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTAINER UTAMA */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* TANGGAL & INFORMASI HARI INI */}
            <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700/80 px-5 py-3.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Tanggal Operasional Hari Ini:</span>
              </div>
              <span className="bg-slate-900 text-amber-300 text-xs font-black px-4 py-1.5 rounded-xl border border-amber-500/30">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-6 sm:p-8 rounded-3xl border border-red-900/50 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">
                  Operational Control Center
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">Selamat Datang di Portal SOP Warung Sambal Samuda</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Absensi karyawan wajib diisi sebelum mengakses form FOH. Form BOH dapat diakses secara langsung. Semua data tersinkronisasi real-time ke cloud.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab('foh')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Building2 size={16} /> Buka Form FOH
                  </button>
                  <button 
                    onClick={() => setActiveTab('boh')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs border border-slate-700 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <UtensilsCrossed size={16} /> Buka Form BOH
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Laporan Cloud</p>
                  <h3 className="text-2xl font-black text-white m-0">{totalReportsCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <FileText size={24} />
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Laporan FOH</p>
                  <h3 className="text-2xl font-black text-white m-0">{fohCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Building2 size={24} />
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Laporan BOH</p>
                  <h3 className="text-2xl font-black text-white m-0">{bohCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UtensilsCrossed size={24} />
                </div>
              </div>
            </div>

            {/* ABSENSI KARYAWAN (Wajib untuk FOH) */}
            <div className="bg-slate-800/90 border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">Wajib untuk FOH</span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                    <Users size={20} className="text-amber-400" /> Daftar Kehadiran Karyawan Hari Ini
                  </h3>
                </div>
                <span className="bg-slate-900 text-slate-300 text-xs font-bold px-4 py-2 rounded-2xl border border-slate-700 w-fit">{todayDateStr}</span>
              </div>

              {attendance.isSubmitted ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <CheckCircle2 size={18} /> Kehadiran Karyawan Telah Disimpan di Cloud (Form FOH Terbuka)
                    </div>
                    <button 
                      onClick={async () => {
                        const resetState = { ...attendance, isSubmitted: false };
                        setAttendance(resetState);
                        try {
                          if (db) {
                            const todayStr = new Date().toISOString().split('T')[0];
                            await setDoc(doc(db, "wss_system_master", `attendance_${todayStr}`), resetState);
                          }
                        } catch (e) { console.error(e); }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-600 transition-all"
                    >
                      Edit Absen
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block mb-0.5">Hadir</span>
                      <strong className="text-white text-sm">{attendance.hadirCount} Orang</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block mb-0.5">Sakit</span>
                      <strong className="text-amber-400 text-sm">{attendance.sakitList.filter(Boolean).length} Orang</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block mb-0.5">Izin</span>
                      <strong className="text-sky-400 text-sm">{attendance.izinList.filter(Boolean).length} Orang</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block mb-0.5">Tanpa Keterangan</span>
                      <strong className="text-rose-400 text-sm">{attendance.alphaList.filter(Boolean).length} Orang</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">Jumlah Karyawan Hadir (Masuk Kerja):</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 10"
                      value={attendance.hadirCount}
                      onChange={(e) => setAttendance({ ...attendance, hadirCount: e.target.value })}
                      className="w-full sm:w-56 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-400">Karyawan Sakit:</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, sakitList: [...p.sakitList, ''] }))} className="text-[11px] text-amber-300 font-bold hover:underline">+ Nama</button>
                      </div>
                      {attendance.sakitList.map((name, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={`Nama sakit #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.sakitList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, sakitList: list });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
                          />
                          {attendance.sakitList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, sakitList: p.sakitList.filter((_, i) => i !== idx) }))} className="text-rose-400 px-2"><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-sky-400">Karyawan Izin:</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, izinList: [...p.izinList, ''] }))} className="text-[11px] text-sky-300 font-bold hover:underline">+ Nama</button>
                      </div>
                      {attendance.izinList.map((name, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={`Nama izin #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.izinList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, izinList: list });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
                          />
                          {attendance.izinList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, izinList: p.izinList.filter((_, i) => i !== idx) }))} className="text-rose-400 px-2"><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-rose-400">Tanpa Keterangan (Alpha):</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, alphaList: [...p.alphaList, ''] }))} className="text-[11px] text-rose-300 font-bold hover:underline">+ Nama</button>
                      </div>
                      {attendance.alphaList.map((name, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={`Nama alpha #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.alphaList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, alphaList: list });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
                          />
                          {attendance.alphaList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, alphaList: p.alphaList.filter((_, i) => i !== idx) }))} className="text-rose-400 px-2"><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleSaveAttendance}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-lg transition-transform active:scale-98 mt-4"
                  >
                    Simpan Kehadiran Karyawan (Buka Akses FOH)
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-400" /> Ringkasan Laporan Hari Ini ({todayDateStr})
              </h3>
              {todayReports.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                  Belum ada laporan checklist yang diinput hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayReports.map((rep, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700/70 p-4 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block mb-1 text-sm">{rep.formTitle}</strong>
                        <span className="text-slate-400">PIC: <strong className="text-slate-200">{rep.headers?.diisiOleh}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-xl border border-emerald-500/30">
                          ✓ Selesai
                        </span>
                        <button 
                          onClick={() => setSelectedReport(rep)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2 rounded-xl font-bold transition-all"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. FOH (TERKONTROL OLEH ABSENSI) */}
        {activeTab === 'foh' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-950 to-slate-900 p-6 rounded-3xl border border-amber-900/40 shadow-xl flex items-center justify-between">
              <div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                  Front of House Control (Terkunci jika belum absen)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white m-0">Form Checklist FOH (Lobi, Bar & Area Umum)</h2>
              </div>
              <Building2 size={36} className="text-amber-400 opacity-80" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'opening_lobi', title: 'Opening FOH (Lobi & Bar)', desc: 'Pemeriksaan kesiapan area publik sebelum operasional buka', icon: <Building2 className="text-amber-400" size={24} /> },
                { key: 'closing_lobi', title: 'Closing FOH (Lobi & Bar)', desc: 'Pemberkasan malam, kasir & pengamanan area publik', icon: <Building2 className="text-orange-400" size={24} /> }
              ].map(item => {
                const isSubmitted = historyReports.some(r => r.formType === item.key && r.headers?.tanggal === todayDateStr);
                return (
                  <div 
                    key={item.key}
                    onClick={() => {
                      if (!attendance.isSubmitted) {
                        alert("Form FOH terkunci! Harap isi dan simpan Daftar Kehadiran Karyawan terlebih dahulu di Dashboard Utama.");
                        return;
                      }
                      setActiveTab(item.key);
                    }}
                    className={`bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 p-6 rounded-3xl shadow-lg cursor-pointer transition-all group flex flex-col justify-between ${!attendance.isSubmitted ? 'opacity-60' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                          {item.icon}
                        </div>
                        {isSubmitted && (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-xl border border-emerald-500/30">
                            Sudah Diinput
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 mb-6">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>{!attendance.isSubmitted ? 'Terkunci (Wajib Absen)' : 'Mulai Pemeriksaan'}</span>
                      {!attendance.isSubmitted ? <Lock size={16} /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. BOH (BEBAS DIAKSES TANPA SYARAT ABSENSI FOH) */}
        {activeTab === 'boh' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-950 to-slate-900 p-6 rounded-3xl border border-red-900/40 shadow-xl flex items-center justify-between">
              <div>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                  Back of House Control (Akses Langsung)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white m-0">Form Checklist BOH (Kitchen & Dapur)</h2>
              </div>
              <UtensilsCrossed size={36} className="text-red-400 opacity-80" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'opening_kitchen', title: 'Opening Kitchen (BOH)', desc: 'Pemeriksaan kesiapan dapur, kebersihan & suhu kulkas', icon: <UtensilsCrossed className="text-red-400" size={24} /> },
                { key: 'closing_kitchen', title: 'Closing Kitchen (BOH)', desc: 'Pembersihan dapur malam, pencatatan waste & pengamanan gas', icon: <UtensilsCrossed className="text-rose-400" size={24} /> }
              ].map(item => {
                const isSubmitted = historyReports.some(r => r.formType === item.key && r.headers?.tanggal === todayDateStr);
                return (
                  <div 
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className="bg-slate-800/90 border border-slate-700 hover:border-red-500/50 p-6 rounded-3xl shadow-lg cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                          {item.icon}
                        </div>
                        {isSubmitted && (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-xl border border-emerald-500/30">
                            Sudah Diinput
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 mb-6">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-red-400">
                      <span>Mulai Pemeriksaan</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. FORM CHECKLIST AKTIF */}
        {['opening_lobi', 'closing_lobi', 'opening_kitchen', 'closing_kitchen'].includes(activeTab) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <button 
                onClick={() => setActiveTab(activeTab.includes('lobi') ? 'foh' : 'boh')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                ← Kembali ke Menu
              </button>
              <span className="text-xs font-black uppercase text-red-400 bg-red-500/10 px-3.5 py-1.5 rounded-xl border border-red-500/20">
                {getFormTitle(activeTab)}
              </span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/70">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tanggal:</label>
                  <input 
                    type="date"
                    value={headers.tanggal}
                    onChange={(e) => setHeaders({ ...headers, tanggal: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Diisi Oleh (Petugas):</label>
                  <input 
                    type="text"
                    placeholder="Nama lengkap petugas..."
                    value={headers.diisiOleh}
                    onChange={(e) => setHeaders({ ...headers, diisiOleh: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Diperiksa Oleh (Manager/PIC):</label>
                  <input 
                    type="text"
                    placeholder="Nama pemeriksa..."
                    value={headers.diperiksaOleh}
                    onChange={(e) => setHeaders({ ...headers, diperiksaOleh: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {(() => {
                  const qList = questions[activeTab] || [];
                  const categories = formCategories[activeTab] || [...new Set(qList.map(q => q.category))];

                  return categories.map(catName => {
                    const catQuestions = qList.filter(q => q.category === catName);
                    if (catQuestions.length === 0) return null;

                    return (
                      <div key={catName} className="border border-slate-700 rounded-3xl overflow-hidden shadow-sm bg-slate-900/60">
                        <div className="bg-slate-900 text-white px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                          <span>Area: {catName}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">{catQuestions.length} Item</span>
                        </div>

                        <div className="divide-y divide-slate-800/80">
                          {catQuestions.map((q, qIdx) => {
                            const ans = checklistData[q.id] || { status: '', note: '', photo: '' };
                            return (
                              <div key={q.id} className="p-5 space-y-4 hover:bg-slate-800/40 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                                    <strong className="text-slate-500 mr-2">{qIdx + 1}.</strong> {q.text}
                                    {q.requirePhoto && <span className="ml-2 text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-md border border-red-500/30">Wajib Foto</span>}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4">
                                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${ans.status === 'OK' ? 'bg-slate-700 border-emerald-500 text-emerald-300 shadow-sm' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                    <input 
                                      type="radio" 
                                      name={`status_${q.id}`} 
                                      checked={ans.status === 'OK'}
                                      onChange={() => handleAnswerChange(q.id, 'status', 'OK')}
                                      className="accent-emerald-500"
                                    /> OK
                                  </label>
                                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${ans.status === 'Tidak' ? 'bg-slate-700 border-rose-500 text-rose-300 shadow-sm' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                    <input 
                                      type="radio" 
                                      name={`status_${q.id}`} 
                                      checked={ans.status === 'Tidak'}
                                      onChange={() => handleAnswerChange(q.id, 'status', 'Tidak')}
                                      className="accent-rose-500"
                                    /> Tidak (Masalah)
                                  </label>
                                </div>

                                {ans.status === 'Tidak' && (
                                  <div className="pt-1">
                                    <input 
                                      type="text"
                                      placeholder="Catatan Kendala / Tindak Lanjut (Wajib diisi)..."
                                      value={ans.note || ''}
                                      onChange={(e) => handleAnswerChange(q.id, 'note', e.target.value)}
                                      className="w-full bg-rose-950/30 border border-rose-500/50 rounded-xl px-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                  </div>
                                )}

                                {q.requirePhoto && (
                                  <div className="pt-1 flex items-center gap-3">
                                    <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 border border-slate-700 shadow-sm active:scale-95 transition-transform">
                                      <Camera size={16} className="text-red-400" />
                                      {ans.photo ? 'Ganti Foto' : 'Ambil Foto Bukti'}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        onChange={(e) => handlePhotoCapture(q.id, e)}
                                        className="hidden"
                                      />
                                    </label>

                                    {ans.photo && (
                                      <div className="flex items-center gap-2.5">
                                        <img src={ans.photo} alt="Bukti" className="w-11 h-11 object-cover rounded-xl border border-slate-700 shadow-sm" />
                                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                          <Check size={14} /> Terlampir
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="pt-4">
                <button 
                  type="button"
                  onClick={handleSubmitChecklistForm}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-red-600/30 transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ClipboardCheck size={18} /> {isSubmitting ? 'Menyimpan ke Cloud...' : 'Simpan & Arsipkan ke Firebase Cloud'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 5. ARSIP CLOUD */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FolderArchive size={22} className="text-red-500" /> Arsip Laporan Cloud (Multi-Device)
              </h2>
              <p className="text-xs text-slate-400">Semua laporan dari seluruh perangkat tersimpan secara real-time di server cloud.</p>

              {historyReports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                  Belum ada laporan tersimpan di database cloud.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyReports.map((rep, idx) => (
                    <div key={rep.firestore_id || idx} className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="text-xs font-black text-red-300 bg-red-500/20 px-3 py-1 rounded-xl border border-red-500/30">
                            {rep.formTitle}
                          </span>
                          <span className="text-[11px] text-slate-400">{rep.timestamp_readable}</span>
                        </div>
                        <p className="text-xs text-slate-300 m-0">
                          Petugas: <strong className="text-white">{rep.headers?.diisiOleh}</strong> | Pemeriksa: <strong className="text-white">{rep.headers?.diperiksaOleh}</strong>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedReport(rep)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-transform active:scale-95"
                        >
                          Lihat Detail
                        </button>

                        {isAdminLoggedIn && (
                          <button 
                            onClick={() => handleDeleteReportFromCloud(rep.firestore_id)}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold p-2.5 rounded-xl border border-rose-500/30 transition-transform active:scale-95"
                            title="Hapus dari database cloud"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. PANEL ADMIN */}
        {activeTab === 'admin_panel' && isAdminLoggedIn && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 p-6 rounded-3xl border border-red-900/40 shadow-xl flex items-center justify-between">
              <div>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                  Admin Control Panel
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white m-0">Pengaturan & Editor Pertanyaan SOP</h2>
              </div>
              <ShieldCheck size={36} className="text-red-400" />
            </div>

            <div className="flex overflow-x-auto gap-2 pb-2">
              {[
                { key: 'opening_lobi', label: 'FOH Opening' },
                { key: 'closing_lobi', label: 'FOH Closing' },
                { key: 'opening_kitchen', label: 'BOH Opening' },
                { key: 'closing_kitchen', label: 'BOH Closing' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setSelectedEditorTab(tab.key); setEditingQuestionId(null); setNewQText(''); }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedEditorTab === tab.key ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl space-y-4 lg:col-span-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-amber-400" /> {editingQuestionId ? 'Edit Pertanyaan SOP' : 'Tambah Pertanyaan Baru'}
                </h3>
                
                <form onSubmit={handleSaveQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Kategori / Area:</label>
                    <select
                      value={newQCategory}
                      onChange={(e) => setNewQCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {(formCategories[selectedEditorTab] || []).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Teks Pertanyaan / Checklist:</label>
                    <textarea 
                      rows={3}
                      placeholder="Tuliskan poin SOP..."
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="req_photo_chk"
                      checked={newQRequirePhoto}
                      onChange={(e) => setNewQRequirePhoto(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <label htmlFor="req_photo_chk" className="text-xs font-bold text-slate-300 cursor-pointer">Wajib Lampirkan Foto</label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs shadow transition-transform active:scale-98"
                    >
                      {editingQuestionId ? 'Simpan Perubahan' : 'Tambah ke SOP'}
                    </button>
                    {editingQuestionId && (
                      <button 
                        type="button"
                        onClick={() => { setEditingQuestionId(null); setNewQText(''); }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl text-xs font-bold"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                <div className="border-t border-slate-700 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-400" /> Tambah Area / Kategori Baru
                  </h4>
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Nama Area (e.g. GUDANG)..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                    />
                    <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl">
                      Tambah
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl space-y-4 lg:col-span-2">
                <h3 className="text-sm font-black text-white">Daftar Pertanyaan SOP ({selectedEditorTab})</h3>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(questions[selectedEditorTab] || []).map((q, qIdx) => (
                    <div key={q.id} className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-500/30">{q.category}</span>
                          {q.requirePhoto && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md border border-red-500/30">Wajib Foto</span>}
                        </div>
                        <p className="text-xs font-medium text-slate-200 m-0">
                          <strong className="text-slate-500 mr-1.5">{qIdx + 1}.</strong> {q.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleMoveQuestion(qIdx, 'up')} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700" title="Geser Atas"><ArrowUp size={14} /></button>
                        <button onClick={() => handleMoveQuestion(qIdx, 'down')} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700" title="Geser Bawah"><ArrowDown size={14} /></button>
                        <button onClick={() => { setEditingQuestionId(q.id); setNewQText(q.text); setNewQCategory(q.category); setNewQRequirePhoto(q.requirePhoto); }} className="p-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 rounded-lg border border-sky-500/30" title="Edit"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg border border-rose-500/30" title="Hapus"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DETAIL LAPORAN */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase bg-red-500/20 text-red-300 px-3 py-1 rounded-xl border border-red-500/30">{selectedReport.formTitle}</span>
                <h3 className="text-base font-black text-white mt-1.5">Detail Laporan SOP</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div><strong className="text-slate-400 block mb-0.5">Tanggal:</strong> {selectedReport.headers?.tanggal}</div>
              <div><strong className="text-slate-400 block mb-0.5">Waktu Input:</strong> {selectedReport.timestamp_readable}</div>
              <div><strong className="text-slate-400 block mb-0.5">Petugas:</strong> {selectedReport.headers?.diisiOleh}</div>
              <div><strong className="text-slate-400 block mb-0.5">Pemeriksa:</strong> {selectedReport.headers?.diperiksaOleh}</div>
            </div>

            {selectedReport.attendance?.isSubmitted && (
              <div className="text-xs bg-amber-950/40 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <strong className="text-amber-300 block">Kehadiran Karyawan (FOH):</strong>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>• Hadir: <strong>{selectedReport.attendance.hadirCount} Orang</strong></div>
                  <div>• Sakit: <strong>{selectedReport.attendance.sakitList?.filter(Boolean).length || 0} Orang</strong></div>
                  <div>• Izin: <strong>{selectedReport.attendance.izinList?.filter(Boolean).length || 0} Orang</strong></div>
                  <div>• Tanpa Keterangan: <strong>{selectedReport.attendance.alphaList?.filter(Boolean).length || 0} Orang</strong></div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Item Pemeriksaan:</h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Object.entries(selectedReport.checklistData || {}).map(([qId, ans], idx) => (
                  <div key={idx} className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700 text-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-white block mb-1">Item #{idx + 1}</span>
                      <span className={`inline-block font-bold px-2.5 py-0.5 rounded-lg text-[10px] mb-1 ${ans.status === 'OK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                        Status: {ans.status}
                      </span>
                      {ans.note && <p className="text-slate-300 m-0 mt-1">Catatan: {ans.note}</p>}
                    </div>
                    {ans.photo && (
                      <a href={ans.photo} target="_blank" rel="noreferrer">
                        <img src={ans.photo} alt="Bukti" className="w-14 h-14 object-cover rounded-xl border border-slate-700 shadow-sm" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-xs border border-slate-700"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN LOGIN ADMIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Lock size={18} className="text-red-500" /> Masukkan PIN Admin
            </h3>
            <p className="text-xs text-slate-400">Masukkan PIN Admin untuk mengakses Panel Editor SOP & Penghapusan Arsip.</p>
            <input 
              type="password"
              placeholder="PIN (Default: 1234)"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-4 py-3 text-sm font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600"
              autoFocus
            />
            <div className="flex gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setShowPinModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl text-xs border border-slate-700"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleVerifyAdminPin}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-red-600/30"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

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

let db = null;
try {
  const app = initializeApp(FIREBASE_CONFIG);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const DEFAULT_FORM_CATEGORIES = {
  opening_lobi: ['Lobi', 'Bar', 'Parkir', 'Taman', 'Toilet', 'Musholah'],
  closing_lobi: ['Lobi', 'Bar', 'Parkir', 'Taman', 'Toilet', 'Musholah'],
  opening_kitchen: ['General', 'Kebersihan', 'Peralatan', 'Suhu', 'Bahan Baku', 'Preparation', 'Operasional'],
  closing_kitchen: ['Operasional', 'Bahan Baku', 'Preparation', 'Waste', 'Kebersihan', 'Peralatan', 'Stok', 'Keamanan']
};

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
  const [previewImage, setPreviewImage] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (msg) => {
    setToastMessage(String(msg));
    setTimeout(() => setToastMessage(''), 3000);
  };

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
      const formattedChecklist = {};
      Object.entries(checklistData).forEach(([qId, ans]) => {
        const foundQ = currentQList.find(q => q.id === qId);
        formattedChecklist[qId] = {
          questionText: foundQ ? foundQ.text : qId,
          category: foundQ ? foundQ.category : 'General',
          status: ans.status,
          note: ans.note || '',
          photo: ans.photo || ''
        };
      });

      const reportPayload = {
        formType: activeTab,
        formTitle: getFormTitle(activeTab),
        headers,
        attendance: activeTab.includes('lobi') ? attendance : { isSubmitted: false },
        checklistData: formattedChecklist,
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, backgroundColor: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #334155' }}>
          <Check size={16} style={{ color: '#34d399' }} /> {toastMessage}
        </div>
      )}

      {/* HEADER UTAMA */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #dc2626, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220,38,38,0.3)', padding: '6px' }}>
              <svg viewBox="0 0 512 512" style={{ width: '100%', height: '100%', fill: '#ffffff' }}>
                <path d="M256 32c125.8 0 228 102.2 228 228 0 42.4-11.4 82.2-31.2 116.4-13.8 24.2-34.4 44.8-58.6 58.6C338.2 456.6 298.4 468 256 468c-125.8 0-228-102.2-228-228S130.2 32 256 32zm0 48c-99.4 0-180 80.6-180 180 0 29.4 7.4 57 20.4 81.2 1.4 2.6 3.6 4.8 6.2 6.2 24.2 13 51.8 20.4 81.2 20.4 99.4 0 180-80.6 180-180S355.4 80 256 80z" />
                <path d="M256 120c75.1 0 136 60.9 136 136 0 21.3-5.2 41.4-14.4 59.2-4.2 8.2-13.8 11.4-22 7.2-8.2-4.2-11.4-13.8-7.2-22 7.4-14.6 11.6-31.4 11.6-44.4 0-53-43-96-96-96s-96 43-96 96 43 96 96 96c13 0 29.8-4.2 44.4-11.6 8.2-4.2 17.8-1 22 7.2 4.2 8.2 1 17.8-7.2 22C305.4 346.8 285.3 352 264 352c-75.1 0-136-60.9-136-136s60.9-136 136-136z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>WARUNG SAMBAL SAMUDA</h1>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', margin: 0, textTransform: 'uppercase' }}>SOP Digital Control System</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isSyncingCloud && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Sync
              </span>
            )}

            {isAdminLoggedIn ? (
              <button 
                onClick={() => setIsAdminLoggedIn(false)}
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '12px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Unlock size={14} /> Admin Aktif
              </button>
            ) : (
              <button 
                onClick={() => setShowPinModal(true)}
                style={{ backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', fontSize: '12px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Lock size={14} /> Login Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGASI TABS */}
      <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', position: 'sticky', top: '67px', zIndex: 90, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '8px', padding: '8px 20px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard size={15} /> },
            { id: 'foh', label: 'FOH (Lobi & Bar)', icon: <Building2 size={15} /> },
            { id: 'boh', label: 'BOH (Kitchen)', icon: <UtensilsCrossed size={15} /> },
            { id: 'history', label: 'Arsip Cloud', icon: <FolderArchive size={15} /> },
            ...(isAdminLoggedIn ? [{ id: 'admin_panel', label: 'Panel Editor SOP', icon: <ShieldCheck size={15} /> }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#dc2626' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTAINER UTAMA */}
      <main style={{ maxWidth: '1100px', margin: '24px auto', padding: '0 20px' }}>

        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TANGGAL & INFORMASI HARI INI */}
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>Tanggal Operasional Hari Ini:</span>
              </div>
              <span style={{ backgroundColor: '#0f172a', color: '#fbbf24', fontSize: '12px', fontWeight: '900', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #0f172a, #78350f)', padding: '28px', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 10, maxWidth: '650px' }}>
                <span style={{ backgroundColor: 'rgba(220, 38, 38, 0.3)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
                  Operational Control Center
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0' }}>Selamat Datang di Portal SOP Warung Sambal Samuda</h2>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  Absensi karyawan wajib diisi sebelum mengakses form FOH. Form BOH dapat diakses secara langsung. Semua data tersinkronisasi real-time ke cloud.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setActiveTab('foh')}
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
                  >
                    <Building2 size={16} /> Buka Form FOH
                  </button>
                  <button 
                    onClick={() => setActiveTab('boh')}
                    style={{ backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #475569', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <UtensilsCrossed size={16} /> Buka Form BOH
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Total Laporan Cloud</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0 }}>{totalReportsCount}</h3>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                  <FileText size={22} />
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Laporan FOH</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0 }}>{fohCount}</h3>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <Building2 size={22} />
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Laporan BOH</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0 }}>{bohCount}</h3>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <UtensilsCrossed size={22} />
                </div>
              </div>
            </div>

            {/* ABSENSI KARYAWAN */}
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Wajib untuk FOH</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} style={{ color: '#fbbf24' }} /> Daftar Kehadiran Karyawan Hari Ini
                  </h3>
                </div>
                <span style={{ backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '12px', border: '1px solid #334155' }}>{todayDateStr}</span>
              </div>

              {attendance.isSubmitted ? (
                <div style={{ backgroundColor: 'rgba(6, 95, 70, 0.3)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>
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
                      style={{ backgroundColor: '#334155', color: '#f8fafc', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '10px', border: '1px solid #475569', cursor: 'pointer' }}
                    >
                      Edit Absen
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '12px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Hadir</span>
                      <strong style={{ color: '#ffffff', fontSize: '14px' }}>{attendance.hadirCount} Orang</strong>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Sakit</span>
                      <strong style={{ color: '#fbbf24', fontSize: '14px' }}>{attendance.sakitList.filter(Boolean).length} Orang</strong>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Izin</span>
                      <strong style={{ color: '#38bdf8', fontSize: '14px' }}>{attendance.izinList.filter(Boolean).length} Orang</strong>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Alpha</span>
                      <strong style={{ color: '#f87171', fontSize: '14px' }}>{attendance.alphaList.filter(Boolean).length} Orang</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' }}>Jumlah Karyawan Hadir (Masuk Kerja):</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 10"
                      value={attendance.hadirCount}
                      onChange={(e) => setAttendance({ ...attendance, hadirCount: e.target.value })}
                      style={{ width: '100%', maxWidth: '220px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#fbbf24' }}>Karyawan Sakit:</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, sakitList: [...p.sakitList, ''] }))} style={{ fontSize: '11px', color: '#fcd34d', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Nama</button>
                      </div>
                      {attendance.sakitList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder={`Nama sakit #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.sakitList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, sakitList: list });
                            }}
                            style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.sakitList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, sakitList: p.sakitList.filter((_, i) => i !== idx) }))} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }}>Karyawan Izin:</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, izinList: [...p.izinList, ''] }))} style={{ fontSize: '11px', color: '#7dd3fc', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Nama</button>
                      </div>
                      {attendance.izinList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder={`Nama izin #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.izinList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, izinList: list });
                            }}
                            style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.izinList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, izinList: p.izinList.filter((_, i) => i !== idx) }))} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#f87171' }}>Tanpa Keterangan (Alpha):</label>
                        <button type="button" onClick={() => setAttendance(p => ({ ...p, alphaList: [...p.alphaList, ''] }))} style={{ fontSize: '11px', color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Nama</button>
                      </div>
                      {attendance.alphaList.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder={`Nama alpha #${idx+1}`}
                            value={name}
                            onChange={(e) => {
                              const list = [...attendance.alphaList];
                              list[idx] = e.target.value;
                              setAttendance({ ...attendance, alphaList: list });
                            }}
                            style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                          />
                          {attendance.alphaList.length > 1 && (
                            <button type="button" onClick={() => setAttendance(p => ({ ...p, alphaList: p.alphaList.filter((_, i) => i !== idx) }))} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleSaveAttendance}
                    style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '14px', fontWeight: 900, fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)', marginTop: '8px' }}
                  >
                    Simpan Kehadiran Karyawan (Buka Akses FOH)
                  </button>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#cbd5e1', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#34d399' }} /> Ringkasan Laporan Hari Ini ({todayDateStr})
              </h3>
              {todayReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '12px', fontStyle: 'italic', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px dashed #334155' }}>
                  Belum ada laporan checklist yang diinput hari ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {todayReports.map((rep, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '14px 18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div>
                        <strong style={{ color: '#ffffff', display: 'block', marginBottom: '3px', fontSize: '13px' }}>{rep.formTitle}</strong>
                        <span style={{ color: '#94a3b8' }}>PIC: <strong style={{ color: '#cbd5e1' }}>{rep.headers?.diisiOleh}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          ✓ Selesai
                        </span>
                        <button 
                          onClick={() => setSelectedReport(rep)}
                          style={{ backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', padding: '6px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
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

        {/* 2. FOH */}
        {activeTab === 'foh' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #78350f, #0f172a)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' }}>
                  Front of House Control (Terkunci jika belum absen)
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Form Checklist FOH (Lobi, Bar & Area Umum)</h2>
              </div>
              <Building2 size={36} style={{ color: '#fbbf24', opacity: 0.8 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { key: 'opening_lobi', title: 'Opening FOH (Lobi & Bar)', desc: 'Pemeriksaan kesiapan area publik sebelum operasional buka', icon: <Building2 style={{ color: '#fbbf24' }} size={24} /> },
                { key: 'closing_lobi', title: 'Closing FOH (Lobi & Bar)', desc: 'Pemberkasan malam, kasir & pengamanan area publik', icon: <Building2 style={{ color: '#f97316' }} size={24} /> }
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
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: !attendance.isSubmitted ? 0.6 : 1, transition: 'all 0.2s' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                          {item.icon}
                        </div>
                        {isSubmitted && (
                          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Sudah Diinput
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>{item.title}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fbbf24' }}>
                      <span>{!attendance.isSubmitted ? 'Terkunci (Wajib Absen)' : 'Mulai Pemeriksaan'}</span>
                      {!attendance.isSubmitted ? <Lock size={16} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. BOH */}
        {activeTab === 'boh' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #0f172a)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.3)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' }}>
                  Back of House Control (Akses Langsung)
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Form Checklist BOH (Kitchen & Dapur)</h2>
              </div>
              <UtensilsCrossed size={36} style={{ color: '#f87171', opacity: 0.8 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { key: 'opening_kitchen', title: 'Opening Kitchen (BOH)', desc: 'Pemeriksaan kesiapan dapur, kebersihan & suhu kulkas', icon: <UtensilsCrossed style={{ color: '#f87171' }} size={24} /> },
                { key: 'closing_kitchen', title: 'Closing Kitchen (BOH)', desc: 'Pembersihan dapur malam, pencatatan waste & pengamanan gas', icon: <UtensilsCrossed style={{ color: '#fb7185' }} size={24} /> }
              ].map(item => {
                const isSubmitted = historyReports.some(r => r.formType === item.key && r.headers?.tanggal === todayDateStr);
                return (
                  <div 
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                          {item.icon}
                        </div>
                        {isSubmitted && (
                          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Sudah Diinput
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>{item.title}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#f87171' }}>
                      <span>Mulai Pemeriksaan</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. FORM CHECKLIST AKTIF */}
        {['opening_lobi', 'closing_lobi', 'opening_kitchen', 'closing_kitchen'].includes(activeTab) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab(activeTab.includes('lobi') ? 'foh' : 'boh')}
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ← Kembali ke Menu
              </button>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#f87171', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                {getFormTitle(activeTab)}
              </span>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', backgroundColor: '#0f172a', padding: '18px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Tanggal:</label>
                  <input 
                    type="date"
                    value={headers.tanggal}
                    onChange={(e) => setHeaders({ ...headers, tanggal: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Diisi Oleh (Petugas):</label>
                  <input 
                    type="text"
                    placeholder="Nama lengkap petugas..."
                    value={headers.diisiOleh}
                    onChange={(e) => setHeaders({ ...headers, diisiOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Diperiksa Oleh (Manager/PIC):</label>
                  <input 
                    type="text"
                    placeholder="Nama pemeriksa..."
                    value={headers.diperiksaOleh}
                    onChange={(e) => setHeaders({ ...headers, diperiksaOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(() => {
                  const qList = questions[activeTab] || [];
                  const categories = formCategories[activeTab] || [...new Set(qList.map(q => q.category))];

                  return categories.map(catName => {
                    const catQuestions = qList.filter(q => q.category === catName);
                    if (catQuestions.length === 0) return null;

                    return (
                      <div key={catName} style={{ border: '1px solid #334155', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
                        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                          <span>Area: {catName}</span>
                          <span style={{ fontSize: '10px', backgroundColor: '#1e293b', color: '#cbd5e1', padding: '3px 10px', borderRadius: '8px', border: '1px solid #334155' }}>{catQuestions.length} Item</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {catQuestions.map((q, qIdx) => {
                            const ans = checklistData[q.id] || { status: '', note: '', photo: '' };
                            return (
                              <div key={q.id} style={{ padding: '20px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc', lineHeight: '1.5' }}>
                                    <strong style={{ color: '#64748b', marginRight: '8px' }}>{qIdx + 1}.</strong> {q.text}
                                    {q.requirePhoto && <span style={{ marginLeft: '10px', fontSize: '10px', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>Wajib Foto</span>}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', border: ans.status === 'OK' ? '1px solid #34d399' : '1px solid #334155', backgroundColor: ans.status === 'OK' ? '#1e293b' : 'transparent', color: ans.status === 'OK' ? '#34d399' : '#94a3b8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <input 
                                      type="radio" 
                                      name={`status_${q.id}`} 
                                      checked={ans.status === 'OK'}
                                      onChange={() => handleAnswerChange(q.id, 'status', 'OK')}
                                    /> OK
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', border: ans.status === 'Tidak' ? '1px solid #f87171' : '1px solid #334155', backgroundColor: ans.status === 'Tidak' ? '#1e293b' : 'transparent', color: ans.status === 'Tidak' ? '#f87171' : '#94a3b8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <input 
                                      type="radio" 
                                      name={`status_${q.id}`} 
                                      checked={ans.status === 'Tidak'}
                                      onChange={() => handleAnswerChange(q.id, 'status', 'Tidak')}
                                    /> Tidak (Masalah)
                                  </label>
                                </div>

                                {ans.status === 'Tidak' && (
                                  <div>
                                    <input 
                                      type="text"
                                      placeholder="Catatan Kendala / Tindak Lanjut (Wajib diisi)..."
                                      value={ans.note || ''}
                                      onChange={(e) => handleAnswerChange(q.id, 'note', e.target.value)}
                                      style={{ width: '100%', backgroundColor: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(248, 113, 113, 0.5)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#fff', outline: 'none' }}
                                    />
                                  </div>
                                )}

                                {q.requirePhoto && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ backgroundColor: '#334155', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #475569' }}>
                                      <Camera size={15} style={{ color: '#f87171' }} />
                                      {ans.photo ? 'Ganti Foto (Kamera)' : 'Ambil dari Kamera'}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        onChange={(e) => handlePhotoCapture(q.id, e)}
                                        style={{ display: 'none' }}
                                      />
                                    </label>

                                    <label style={{ backgroundColor: '#334155', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #475569' }}>
                                      <FolderArchive size={15} style={{ color: '#fbbf24' }} />
                                      Pilih dari Galeri
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handlePhotoCapture(q.id, e)}
                                        style={{ display: 'none' }}
                                      />
                                    </label>

                                    {ans.photo && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={ans.photo} alt="Bukti" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #475569' }} />
                                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

              <div>
                <button 
                  type="button"
                  onClick={handleSubmitChecklistForm}
                  disabled={isSubmitting}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.5 : 1 }}
                >
                  <ClipboardCheck size={18} /> {isSubmitting ? 'Menyimpan ke Cloud...' : 'Simpan & Arsipkan ke Firebase Cloud'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 5. ARSIP CLOUD */}
        {activeTab === 'history' && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderArchive size={20} style={{ color: '#dc2626' }} /> Arsip Laporan Cloud (Multi-Device)
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Semua laporan dari seluruh perangkat tersimpan secara real-time di server cloud.</p>

            {historyReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '12px', fontStyle: 'italic', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px dashed #334155' }}>
                Belum ada laporan tersimpan di database cloud.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyReports.map((rep, idx) => (
                  <div key={rep.firestore_id || idx} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#fca5a5', backgroundColor: 'rgba(220, 38, 38, 0.2)', padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                          {rep.formTitle}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rep.timestamp_readable}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                        Petugas: <strong style={{ color: '#ffffff' }}>{rep.headers?.diisiOleh}</strong> | Pemeriksa: <strong style={{ color: '#ffffff' }}>{rep.headers?.diperiksaOleh}</strong>
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => setSelectedReport(rep)}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Lihat Detail
                      </button>

                      {isAdminLoggedIn && (
                        <button 
                          onClick={() => handleDeleteReportFromCloud(rep.firestore_id)}
                          style={{ backgroundColor: 'rgba(248, 113, 113, 0.2)', color: '#fca5a5', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer' }}
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
        )}

        {/* 6. PANEL ADMIN */}
        {activeTab === 'admin_panel' && isAdminLoggedIn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #7f1d1d, #0f172a)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.3)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' }}>
                  Admin Control Panel
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Pengaturan & Editor Pertanyaan SOP</h2>
              </div>
              <ShieldCheck size={36} style={{ color: '#f87171' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { key: 'opening_lobi', label: 'FOH Opening' },
                { key: 'closing_lobi', label: 'FOH Closing' },
                { key: 'opening_kitchen', label: 'BOH Opening' },
                { key: 'closing_kitchen', label: 'BOH Closing' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setSelectedEditorTab(tab.key); setEditingQuestionId(null); setNewQText(''); }}
                  style={{ backgroundColor: selectedEditorTab === tab.key ? '#fbbf24' : '#1e293b', color: selectedEditorTab === tab.key ? '#0f172a' : '#cbd5e1', border: '1px solid #334155', padding: '9px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} style={{ color: '#fbbf24' }} /> {editingQuestionId ? 'Edit Pertanyaan SOP' : 'Tambah Pertanyaan Baru'}
                </h3>
                
                <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Pilih Kategori / Area:</label>
                    <select
                      value={newQCategory}
                      onChange={(e) => setNewQCategory(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                    >
                      {(formCategories[selectedEditorTab] || []).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Teks Pertanyaan / Checklist:</label>
                    <textarea 
                      rows={3}
                      placeholder="Tuliskan poin SOP..."
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      id="req_photo_chk"
                      checked={newQRequirePhoto}
                      onChange={(e) => setNewQRequirePhoto(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#fbbf24' }}
                    />
                    <label htmlFor="req_photo_chk" style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', cursor: 'pointer' }}>Wajib Lampirkan Foto</label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                    <button 
                      type="submit"
                      style={{ flex: 1, backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}
                    >
                      {editingQuestionId ? 'Simpan Perubahan' : 'Tambah ke SOP'}
                    </button>
                    {editingQuestionId && (
                      <button 
                        type="button"
                        onClick={() => { setEditingQuestionId(null); setNewQText(''); }}
                        style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#cbd5e1', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} style={{ color: '#fbbf24' }} /> Tambah Area / Kategori Baru
                  </h4>
                  <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      placeholder="Nama Area (e.g. GUDANG)..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                    />
                    <button type="submit" style={{ backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', fontSize: '12px', fontWeight: 'bold', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>
                      Tambah
                    </button>
                  </form>
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Daftar Pertanyaan SOP ({selectedEditorTab})</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                  {(questions[selectedEditorTab] || []).map((q, qIdx) => (
                    <div key={q.id} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '14px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>{q.category}</span>
                          {q.requirePhoto && <span style={{ fontSize: '9px', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>Wajib Foto</span>}
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#e2e8f0', margin: 0, lineHeight: '1.4' }}>
                          <strong style={{ color: '#64748b', marginRight: '6px' }}>{qIdx + 1}.</strong> {q.text}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => handleMoveQuestion(qIdx, 'up')} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }} title="Geser Atas"><ArrowUp size={13} /></button>
                        <button onClick={() => handleMoveQuestion(qIdx, 'down')} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }} title="Geser Bawah"><ArrowDown size={13} /></button>
                        <button onClick={() => { setEditingQuestionId(q.id); setNewQText(q.text); setNewQCategory(q.category); setNewQRequirePhoto(q.requirePhoto); }} style={{ padding: '6px', backgroundColor: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', borderRadius: '8px', cursor: 'pointer' }} title="Edit"><Edit3 size={13} /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} style={{ padding: '6px', backgroundColor: 'rgba(248, 113, 113, 0.2)', border: '1px solid rgba(248, 113, 113, 0.3)', color: '#f87171', borderRadius: '8px', cursor: 'pointer' }} title="Hapus"><Trash2 size={13} /></button>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>{selectedReport.formTitle}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: '8px 0 0 0' }}>Detail Laporan SOP</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div><strong style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Tanggal:</strong> {selectedReport.headers?.tanggal}</div>
              <div><strong style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Waktu Input:</strong> {selectedReport.timestamp_readable}</div>
              <div><strong style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Petugas:</strong> {selectedReport.headers?.diisiOleh}</div>
              <div><strong style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Pemeriksa:</strong> {selectedReport.headers?.diperiksaOleh}</div>
            </div>

            {selectedReport.attendance?.isSubmitted && (
              <div style={{ fontSize: '12px', backgroundColor: 'rgba(120, 53, 15, 0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ color: '#fbbf24', display: 'block' }}>Kehadiran Karyawan (FOH):</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', color: '#cbd5e1' }}>
                  <div>• Hadir: <strong style={{ color: '#fff' }}>{selectedReport.attendance.hadirCount} Orang</strong></div>
                  <div>• Sakit: <strong style={{ color: '#fff' }}>{selectedReport.attendance.sakitList?.filter(Boolean).length || 0} Orang</strong></div>
                  <div>• Izin: <strong style={{ color: '#fff' }}>{selectedReport.attendance.izinList?.filter(Boolean).length || 0} Orang</strong></div>
                  <div>• Alpha: <strong style={{ color: '#fff' }}>{selectedReport.attendance.alphaList?.filter(Boolean).length || 0} Orang</strong></div>
                </div>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 10px 0' }}>Item Pemeriksaan:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                {Object.entries(selectedReport.checklistData || {}).map(([qId, ans], idx) => {
                  const displayQuestionText = ans.questionText || `Item #${idx + 1}`;
                  const displayCategory = ans.category || 'General';

                  return (
                    <div key={idx} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '14px', border: '1px solid #334155', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.2)', width: 'fit-content' }}>{displayCategory}</span>
                        <span style={{ fontWeight: 'bold', color: '#ffffff', lineHeight: '1.4' }}>{idx + 1}. {displayQuestionText}</span>
                        <span style={{ display: 'inline-block', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', width: 'fit-content', backgroundColor: ans.status === 'OK' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)', color: ans.status === 'OK' ? '#34d399' : '#f87171', border: ans.status === 'OK' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)' }}>
                          Status: {ans.status}
                        </span>
                        {ans.note && <p style={{ color: '#cbd5e1', margin: '4px 0 0 0' }}>Catatan: {ans.note}</p>}
                      </div>
                      {ans.photo && (
                        <div onClick={() => setPreviewImage(ans.photo)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                          <img src={ans.photo} alt="Bukti" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #334155' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <button 
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ width: '100%', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '12px', borderRadius: '14px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO FULLSCREEN */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '700px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-45px', right: 0, backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '8px 12px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            <img src={previewImage} alt="Preview Bukti Full" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }} />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>Klik di luar gambar atau tombol tutup untuk keluar</p>
          </div>
        </div>
      )}

      {/* MODAL PIN LOGIN ADMIN */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', maxWidth: '340px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#dc2626' }} /> Masukkan PIN Admin
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Masukkan PIN Admin untuk mengakses Panel Editor SOP & Penghapusan Arsip.</p>
            <input 
              type="password"
              placeholder="PIN (Default: 1234)"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '4px', outline: 'none' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button 
                type="button"
                onClick={() => setShowPinModal(false)}
                style={{ flex: 1, backgroundColor: '#334155', color: '#cbd5e1', border: '1px solid #475569', padding: '12px', borderRadius: '14px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleVerifyAdminPin}
                style={{ flex: 1, backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '14px', fontWeight: 900, fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
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

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { 
  ClipboardCheck, 
  History, 
  Lock, 
  Unlock, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  UserCheck, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Check, 
  X, 
  FileText, 
  ShieldCheck, 
  Database,
  Layers
} from 'lucide-react';

// ==========================================
// KONFIGURASI FIREBASE ANDA
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCeAfwtro-qbH_ZcnMraFOXeu1kysm-Rm8",
  authDomain: "cheklist-warung-samuda.firebaseapp.com",
  projectId: "cheklist-warung-sambal-samuda",
  storageBucket: "cheklist-warung-sambal-samuda.firebasestorage.app",
  messagingSenderId: "190654796294",
  appId: "1:190654796294:web:c6e7c2999b8a2eb668e987",
  measurementId: "G-ECHVHC57L4"
};

// Inisialisasi Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Data Default Pertanyaan SOP Berdasarkan Dokumen Resmi Warung Sambal Samuda
const DEFAULT_QUESTIONS = {
  fohOpening: [
    { id: 1, categoryArea: "LOBI", text: "Lantai bersih, kering, dan tidak licin", requirePhoto: true, requireNoteIfBad: true },
    { id: 2, categoryArea: "LOBI", text: "Meja & kursi bersih, tertata rapi", requirePhoto: true, requireNoteIfBad: true },
    { id: 3, categoryArea: "LOBI", text: "Kaca dan pintu masuk bersih, bebas noda/sidik jari", requirePhoto: true, requireNoteIfBad: true },
    { id: 4, categoryArea: "LOBI", text: "Pencahayaan/lampu berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 5, categoryArea: "LOBI", text: "AC/kipas angin berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 6, categoryArea: "LOBI", text: "Sound system/musik berfungsi (jika digunakan)", requirePhoto: false, requireNoteIfBad: true },
    { id: 7, categoryArea: "LOBI", text: "Meja reception/kasir bersih dan siap operasional", requirePhoto: true, requireNoteIfBad: true },
    { id: 8, categoryArea: "LOBI", text: "Tidak ada sampah atau barang tertinggal", requirePhoto: false, requireNoteIfBad: true },
    { id: 9, categoryArea: "LOBI", text: "Dekorasi & signage rapi, tidak rusak", requirePhoto: false, requireNoteIfBad: true },
    { id: 10, categoryArea: "BAR", text: "Meja bar & counter bersih dan sudah disanitasi", requirePhoto: true, requireNoteIfBad: true },
    { id: 11, categoryArea: "BAR", text: "Peralatan bar (shaker, gelas, alat seduh, dll) bersih & siap pakai", requirePhoto: true, requireNoteIfBad: true },
    { id: 12, categoryArea: "BAR", text: "Stok minuman & bahan dicek, FIFO/FEFO diterapkan", requirePhoto: false, requireNoteIfBad: true },
    { id: 13, categoryArea: "BAR", text: "Es batu tersedia dan dalam kondisi bersih", requirePhoto: false, requireNoteIfBad: true },
    { id: 14, categoryArea: "BAR", text: "Sink bar bersih, air mengalir lancar", requirePhoto: false, requireNoteIfBad: true },
    { id: 15, categoryArea: "BAR", text: "Chiller/kulkas bar berfungsi normal, suhu sesuai standar", requirePhoto: false, requireNoteIfBad: true },
    { id: 16, categoryArea: "BAR", text: "Label bahan (tanggal buka/EXP) lengkap dan terbaca", requirePhoto: false, requireNoteIfBad: true },
    { id: 17, categoryArea: "BAR", text: "Alat pembayaran/POS berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 18, categoryArea: "PARKIR", text: "Area parkir bersih dari sampah dan kotoran", requirePhoto: false, requireNoteIfBad: true },
    { id: 19, categoryArea: "PARKIR", text: "Marka/rambu parkir terlihat jelas", requirePhoto: false, requireNoteIfBad: true },
    { id: 20, categoryArea: "PARKIR", text: "Penerangan area parkir berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 21, categoryArea: "PARKIR", text: "Akses jalan masuk/keluar tidak terhalang", requirePhoto: false, requireNoteIfBad: true },
    { id: 22, categoryArea: "PARKIR", text: "CCTV area parkir berfungsi (jika tersedia)", requirePhoto: false, requireNoteIfBad: true },
    { id: 23, categoryArea: "PARKIR", text: "Petugas/security parkir siap bertugas", requirePhoto: false, requireNoteIfBad: true },
    { id: 24, categoryArea: "TAMAN", text: "Taman bersih dari sampah, putung rokok dan daun kering berlebih", requirePhoto: false, requireNoteIfBad: true },
    { id: 25, categoryArea: "TAMAN", text: "Tanaman terawat, tidak layu atau rusak", requirePhoto: false, requireNoteIfBad: true },
    { id: 26, categoryArea: "TAMAN", text: "Jalur pejalan kaki bersih dan tidak licin", requirePhoto: false, requireNoteIfBad: true },
    { id: 27, categoryArea: "TAMAN", text: "Lampu taman sudah dimatikan", requirePhoto: false, requireNoteIfBad: true },
    { id: 28, categoryArea: "TAMAN", text: "Area kolam bersih dari sampah dan kotoran", requirePhoto: false, requireNoteIfBad: true },
    { id: 29, categoryArea: "TAMAN", text: "Taman disiram", requirePhoto: false, requireNoteIfBad: true },
    { id: 30, categoryArea: "TOILET", text: "Lantai toilet bersih, kering, dan tidak licin", requirePhoto: true, requireNoteIfBad: true },
    { id: 31, categoryArea: "TOILET", text: "Kloset & wastafel bersih dan sudah disanitasi", requirePhoto: true, requireNoteIfBad: true },
    { id: 32, categoryArea: "TOILET", text: "Sabun cuci tangan dan tisu tersedia", requirePhoto: false, requireNoteIfBad: true },
    { id: 33, categoryArea: "TOILET", text: "Tempat sampah tersedia dan tidak penuh", requirePhoto: false, requireNoteIfBad: true },
    { id: 34, categoryArea: "TOILET", text: "Cermin bersih, bebas noda", requirePhoto: false, requireNoteIfBad: true },
    { id: 35, categoryArea: "TOILET", text: "Air mengalir lancar, tidak ada kebocoran", requirePhoto: false, requireNoteIfBad: true },
    { id: 36, categoryArea: "TOILET", text: "Pengharum ruangan/exhaust fan berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 37, categoryArea: "TOILET", text: "Pintu & kunci toilet berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 38, categoryArea: "MUSHOLAH", text: "Lantai musholah bersih, kering, dan tidak licin", requirePhoto: false, requireNoteIfBad: true },
    { id: 39, categoryArea: "MUSHOLAH", text: "Karpet/sajadah bersih dan tertata rapi", requirePhoto: false, requireNoteIfBad: true },
    { id: 40, categoryArea: "MUSHOLAH", text: "Mukena & sarung bersih dan tersedia", requirePhoto: false, requireNoteIfBad: true },
    { id: 41, categoryArea: "MUSHOLAH", text: "Al-Qur'an dan perlengkapan ibadah tertata rapi", requirePhoto: false, requireNoteIfBad: true },
    { id: 42, categoryArea: "MUSHOLAH", text: "Tempat wudhu bersih, air mengalir lancar", requirePhoto: false, requireNoteIfBad: true },
    { id: 43, categoryArea: "MUSHOLAH", text: "Sandal/rak sandal tertata rapi", requirePhoto: false, requireNoteIfBad: true },
    { id: 44, categoryArea: "MUSHOLAH", text: "Pencahayaan musholah berfungsi normal", requirePhoto: false, requireNoteIfBad: true }
  ],
  fohClosing: [
    { id: 45, categoryArea: "LOBI", text: "Lantai disapu dan dipel", requirePhoto: true, requireNoteIfBad: true },
    { id: 46, categoryArea: "LOBI", text: "Meja & kursi dirapikan dan dibersihkan", requirePhoto: true, requireNoteIfBad: true },
    { id: 47, categoryArea: "LOBI", text: "Sampah dibuang, tempat sampah dikosongkan", requirePhoto: true, requireNoteIfBad: true },
    { id: 48, categoryArea: "LOBI", text: "Kaca dan pintu masuk dibersihkan dari noda", requirePhoto: false, requireNoteIfBad: true },
    { id: 49, categoryArea: "LOBI", text: "Lampu dimatikan sesuai jadwal (kecuali lampu keamanan)", requirePhoto: false, requireNoteIfBad: true },
    { id: 50, categoryArea: "LOBI", text: "AC/kipas angin dimatikan", requirePhoto: false, requireNoteIfBad: true },
    { id: 51, categoryArea: "LOBI", text: "Meja kasir/reception ditutup rapi, uang/kas diamankan", requirePhoto: true, requireNoteIfBad: true },
    { id: 52, categoryArea: "LOBI", text: "Laci kasir dipastikan terkunci", requirePhoto: false, requireNoteIfBad: true },
    { id: 53, categoryArea: "LOBI", text: "Tidak ada barang berharga tertinggal di area lobi", requirePhoto: false, requireNoteIfBad: true },
    { id: 54, categoryArea: "BAR", text: "Peralatan bar dicuci bersih dan disimpan pada tempatnya", requirePhoto: true, requireNoteIfBad: true },
    { id: 55, categoryArea: "BAR", text: "Sisa bahan/minuman disimpan sesuai standar & diberi label", requirePhoto: true, requireNoteIfBad: true },
    { id: 56, categoryArea: "BAR", text: "Counter & meja bar dibersihkan dan disanitasi", requirePhoto: true, requireNoteIfBad: true },
    { id: 57, categoryArea: "BAR", text: "Sampah dibuang, tempat sampah dikosongkan", requirePhoto: false, requireNoteIfBad: true },
    { id: 58, categoryArea: "BAR", text: "Chiller bar berfungsi dan tetap menyala", requirePhoto: false, requireNoteIfBad: true },
    { id: 59, categoryArea: "BAR", text: "Kran air bar dipastikan tertutup", requirePhoto: false, requireNoteIfBad: true },
    { id: 60, categoryArea: "BAR", text: "Kasir/POS bar di-closing, uang/kas diamankan", requirePhoto: true, requireNoteIfBad: true },
    { id: 61, categoryArea: "BAR", text: "Peralatan listrik bar yang tidak diperlukan dimatikan", requirePhoto: false, requireNoteIfBad: true },
    { id: 62, categoryArea: "PARKIR", text: "Area parkir dipastikan kosong dari kendaraan tertinggal", requirePhoto: false, requireNoteIfBad: true },
    { id: 63, categoryArea: "PARKIR", text: "Sampah di area parkir dibersihkan", requirePhoto: false, requireNoteIfBad: true },
    { id: 64, categoryArea: "PARKIR", text: "Palang/portal parkir dirantai dan dikunci", requirePhoto: false, requireNoteIfBad: true },
    { id: 65, categoryArea: "PARKIR", text: "Lampu parkir diatur sesuai kebutuhan keamanan malam", requirePhoto: false, requireNoteIfBad: true },
    { id: 66, categoryArea: "PARKIR", text: "Tidak ada barang mencurigakan/tertinggal di area parkir", requirePhoto: false, requireNoteIfBad: true },
    { id: 67, categoryArea: "PARKIR", text: "CCTV dipastikan tetap menyala & merekam", requirePhoto: false, requireNoteIfBad: true },
    { id: 68, categoryArea: "TAMAN", text: "Taman dibersihkan dari sampah pengunjung", requirePhoto: false, requireNoteIfBad: true },
    { id: 69, categoryArea: "TAMAN", text: "Lampu taman diatur sesuai kebutuhan keamanan malam", requirePhoto: false, requireNoteIfBad: true },
    { id: 70, categoryArea: "TAMAN", text: "Gazebo / Tempat istirahat karyawan dirapikan kembali", requirePhoto: false, requireNoteIfBad: true },
    { id: 71, categoryArea: "TAMAN", text: "Tidak ada barang tertinggal milik pengunjung", requirePhoto: false, requireNoteIfBad: true },
    { id: 72, categoryArea: "TAMAN", text: "Keran/selang air taman dipastikan tertutup rapat", requirePhoto: false, requireNoteIfBad: true },
    { id: 73, categoryArea: "TAMAN", text: "Pastikan tidak ada api/rokok menyala tertinggal di taman", requirePhoto: false, requireNoteIfBad: true },
    { id: 74, categoryArea: "TOILET", text: "Toilet dibersihkan dan disanitasi ulang", requirePhoto: true, requireNoteIfBad: true },
    { id: 75, categoryArea: "TOILET", text: "Sampah dibuang, tempat sampah dikosongkan", requirePhoto: false, requireNoteIfBad: true },
    { id: 76, categoryArea: "TOILET", text: "Persediaan sabun & tisu dicek untuk kebutuhan besok", requirePhoto: false, requireNoteIfBad: true },
    { id: 77, categoryArea: "TOILET", text: "Lampu toilet dimatikan (kecuali diperlukan untuk keamanan)", requirePhoto: false, requireNoteIfBad: true },
    { id: 78, categoryArea: "TOILET", text: "Kran air dipastikan tertutup rapat, tidak ada kebocoran", requirePhoto: false, requireNoteIfBad: true },
    { id: 79, categoryArea: "TOILET", text: "Kaca dan wastafel toilet bersih dan bebas dari noda", requirePhoto: false, requireNoteIfBad: true },
    { id: 80, categoryArea: "MUSHOLAH", text: "Lantai musholah disapu dan dipel", requirePhoto: false, requireNoteIfBad: true },
    { id: 81, categoryArea: "MUSHOLAH", text: "Karpet/sajadah dirapikan kembali", requirePhoto: false, requireNoteIfBad: true },
    { id: 82, categoryArea: "MUSHOLAH", text: "Mukena & sarung dirapikan dan disimpan", requirePhoto: false, requireNoteIfBad: true },
    { id: 83, categoryArea: "MUSHOLAH", text: "Sampah dibuang, tempat sampah dikosongkan", requirePhoto: false, requireNoteIfBad: true },
    { id: 84, categoryArea: "MUSHOLAH", text: "Tempat wudhu dibersihkan, kran air dipastikan tertutup", requirePhoto: false, requireNoteIfBad: true },
    { id: 85, categoryArea: "MUSHOLAH", text: "Sandal/rak sandal dirapikan", requirePhoto: false, requireNoteIfBad: true },
    { id: 86, categoryArea: "MUSHOLAH", text: "Lampu musholah dimatikan (kecuali diperlukan untuk keamanan)", requirePhoto: false, requireNoteIfBad: true }
  ],
  bohOpening: [
    { id: 87, categoryArea: "KITCHEN", text: "Team lengkap, briefing selesai, uniform & hygiene sesuai standar", requirePhoto: true, requireNoteIfBad: true },
    { id: 88, categoryArea: "KITCHEN", text: "Area kitchen (lantai, meja kerja, sink, tempat sampah, saluran air) bersih", requirePhoto: true, requireNoteIfBad: true },
    { id: 89, categoryArea: "KITCHEN", text: "Tidak ada tanda-tanda hama", requirePhoto: false, requireNoteIfBad: true },
    { id: 90, categoryArea: "KITCHEN", text: "Kompor, gas, rice cooker/warmer berfungsi normal & tidak bocor", requirePhoto: true, requireNoteIfBad: true },
    { id: 91, categoryArea: "KITCHEN", text: "Chiller & freezer berfungsi normal", requirePhoto: true, requireNoteIfBad: true },
    { id: 92, categoryArea: "KITCHEN", text: "Pisau, cutting board, container, alat preparation siap pakai", requirePhoto: false, requireNoteIfBad: true },
    { id: 93, categoryArea: "KITCHEN", text: "Suhu chiller sesuai standar", requirePhoto: false, requireNoteIfBad: true },
    { id: 94, categoryArea: "KITCHEN", text: "Suhu freezer sesuai standar", requirePhoto: false, requireNoteIfBad: true },
    { id: 95, categoryArea: "KITCHEN", text: "Bahan baku tersedia, kondisi fisik/aroma/warna baik, EXP terkontrol", requirePhoto: true, requireNoteIfBad: true },
    { id: 96, categoryArea: "KITCHEN", text: "FIFO/FEFO diterapkan; bahan tidak layak dipisahkan & dicatat sebagai waste", requirePhoto: false, requireNoteIfBad: true },
    { id: 97, categoryArea: "KITCHEN", text: "Preparation sesuai marketlist, forecast, resep & gramasi", requirePhoto: false, requireNoteIfBad: true },
    { id: 98, categoryArea: "KITCHEN", text: "Label preparation lengkap (nama, tanggal/jam, EXP/holding time)", requirePhoto: false, requireNoteIfBad: true },
    { id: 99, categoryArea: "KITCHEN", text: "Jumlah nasi sesuai buffer (weekday/weekend), batch tercatat", requirePhoto: false, requireNoteIfBad: true },
    { id: 100, categoryArea: "KITCHEN", text: "Station siap untuk operasional", requirePhoto: true, requireNoteIfBad: true }
  ],
  bohClosing: [
    { id: 101, categoryArea: "KITCHEN", text: "Seluruh pesanan berjalan sudah selesai, tidak ada pekerjaan tertinggal", requirePhoto: true, requireNoteIfBad: true },
    { id: 102, categoryArea: "KITCHEN", text: "Bahan sisa dicek, dipisahkan (layak/tidak layak), FIFO/FEFO diterapkan", requirePhoto: true, requireNoteIfBad: true },
    { id: 103, categoryArea: "KITCHEN", text: "Bahan yang dibuka diberi label & disimpan sesuai Dry Storage/Chiller/Freezer", requirePhoto: false, requireNoteIfBad: true },
    { id: 104, categoryArea: "KITCHEN", text: "Container tertutup rapat; tidak ada bahan rusak/basi/expired disimpan", requirePhoto: false, requireNoteIfBad: true },
    { id: 105, categoryArea: "KITCHEN", text: "Sisa nasi putih & nasi uduk dihitung dan dicatat", requirePhoto: false, requireNoteIfBad: true },
    { id: 106, categoryArea: "KITCHEN", text: "Waste (bahan & nasi) dicatat lengkap di Form Pencatatan Waste", requirePhoto: false, requireNoteIfBad: true },
    { id: 107, categoryArea: "KITCHEN", text: "Area kerja, kompor, rice cooker/warmer, sink, alat, lantai dibersihkan", requirePhoto: true, requireNoteIfBad: true },
    { id: 108, categoryArea: "KITCHEN", text: "Tempat sampah dikosongkan; peralatan kering & tersimpan pada tempatnya", requirePhoto: false, requireNoteIfBad: true },
    { id: 109, categoryArea: "KITCHEN", text: "Pintu chiller/freezer tertutup rapat; suhu closing dicatat", requirePhoto: false, requireNoteIfBad: true },
    { id: 110, categoryArea: "KITCHEN", text: "Bahan tersusun rapi, tidak diletakkan langsung di lantai", requirePhoto: false, requireNoteIfBad: true },
    { id: 111, categoryArea: "KITCHEN", text: "Stok kritis / hampir habis / slow moving dicek & dilaporkan ke Store Manager (PIC)", requirePhoto: false, requireNoteIfBad: true },
    { id: 112, categoryArea: "KITCHEN", text: "Kompor & gas mati/tertutup; listrik tidak perlu dimatikan; air ditutup", requirePhoto: true, requireNoteIfBad: true },
    { id: 113, categoryArea: "KITCHEN", text: "Chiller & freezer tetap menyala; pintu storage tertutup", requirePhoto: false, requireNoteIfBad: true },
    { id: 114, categoryArea: "KITCHEN", text: "Tidak ada sumber panas/api tertinggal, tidak ada kebocoran air/gas", requirePhoto: true, requireNoteIfBad: true },
    { id: 115, categoryArea: "KITCHEN", text: "Kitchen siap ditinggalkan", requirePhoto: true, requireNoteIfBad: true }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fohOpening');
  const [staffName, setStaffName] = useState('');
  
  // State Absensi FOH/BOH
  const [attendance, setAttendance] = useState({
    totalHadir: '',
    listNama: '',
    submitted: false
  });

  // State Pertanyaan SOP & Kategori Dinamis
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [customCategories, setCustomCategories] = useState({
    fohOpening: ["LOBI", "BAR", "PARKIR", "TAMAN", "TOILET", "MUSHOLAH"],
    fohClosing: ["LOBI", "BAR", "PARKIR", "TAMAN", "TOILET", "MUSHOLAH"],
    bohOpening: ["KITCHEN"],
    bohClosing: ["KITCHEN"]
  });

  // State Jawaban Checklist
  const [answers, setAnswers] = useState({});
  
  // State Riwayat Laporan (Tersinkronisasi ke Firebase)
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State Admin & Modal
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  
  // Form Editor Pertanyaan
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQText, setNewQText] = useState('');
  const [newQCategoryTab, setNewQCategoryTab] = useState('fohOpening');
  const [newQCategoryArea, setNewQCategoryArea] = useState('LOBI');
  const [newQReqPhoto, setNewQReqPhoto] = useState(true);
  const [newQReqNote, setNewQReqNote] = useState(true);
  const [newAreaInput, setNewAreaInput] = useState('');

  // Load Riwayat dari Firebase saat aplikasi dibuka
  useEffect(() => {
    fetchHistoryFromFirebase();
  }, []);

  const fetchHistoryFromFirebase = async () => {
    if (!db) return;
    setLoadingHistory(true);
    try {
      const querySnapshot = await getDocs(collection(db, "sop_reports"));
      const loadedHistory = [];
      querySnapshot.forEach((docSnap) => {
        loadedHistory.push({ id: docSnap.id, ...docSnap.data() });
      });
      loadedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(loadedHistory);
    } catch (e) {
      console.error("Gagal mengambil data dari Firebase:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    if (!attendance.totalHadir || !attendance.listNama) {
      alert("Harap isi jumlah hadir dan nama staff!");
      return;
    }
    setAttendance(prev => ({ ...prev, submitted: true }));
  };

  // Kompresi Foto Otomatis agar muat di Database Firebase tanpa lag
  const handlePhotoCapture = (qId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
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
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setAnswers(prev => ({
            ...prev,
            [qId]: { ...(prev[qId] || { status: 'OK' }), photo: compressedDataUrl }
          }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (qId, status) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), status }
    }));
  };

  const handleInputChange = (qId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { status: 'OK' }), [field]: value }
    }));
  };

  const handleSubmitReport = async () => {
    if (!staffName.trim()) {
      alert("Harap masukkan Nama Petugas terlebih dahulu!");
      return;
    }

    const currentQuestions = questions[activeTab] || [];
    
    for (let q of currentQuestions) {
      const ans = answers[q.id];
      if (!ans || !ans.status) {
        alert(`Pertanyaan "${q.text}" belum dijawab!`);
        return;
      }
      if (q.requirePhoto && !ans.photo) {
        alert(`Pertanyaan "${q.text}" wajib menyertakan bukti foto!`);
        return;
      }
      if (ans.status === 'Tidak' && (!ans.note || !ans.note.trim() || !ans.followUp || !ans.followUp.trim())) {
        alert(`Pertanyaan "${q.text}" berstatus "Tidak" wajib mengisi Catatan dan Tindak Lanjut!`);
        return;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const reportData = {
      category: activeTab,
      staffName: staffName.trim(),
      attendance: attendance,
      answers: answers,
      dateStr: todayStr,
      timestamp: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, "sop_reports"), reportData);
      }
      setHistory(prev => [reportData, ...prev]);
      alert("Berhasil! Laporan & foto telah tersimpan ke Database Firebase Cloud dan dapat diakses dari semua perangkat.");
      setAnswers({});
      setStaffName('');
      setAttendance({ totalHadir: '', listNama: '', submitted: false });
    } catch (e) {
      console.error("Gagal menyimpan ke Firebase:", e);
      alert("Gagal menyimpan ke database server. Periksa koneksi internet Anda.");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      alert("Login Admin Berhasil!");
    } else {
      alert("PIN Salah! Gunakan PIN default: 1234");
    }
  };

  const handleAddNewArea = (e) => {
    e.preventDefault();
    if (!newAreaInput.trim()) return;
    const upperArea = newAreaInput.trim().toUpperCase();
    const currentAreas = customCategories[newQCategoryTab] || [];
    if (currentAreas.includes(upperArea)) {
      alert("Area/Kategori tersebut sudah ada!");
      return;
    }
    setCustomCategories({
      ...customCategories,
      [newQCategoryTab]: [...currentAreas, upperArea]
    });
    setNewQCategoryArea(upperArea);
    setNewAreaInput('');
    alert(`Area "${upperArea}" berhasil ditambahkan!`);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const updatedCategoryQuestions = [...(questions[newQCategoryTab] || [])];

    if (editingQuestion) {
      const index = updatedCategoryQuestions.findIndex(q => q.id === editingQuestion.id);
      if (index !== -1) {
        updatedCategoryQuestions[index] = {
          ...editingQuestion,
          categoryArea: newQCategoryArea,
          text: newQText,
          requirePhoto: newQReqPhoto,
          requireNoteIfBad: newQReqNote
        };
      }
    } else {
      const newId = Date.now();
      updatedCategoryQuestions.push({
        id: newId,
        categoryArea: newQCategoryArea,
        text: newQText,
        requirePhoto: newQReqPhoto,
        requireNoteIfBad: newQReqNote
      });
    }

    setQuestions({
      ...questions,
      [newQCategoryTab]: updatedCategoryQuestions
    });

    setEditingQuestion(null);
    setNewQText('');
    alert("Pertanyaan berhasil disimpan!");
  };

  const handleDeleteQuestion = (cat, id) => {
    if (window.confirm("Yakin ingin menghapus pertanyaan ini?")) {
      setQuestions({
        ...questions,
        [cat]: questions[cat].filter(q => q.id !== id)
      });
    }
  };

  const handleMoveQuestion = (cat, index, direction) => {
    const list = [...questions[cat]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setQuestions({ ...questions, [cat]: list });
  };

  // Cek apakah form aktif sudah diinput hari ini
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isAlreadySubmittedToday = history.some(item => 
    item.category === activeTab && item.dateStr === todayDateStr
  );

  // Filter riwayat hari ini untuk ditampilkan di bagian bawah dashboard
  const todayHistoryList = history.filter(item => item.dateStr === todayDateStr);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfbf7', fontFamily: 'Inter, sans-serif', paddingBottom: '50px', color: '#2d1810' }}>
      
      {/* HEADER UTAMA DENGAN TEMA WARNA & LOGO */}
      <header style={{ 
        background: 'linear-gradient(135deg, #b71c1c 0%, #880e4f 100%)', 
        color: 'white', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 4px 12px rgba(183, 28, 28, 0.25)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: 'white', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            overflow: 'hidden', 
            border: '2px solid #ffcdd2', 
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)' 
          }}>
            <img 
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150" 
              alt="Logo Sambal Samuda" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>WARUNG SAMBAL SAMUDA</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.95, fontWeight: '600', color: '#ffecb3', letterSpacing: '1px' }}>PEDASNYA DASSS!!!!!</p>
          </div>
        </div>
        <div>
          {isAdmin ? (
            <button 
              onClick={() => setIsAdmin(false)} 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.4)', 
                padding: '8px 14px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} /> Keluar Admin
            </button>
          ) : (
            <button 
              onClick={() => setShowPinModal(true)} 
              style={{ 
                backgroundColor: 'white', 
                color: '#b71c1c', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '700', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <Lock size={16} /> Login Admin
            </button>
          )}
        </div>
      </header>

      {/* NAVIGASI UTAMA DENGAN IKON */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', overflowX: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        {[
          { key: 'fohOpening', label: 'FOH Opening', icon: <ClipboardCheck size={18} /> },
          { key: 'fohClosing', label: 'FOH Closing', icon: <ClipboardCheck size={18} /> },
          { key: 'bohOpening', label: 'BOH Opening', icon: <ClipboardCheck size={18} /> },
          { key: 'bohClosing', label: 'BOH Closing', icon: <ClipboardCheck size={18} /> },
          { key: 'history', label: 'Riwayat Arsip', icon: <History size={18} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '14px 18px',
              backgroundColor: activeTab === tab.key ? '#fff5f5' : 'transparent',
              color: activeTab === tab.key ? '#b71c1c' : '#616161',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #b71c1c' : '3px solid transparent',
              fontWeight: activeTab === tab.key ? '700' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '850px', margin: '24px auto', padding: '0 16px' }}>
        
        {/* KELOLA PERTANYAAN (ADMIN PANEL) */}
        {isAdmin && activeTab !== 'history' && (
          <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082', padding: '18px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(255, 193, 7, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f57f17', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} /> Panel Admin: Pengaturan Area & SOP
              </h3>
              <button 
                onClick={() => {
                  setEditingQuestion(null);
                  setNewQText('');
                  setShowQuestionManager(!showQuestionManager);
                }}
                style={{ backgroundColor: '#ff8f00', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                {showQuestionManager ? 'Tutup Pengaturan' : '➕ Kelola Pertanyaan & Area'}
              </button>
            </div>

            {showQuestionManager && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #ffe082', paddingTop: '16px' }}>
                
                {/* Fitur Tambah Area Baru */}
                <div style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffe082' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} /> Tambah Area / Kategori Baru di Tab Aktif ({activeTab})
                  </h4>
                  <form onSubmit={handleAddNewArea} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      value={newAreaInput} 
                      onChange={(e) => setNewAreaInput(e.target.value)} 
                      placeholder="Nama Area Baru (Contoh: GUDANG, TERAS)..." 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                    />
                    <button type="submit" style={{ backgroundColor: '#e65100', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      Tambah Area
                    </button>
                  </form>
                </div>

                {/* Form Tambah/Edit Pertanyaan */}
                <form onSubmit={handleSaveQuestion} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
                    {editingQuestion ? 'Edit Pertanyaan SOP' : 'Tambah Pertanyaan SOP Baru'}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Tab Formulir:</label>
                      <select 
                        value={newQCategoryTab} 
                        onChange={(e) => {
                          setNewQCategoryTab(e.target.value);
                          const firstArea = (customCategories[e.target.value] || [])[0] || 'LOBI';
                          setNewQCategoryArea(firstArea);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                      >
                        <option value="fohOpening">FOH Opening</option>
                        <option value="fohClosing">FOH Closing</option>
                        <option value="bohOpening">BOH Opening</option>
                        <option value="bohClosing">BOH Closing</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Pilih Area / Kategori:</label>
                      <select 
                        value={newQCategoryArea} 
                        onChange={(e) => setNewQCategoryArea(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                      >
                        {(customCategories[newQCategoryTab] || []).map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Teks Pertanyaan / Item Checklist:</label>
                    <input 
                      type="text" 
                      value={newQText} 
                      onChange={(e) => setNewQText(e.target.value)} 
                      placeholder="Contoh: Kebersihan lantai..." 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newQReqPhoto} onChange={(e) => setNewQReqPhoto(e.target.checked)} /> Wajib Foto
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newQReqNote} onChange={(e) => setNewQReqNote(e.target.checked)} /> Wajib Catatan jika "Tidak"
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      {editingQuestion ? 'Simpan Perubahan' : 'Tambah ke Daftar'}
                    </button>
                    {editingQuestion && (
                      <button type="button" onClick={() => { setEditingQuestion(null); setNewQText(''); }} style={{ backgroundColor: '#757575', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                <h4 style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: '700' }}>Daftar Pertanyaan di Kategori Aktif ({activeTab}):</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {(questions[activeTab] || []).map((q, idx) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                      <div style={{ fontSize: '13px', flex: 1 }}>
                        <span style={{ backgroundColor: '#ffe0b2', color: '#e65100', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', marginRight: '8px' }}>{q.categoryArea}</span>
                        {idx + 1}. {q.text}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleMoveQuestion(activeTab, idx, 'up')} title="Geser ke Atas" style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5' }}><ChevronUp size={14} /></button>
                        <button onClick={() => handleMoveQuestion(activeTab, idx, 'down')} title="Geser ke Bawah" style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5' }}><ChevronDown size={14} /></button>
                        <button onClick={() => { setEditingQuestion(q); setNewQText(q.text); setNewQCategoryTab(activeTab); setNewQCategoryArea(q.categoryArea || 'LOBI'); setNewQReqPhoto(q.requirePhoto); setNewQReqNote(q.requireNoteIfBad); }} style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteQuestion(activeTab, q.id)} style={{ backgroundColor: '#c62828', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB RIWAYAT ARSIR / ARSIP */}
        {activeTab === 'history' ? (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, color: '#2d1810', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={22} color="#b71c1c" /> Riwayat Arsip Cloud Database
                </h2>
                <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Semua laporan dari seluruh perangkat tersimpan secara real-time di server.</p>
              </div>
              <button 
                onClick={fetchHistoryFromFirebase} 
                style={{ 
                  backgroundColor: '#b71c1c', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 2px 6px rgba(183, 28, 28, 0.2)'
                }}
              >
                <RefreshCw size={16} /> Perbarui Data Cloud
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Memuat data arsip cloud...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#777', fontStyle: 'italic' }}>Belum ada riwayat laporan tersimpan di database.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((item, index) => (
                  <div key={index} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px', backgroundColor: '#faf9f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '12px', alignItems: 'center' }}>
                      <div>
                        <span style={{ backgroundColor: '#ffebee', color: '#b71c1c', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', textTransform: 'uppercase', fontSize: '12px' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '13px', color: '#444', marginLeft: '12px' }}>Petugas: <strong>{item.staffName}</strong></span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>

                    {item.attendance && (
                      <div style={{ fontSize: '13px', backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={16} /> <strong>Kehadiran:</strong> {item.attendance.totalHadir} Orang ({item.attendance.listNama})
                      </div>
                    )}

                    <div style={{ fontSize: '13px', marginTop: '10px' }}>
                      <strong style={{ display: 'block', marginBottom: '6px' }}>Detail Checklist:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {Object.entries(item.answers || {}).map(([qId, ans]) => (
                          <div key={qId} style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: ans.status === 'OK' ? '#2e7d32' : '#c62828' }}>
                                [{ans.status}]
                              </span>
                              {ans.note && <span style={{ marginLeft: '8px', color: '#555' }}>| Catatan: {ans.note}</span>}
                              {ans.followUp && <span style={{ marginLeft: '8px', color: '#555' }}>| Tindak Lanjut: {ans.followUp}</span>}
                            </div>
                            {ans.photo && (
                              <img src={ans.photo} alt="Bukti" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* FORM CHECKLIST UTAMA & ABSENSI */
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            
            {/* Status Sudah Diinput Hari Ini */}
            {isAlreadySubmittedToday && (
              <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32' }}>
                <CheckCircle2 size={20} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Form {activeTab} sudah berhasil diinput untuk hari ini ({todayDateStr}). Anda tetap dapat melakukan pengisian ulang jika diperlukan.</span>
              </div>
            )}

            {/* FORM ABSENSI */}
            {!attendance.submitted ? (
              <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe0b2', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(255,193,7,0.1)' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#f57f17', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} /> Daftar Kehadiran Karyawan Wajib Diisi
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 14px 0' }}>Form checklist dikunci sampai Anda mengisi dan menyimpan absensi staf hari ini.</p>
                
                <form onSubmit={handleAttendanceSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Jumlah Hadir (Orang):</label>
                    <input 
                      type="number" 
                      value={attendance.totalHadir} 
                      onChange={(e) => setAttendance({ ...attendance, totalHadir: e.target.value })} 
                      placeholder="Contoh: 5" 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                      required 
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Nama-nama Staff yang Hadir:</label>
                    <textarea 
                      value={attendance.listNama} 
                      onChange={(e) => setAttendance({ ...attendance, listNama: e.target.value })} 
                      placeholder="Contoh: Budi, Siti, Andi..." 
                      rows="2"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                      required 
                    />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', width: '100%', boxShadow: '0 2px 6px rgba(46,125,50,0.3)' }}>
                    Simpan Kehadiran
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: '#e8f5e9', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1b5e20' }}>
                  <UserCheck size={22} />
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>Kehadiran Tersimpan: {attendance.totalHadir} Orang</strong>
                    <span style={{ fontSize: '13px' }}>{attendance.listNama}</span>
                  </div>
                </div>
                <button onClick={() => setAttendance({ ...attendance, submitted: false })} style={{ background: '#fff', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  Edit Data Kehadiran
                </button>
              </div>
            )}

            <h2 style={{ fontSize: '20px', marginTop: 0, textTransform: 'capitalize', color: '#2d1810', marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px' }}>
              Form Checklist: {activeTab.replace(/([A-Z])/g, ' $1')}
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>Nama Petugas Pemeriksa:</label>
              <input 
                type="text" 
                value={staffName} 
                onChange={(e) => setStaffName(e.target.value)} 
                placeholder="Masukkan nama lengkap Anda..." 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                required 
              />
            </div>

            {/* PENGELOMPOKKAN PERTANYAAN BERDASARKAN AREA / KATEGORI */}
            {(() => {
              const currentList = questions[activeTab] || [];
              const areas = customCategories[activeTab] || [...new Set(currentList.map(q => q.categoryArea || 'UMUM'))];

              return areas.map(areaName => {
                const areaQuestions = currentList.filter(q => (q.categoryArea || 'UMUM') === areaName);
                if (areaQuestions.length === 0) return null;

                return (
                  <div key={areaName} style={{ marginBottom: '28px' }}>
                    <div style={{ backgroundColor: '#b71c1c', color: 'white', padding: '10px 16px', borderRadius: '8px 8px 0 0', fontWeight: '700', fontSize: '14px', letterSpacing: '0.5px' }}>
                      AREA / KATEGORI: {areaName}
                    </div>

                    <div style={{ border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {areaQuestions.map((q, index) => {
                        const ans = answers[q.id] || { status: 'OK', photo: '', note: '', followUp: '' };
                        return (
                          <div key={q.id} style={{ border: '1px solid #eee', padding: '16px', borderRadius: '10px', backgroundColor: '#faf9f5' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#222', lineHeight: '1.4' }}>
                              {index + 1}. {q.text} {q.requirePhoto && <span style={{ color: '#d32f2f', fontSize: '12px', fontWeight: '700' }}>(Wajib Foto)</span>}
                            </p>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                              <label style={{ cursor: 'pointer', fontSize: '14px', fontWeight: ans.status === 'OK' ? '700' : 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="radio" 
                                  name={`status_${q.id}`} 
                                  checked={ans.status === 'OK'} 
                                  onChange={() => handleStatusChange(q.id, 'OK')} 
                                /> OK (Sesuai)
                              </label>
                              <label style={{ cursor: 'pointer', fontSize: '14px', fontWeight: ans.status === 'Tidak' ? '700' : 'normal', color: ans.status === 'Tidak' ? '#c62828' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="radio" 
                                  name={`status_${q.id}`} 
                                  checked={ans.status === 'Tidak'} 
                                  onChange={() => handleStatusChange(q.id, 'Tidak')} 
                                /> Tidak (Bermasalah)
                              </label>
                            </div>

                            {ans.status === 'Tidak' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                                <input 
                                  type="text" 
                                  placeholder="Catatan Kendala / Masalah (Wajib Diisi)..." 
                                  value={ans.note} 
                                  onChange={(e) => handleInputChange(q.id, 'note', e.target.value)}
                                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '13px' }}
                                  required
                                />
                                <input 
                                  type="text" 
                                  placeholder="Tindakan Perbaikan / Tindak Lanjut (Wajib Diisi)..." 
                                  value={ans.followUp} 
                                  onChange={(e) => handleInputChange(q.id, 'followUp', e.target.value)}
                                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '13px' }}
                                  required
                                />
                              </div>
                            )}

                            <div>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #ccc', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                                <Camera size={16} /> {ans.photo ? 'Ganti Foto Bukti' : 'Ambil Foto Kamera'}
                                <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(q.id, e)} style={{ display: 'none' }} />
                              </label>
                              {ans.photo && (
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img src={ans.photo} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc' }} />
                                  <span style={{ fontSize: '13px', color: '#2e7d32', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={16} /> Foto terlampir & terkompresi
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}

            <button 
              onClick={handleSubmitReport} 
              style={{ width: '100%', marginTop: '20px', backgroundColor: '#b71c1c', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(183, 28, 28, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              🚀 Simpan & Arsipkan ke Database Firebase Cloud
            </button>

            {/* RINGKASAN LAPORAN HARI INI DI BAGIAN BAWAH BERANDA */}
            <div style={{ marginTop: '36px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#2d1810', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#b71c1c" /> Ringkasan Laporan Hari Ini ({todayDateStr})
              </h3>
              {todayHistoryList.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#777', fontStyle: 'italic' }}>Belum ada laporan yang diinput untuk form ini hari ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {todayHistoryList.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f5f5f5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#b71c1c', fontSize: '14px' }}>{item.category.toUpperCase()}</strong>
                        <span style={{ fontSize: '13px', marginLeft: '10px' }}>Petugas: <strong>{item.staffName}</strong></span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '700', backgroundColor: '#e8f5e9', padding: '4px 8px', borderRadius: '4px' }}>
                        ✓ Berhasil Disimpan ({new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* MODAL LOGIN ADMIN */}
      {showPinModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="#b71c1c" /> Masukkan PIN Admin
            </h3>
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value)} 
                placeholder="PIN (Default: 1234)" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '16px', boxSizing: 'border-box', fontSize: '14px' }}
                autoFocus
                required 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowPinModal(false)} style={{ backgroundColor: '#e0e0e0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Batal</button>
                <button type="submit" style={{ backgroundColor: '#b71c1c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

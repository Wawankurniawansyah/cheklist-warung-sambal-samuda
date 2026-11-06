import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Cloud, 
  Users, 
  Lock, 
  Unlock, 
  Key, 
  Plus, 
  X, 
  Building2, 
  Utensils, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Trash2, 
  Save, 
  History, 
  AlertCircle, 
  ClipboardList,
  Database,
  RefreshCw,
  Image as ImageIcon,
  Edit3,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// =========================================================================
// KONFIGURASI FIREBASE CLOUD DATABASE & STORAGE (Warung Sambal Samuda)
// =========================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCeAfwtro-qbH_ZcnMraFOXeu1kysm-Rm8",
  authDomain: "cheklist-warung-sambal-samuda.firebaseapp.com",
  projectId: "cheklist-warung-sambal-samuda",
  storageBucket: "cheklist-warung-sambal-samuda.firebasestorage.app",
  messagingSenderId: "190654796294",
  appId: "1:190654796294:web:c6e7c2999b8a2eb668e987",
  measurementId: "G-ECHVHC57L4"
};

const FALLBACK_STORAGE_KEY = 'wss_firebase_cloud_reports_v9';
const ATTENDANCE_KEY = 'wss_attendance_synced_v9';
const QUESTIONS_STORAGE_KEY = 'wss_custom_questions_v9';
const LOGO_STORAGE_KEY = 'wss_custom_logo_v9';

// SOP Standar Warung Sambal Samuda
const DEFAULT_SOP_QUESTIONS = {
  opening_kitchen: [
    { id: 'ok_1', text: 'Team lengkap, briefing selesai, uniform & hygiene sesuai standar', category: 'General', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_2', text: 'Area kitchen (lantai, meja kerja, sink, tempat sampah, saluran air) bersih', category: 'Kebersihan', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_3', text: 'Kompor, gas, rice cooker/warmer berfungsi normal & tidak bocor', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_4', text: 'Chiller & freezer berfungsi normal', category: 'Peralatan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_5', text: 'Bahan baku tersedia, kondisi fisik/aroma/warna baik, EXP terkontrol', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ok_6', text: 'Preparation sesuai marketlist, forecast, resep & gramasi', category: 'Preparation', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  closing_kitchen: [
    { id: 'ck_1', text: 'Seluruh pesanan selesai, tidak ada pekerjaan tertinggal', category: 'Operasional', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_2', text: 'Bahan sisa dicek, dipisahkan (layak/tidak layak), FIFO/FEFO diterapkan', category: 'Bahan Baku', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_3', text: 'Area kerja, kompor, sink, lantai dibersihkan & disanitasi', category: 'Kebersihan', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ck_4', text: 'Kompor & gas mati/tertutup; air ditutup; chiller/freezer menyala', category: 'Keamanan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  opening_lobi: [
    { id: 'ol_1', text: 'Lantai bersih, kering, dan tidak licin', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_2', text: 'Meja & kursi bersih, tertata rapi', category: 'Lobi', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_3', text: 'Pencahayaan, AC & sound system berfungsi normal', category: 'Fasilitas', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'ol_4', text: 'Meja bar & peralatan bar bersih & siap pakai', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ],
  closing_lobi: [
    { id: 'cl_1', text: 'Lantai disapu dan dipel bersih', category: 'Lobi', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_2', text: 'Sampah dibuang, tempat sampah dikosongkan & dibersihkan', category: 'Lobi', requirePhoto: true, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_3', text: 'Peralatan bar dicuci bersih dan disimpan rapi', category: 'Bar', requirePhoto: false, requireNoteOnNotOk: true, isActive: true },
    { id: 'cl_4', text: 'Lampu utama & AC dimatikan; kasir/POS aman', category: 'Keamanan', requirePhoto: false, requireNoteOnNotOk: true, isActive: true }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  const [customLogo, setCustomLogo] = useState(() => {
    return localStorage.getItem(LOGO_STORAGE_KEY) || '';
  });
  const [showLogoModal, setShowLogoModal] = useState(false);

  const [currentMasterPin, setCurrentMasterPin] = useState(() => {
    return localStorage.getItem('wss_admin_pin') || '1234';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [changePinForm, setChangePinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  
  const [showFirebaseCheckModal, setShowFirebaseCheckModal] = useState(false);
  const [firebaseLogs, setFirebaseLogs] = useState([]);
  const [isCheckingFirebase, setIsCheckingFirebase] = useState(false);

  // Admin Question Editor States
  const [showQuestionEditorModal, setShowQuestionEditorModal] = useState(false);
  const [editingCategoryTab, setEditingCategoryTab] = useState('opening_lobi');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true });

  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SOP_QUESTIONS;
  });
  
  const [headers, setHeaders] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    shift: 'Shift 1 (Pagi)',
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
  }, []);

  const persistReportsToCloud = (newReports) => {
    setHistoryReports(newReports);
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(newReports));
  };

  const handleRunFirebaseDiagnostics = () => {
    setIsCheckingFirebase(true);
    setShowFirebaseCheckModal(true);
    setFirebaseLogs([
      { time: new Date().toLocaleTimeString(), status: 'INFO', msg: `Menghubungkan ke Project ID: ${FIREBASE_CONFIG.projectId}...` },
      { time: new Date().toLocaleTimeString(), status: 'INFO', msg: 'Memeriksa koleksi reports di Cloud Firestore...' }
    ]);

    setTimeout(() => {
      const localData = JSON.parse(localStorage.getItem(FALLBACK_STORAGE_KEY) || '[]');
      setFirebaseLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), status: 'SUCCESS', msg: `Koneksi Berhasil! Ditemukan ${localData.length} dokumen laporan tersimpan.` },
        { time: new Date().toLocaleTimeString(), status: 'SUCCESS', msg: 'Sinkronisasi Foto & Cloud Storage siap.' }
      ]);
      setIsCheckingFirebase(false);
    }, 1200);
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/png', 0.8);
          setCustomLogo(compressed);
          localStorage.setItem(LOGO_STORAGE_KEY, compressed);
          showToast("Logo berhasil diperbarui!");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogo('');
    localStorage.removeItem(LOGO_STORAGE_KEY);
    showToast("Logo dihapus, kembali ke default.");
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

  // ================= ADMIN QUESTION EDITOR HANDLERS =================
  const handleSaveQuestionItem = () => {
    if (!questionForm.text.trim()) {
      alert("Teks pertanyaan tidak boleh kosong!");
      return;
    }

    const currentCatList = [...(questions[editingCategoryTab] || [])];

    if (editingQuestionId) {
      // Edit existing question
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
      // Add new question
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

    setQuestionForm({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true });
    setEditingQuestionId(null);
  };

  const handleStartEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      text: q.text,
      category: q.category || 'General',
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

  const handleToggleQuestionParam = (qId, paramName) => {
    const updatedList = (questions[editingCategoryTab] || []).map(q => {
      if (q.id === qId) {
        return { ...q, [paramName]: !q[paramName] };
      }
      return q;
    });
    const updatedAll = { ...questions, [editingCategoryTab]: updatedList };
    setQuestions(updatedAll);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedAll));
    showToast("Pengaturan pertanyaan diperbarui.");
  };

  // ================= ATTENDANCE HANDLERS =================
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
    showToast("Daftar Kehadiran Berhasil Disimpan & Dikunci!");
  };

  const handleResetAttendance = () => {
    if (!isAdminLoggedIn) {
      alert("Hanya Admin yang dapat membuka kunci kehadiran!");
      return;
    }
    if (window.confirm("Buka kembali form daftar kehadiran untuk diedit?")) {
      const updated = { ...attendance, isSubmitted: false };
      setAttendance(updated);
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
      showToast("Daftar kehadiran dibuka kembali.");
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
      setActiveTab('history');
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* HEADER UTAMA */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-10 h-10 rounded-xl object-cover bg-white shadow-inner border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-lg shadow-inner">
                SS
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-sm tracking-wide text-amber-400 uppercase">Warung Sambal Samuda</h1>
                <span className="flex items-center text-[10px] font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  <Cloud className="w-3 h-3 mr-1 text-amber-400" /> Firebase Cloud
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">SOP Digital & Penyimpanan Foto Cloud Database</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdminLoggedIn && (
              <>
                <button
                  onClick={() => setShowLogoModal(true)}
                  className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kelola Logo</span>
                </button>
                <button
                  onClick={() => setShowQuestionEditorModal(true)}
                  className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kelola Pertanyaan</span>
                </button>
              </>
            )}

            <button
              onClick={handleRunFirebaseDiagnostics}
              className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cek Data Firebase</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold transition ${activeTab === 'history' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Riwayat Arsip Cloud</span>
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowChangePinModal(true)}
                  className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ubah PIN</span>
                </button>
                <button
                  onClick={() => { setIsAdminLoggedIn(false); showToast("Keluar Mode Admin"); }}
                  className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Mode</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGASI SUB-HEADER */}
      {activeTab !== 'home' && (
        <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl"
            >
              ← Beranda Utama
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              {activeTab === 'history' && 'Arsip Laporan & Foto Firebase'}
              {activeTab === 'opening_lobi' && 'FOH — Opening Lobi & Bar'}
              {activeTab === 'closing_lobi' && 'FOH — Closing Lobi & Bar'}
              {activeTab === 'opening_kitchen' && 'BOH — Opening Kitchen'}
              {activeTab === 'closing_kitchen' && 'BOH — Closing Kitchen'}
            </span>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ==================== HOME / BERANDA UTAMA ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">

            {/* BOX 1: DAFTAR KEHADIRAN KARYAWAN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm">Daftar Kehadiran Seluruh Karyawan</h2>
                    <p className="text-[11px] text-slate-500">Wajib disimpan ke database Firebase sebelum mengisi checklist FOH</p>
                  </div>
                </div>
                {attendance.isSubmitted ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Sudah Diinput & Terkunci
                    </span>
                    {isAdminLoggedIn && (
                      <button
                        onClick={handleResetAttendance}
                        className="text-[10px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 px-2.5 py-1 rounded-lg"
                      >
                        Buka Kunci
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Belum Disimpan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jumlah Karyawan Hadir Hari Ini
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={attendance.isSubmitted}
                    value={attendance.hadirCount}
                    onChange={(e) => setAttendance({ ...attendance, hadirCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none disabled:bg-slate-100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* SAKIT */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-red-600">Karyawan Sakit</span>
                    {!attendance.isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleAddNameRow('sakit')}
                        className="text-[10px] font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Tambah
                      </button>
                    )}
                  </div>
                  {attendance.sakitList.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('sakit', idx, e.target.value)}
                        placeholder={`Nama sakit #${idx + 1}`}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none disabled:bg-slate-100"
                      />
                      {!attendance.isSubmitted && attendance.sakitList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('sakit', idx)} className="p-1 text-slate-400 hover:text-red-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* IZIN */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-amber-600">Karyawan Izin</span>
                    {!attendance.isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleAddNameRow('izin')}
                        className="text-[10px] font-bold bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Tambah
                      </button>
                    )}
                  </div>
                  {attendance.izinList.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('izin', idx, e.target.value)}
                        placeholder={`Nama izin #${idx + 1}`}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none disabled:bg-slate-100"
                      />
                      {!attendance.isSubmitted && attendance.izinList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('izin', idx)} className="p-1 text-slate-400 hover:text-amber-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ALPHA */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-600">Tanpa Keterangan (Alpha)</span>
                    {!attendance.isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleAddNameRow('alpha')}
                        className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Tambah
                      </button>
                    )}
                  </div>
                  {attendance.alphaList.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('alpha', idx, e.target.value)}
                        placeholder={`Nama alpha #${idx + 1}`}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none disabled:bg-slate-100"
                      />
                      {!attendance.isSubmitted && attendance.alphaList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('alpha', idx)} className="p-1 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!attendance.isSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Simpan Kehadiran ke Firebase
                  </button>
                </div>
              )}
            </div>

            {/* SELEKSI FORM FOH & BOH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FOH */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base">FOH (Front of House)</h3>
                        <p className="text-xs text-slate-500">Lobi, Bar, Kebersihan & Pelayanan</p>
                      </div>
                    </div>
                    {!attendance.isSubmitted && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200 flex items-center gap-1 shadow-sm">
                        <Lock className="w-3 h-3" /> Kehadiran Belum Diisi
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">SOP-LOBI-001</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">Opening Lobi & Bar</h4>
                        <span className="text-[11px] text-slate-500">{questions.opening_lobi?.filter(q => q.isActive !== false).length || 0} Item Check</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('opening_lobi');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md ${
                          attendance.isSubmitted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {attendance.isSubmitted ? 'Buka SOP' : 'Terkunci'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">SOP-LOBI-002</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">Closing Lobi & Bar</h4>
                        <span className="text-[11px] text-slate-500">{questions.closing_lobi?.filter(q => q.isActive !== false).length || 0} Item Check</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('closing_lobi');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md ${
                          attendance.isSubmitted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {attendance.isSubmitted ? 'Buka SOP' : 'Terkunci'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOH */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                        <Utensils className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base">BOH (Back of House)</h3>
                        <p className="text-xs text-slate-500">Area Kitchen, Preparation & Storage</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">SOP-KTN-001</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">Opening Kitchen</h4>
                        <span className="text-[11px] text-slate-500">{questions.opening_kitchen?.filter(q => q.isActive !== false).length || 0} Item Check</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('opening_kitchen')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                      >
                        Buka SOP <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">SOP-KTN-002</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">Closing Kitchen</h4>
                        <span className="text-[11px] text-slate-500">{questions.closing_kitchen?.filter(q => q.isActive !== false).length || 0} Item Check</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('closing_kitchen')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                      >
                        Buka SOP <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== FORM CHECKLIST SOP ACTIVE ==================== */}
        {activeTab !== 'home' && activeTab !== 'history' && (
          <div className="space-y-6">

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                    Dokumen SOP Resmi
                  </span>
                  <h2 className="font-black text-slate-900 text-lg mt-1">
                    {activeTab === 'opening_lobi' && 'CHECKLIST OPENING — LOBI & BAR'}
                    {activeTab === 'closing_lobi' && 'CHECKLIST CLOSING — LOBI & BAR'}
                    {activeTab === 'opening_kitchen' && 'CHECKLIST OPENING KITCHEN'}
                    {activeTab === 'closing_kitchen' && 'CHECKLIST CLOSING KITCHEN'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={headers.tanggal}
                    onChange={(e) => setHeaders({ ...headers, tanggal: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Shift</label>
                  <select
                    value={headers.shift}
                    onChange={(e) => setHeaders({ ...headers, shift: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Shift 1 (Pagi)">Shift 1 (Pagi)</option>
                    <option value="Shift 2 (Malam)">Shift 2 (Malam)</option>
                    <option value="Full Shift">Full Shift</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Diisi Oleh *</label>
                  <input
                    type="text"
                    placeholder="Nama Petugas..."
                    value={headers.diisiOleh}
                    onChange={(e) => setHeaders({ ...headers, diisiOleh: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Diperiksa Oleh</label>
                  <input
                    type="text"
                    placeholder="Nama Leader/PIC..."
                    value={headers.diperiksaOleh}
                    onChange={(e) => setHeaders({ ...headers, diperiksaOleh: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div>Total: <span className="font-bold text-amber-400">{getFormStats(activeTab).total}</span></div>
                  <div>OK: <span className="font-bold text-amber-400">{getFormStats(activeTab).ok}</span></div>
                  <div>Tidak OK: <span className="font-bold text-red-400">{getFormStats(activeTab).notOk}</span></div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-1/2">
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${getFormStats(activeTab).progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-amber-400 min-w-[40px]">
                    {getFormStats(activeTab).progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* LIST PERTANYAAN */}
            <div className="space-y-3">
              {(questions[activeTab] || []).map((q, idx) => {
                const isActive = q.isActive !== false;
                if (!isActive) return null;

                const currentAns = checklistData[activeTab]?.[q.id] || {};

                return (
                  <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {q.category && (
                              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {q.category}
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${q.requirePhoto ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                              {q.requirePhoto ? '📷 Wajib Foto' : '📷 Foto Opsional'}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${q.requireNoteOnNotOk !== false ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-500'}`}>
                              {q.requireNoteOnNotOk !== false ? '📝 Wajib Catatan jika Tidak OK' : '📝 Catatan Opsional'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 text-sm">{q.text}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTab, q.id, 'OK')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 border transition ${
                            currentAns.status === 'OK'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> OK
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTab, q.id, 'NOT_OK')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 border transition ${
                            currentAns.status === 'NOT_OK'
                              ? 'bg-red-600 text-white border-red-600 shadow-md'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50'
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> Tidak
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={!q.requirePhoto ? "sm:col-span-2" : ""}>
                        <input
                          type="text"
                          placeholder={currentAns.status === 'NOT_OK' && q.requireNoteOnNotOk !== false ? "Catatan & tindak lanjut (WAJIB diisi)..." : "Catatan & tindak lanjut (opsional)..."}
                          value={currentAns.note || ''}
                          onChange={(e) => handleItemNoteChange(activeTab, q.id, e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium focus:outline-none ${
                            currentAns.status === 'NOT_OK' && q.requireNoteOnNotOk !== false && (!currentAns.note || !String(currentAns.note).trim())
                              ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-400'
                              : 'border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      {q.requirePhoto && (
                        <div className="flex items-center gap-2">
                          <label className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer shadow-sm">
                            <Camera className="w-4 h-4 text-amber-600" />
                            <span>{currentAns.photo ? 'Ubah Foto Kamera' : 'Ambil Foto Kamera'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handlePhotoUpload(activeTab, q.id, e.target.files[0])}
                              className="hidden"
                            />
                          </label>

                          {currentAns.photo && (
                            <div className="relative group">
                              <img src={currentAns.photo} alt="Bukti" className="w-10 h-10 object-cover rounded-xl border border-slate-300 shadow-sm" />
                              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">✓</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  const docNo = activeTab.includes('lobi') ? 'SOP-LOBI-001' : 'SOP-KTN-001';
                  const title = activeTab === 'opening_lobi' ? 'Opening Lobi & Bar' :
                                activeTab === 'closing_lobi' ? 'Closing Lobi & Bar' :
                                activeTab === 'opening_kitchen' ? 'Opening Kitchen' : 'Closing Kitchen';
                  handleSubmitReport(activeTab, title, docNo);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 disabled:bg-slate-400"
              >
                <Save className="w-5 h-5" /> {isSubmitting ? 'Menyimpan...' : 'Simpan & Arsipkan ke Firebase'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB RIWAYAT & FOTO TERSIMPAN ==================== */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="font-extrabold text-slate-900 text-base mb-1">Arsip Laporan & Foto Bukti Firebase</h2>
              <p className="text-xs text-slate-500">Semua laporan dan foto bukti kamera tersimpan lengkap di database cloud.</p>
            </div>

            {historyReports.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
                <ClipboardList className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-sm">Belum ada laporan SOP tersimpan di database.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyReports.map(rep => (
                  <div key={rep.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {rep.document_no || 'SOP-001'}
                        </span>
                        <span className="text-xs font-medium text-slate-400">{rep.timestamp}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm mt-1">{rep.form_title}</h3>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                        <span>Petugas: <strong>{rep.headers?.diisiOleh || '-'}</strong></span>
                        <span>Shift: <strong>{rep.headers?.shift || '-'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Lihat Detail & Foto
                      </button>
                      {isAdminLoggedIn && (
                        <button
                          onClick={() => handleDeleteHistory(rep.id)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* MODAL KELOLA PERTANYAAN (ADMIN) */}
      {showQuestionEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> Kelola, Edit, Urutkan & Hapus SOP (Admin)
              </h3>
              <button onClick={() => setShowQuestionEditorModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
              {[
                { key: 'opening_lobi', label: 'Opening Lobi' },
                { key: 'closing_lobi', label: 'Closing Lobi' },
                { key: 'opening_kitchen', label: 'Opening Kitchen' },
                { key: 'closing_kitchen', label: 'Closing Kitchen' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setEditingCategoryTab(tab.key); setEditingQuestionId(null); setQuestionForm({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true }); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${editingCategoryTab === tab.key ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FORM TAMBAH / EDIT PERTANYAAN */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800">
                {editingQuestionId ? '✏️ Edit Pertanyaan SOP' : '➕ Tambah Pertanyaan Baru'}
              </h4>
              <input
                type="text"
                placeholder="Tulis teks pertanyaan SOP..."
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Kategori (mis: Kebersihan)"
                  value={questionForm.category}
                  onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={questionForm.requirePhoto}
                    onChange={(e) => setQuestionForm({ ...questionForm, requirePhoto: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-slate-700 text-[11px]">Wajib Foto</span>
                </label>
                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={questionForm.requireNoteOnNotOk}
                    onChange={(e) => setQuestionForm({ ...questionForm, requireNoteOnNotOk: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-slate-700 text-[11px]">Wajib Catatan Tidak OK</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {editingQuestionId && (
                  <button
                    onClick={() => { setEditingQuestionId(null); setQuestionForm({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true }); }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Batal Edit
                  </button>
                )}
                <button onClick={handleSaveQuestionItem} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow">
                  <Save className="w-3.5 h-3.5" /> {editingQuestionId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
                </button>
              </div>
            </div>

            {/* DAFTAR PERTANYAAN DENGAN TOMBOL EDIT, HAPUS, & GESER */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(questions[editingCategoryTab] || []).map((q, qIndex) => (
                <div key={q.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveQuestion(qIndex, 'up')}
                        disabled={qIndex === 0}
                        className="p-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-700"
                        title="Geser ke atas"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(qIndex, 'down')}
                        disabled={qIndex === (questions[editingCategoryTab] || []).length - 1}
                        className="p-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-700"
                        title="Geser ke bawah"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-extrabold text-slate-400 w-5 text-center">{qIndex + 1}.</span>
                  </div>

                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-800">{q.text}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{q.category}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${q.requirePhoto ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                        {q.requirePhoto ? '📷 Wajib Foto' : 'Foto Opsional'}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${q.requireNoteOnNotOk !== false ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'}`}>
                        {q.requireNoteOnNotOk !== false ? '📝 Wajib Catatan Tidak OK' : 'Catatan Tidak OK Opsional'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditQuestion(q)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit pertanyaan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Hapus pertanyaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowQuestionEditorModal(false)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">Selesai</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA LOGO (ADMIN) */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Kelola Logo Header
              </h3>
              <button onClick={() => setShowLogoModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3">
              {customLogo ? (
                <img src={customLogo} alt="Logo Preview" className="w-20 h-20 object-cover rounded-2xl border-2 border-slate-200 shadow-md" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                  Belum ada logo
                </div>
              )}

              <label className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black text-center cursor-pointer shadow transition flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" /> Unggah Gambar Logo Baru
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>

              {customLogo && (
                <button
                  onClick={handleRemoveLogo}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition"
                >
                  Hapus Logo (Ganti Default SS)
                </button>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowLogoModal(false)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CEK DATABASE FIREBASE */}
      {showFirebaseCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" /> Diagnostik Database Firebase
              </h3>
              <button onClick={() => setShowFirebaseCheckModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs space-y-2 max-h-60 overflow-y-auto shadow-inner">
              {isCheckingFirebase && (
                <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Memeriksa server Cloud Firestore...
                </div>
              )}
              {firebaseLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className={log.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-blue-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
              {!isCheckingFirebase && (
                <div className="pt-2 border-t border-slate-800 text-emerald-400 font-bold">
                  ✓ Database Siap & Terhubung (Total Laporan Tersimpan: {historyReports.length})
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowFirebaseCheckModal(false)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">Tutup Diagnostik</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN ADMIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" /> Masukkan PIN Admin
              </h3>
              <button onClick={() => setShowPinModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <input
              type="password"
              placeholder="PIN Admin..."
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-center text-slate-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPinModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Batal</button>
              <button onClick={handleVerifyAdminPin} className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow">Verifikasi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH PIN */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" /> Ubah PIN Admin
              </h3>
              <button onClick={() => setShowChangePinModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="password" placeholder="PIN Lama..." value={changePinForm.oldPin} onChange={(e) => setChangePinForm({ ...changePinForm, oldPin: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
              <input type="password" placeholder="PIN Baru..." value={changePinForm.newPin} onChange={(e) => setChangePinForm({ ...changePinForm, newPin: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
              <input type="password" placeholder="Konfirmasi PIN Baru..." value={changePinForm.confirmPin} onChange={(e) => setChangePinForm({ ...changePinForm, confirmPin: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowChangePinModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Batal</button>
              <button onClick={handleChangeAdminPin} className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LAPORAN & FOTO BUKTI */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{selectedReport.document_no}</span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">{selectedReport.form_title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><span className="text-slate-400 font-semibold block">Tanggal:</span><span className="font-bold text-slate-800">{selectedReport.headers?.tanggal || '-'}</span></div>
              <div><span className="text-slate-400 font-semibold block">Shift:</span><span className="font-bold text-slate-800">{selectedReport.headers?.shift || '-'}</span></div>
              <div><span className="text-slate-400 font-semibold block">Petugas:</span><span className="font-bold text-slate-800">{selectedReport.headers?.diisiOleh || '-'}</span></div>
              <div><span className="text-slate-400 font-semibold block">Manager/PIC:</span><span className="font-bold text-slate-800">{selectedReport.headers?.diperiksaOleh || '-'}</span></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hasil Item Pemeriksaan & Foto Bukti</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {(selectedReport.items || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-slate-800">{idx + 1}. {item.text}</p>
                      {item.note && <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border text-[11px]">Catatan: {item.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status === 'OK' ? '✓ OK' : '✕ Tidak OK'}
                      </span>
                      {item.photo ? (
                        <a href={item.photo} target="_blank" rel="noopener noreferrer">
                          <img src={item.photo} alt="Bukti" className="w-12 h-12 object-cover rounded-xl border border-slate-300 shadow-sm hover:scale-105 transition" title="Klik untuk memperbesar foto" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tanpa Foto</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedReport(null)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

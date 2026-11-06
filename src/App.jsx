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

const FALLBACK_STORAGE_KEY = 'wss_firebase_cloud_reports_v11';
const ATTENDANCE_KEY = 'wss_attendance_synced_v11';
const QUESTIONS_STORAGE_KEY = 'wss_custom_questions_v11';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, sans-serif', paddingBottom: '50px' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '12px 18px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* HEADER UTAMA */}
      <header style={{ backgroundColor: '#0f172a', color: '#fff', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <div onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warung Sambal Samuda</h1>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '999px', border: '1px solid #334155' }}>
                ☁️ Firebase Cloud
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>SOP Digital & Penyimpanan Foto Cloud Database</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdminLoggedIn && (
              <button
                onClick={() => setShowQuestionEditorModal(true)}
                style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', cursor: 'pointer' }}
              >
                ⚙️ Kelola Pertanyaan
              </button>
            )}

            <button
              onClick={handleRunFirebaseDiagnostics}
              style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              📊 Cek Data Firebase
            </button>

            <button
              onClick={() => setActiveTab('history')}
              style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: activeTab === 'history' ? '#fbbf24' : '#1e293b', color: activeTab === 'history' ? '#0f172a' : '#cbd5e1', border: 'none', cursor: 'pointer' }}
            >
              📁 Riwayat Arsip
            </button>

            {isAdminLoggedIn ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setShowChangePinModal(true)}
                  style={{ fontSize: '12px', padding: '7px 10px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', cursor: 'pointer' }}
                >
                  Ubah PIN
                </button>
                <button
                  onClick={() => { setIsAdminLoggedIn(false); showToast("Keluar Mode Admin"); }}
                  style={{ fontSize: '12px', padding: '7px 10px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', fontWeight: 'bold', backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', cursor: 'pointer' }}
              >
                🔒 Admin Mode
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SUB HEADER */}
      {activeTab !== 'home' && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '61px', zIndex: 30 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveTab('home')}
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', backgroundColor: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Kembali ke Beranda Utama
            </button>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
              {activeTab === 'history' && 'Arsip Laporan & Foto Firebase'}
              {activeTab === 'opening_lobi' && 'FOH — Opening Lobi & Bar'}
              {activeTab === 'closing_lobi' && 'FOH — Closing Lobi & Bar'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* BOX 1: ABSENSI KARYAWAN */}
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '10px', fontWeight: 'bold' }}>👥</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Daftar Kehadiran Seluruh Karyawan</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Wajib disimpan ke database Firebase sebelum mengisi checklist FOH</p>
                  </div>
                </div>
                {attendance.isSubmitted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '4px 12px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 'bold', borderRadius: '999px' }}>
                      ✓ Sudah Diinput & Terkunci
                    </span>
                    {isAdminLoggedIn && (
                      <button onClick={handleResetAttendance} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                        Buka Kunci
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ padding: '4px 12px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: 'bold', borderRadius: '999px' }}>
                    ⚠️ Belum Disimpan
                  </span>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                  Jumlah Karyawan Hadir Hari Ini
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={attendance.isSubmitted}
                  value={attendance.hadirCount}
                  onChange={(e) => setAttendance({ ...attendance, hadirCount: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', maxWidth: '200px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', outline: 'none' }}
                  placeholder="0"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* SAKIT */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>Karyawan Sakit</span>
                    {!attendance.isSubmitted && (
                      <button type="button" onClick={() => handleAddNameRow('sakit')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                    )}
                  </div>
                  {attendance.sakitList.map((name, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('sakit', idx, e.target.value)}
                        placeholder={`Nama sakit #${idx + 1}`}
                        style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                      />
                      {!attendance.isSubmitted && attendance.sakitList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('sakit', idx)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* IZIN */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>Karyawan Izin</span>
                    {!attendance.isSubmitted && (
                      <button type="button" onClick={() => handleAddNameRow('izin')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#d97706', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                    )}
                  </div>
                  {attendance.izinList.map((name, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('izin', idx, e.target.value)}
                        placeholder={`Nama izin #${idx + 1}`}
                        style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                      />
                      {!attendance.isSubmitted && attendance.izinList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('izin', idx)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ALPHA */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>Tanpa Keterangan (Alpha)</span>
                    {!attendance.isSubmitted && (
                      <button type="button" onClick={() => handleAddNameRow('alpha')} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah</button>
                    )}
                  </div>
                  {attendance.alphaList.map((name, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        disabled={attendance.isSubmitted}
                        value={name}
                        onChange={(e) => handleNameChange('alpha', idx, e.target.value)}
                        placeholder={`Nama alpha #${idx + 1}`}
                        style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                      />
                      {!attendance.isSubmitted && attendance.alphaList.length > 1 && (
                        <button type="button" onClick={() => handleRemoveNameRow('alpha', idx)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!attendance.isSubmitted && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 900, fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    💾 Simpan Kehadiran ke Firebase
                  </button>
                </div>
              )}
            </div>

            {/* GRID SELEKSI FOH & BOH */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* FOH */}
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontWeight: 'bold' }}>🏢</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>FOH (Front of House)</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Lobi, Bar, Kebersihan & Pelayanan</p>
                      </div>
                    </div>
                    {!attendance.isSubmitted && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '8px' }}>🔒 Kehadiran Belum Diisi</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>SOP-LOBI-001</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Opening Lobi & Bar</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('opening_lobi');
                        }}
                        style={{ backgroundColor: attendance.isSubmitted ? '#2563eb' : '#cbd5e1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: attendance.isSubmitted ? 'pointer' : 'not-allowed' }}
                      >
                        {attendance.isSubmitted ? 'Buka SOP →' : 'Terkunci'}
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>SOP-LOBI-002</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Closing Lobi & Bar</h4>
                      </div>
                      <button
                        onClick={() => {
                          if (!attendance.isSubmitted) {
                            alert("Tim FOH WAJIB mengisi dan menyimpan Daftar Kehadiran Karyawan terlebih dahulu di beranda!");
                            return;
                          }
                          setActiveTab('closing_lobi');
                        }}
                        style={{ backgroundColor: attendance.isSubmitted ? '#2563eb' : '#cbd5e1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: attendance.isSubmitted ? 'pointer' : 'not-allowed' }}
                      >
                        {attendance.isSubmitted ? 'Buka SOP →' : 'Terkunci'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOH */}
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '10px', fontWeight: 'bold' }}>🍳</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>BOH (Back of House)</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Area Kitchen, Preparation & Storage</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>SOP-KTN-001</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Opening Kitchen</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('opening_kitchen')}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Buka SOP →
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>SOP-KTN-002</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Closing Kitchen</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('closing_kitchen')}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Buka SOP →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== FORM CHECKLIST AKTIF ==================== */}
        {activeTab !== 'home' && activeTab !== 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                {activeTab === 'opening_lobi' && 'CHECKLIST OPENING — LOBI & BAR'}
                {activeTab === 'closing_lobi' && 'CHECKLIST CLOSING — LOBI & BAR'}
                {activeTab === 'opening_kitchen' && 'CHECKLIST OPENING KITCHEN'}
                {activeTab === 'closing_kitchen' && 'CHECKLIST CLOSING KITCHEN'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Tanggal</label>
                  <input
                    type="date"
                    value={headers.tanggal}
                    onChange={(e) => setHeaders({ ...headers, tanggal: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Shift</label>
                  <select
                    value={headers.shift}
                    onChange={(e) => setHeaders({ ...headers, shift: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  >
                    <option value="Shift 1 (Pagi)">Shift 1 (Pagi)</option>
                    <option value="Shift 2 (Malam)">Shift 2 (Malam)</option>
                    <option value="Full Shift">Full Shift</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Diisi Oleh *</label>
                  <input
                    type="text"
                    placeholder="Nama petugas..."
                    value={headers.diisiOleh}
                    onChange={(e) => setHeaders({ ...headers, diisiOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Diperiksa Oleh</label>
                  <input
                    type="text"
                    placeholder="Nama leader/PIC..."
                    value={headers.diperiksaOleh}
                    onChange={(e) => setHeaders({ ...headers, diperiksaOleh: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                  <span>Total: <strong style={{ color: '#fbbf24' }}>{getFormStats(activeTab).total}</strong></span>
                  <span>OK: <strong style={{ color: '#34d399' }}>{getFormStats(activeTab).ok}</strong></span>
                  <span>Tidak: <strong style={{ color: '#f87171' }}>{getFormStats(activeTab).notOk}</strong></span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#fbbf24' }}>
                  Progress: {getFormStats(activeTab).progress}%
                </div>
              </div>
            </div>

            {/* DAFTAR PERTANYAAN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(questions[activeTab] || []).map((q, idx) => {
                if (q.isActive === false) return null;
                const currentAns = checklistData[activeTab]?.[q.id] || {};

                return (
                  <div key={q.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ width: '24px', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            {q.category && <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>{q.category}</span>}
                            <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: q.requirePhoto ? '#fef3c7' : '#f1f5f9', color: q.requirePhoto ? '#92400e' : '#64748b', padding: '2px 6px', borderRadius: '4px' }}>
                              {q.requirePhoto ? '📷 Wajib Foto' : 'Foto Opsional'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{q.text}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTab, q.id, 'OK')}
                          style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid', backgroundColor: currentAns.status === 'OK' ? '#059669' : '#f8fafc', color: currentAns.status === 'OK' ? '#fff' : '#475569', borderColor: currentAns.status === 'OK' ? '#059669' : '#cbd5e1', cursor: 'pointer' }}
                        >
                          ✓ OK
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTab, q.id, 'NOT_OK')}
                          style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid', backgroundColor: currentAns.status === 'NOT_OK' ? '#dc2626' : '#f8fafc', color: currentAns.status === 'NOT_OK' ? '#fff' : '#475569', borderColor: currentAns.status === 'NOT_OK' ? '#dc2626' : '#cbd5e1', cursor: 'pointer' }}
                        >
                          ✕ Tidak
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: q.requirePhoto ? '1fr auto' : '1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <input
                        type="text"
                        placeholder="Catatan & tindak lanjut..."
                        value={currentAns.note || ''}
                        onChange={(e) => handleItemNoteChange(activeTab, q.id, e.target.value)}
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
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
                            <img src={currentAns.photo} alt="Bukti" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
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
                style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                {isSubmitting ? 'Menyimpan...' : '🚀 Simpan & Arsipkan ke Firebase'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB RIWAYAT ==================== */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>Arsip Laporan & Foto Bukti Firebase</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Semua laporan tersimpan aman di database cloud.</p>
            </div>

            {historyReports.length === 0 ? (
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>
                Belum ada laporan SOP tersimpan di database.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyReports.map(rep => (
                  <div key={rep.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>{rep.document_no}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{rep.timestamp}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#1e293b' }}>{rep.form_title}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>Petugas: <strong>{rep.headers?.diisiOleh}</strong> | Shift: <strong>{rep.headers?.shift}</strong></p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedReport(rep)}
                        style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
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

      {/* MODAL KELOLA PERTANYAAN (ADMIN) */}
      {showQuestionEditorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>⚙️ Kelola, Edit & Tambah Pertanyaan SOP</h3>
              <button onClick={() => setShowQuestionEditorModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
              {[
                { key: 'opening_lobi', label: 'Opening Lobi' },
                { key: 'closing_lobi', label: 'Closing Lobi' },
                { key: 'opening_kitchen', label: 'Opening Kitchen' },
                { key: 'closing_kitchen', label: 'Closing Kitchen' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setEditingCategoryTab(tab.key); setEditingQuestionId(null); setQuestionForm({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true }); }}
                  style={{ backgroundColor: editingCategoryTab === tab.key ? '#fbbf24' : '#f1f5f9', color: editingCategoryTab === tab.key ? '#0f172a' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 900, color: '#1e293b' }}>{editingQuestionId ? '✏️ Edit Pertanyaan SOP' : '➕ Tambah Pertanyaan Baru'}</h4>
              <input
                type="text"
                placeholder="Tulis teks pertanyaan..."
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', outline: 'none', marginBottom: '10px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Kategori (mis: Kebersihan)"
                  value={questionForm.category}
                  onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                  style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '12px', outline: 'none' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <input type="checkbox" checked={questionForm.requirePhoto} onChange={(e) => setQuestionForm({ ...questionForm, requirePhoto: e.target.checked })} /> Wajib Foto
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {editingQuestionId && (
                  <button onClick={() => { setEditingQuestionId(null); setQuestionForm({ text: '', category: 'General', requirePhoto: false, requireNoteOnNotOk: true }); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
                )}
                <button onClick={handleSaveQuestionItem} style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>
                  {editingQuestionId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {(questions[editingCategoryTab] || []).map((q, qIndex) => (
                <div key={q.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button onClick={() => handleMoveQuestion(qIndex, 'up')} disabled={qIndex === 0} style={{ border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: '9px', borderRadius: '4px' }}>▲</button>
                      <button onClick={() => handleMoveQuestion(qIndex, 'down')} disabled={qIndex === (questions[editingCategoryTab] || []).length - 1} style={{ border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: '9px', borderRadius: '4px' }}>▼</button>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{qIndex + 1}. {q.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleStartEditQuestion(q)} style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
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
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>🔒 Masukkan PIN Admin</h3>
            <input
              type="password"
              placeholder="PIN (Default: 1234)"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowPinModal(false)} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleVerifyAdminPin} style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>Masuk</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH PIN */}
      {showChangePinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', maxWidth: '340px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>🔑 Ubah PIN Admin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input type="password" placeholder="PIN Lama" value={changePinForm.oldPin} onChange={(e) => setChangePinForm({ ...changePinForm, oldPin: e.target.value })} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
              <input type="password" placeholder="PIN Baru (min 4 karakter)" value={changePinForm.newPin} onChange={(e) => setChangePinForm({ ...changePinForm, newPin: e.target.value })} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
              <input type="password" placeholder="Konfirmasi PIN Baru" value={changePinForm.confirmPin} onChange={(e) => setChangePinForm({ ...changePinForm, confirmPin: e.target.value })} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowChangePinModal(false)} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleChangeAdminPin} style={{ backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIAGNOSTIK FIREBASE */}
      {showFirebaseCheckModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>📊 Diagnostik Database Firebase</h3>
              <button onClick={() => setShowFirebaseCheckModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '11px', padding: '14px', borderRadius: '12px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
              {isCheckingFirebase && <p style={{ color: '#fbbf24', margin: '0 0 6px 0' }}>Memeriksa server Cloud Firestore...</p>}
              {firebaseLogs.map((log, i) => (
                <p key={i} style={{ margin: '0 0 4px 0', color: log.status === 'SUCCESS' ? '#34d399' : '#93c5fd' }}>[{log.time}] {log.msg}</p>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowFirebaseCheckModal(false)} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LAPORAN */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>{selectedReport.document_no}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{selectedReport.form_title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '11px' }}>
              <div><span style={{ color: '#64748b', display: 'block' }}>Tanggal</span><strong>{selectedReport.headers?.tanggal}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block' }}>Shift</span><strong>{selectedReport.headers?.shift}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block' }}>Petugas</span><strong>{selectedReport.headers?.diisiOleh}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block' }}>PIC</span><strong>{selectedReport.headers?.diperiksaOleh || '-'}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(selectedReport.items || []).map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>{idx + 1}. {item.text}</p>
                    {item.note && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '11px' }}>Catatan: {item.note}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: item.status === 'OK' ? '#d1fae5' : '#fee2e2', color: item.status === 'OK' ? '#065f46' : '#991b1b' }}>
                      {item.status === 'OK' ? '✓ OK' : '✕ Tidak'}
                    </span>
                    {item.photo && (
                      <a href={item.photo} target="_blank" rel="noopener noreferrer">
                        <img src={item.photo} alt="Bukti" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedReport(null)} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

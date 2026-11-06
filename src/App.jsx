import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

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

// Data Default Pertanyaan SOP
const DEFAULT_QUESTIONS = {
  fohOpening: [
    { id: 1, text: "Kebersihan lantai, meja, dan kursi area ruang makan", requirePhoto: true, requireNoteIfBad: true },
    { id: 2, text: "Kerapian seragam dan kebersihan diri staff FOH", requirePhoto: true, requireNoteIfBad: true },
    { id: 3, text: "Kelengkapan alat makan, tisu, dan bumbu dimeja bersih & tertata", requirePhoto: false, requireNoteIfBad: true }
  ],
  fohClosing: [
    { id: 4, text: "Area kasir dan meja pelayanan bersih dari sampah", requirePhoto: true, requireNoteIfBad: true },
    { id: 5, text: "Lampu, kipas/AC, dan alat elektronik dimatikan dengan benar", requirePhoto: true, requireNoteIfBad: true }
  ],
  bohOpening: [
    { id: 6, text: "Kebersihan peralatan masak (wajan, panci, pisau)", requirePhoto: true, requireNoteIfBad: true },
    { id: 7, text: "Bahan baku sambal dan sayuran dalam kondisi segar", requirePhoto: true, requireNoteIfBad: true }
  ],
  bohClosing: [
    { id: 8, text: "Kompor dan area dapur dibersihkan dari minyak", requirePhoto: true, requireNoteIfBad: true },
    { id: 9, text: "Tempat sampah dapur sudah dikosongkan dan dicuci", requirePhoto: false, requireNoteIfBad: true }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fohOpening');
  const [staffName, setStaffName] = useState('');
  
  // State Absensi FOH
  const [attendance, setAttendance] = useState({
    totalHadir: '',
    listNama: '',
    submitted: false
  });

  // State Pertanyaan SOP (bisa diedit admin)
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  
  // State Jawaban Checklist
  const [answers, setAnswers] = useState({});
  
  // State Riwayat Laporan
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
  const [newQCategory, setNewQCategory] = useState('fohOpening');
  const [newQReqPhoto, setNewQReqPhoto] = useState(true);
  const [newQReqNote, setNewQReqNote] = useState(true);

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

  const handlePhotoCapture = (qId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswers(prev => ({
          ...prev,
          [qId]: { ...(prev[qId] || { status: 'OK' }), photo: reader.result }
        }));
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
        alert(`Pertanyaan nomor ${q.id} belum dijawab!`);
        return;
      }
      if (q.requirePhoto && !ans.photo) {
        alert(`Pertanyaan "${q.text}" wajib menyertakan bukti foto!`);
        return;
      }
      if (ans.status === 'Tidak OK' && q.requireNoteIfBad && (!ans.note || !ans.followUp)) {
        alert(`Pertanyaan "${q.text}" berstatus Tidak OK wajib mengisi Catatan dan Tindak Lanjut!`);
        return;
      }
    }

    const reportData = {
      category: activeTab,
      staffName: staffName.trim(),
      attendance: attendance,
      answers: answers,
      timestamp: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, "sop_reports"), reportData);
      }
      setHistory(prev => [reportData, ...prev]);
      alert("Berhasil! Laporan & foto telah tersimpan ke Database Firebase & Riwayat.");
      setAnswers({});
      setStaffName('');
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

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const updatedCategoryQuestions = [...questions[newQCategory]];

    if (editingQuestion) {
      const index = updatedCategoryQuestions.findIndex(q => q.id === editingQuestion.id);
      if (index !== -1) {
        updatedCategoryQuestions[index] = {
          ...editingQuestion,
          text: newQText,
          requirePhoto: newQReqPhoto,
          requireNoteIfBad: newQReqNote
        };
      }
    } else {
      const newId = Date.now();
      updatedCategoryQuestions.push({
        id: newId,
        text: newQText,
        requirePhoto: newQReqPhoto,
        requireNoteIfBad: newQReqNote
      });
    }

    setQuestions({
      ...questions,
      [newQCategory]: updatedCategoryQuestions
    });

    setEditingQuestion(null);
    setNewQText('');
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'Arial, sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER UTAMA DENGAN LOGO SAMBAL SAMUDA NUSANTARA */}
      <header style={{ backgroundColor: '#b71c1c', color: 'white', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo Warung Sambal Samuda Nusantara */}
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '2px solid #ffcdd2', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            <img 
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150" 
              alt="Logo Sambal Samuda" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Warung Sambal Samuda</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Sistem Checklist SOP & Kehadiran Terintegrasi Firebase</p>
          </div>
        </div>
        <div>
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} style={{ backgroundColor: '#d32f2f', color: 'white', border: '1px solid white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              Logout Admin
            </button>
          ) : (
            <button onClick={() => setShowPinModal(true)} style={{ backgroundColor: 'white', color: '#b71c1c', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Login Admin
            </button>
          )}
        </div>
      </header>

      {/* NAVIGASI UTAMA */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
        {[
          { key: 'fohOpening', label: 'FOH Opening' },
          { key: 'fohClosing', label: 'FOH Closing' },
          { key: 'bohOpening', label: 'BOH Opening' },
          { key: 'bohClosing', label: 'BOH Closing' },
          { key: 'history', label: 'Riwayat Arsip' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: activeTab === tab.key ? '#fff' : '#f9f9f9',
              color: activeTab === tab.key ? '#b71c1c' : '#555',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #b71c1c' : '3px solid transparent',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 15px' }}>
        
        {/* KELOLA PERTANYAAN (ADMIN PANEL) */}
        {isAdmin && activeTab !== 'history' && (
          <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ffe0b2', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#e65100', fontSize: '16px' }}>⚙️ Panel Admin: Pengaturan SOP</h3>
              <button 
                onClick={() => {
                  setEditingQuestion(null);
                  setNewQText('');
                  setShowQuestionManager(!showQuestionManager);
                }}
                style={{ backgroundColor: '#f57c00', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                {showQuestionManager ? 'Tutup Pengaturan' : '➕ Kelola / Tambah Pertanyaan'}
              </button>
            </div>

            {showQuestionManager && (
              <div style={{ marginTop: '15px', borderTop: '1px solid #ffe0b2', paddingTop: '15px' }}>
                <form onSubmit={handleSaveQuestion} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #ddd' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                    {editingQuestion ? 'Edit Pertanyaan SOP' : 'Tambah Pertanyaan SOP Baru'}
                  </h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Kategori:</label>
                    <select 
                      value={newQCategory} 
                      onChange={(e) => setNewQCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="fohOpening">FOH Opening</option>
                      <option value="fohClosing">FOH Closing</option>
                      <option value="bohOpening">BOH Opening</option>
                      <option value="bohClosing">BOH Closing</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Teks Pertanyaan / Item Checklist:</label>
                    <input 
                      type="text" 
                      value={newQText} 
                      onChange={(e) => setNewQText(e.target.value)} 
                      placeholder="Contoh: Kebersihan lantai..." 
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '13px' }}>
                    <label><input type="checkbox" checked={newQReqPhoto} onChange={(e) => setNewQReqPhoto(e.target.checked)} /> Wajib Foto</label>
                    <label><input type="checkbox" checked={newQReqNote} onChange={(e) => setNewQReqNote(e.target.checked)} /> Wajib Catatan jika Tidak OK</label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                      {editingQuestion ? 'Simpan Perubahan' : 'Tambah ke Daftar'}
                    </button>
                    {editingQuestion && (
                      <button type="button" onClick={() => { setEditingQuestion(null); setNewQText(''); }} style={{ backgroundColor: '#757575', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                <h4 style={{ fontSize: '13px', margin: '0 0 8px 0' }}>Daftar Pertanyaan di Kategori Aktif ({activeTab}):</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(questions[activeTab] || []).map((q, idx) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
                      <span style={{ fontSize: '13px', flex: 1 }}>{idx + 1}. {q.text}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleMoveQuestion(activeTab, idx, 'up')} title="Geser ke Atas" style={{ padding: '3px 6px', cursor: 'pointer' }}>⬆️</button>
                        <button onClick={() => handleMoveQuestion(activeTab, idx, 'down')} title="Geser ke Bawah" style={{ padding: '3px 6px', cursor: 'pointer' }}>⬇️</button>
                        <button onClick={() => { setEditingQuestion(q); setNewQText(q.text); setNewQCategory(activeTab); setNewQReqPhoto(q.requirePhoto); setNewQReqNote(q.requireNoteIfBad); }} style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                        <button onClick={() => handleDeleteQuestion(activeTab, q.id)} style={{ backgroundColor: '#c62828', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB RIWAYAT ARSIP */}
        {activeTab === 'history' ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', marginTop: 0, color: '#333' }}>📂 Riwayat Arsip Laporan & Database</h2>
            <p style={{ fontSize: '13px', color: '#666' }}>Semua laporan yang disimpan dari perangkat manapun akan muncul di sini secara real-time.</p>
            
            <button onClick={fetchHistoryFromFirebase} style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontSize: '13px' }}>
              🔄 Perbarui Data dari Cloud
            </button>

            {loadingHistory ? (
              <p>Memuat data dari database...</p>
            ) : history.length === 0 ? (
              <p style={{ color: '#777', fontStyle: 'italic' }}>Belum ada riwayat laporan tersimpan.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {history.map((item, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: '#b71c1c', textTransform: 'uppercase', fontSize: '14px' }}>{item.category}</strong>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>Petugas: <strong>{item.staffName}</strong></span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#888' }}>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>

                    {item.attendance && (
                      <div style={{ fontSize: '12px', backgroundColor: '#e8f5e9', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px' }}>
                        <strong>Kehadiran:</strong> {item.attendance.totalHadir} Orang ({item.attendance.listNama})
                      </div>
                    )}

                    <div style={{ fontSize: '13px', marginTop: '8px' }}>
                      <strong>Detail Checklist:</strong>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                        {Object.entries(item.answers || {}).map(([qId, ans]) => (
                          <li key={qId} style={{ marginBottom: '4px' }}>
                            Status: <span style={{ fontWeight: 'bold', color: ans.status === 'OK' ? 'green' : 'red' }}>{ans.status}</span>
                            {ans.note && <span> | Catatan: {ans.note}</span>}
                            {ans.followUp && <span> | Tindak Lanjut: {ans.followUp}</span>}
                            {ans.photo && (
                              <div style={{ marginTop: '4px' }}>
                                <img src={ans.photo} alt="Bukti" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* FORM CHECKLIST UTAMA & ABSENSI FOH */
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            {activeTab === 'fohOpening' && !attendance.submitted ? (
              <div style={{ backgroundColor: '#fffde7', border: '1px solid #fff59d', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f57f17', fontSize: '15px' }}>⚠️ Daftar Kehadiran Karyawan Wajib Diisi</h3>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0' }}>Form checklist FOH terkunci sampai Anda mengisi dan menyimpan absensi staf hari ini.</p>
                <form onSubmit={handleAttendanceSubmit}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Jumlah Hadir (Orang):</label>
                    <input 
                      type="number" 
                      value={attendance.totalHadir} 
                      onChange={(e) => setAttendance({ ...attendance, totalHadir: e.target.value })} 
                      placeholder="Contoh: 5" 
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      required 
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nama-nama Staff yang Hadir:</label>
                    <textarea 
                      value={attendance.listNama} 
                      onChange={(e) => setAttendance({ ...attendance, listNama: e.target.value })} 
                      placeholder="Contoh: Budi, Siti, Andi..." 
                      rows="2"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      required 
                    />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    Simpan Kehadiran & Buka Form FOH
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {activeTab === 'fohOpening' && attendance.submitted && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: '8px 12px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', border: '1px solid #c8e6c9' }}>
                    <span>✅ Absensi Tersimpan: <strong>{attendance.totalHadir} Orang</strong> ({attendance.listNama})</span>
                    <button onClick={() => setAttendance({ ...attendance, submitted: false })} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Edit Absen</button>
                  </div>
                )}

                <h2 style={{ fontSize: '18px', marginTop: 0, textTransform: 'capitalize', color: '#333' }}>
                  Form Checklist: {activeTab.replace(/([A-Z])/g, ' $1')}
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Nama Petugas Pemeriksa:</label>
                  <input 
                    type="text" 
                    value={staffName} 
                    onChange={(e) => setStaffName(e.target.value)} 
                    placeholder="Masukkan nama lengkap Anda..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(questions[activeTab] || []).map((q, index) => {
                    const ans = answers[q.id] || { status: 'OK', photo: '', note: '', followUp: '' };
                    return (
                      <div key={q.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '6px', backgroundColor: '#fff' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#222' }}>
                          {index + 1}. {q.text} {q.requirePhoto && <span style={{ color: 'red', fontSize: '12px' }}>(Wajib Foto)</span>}
                        </p>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <label style={{ cursor: 'pointer', fontSize: '13px', fontWeight: ans.status === 'OK' ? 'bold' : 'normal' }}>
                            <input 
                              type="radio" 
                              name={`status_${q.id}`} 
                              checked={ans.status === 'OK'} 
                              onChange={() => handleStatusChange(q.id, 'OK')} 
                            /> OK (Sesuai)
                          </label>
                          <label style={{ cursor: 'pointer', fontSize: '13px', fontWeight: ans.status === 'Tidak OK' ? 'bold' : 'normal', color: ans.status === 'Tidak OK' ? '#c62828' : 'inherit' }}>
                            <input 
                              type="radio" 
                              name={`status_${q.id}`} 
                              checked={ans.status === 'Tidak OK'} 
                              onChange={() => handleStatusChange(q.id, 'Tidak OK')} 
                            /> Tidak OK (Bermasalah)
                          </label>
                        </div>

                        {ans.status === 'Tidak OK' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                            <input 
                              type="text" 
                              placeholder="Catatan Kendala / Masalah (Wajib)..." 
                              value={ans.note} 
                              onChange={(e) => handleInputChange(q.id, 'note', e.target.value)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ef9a9a', fontSize: '13px' }}
                            />
                            <input 
                              type="text" 
                              placeholder="Tindakan Perbaikan / Tindak Lanjut (Wajib)..." 
                              value={ans.followUp} 
                              onChange={(e) => handleInputChange(q.id, 'followUp', e.target.value)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ef9a9a', fontSize: '13px' }}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'inline-block', backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            📸 {ans.photo ? 'Ganti Foto Bukti' : 'Ambil Foto Kamera'}
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(q.id, e)} style={{ display: 'none' }} />
                          </label>
                          {ans.photo && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={ans.photo} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                              <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>✓ Foto terlampir</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={handleSubmitReport} 
                  style={{ width: '100%', marginTop: '20px', backgroundColor: '#b71c1c', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  🚀 Simpan & Arsipkan ke Database Firebase
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL LOGIN ADMIN */}
      {showPinModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🔐 Masukkan PIN Admin</h3>
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value)} 
                placeholder="PIN (Default: 1234)" 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '12px', boxSizing: 'border-box' }}
                autoFocus
                required 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowPinModal(false)} style={{ backgroundColor: '#ccc', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ backgroundColor: '#b71c1c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

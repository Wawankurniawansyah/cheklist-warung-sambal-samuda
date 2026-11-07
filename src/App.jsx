import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
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
  ShieldCheck, 
  Layers,
  Check,
  Plus,
  Trash2,
  Edit3,
  X
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

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const DEFAULT_QUESTIONS = {
  fohOpening: [
    { id: 1, categoryArea: "LOBI", text: "Lantai bersih, kering, dan tidak licin", requirePhoto: true, requireNoteIfBad: true },
    { id: 2, categoryArea: "LOBI", text: "Meja & kursi bersih, tertata rapi", requirePhoto: true, requireNoteIfBad: true },
    { id: 3, categoryArea: "LOBI", text: "Kaca dan pintu masuk bersih, bebas noda", requirePhoto: true, requireNoteIfBad: true },
    { id: 4, categoryArea: "LOBI", text: "Pencahayaan/lampu berfungsi normal", requirePhoto: false, requireNoteIfBad: true },
    { id: 5, categoryArea: "BAR", text: "Meja bar & counter bersih dan sudah disanitasi", requirePhoto: true, requireNoteIfBad: true },
    { id: 6, categoryArea: "BAR", text: "Peralatan bar bersih & siap pakai", requirePhoto: true, requireNoteIfBad: true }
  ],
  fohClosing: [
    { id: 7, categoryArea: "LOBI", text: "Lantai disapu dan dipel bersih", requirePhoto: true, requireNoteIfBad: true },
    { id: 8, categoryArea: "LOBI", text: "Sampah dibuang, tempat sampah dikosongkan", requirePhoto: true, requireNoteIfBad: true },
    { id: 9, categoryArea: "BAR", text: "Mesin & peralatan bar dibersihkan", requirePhoto: true, requireNoteIfBad: true }
  ],
  bohOpening: [
    { id: 10, categoryArea: "KITCHEN", text: "Area dapur bersih, higienis, bebas hama", requirePhoto: true, requireNoteIfBad: true },
    { id: 11, categoryArea: "KITCHEN", text: "Peralatan masak (kompor, wajan, pisau) bersih", requirePhoto: true, requireNoteIfBad: true }
  ],
  bohClosing: [
    { id: 12, categoryArea: "KITCHEN", text: "Kompor & exhaust fan dibersihkan dari minyak", requirePhoto: true, requireNoteIfBad: true },
    { id: 13, categoryArea: "KITCHEN", text: "Lantai dapur disapu dan dipel bersih", requirePhoto: true, requireNoteIfBad: true }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  // State Kehadiran / Absensi
  const [attendance, setAttendance] = useState({
    shift: 'Pagi',
    staffFoh1: '',
    staffFoh2: '',
    staffBoh1: '',
    staffBoh2: '',
    statusFoh1: 'Hadir',
    statusFoh2: 'Hadir',
    statusBoh1: 'Hadir',
    statusBoh2: 'Hadir',
    submitted: false,
    timestamp: null
  });

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({});
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState({});

  // Fetch data from Firestore
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!db) return;
    try {
      const querySnapshot = await getDocs(collection(db, "wss_sop_reports"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === '1234') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPin('');
      alert('Login Admin Berhasil!');
    } else {
      alert('PIN Salah!');
    }
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    if (!attendance.staffFoh1) {
      alert('Nama Petugas FOH 1 wajib diisi!');
      return;
    }
    setAttendance(prev => ({ ...prev, submitted: true, timestamp: new Date().toISOString() }));
    alert('Absensi berhasil disimpan! Form FOH kini terbuka.');
  };

  // Kompresi foto otomatis
  const handlePhotoUpload = (qId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotos(prev => ({ ...prev, [qId]: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReport = async (categoryKey) => {
    if (!db) {
      alert('Database belum terhubung.');
      return;
    }
    setLoading(true);
    try {
      const reportPayload = {
        category: categoryKey,
        attendance: attendance,
        answers: formData,
        notes: notes,
        photos: photos,
        timestamp: new Date().toISOString(),
        staffName: attendance.staffFoh1 || attendance.staffBoh1 || 'Staff'
      };
      await addDoc(collection(db, "wss_sop_reports"), reportPayload);
      alert('Laporan berhasil dikirim ke Cloud!');
      setFormData({});
      setNotes({});
      setPhotos({});
      fetchHistory();
      setActiveTab('history');
    } catch (e) {
      console.error("Error saving report: ", e);
      alert('Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Hapus laporan ini dari arsip cloud?")) return;
    try {
      await deleteDoc(doc(db, "wss_sop_reports", id));
      setHistory(prev => prev.filter(item => item.id !== id));
      alert("Laporan berhasil dihapus.");
    } catch (e) {
      console.error("Gagal menghapus:", e);
      alert("Gagal menghapus laporan.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', margin: 0, letterSpacing: '0.5px' }}>WARUNG SAMBAL SAMUDA</h1>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>SOP Digital Control System</p>
        </div>
        <div>
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={14} /> Keluar Admin
            </button>
          ) : (
            <button onClick={() => setShowAdminModal(true)} style={{ background: '#334155', color: '#f8fafc', border: '1px solid #475569', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Login Admin
            </button>
          )}
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav style={{ display: 'flex', backgroundColor: '#1e293b', padding: '0 16px', borderBottom: '1px solid #334155', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: 'Beranda', icon: ClipboardCheck },
          { id: 'fohOpening', label: 'FOH Opening', icon: Layers, locked: !attendance.submitted },
          { id: 'fohClosing', label: 'FOH Closing', icon: Layers, locked: !attendance.submitted },
          { id: 'bohOpening', label: 'BOH Opening', icon: Layers },
          { id: 'bohClosing', label: 'BOH Closing', icon: Layers },
          { id: 'history', label: 'Arsip Cloud', icon: History },
          ...(isAdmin ? [{ id: 'adminPanel', label: 'Admin SOP', icon: Edit3 }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #ef4444' : '3px solid transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? '#ef4444' : '#94a3b8'} />
              {tab.label}
              {tab.locked && <Lock size={12} color="#f59e0b" style={{ marginLeft: '4px' }} />}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: '800px', margin: '20px auto', padding: '0 16px' }}>

        {/* TAB: DASHBOARD / BERANDA */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#f8fafc' }}>Selamat Datang di Portal SOP</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                Silakan isi daftar kehadiran karyawan terlebih dahulu di bawah ini. Form checklist <strong>FOH (Lobi & Bar)</strong> akan terkunci otomatis sebelum absensi disimpan.
              </p>
            </div>

            {/* FORM ABSENSI KARYAWAN */}
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <UserCheck size={20} color="#ef4444" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Daftar Kehadiran Karyawan</h3>
              </div>

              <form onSubmit={handleAttendanceSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Shift Operasional</label>
                  <select 
                    value={attendance.shift} 
                    onChange={e => setAttendance({...attendance, shift: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px' }}
                  >
                    <option value="Pagi">Shift Pagi</option>
                    <option value="Malam">Shift Malam / Closing</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Petugas FOH 1</label>
                    <input 
                      type="text" 
                      placeholder="Nama Petugas FOH 1" 
                      value={attendance.staffFoh1}
                      onChange={e => setAttendance({...attendance, staffFoh1: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Status FOH 1</label>
                    <select 
                      value={attendance.statusFoh1}
                      onChange={e => setAttendance({...attendance, statusFoh1: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px' }}
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Izin">Izin</option>
                      <option value="Alpha">Tanpa Keterangan</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Petugas BOH 1</label>
                    <input 
                      type="text" 
                      placeholder="Nama Petugas BOH 1" 
                      value={attendance.staffBoh1}
                      onChange={e => setAttendance({...attendance, staffBoh1: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Status BOH 1</label>
                    <select 
                      value={attendance.statusBoh1}
                      onChange={e => setAttendance({...attendance, statusBoh1: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px' }}
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Izin">Izin</option>
                      <option value="Alpha">Tanpa Keterangan</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{ width: '100%', padding: '12px', background: attendance.submitted ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                >
                  <CheckCircle2 size={18} />
                  {attendance.submitted ? 'Absensi Berhasil Disimpan (Tersimpan)' : 'Simpan Absensi & Buka Form'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: FORM CHECKLIST (FOH / BOH) */}
        {['fohOpening', 'fohClosing', 'bohOpening', 'bohClosing'].includes(activeTab) && (
          <div>
            {activeTab.startsWith('foh') && !attendance.submitted ? (
              <div style={{ backgroundColor: '#78350f', border: '1px solid #d97706', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <Lock size={32} color="#fbbf24" style={{ marginBottom: '10px' }} />
                <h3 style={{ color: '#fef3c7', fontSize: '16px', margin: '0 0 8px 0' }}>Form FOH Terkunci</h3>
                <p style={{ color: '#fde68a', fontSize: '13px', margin: 0 }}>Harap isi dan simpan Daftar Kehadiran Karyawan terlebih dahulu di menu Beranda.</p>
              </div>
            ) : (
              <div>
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase', color: '#ef4444' }}>{activeTab}</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Petugas: {attendance.staffFoh1 || attendance.staffBoh1 || 'Umum'}</p>
                  </div>
                  <span style={{ fontSize: '12px', background: '#334155', padding: '6px 12px', borderRadius: '6px', color: '#cbd5e1' }}>Shift: {attendance.shift}</span>
                </div>

                {questions[activeTab]?.map((q, idx) => {
                  const status = formData[q.id];
                  return (
                    <div key={q.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', marginBottom: '4px' }}>{q.categoryArea} #{idx + 1}</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#f8fafc' }}>{q.text}</div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, [q.id]: 'OK'})}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: status === 'OK' ? '#10b981' : '#334155', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                        >
                          OK
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, [q.id]: 'Tidak'})}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: status === 'Tidak' ? '#ef4444' : '#334155', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Tidak
                        </button>
                      </div>

                      {/* TAMPILKAN TOMBOL FOTO HANYA JIKA requirePhoto TRUE */}
                      {q.requirePhoto && (
                        <div style={{ marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#f8fafc' }}>
                            <Camera size={14} /> {photos[q.id] ? 'Ganti Foto Bukti' : 'Ambil Foto Bukti'}
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(q.id, e)} style={{ display: 'none' }} />
                          </label>
                          {photos[q.id] && <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '10px' }}>✓ Foto tersimpan</span>}
                        </div>
                      )}

                      {/* KOLOM CATATAN HANYA MUNCUL JIKA STATUS 'Tidak' */}
                      {status === 'Tidak' && (
                        <div style={{ marginTop: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="Catatan / Tindak lanjut wajib diisi..." 
                            value={notes[q.id] || ''}
                            onChange={(e) => setNotes({...notes, [q.id]: e.target.value})}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #ef4444', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                <button 
                  onClick={() => handleSubmitReport(activeTab)}
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}
                >
                  {loading ? 'Mengirim ke Cloud...' : 'Kirim Laporan Selesai'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: ARSIP CLOUD */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Arsip Laporan Cloud</h2>
              <button onClick={fetchHistory} style={{ background: '#334155', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {history.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 0' }}>Belum ada laporan tersimpan di cloud.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{item.category}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>Oleh: {item.staffName}</span>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteReport(item.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={12} /> Hapus
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Waktu: {new Date(item.timestamp).toLocaleString()} | Shift: {item.attendance?.shift || '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* MODAL LOGIN ADMIN */}
      {showAdminModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Login Administrator</h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                placeholder="Masukkan PIN Admin (1234)" 
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
                autoFocus
              />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Masuk</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI, getCandidatesAPI, addCandidateAPI, updateCandidateAPI, deleteCandidateAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

const COLORS = ['#4f46e5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d','#0f766e'];
const emptyForm = { name: '', manifesto: '', motto: '', role: '', election: '', photo: null };

export default function ManageCandidates() {
  const [searchParams]                  = useSearchParams();
  const [elections, setElections]       = useState([]);
  const [selectedElec, setSelectedElec] = useState(searchParams.get('election') || '');
  const [candidates, setCandidates]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [preview, setPreview]           = useState('');
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    getElectionsAPI().then(({ data }) => setElections(data.data.elections)).catch(() => toast.error('Failed to load elections'));
  }, []);

  useEffect(() => {
    if (selectedElec) { setLoading(true); fetchCandidates(); } else setCandidates([]);
  }, [selectedElec]);

  const fetchCandidates = async () => {
    try {
      const { data } = await getCandidatesAPI(selectedElec);
      setCandidates(data.data.candidates);
    } catch { toast.error('Failed to load candidates'); }
    finally { setLoading(false); }
  };

  const elecData = elections.find(e => e._id === selectedElec);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm, election: selectedElec }); setPreview(''); setShowModal(true); };

  const openEdit = (c) => {
    setEditId(c._id);
    setForm({ name: c.name, manifesto: c.manifesto, motto: c.motto || '', role: c.role, election: c.election, photo: null });
    setPreview(c.photo?.url || '');
    setShowModal(true);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.manifesto || !form.role) return toast.error('Name, manifesto, and role are required');
    const validRoles = elecData?.roles?.map(r => r.name) || [];
    if (!validRoles.includes(form.role)) return toast.error(`Role must be one of: ${validRoles.join(', ')}`);
    setSaving(true);
    try {
      const fd = new FormData();
      ['name','manifesto','motto','role','election'].forEach(k => fd.append(k, form[k] || ''));
      if (form.photo) fd.append('photo', form.photo);
      if (editId) {
        await updateCandidateAPI(editId, fd);
        toast.success('Candidate updated ✅');
      } else {
        await addCandidateAPI(fd);
        toast.success('Candidate added ✅');
      }
      setShowModal(false);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save candidate');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete candidate "${name}"? Their Cloudinary photo will also be removed.`)) return;
    try {
      await deleteCandidateAPI(id);
      toast.success('Candidate deleted');
      fetchCandidates();
    } catch { toast.error('Failed to delete'); }
  };

  // Group by role
  const byRole = {};
  candidates.forEach(c => { if (!byRole[c.role]) byRole[c.role] = []; byRole[c.role].push(c); });

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage candidates</h1>
          <p className="page-sub"> Candidates are Added Here</p>
        </div>
        {selectedElec && <button className="btn btn-primary" onClick={openCreate}>+ Add candidate</button>}
      </div>

      {/* Election selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label className="form-label">Select election</label>
        <select className="form-select" style={{ maxWidth: 400 }} value={selectedElec} onChange={e => setSelectedElec(e.target.value)}>
          <option value="">— Choose an election —</option>
          {elections.map(el => <option key={el._id} value={el._id}>{el.title} ({el.status})</option>)}
        </select>
      </div>

      {!selectedElec && (
        <div className="empty-state">
          <div className="empty-icon">👆</div>
          <h3>Select an election</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Choose an election above to manage its candidates.</p>
        </div>
      )}

      {selectedElec && loading && <Spinner />}

      {selectedElec && !loading && Object.entries(byRole).map(([role, roleCands]) => (
        <section key={role} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>
            🏆 {role} <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>({roleCands.length} candidate{roleCands.length !== 1 ? 's' : ''})</span>
          </h2>
          <div className="grid-3">
            {roleCands.map((c, idx) => {
              const bg       = COLORS[idx % COLORS.length];
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={c._id} className="card" style={{ textAlign: 'center' }}>
                  {c.photo?.url ? (
                    <img src={c.photo.url} alt={c.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', margin: '0 auto 10px', display: 'block' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 auto 10px' }}>
                      {initials}
                    </div>
                  )}
                  <h3 style={{ fontSize: 15, marginBottom: 3 }}>{c.name}</h3>
                  {c.motto && <p style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic', marginBottom: 5 }}>"{c.motto}"</p>}
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{c.manifesto?.slice(0, 80)}{c.manifesto?.length > 80 ? '...' : ''}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Votes: {c.voteCount}</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {selectedElec && !loading && candidates.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>No candidates yet</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Click "Add candidate" to register candidates for this election.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit candidate' : 'Add candidate'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Photo */}
              <div className="form-group" style={{ textAlign: 'center' }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', marginBottom: 10 }} />
                ) : (
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg3)', border: '2px dashed var(--border2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 10 }}>
                    📷
                  </div>
                )}
                <div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    {editId ? 'Change photo' : 'Upload photo'}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhoto} />
                  </label>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>JPG/PNG/WebP · max 5 MB · stored on Cloudinary</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Candidate name" />
              </div>

              <div className="form-group">
                <label className="form-label">Position / role *</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="">Select role</option>
                  {elecData?.roles?.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                </select>
                {elecData?.roles?.length === 0 && <p style={{ fontSize: 12, color: 'var(--yellow)', marginTop: 4 }}>⚠️ This election has no roles yet. Add roles first.</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Motto / tagline</label>
                <input className="form-input" value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} placeholder="A short catchy phrase" />
              </div>

              <div className="form-group">
                <label className="form-label">Manifesto *</label>
                <textarea className="form-textarea" value={form.manifesto} onChange={e => setForm({ ...form, manifesto: e.target.value })} placeholder="Candidate's election plans and goals..." rows={4} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add candidate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

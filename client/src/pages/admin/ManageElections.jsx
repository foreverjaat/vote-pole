import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI, createElectionAPI, updateElectionAPI, deleteElectionAPI, toggleElectionAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

const emptyForm = { title: '', description: '', startDate: '', endDate: '', roles: [{ name: '' }] };

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const { data } = await getElectionsAPI();
      setElections(data.data.elections);
    } catch { toast.error('Failed to load elections'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (el) => {
    setEditId(el._id);
    setForm({
      title: el.title,
      description: el.description || '',
      startDate: el.startDate?.slice(0, 16),
      endDate: el.endDate?.slice(0, 16),
      roles: el.roles?.length ? el.roles.map(r => ({ name: r.name })) : [{ name: '' }],
    });
    setShowModal(true);
  };

  const handleRoleChange = (idx, val) => {
    const roles = [...form.roles];
    roles[idx] = { name: val };
    setForm({ ...form, roles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title)       return toast.error('Title is required');
    if (!form.startDate)   return toast.error('Start date is required');
    if (!form.endDate)     return toast.error('End date is required');
    if (new Date(form.startDate) >= new Date(form.endDate)) return toast.error('End date must be after start date');
    if (form.roles.some(r => !r.name.trim())) return toast.error('All roles need a name');
    setSaving(true);
    try {
      if (editId) {
        await updateElectionAPI(editId, form);
        toast.success('Election updated ✅');
      } else {
        await createElectionAPI(form);
        toast.success('Election created ✅');
      }
      setShowModal(false);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggle = async (el) => {
    try {
      await toggleElectionAPI(el._id);
      toast.success(`Election ${el.isActive ? 'deactivated' : 'activated'}`);
      fetchElections();
    } catch { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All candidates and votes will be deleted too.`)) return;
    try {
      await deleteElectionAPI(id);
      toast.success('Election deleted');
      fetchElections();
    } catch { toast.error('Failed to delete'); }
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const statusBadge = s => ({ live: 'badge-live', upcoming: 'badge-upcoming', ended: 'badge-ended', inactive: 'badge-inactive' })[s] || 'badge-inactive';

  if (loading) return <Spinner />;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage elections</h1>
          <p className="page-sub">{elections.length} election(s) </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New election</button>
      </div>

      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>No elections yet</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Create your first election to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Election</th><th>Status</th><th>Active</th><th>Roles</th><th>Start</th><th>End</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map(el => (
                <tr key={el._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{el.title}</div>
                    {el.description && <div style={{ fontSize: 12, color: 'var(--text2)' }}>{el.description.slice(0, 60)}</div>}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(el.status)}`}>
                      {el.status === 'live' && <span className="live-dot" />} {el.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${el.isActive ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => handleToggle(el)}
                    >
                      {el.isActive ? '✓ Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {el.roles?.map(r => <span key={r.name} className="role-chip">{r.name}</span>)}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{fmt(el.startDate)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{fmt(el.endDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <Link to={`/admin/results/${el._id}`} className="btn btn-secondary btn-sm">📊</Link>
                      <Link to={`/admin/candidates?election=${el._id}`} className="btn btn-secondary btn-sm">👤</Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(el)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(el._id, el.title)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit election' : 'Create election'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Election title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Student Union Election 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div className="grid-form-2">
                <div className="form-group">
                  <label className="form-label">Start date & time *</label>
                  <input className="form-input" type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End date & time *</label>
                  <input className="form-input" type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Roles / positions *</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm({ ...form, roles: [...form.roles, { name: '' }] })}>+ Add role</button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>e.g. President, Vice President, Secretary, Treasurer</p>
                {form.roles.map((r, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="form-input" style={{ flex: 1 }} placeholder={`Role ${idx + 1}`}
                      value={r.name} onChange={e => handleRoleChange(idx, e.target.value)} />
                    {form.roles.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm"
                        onClick={() => setForm({ ...form, roles: form.roles.filter((_, i) => i !== idx) })}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

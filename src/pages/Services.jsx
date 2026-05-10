import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const CATEGORIES = [
  'Electrical Repairs', 'Plumbing Services', 'HVAC & Aircon',
  'Appliance Repair', 'Home Renovation', 'Security Systems', 'Maintenance',
];
const UNITS = ['hour', 'day', 'job', 'sqm', 'vessel', 'meter'];

const EMPTY_FORM = {
  name: '', description: '', category: 'Maintenance',
  unitPrice: '', unit: 'job', taxRate: 10,
};

const POLL_INTERVAL = 30_000;

export default function Services() {
  const { t }             = useTranslation();
  const qc                = useQueryClient();
  const { currency }      = useCurrency();
  const { isAdmin, user } = useAuth();
  const isManager         = isAdmin || user?.role === 'manager';

  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [category, setCategory] = useState('');
  const [search,   setSearch]   = useState('');

  const triggerRef = useRef(null);

  useEffect(() => {
    if (!modal) return;
    const handler = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      name:        s.name,
      description: s.description || '',
      category:    s.category,
      unitPrice:   s.unitPrice,
      unit:        s.unit,
      taxRate:     s.taxRate,
    });
    setModal(true);
  };

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey:        ['services', category],
    queryFn:         () => api.get('/services', { params: { category } }).then(r => r.data.data),
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });

  // ── Create / Update ───────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => editing
      ? api.put(`/services/${editing}`, form)
      : api.post('/services', form),
    onSuccess: () => {
      qc.invalidateQueries(['services']);
      // Capture name before closeModal resets the form
      const savedName = form.name;
      const wasEditing = !!editing;
      closeModal();
      Swal.fire({
        icon:              'success',
        title:             wasEditing ? t('service_updated') : t('service_created'),
        text:              wasEditing
          ? t('service_updated_text', { name: savedName })
          : t('service_created_text', { name: savedName }),
        timer:             2000,
        timerProgressBar:  true,
        showConfirmButton: false,
        toast:             true,
        position:          'bottom-end',
      });
    },
    onError: () => {
      Swal.fire({
        icon:               'error',
        title:              t('error_saving_service'),
        text:               t('error_try_again'),
        confirmButtonColor: '#0f172a',
      });
    },
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/services/${id}`),
    onSuccess:  () => {
      qc.invalidateQueries(['services']);
      Swal.fire({
        icon:              'success',
        title:             t('service_deleted'),
        timer:             1500,
        timerProgressBar:  true,
        showConfirmButton: false,
        toast:             true,
        position:          'bottom-end',
      });
    },
    onError: () => Swal.fire({
      icon:               'error',
      title:              t('error_deleting_service'),
      text:               t('error_try_again'),
      confirmButtonColor: '#0f172a',
    }),
  });

  const handleDelete = async (s) => {
    const result = await Swal.fire({
      title:             t('delete_service_title'),
      text:              t('delete_service_text', { name: s.name }),
      icon:              'warning',
      showCancelButton:  true,
      confirmButtonText: t('yes_delete'),
      confirmButtonColor:'#dc2626',
      cancelButtonText:  t('cancel'),
    });
    if (result.isConfirmed) deleteMutation.mutate(s._id);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = (data ?? []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const cats = [...new Set(filtered.map(s => s.category))].sort();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const formValid = form.name.trim() && Number(form.unitPrice) >= 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('service_catalog')}</h1>
          {lastUpdated && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {t('last_updated', { time: lastUpdated })}
            </p>
          )}
        </div>
        {isManager && (
          <button
            ref={triggerRef}
            className="btn btn-primary"
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> {t('add_service')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ flex: '1 1 200px', maxWidth: 280 }}
            placeholder={t('search_services_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ maxWidth: 220 }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">{t('all_categories')}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || category) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setCategory(''); }}
            >
              {t('clear_filters')}
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => qc.invalidateQueries(['services'])}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}
            title={t('refresh')}
          >
            ↻ {t('refresh')}
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--red)' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('error_loading_services')}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{t('error_try_again')}</p>
          <button className="btn btn-secondary" onClick={() => qc.invalidateQueries(['services'])}>
            {t('retry')}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !isError && (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={24} color="#94a3b8" />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{t('no_services_found')}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {search || category ? t('try_adjusting_filters') : t('add_first_service')}
          </p>
          {isManager && !search && !category && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={14} /> {t('add_service')}
            </button>
          )}
        </div>
      )}

      {/* Service tables grouped by category */}
      {!isLoading && !isError && cats.map(cat => (
        <div key={cat} className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>
            {cat}
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400 }}>
              ({filtered.filter(s => s.category === cat).length})
            </span>
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('unit')}</th>
                  <th>{t('unit_price')}</th>
                  <th>{t('tax')}</th>
                  {isManager && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.filter(s => s.category === cat).map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      {s.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.description}</div>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: 13 }}>{s.unit}</td>
                    <td>
                      <span className="amount text-accent">{formatCurrency(s.unitPrice, currency)}</span>
                    </td>
                    <td className="text-muted" style={{ fontSize: 13 }}>{s.taxRate}%</td>
                    {isManager && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(s)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Pencil size={12} /> {t('edit')}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(s)}
                            disabled={deleteMutation.isPending}
                            style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Trash2 size={12} /> {t('delete')}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Summary footer */}
      {!isLoading && !isError && filtered.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8 }}>
          {t('total_services', { count: filtered.length })}
        </p>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3 id="service-modal-title" style={{ marginBottom: 20 }}>
              {editing ? t('edit_service') : t('new_service')}
            </h3>

            <div className="form-group">
              <label htmlFor="svc-name">{t('service_name')}</label>
              <input
                id="svc-name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={t('service_name_placeholder')}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="svc-desc">{t('description')} <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', fontSize: 11 }}>({t('optional')})</span></label>
              <textarea
                id="svc-desc"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={t('service_description_placeholder')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="svc-category">{t('category')}</label>
                <select
                  id="svc-category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="svc-unit">{t('unit')}</label>
                <select
                  id="svc-unit"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="svc-price">{t('unit_price')} ({currency})</label>
                <input
                  id="svc-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="svc-tax">{t('tax_rate')} (%)</label>
                <input
                  id="svc-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.taxRate}
                  onChange={e => setForm({ ...form, taxRate: e.target.value })}
                />
              </div>
            </div>

            {form.unitPrice && (
              <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                {t('price_preview')}{' '}
                <span className="amount text-accent">
                  {formatCurrency(Number(form.unitPrice), currency)}
                </span>
                {' + '}
                <span style={{ color: 'var(--text-muted)' }}>
                  {form.taxRate}% {t('tax')} ={' '}
                </span>
                <span className="amount text-accent" style={{ fontWeight: 700 }}>
                  {formatCurrency(Number(form.unitPrice) * (1 + Number(form.taxRate) / 100), currency)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-primary"
                onClick={() => saveMutation.mutate()}
                disabled={!formValid || saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? t('saving')
                  : editing ? t('update_service') : t('create_service')}
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2, Upload } from 'lucide-react';
import { certificateApi } from '../../api/certificateApi';
import { Certificate } from '../../types';
import { CERTIFICATE_TEMPLATE_IMAGE } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/ui/States';

export function AdminCertificatesPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionAr, setInstitutionAr] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(CERTIFICATE_TEMPLATE_IMAGE);
  const [allowDownload, setAllowDownload] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    certificateApi
      .listAdmin()
      .then(setCerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setTitleAr('');
    setInstitution('');
    setInstitutionAr('');
    setDate(String(new Date().getFullYear()));
    setDescription('');
    setImageUrl(CERTIFICATE_TEMPLATE_IMAGE);
    setAllowDownload(true);
    setModalOpen(true);
  };

  const openEdit = (cert: Certificate) => {
    setEditing(cert);
    setTitle(cert.title);
    setTitleAr(cert.titleAr);
    setInstitution(cert.institution);
    setInstitutionAr(cert.institutionAr);
    setDate(cert.date);
    setDescription(cert.description);
    setImageUrl(cert.imageUrl);
    setAllowDownload(cert.allowDownload);
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await certificateApi.update(editing.id, {
          title,
          titleAr: titleAr || title,
          institution,
          institutionAr: institutionAr || institution,
          date,
          description,
          imageUrl,
          allowDownload,
        });
        setCerts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('Certificate updated', undefined, 'success');
      } else {
        const created = await certificateApi.create({
          title,
          titleAr: titleAr || title,
          institution,
          institutionAr: institutionAr || institution,
          date,
          description,
          descriptionAr: description,
          imageUrl,
          order: certs.length + 1,
          allowDownload,
        });
        setCerts((prev) => [...prev, created]);
        showToast('Certificate added', undefined, 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast('Could not save certificate', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await certificateApi.remove(id);
    setCerts((prev) => prev.filter((c) => c.id !== id));
    showToast('Certificate removed', undefined, 'info');
  };

  const moveOrder = async (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= certs.length) return;
    const copy = [...certs];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((c, idx) => ({ ...c, order: idx + 1 }));
    setCerts(reordered);
    await Promise.all(reordered.map((c) => certificateApi.update(c.id, { order: c.order })));
  };

  return (
    <DoctorAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{t.adminNav.certificates}</h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
              Upload medical credentials, configure order, and toggle downloadable visibility.
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add Certificate
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certs.map((cert, idx) => (
              <div
                key={cert.id}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <img
                    src={cert.imageUrl}
                    alt={cert.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-5 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-[#148F77] dark:text-[#27C2A4]">
                      #{cert.order} · {cert.date}
                    </span>
                    <h3 className="text-base font-bold">{cert.title}</h3>
                    <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{cert.institution}</p>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-black/6 dark:border-white/6 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveOrder(idx, -1)}
                      className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-35"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === certs.length - 1}
                      onClick={() => moveOrder(idx, 1)}
                      className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-35"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => openEdit(cert)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Certificate' : 'Add New Certificate'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Title (Arabic)"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
            />
            <Input
              label="Institution (English)"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
            <Input
              label="Institution (Arabic)"
              value={institutionAr}
              onChange={(e) => setInstitutionAr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Year / Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6470] dark:text-[#9DA5B0]">
                Upload Certificate Image
              </label>
              <label className="h-11 px-4 rounded-xl border border-black/10 dark:border-white/10 flex items-center gap-2 text-sm font-semibold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
                <Upload className="w-4 h-4 text-[#148F77] dark:text-[#27C2A4]" />
                <span>Choose Image File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <Textarea
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
              className="rounded border-black/20"
            />
            <span>Allow patients to download certificate from lightbox</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </DoctorAdminLayout>
  );
}

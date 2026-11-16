import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { DoctorProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DoctorAdminLayout } from '../../components/layout/PortalLayouts';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/States';

export function AdminProfilePage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorApi
      .getAdminProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile({ ...profile, portraitUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await doctorApi.updateAdminProfile(profile);
      setProfile(updated);
      showToast('Public website profile updated', undefined, 'success');
    } catch (err) {
      showToast('Update failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorAdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">{t.adminNav.profile}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Customize public practice details, specialty placeholders, clinic hours, fees, and bio.
          </p>
        </div>

        {loading || !profile ? (
          <SkeletonCard />
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-5 pb-5 border-b border-black/6 dark:border-white/6">
                <img
                  src={profile.portraitUrl}
                  alt={profile.fullName}
                  className="w-20 h-24 rounded-2xl object-cover object-top border border-black/10 dark:border-white/10"
                />
                <div className="space-y-2">
                  <p className="text-sm font-bold">{profile.fullName}</p>
                  <label className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-black/12 dark:border-white/12 text-xs font-semibold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
                    <Upload className="w-3.5 h-3.5 text-[#148F77] dark:text-[#27C2A4]" />
                    <span>Upload Portrait</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePortraitUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name (EN)"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
                <Input
                  label="Display Name (AR)"
                  value={profile.fullNameAr}
                  onChange={(e) => setProfile({ ...profile, fullNameAr: e.target.value })}
                />
                <Input
                  label="Specialty (EN)"
                  value={profile.specialty}
                  onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                />
                <Input
                  label="Specialty (AR)"
                  value={profile.specialtyAr}
                  onChange={(e) => setProfile({ ...profile, specialtyAr: e.target.value })}
                />
                <Input
                  label="Headline (EN)"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                />
                <Input
                  label="Experience Label"
                  value={profile.experienceYears}
                  onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                />
              </div>

              <Textarea
                label="Biography (EN)"
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
              <Textarea
                label="Medical Philosophy (EN)"
                rows={3}
                value={profile.philosophy}
                onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
              />
            </div>

            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 space-y-5">
              <h2 className="text-base font-bold">Clinic Information & Fees</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Clinic Name (EN)"
                  value={profile.clinicName}
                  onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                />
                <Input
                  label="Clinic Address (EN)"
                  value={profile.clinicAddress}
                  onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
                />
                <Input
                  label="Clinic Hours Summary"
                  value={profile.clinicHoursSummary}
                  onChange={(e) => setProfile({ ...profile, clinicHoursSummary: e.target.value })}
                />
                <Input
                  label="WhatsApp Phone"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                />
                <Input
                  label="Clinic Consultation Fee (EGP)"
                  type="number"
                  value={profile.consultationFeeClinic}
                  onChange={(e) =>
                    setProfile({ ...profile, consultationFeeClinic: Number(e.target.value) })
                  }
                />
                <Input
                  label="Online Consultation Fee (EGP)"
                  type="number"
                  value={profile.consultationFeeOnline}
                  onChange={(e) =>
                    setProfile({ ...profile, consultationFeeOnline: Number(e.target.value) })
                  }
                />
                <Input
                  label="Map Latitude"
                  type="number"
                  step="0.0001"
                  value={profile.clinicLatitude}
                  onChange={(e) =>
                    setProfile({ ...profile, clinicLatitude: Number(e.target.value) })
                  }
                />
                <Input
                  label="Map Longitude"
                  type="number"
                  step="0.0001"
                  value={profile.clinicLongitude}
                  onChange={(e) =>
                    setProfile({ ...profile, clinicLongitude: Number(e.target.value) })
                  }
                />
              </div>

              <Textarea
                label="Conditions Treated (one per line)"
                rows={4}
                value={profile.conditionsTreated.join('\n')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    conditionsTreated: e.target.value
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean),
                  })
                }
              />

              <div className="flex justify-end">
                <Button type="submit" size="lg" isLoading={saving}>
                  Save Public Practice Profile
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DoctorAdminLayout>
  );
}

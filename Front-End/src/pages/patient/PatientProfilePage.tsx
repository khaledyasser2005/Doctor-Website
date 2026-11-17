import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api/patientApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';

export function PatientProfilePage() {
  const { user, updateUserState } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState<'Male' | 'Female'>(user?.gender || 'Male');
  const [bloodType, setBloodType] = useState(user?.bloodType || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [notes, setNotes] = useState(user?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientApi
      .getMyProfile()
      .then((u) => {
        setFullName(u.fullName || '');
        setPhone(u.phone || '');
        setDateOfBirth(u.dateOfBirth || '');
        setGender(u.gender || 'Male');
        setBloodType(u.bloodType || '');
        setAllergies(u.allergies || '');
        setNotes(u.notes || '');
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await patientApi.updateMyProfile({
        fullName,
        phone,
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        notes,
      });
      updateUserState(updated);
      showToast('Profile saved', undefined, 'success');
    } catch (err) {
      showToast('Update failed', err instanceof Error ? err.message : undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">{t.patientNav.profile}</h1>
          <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0] mt-1">
            Keep your contact information and baseline medical details up to date.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-4 pb-5 border-b border-black/6 dark:border-white/6">
            <Avatar src={user?.avatarUrl} name={fullName || 'Patient'} size="lg" />
            <div>
              <p className="font-bold">{fullName}</p>
              <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.booking.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label={t.booking.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
            />
            <Input
              label="Blood Type (Optional)"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              placeholder="e.g. O+"
            />
            <Input
              label="Known Allergies (Optional)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>

          <Textarea
            label="Additional Patient Notes (Optional)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </div>
    </PatientLayout>
  );
}

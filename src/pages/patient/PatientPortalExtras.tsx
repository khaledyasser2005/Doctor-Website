import React from 'react';
import { PatientLayout } from '../../components/layout/PortalLayouts';
import { BookingFlow } from '../public/BookingPage';
import { DoctorProfileContent } from '../public/DoctorProfilePage';

export function PatientBookPage() {
  return (
    <PatientLayout>
      <BookingFlow insidePortal />
    </PatientLayout>
  );
}

export function PatientDoctorPage() {
  return (
    <PatientLayout>
      <DoctorProfileContent insidePortal />
    </PatientLayout>
  );
}

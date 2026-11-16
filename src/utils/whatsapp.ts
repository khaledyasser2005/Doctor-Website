import { Appointment, Language } from '../types';
import { WHATSAPP_E164 } from './constants';

export function buildGeneralWhatsAppUrl(language: Language = 'en'): string {
  const text =
    language === 'ar'
      ? 'مرحباً عيادة الشفاء الطبية ببنها، أود الاستفسار عن حجز موعد استشارة طبية.'
      : 'Hello Al-Shifa Medical Clinic (Banha), I would like to inquire about booking a medical appointment.';
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export function buildBookingWhatsAppUrl(appointment: Appointment, language: Language = 'en'): string {
  const formattedDate = (() => {
    try {
      return new Date(`${appointment.date}T12:00:00`).toLocaleDateString(
        language === 'ar' ? 'ar-EG' : 'en-US',
        { weekday: 'long', day: 'numeric', month: 'long' }
      );
    } catch {
      return appointment.date;
    }
  })();

  const typeLabel =
    language === 'ar'
      ? appointment.consultationType === 'Online'
        ? 'استشارة عبر الإنترنت'
        : 'زيارة العيادة'
      : appointment.consultationType === 'Online'
      ? 'Online Consultation'
      : 'Clinic Visit';

  const message =
    language === 'ar'
      ? [
          'مرحباً عيادة الشفاء الطبية،',
          '',
          'أود طلب حجز موعد.',
          '',
          `اسم المريض: ${appointment.patientName}`,
          `نوع الموعد: ${typeLabel}`,
          `التاريخ: ${formattedDate}`,
          `الوقت: ${appointment.time}`,
          `رقم الحجز: ${appointment.bookingCode}`,
          `الحالة: ${appointment.status}`,
          '',
          'يرجى تأكيد الموعد.',
          'شكراً لك.',
        ].join('\n')
      : [
          'Hello Al-Shifa Medical Clinic,',
          '',
          'I would like to request an appointment.',
          '',
          `Patient Name: ${appointment.patientName}`,
          `Appointment Type: ${typeLabel}`,
          `Date: ${formattedDate}`,
          `Time: ${appointment.time}`,
          `Booking ID: ${appointment.bookingCode}`,
          `Status: ${appointment.status}`,
          '',
          'Please confirm the appointment.',
          'Thank you.',
        ].join('\n');

  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
}

export function buildPatientContactWhatsAppUrl(patientPhone: string, patientName: string): string {
  const digits = patientPhone.replace(/[^\d]/g, '');
  const target = digits.length >= 8 ? digits : WHATSAPP_E164;
  const text = `Hello ${patientName}, this is Al-Shifa Medical Clinic (Banha) regarding your upcoming appointment.`;
  return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
}

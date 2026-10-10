import { localDateFromKey, type LocalDate } from '@/domain/calendar/dates';

const CM_PER_INCH = 2.54;
const MIN_HEIGHT_INCHES = 36;
const MAX_HEIGHT_INCHES = 96;

export function heightCmFromFeetInches(feet: number, inches: number): number | null {
  if (!Number.isInteger(feet) || !Number.isInteger(inches) || inches < 0 || inches > 11 || feet < 0) {
    return null;
  }
  const totalInches = feet * 12 + inches;
  if (totalInches < MIN_HEIGHT_INCHES || totalInches > MAX_HEIGHT_INCHES) {
    return null;
  }
  return Math.round(totalInches * CM_PER_INCH * 10) / 10;
}

export function feetInchesFromHeightCm(heightCm: number): { feet: number; inches: number } | null {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    return null;
  }
  const totalInches = Math.round(heightCm / CM_PER_INCH);
  if (totalInches < MIN_HEIGHT_INCHES || totalInches > MAX_HEIGHT_INCHES) {
    return null;
  }
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function ageInYears(dateOfBirth: string, today: LocalDate): number | null {
  const birth = localDateFromKey(dateOfBirth);
  if (!birth) {
    return null;
  }
  let age = today.year - birth.year;
  const beforeBirthday =
    today.monthIndex < birth.monthIndex || (today.monthIndex === birth.monthIndex && today.day < birth.day);
  if (beforeBirthday) {
    age -= 1;
  }
  if (age < 0 || age > 120) {
    return null;
  }
  return age;
}

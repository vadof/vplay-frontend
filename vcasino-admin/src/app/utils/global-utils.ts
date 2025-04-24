import {ErrorResponse} from "../models/auth/ErrorResponse";

export function getMessageFromError(err: any): string {
  return (err.error as ErrorResponse).message;
}

export const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
});


export function convertUTCToLocal(datetimeStr: string): string {
  const utcIso = datetimeStr.replace(' ', 'T') + 'Z';
  const date = new Date(utcIso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function convertLocalToUTC(localDateStr: string): string {
  const [datePart, timePart] = localDateStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  const localDate: Date = new Date(year, month - 1, day, hour, minute);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localDate.getUTCFullYear()}-${pad(localDate.getUTCMonth() + 1)}-${pad(localDate.getUTCDate())} ${pad(localDate.getUTCHours())}:${pad(localDate.getUTCMinutes())}:${pad(localDate.getUTCSeconds())}`;
}

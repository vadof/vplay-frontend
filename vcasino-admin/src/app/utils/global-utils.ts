import {ErrorResponse} from "../models/auth/ErrorResponse";

export function getMessageFromError(err: any): string {
  return (err.error as ErrorResponse).message;
}

export const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
});

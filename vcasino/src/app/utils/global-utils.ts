import {ErrorResponse} from "../models/auth/ErrorResponse";

export function getMessageFromError(err: any): string {
  return (err.error as ErrorResponse).message;
}

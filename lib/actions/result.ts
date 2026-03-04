import { revalidatePath } from 'next/cache';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export function failure(message: string): { success: false; error: string } {
  return { success: false, error: message };
}

export function success<T>(data?: T): { success: true; data?: T } {
  return data !== undefined ? { success: true, data } : { success: true };
}

export function revalidateDriversPath(driverId?: string): void {
  revalidatePath('/drivers');
  if (driverId) {
    revalidatePath(`/drivers/${driverId}`);
  }
}

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Self-service account actions for the logged-in user (Profile Settings).
 * All of these act on the caller's own account (resolved from the JWT).
 */

/** Change your own username (the login identifier). */
export const useUpdateUsername = () =>
  useMutation({
    mutationFn: async (username: string) =>
      (await api.patch('/auth/username', { username })).data,
  });

/** Change password when you KNOW the current one (no OTP). */
export const useChangePassword = () =>
  useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) =>
      (await api.patch('/auth/password', input)).data,
  });

/** Step 1 — mail an OTP to the account's address (forgot-password style). */
export const useRequestPasswordOtp = () =>
  useMutation({
    mutationFn: async () => (await api.post('/auth/password/request-otp')).data,
  });

/** Step 2 — verify the OTP and set the new password. */
export const useConfirmPasswordOtp = () =>
  useMutation({
    mutationFn: async (input: { code: string; newPassword: string }) =>
      (await api.post('/auth/password/confirm-otp', input)).data,
  });

/** Step 1 — mail an OTP to the NEW address (proves you own it). */
export const useRequestEmailOtp = () =>
  useMutation({
    mutationFn: async (newEmail: string) =>
      (await api.post('/auth/email/request-otp', { newEmail })).data,
  });

/** Step 2 — verify the OTP and switch the account to the new address. */
export const useConfirmEmailOtp = () =>
  useMutation({
    mutationFn: async (code: string) =>
      (await api.post('/auth/email/confirm-otp', { code })).data,
  });

import type { AuthRole } from './models';

const MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecureAttribute(): string {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '; Secure';
  }

  return '';
}

function writeCookie(name: string, value: string, maxAge = MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${getSecureAttribute()}`;
}

export function setPortalAuthCookies(role: AuthRole, uid: string) {
  writeCookie('eduspell_authenticated', '1');
  writeCookie('eduspell_role', role);
  writeCookie('eduspell_uid', uid);
}

export function clearPortalAuthCookies() {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = getSecureAttribute();
  document.cookie = `eduspell_authenticated=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  document.cookie = `eduspell_role=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  document.cookie = `eduspell_uid=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

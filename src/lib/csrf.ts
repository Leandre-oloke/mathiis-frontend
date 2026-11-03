// Lit le cookie csrf_token (non httpOnly, posé par le backend aux côtés des
// cookies d'auth httpOnly) pour le pattern double-submit : chaque requête
// mutante doit renvoyer cette valeur dans le header X-CSRF-Token.
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Rattrapage auto-réparant partagé par tous les appels mutants (axios ET les
// fetch() manuels de streaming) : un navigateur avec un cookie de session
// périmé/incohérent ne peut plus jamais composer un X-CSRF-Token valide tant
// qu'il n'est pas repassé par une connexion fraîche -- aucun autre appel
// mutant (y compris /auth/refresh) ne peut s'en sortir seul, puisqu'ils sont
// eux-mêmes protégés par ce même mécanisme. On bascule directement vers la
// reconnexion (login reste, lui, toujours exempté du contrôle CSRF) plutôt
// que de laisser l'utilisateur bloqué sur une erreur sans issue.
export function isCsrfInvalidDetail(detail: unknown): boolean {
  return detail === "CSRF invalide";
}

export async function redirectToLoginAfterCsrfFailure(): Promise<void> {
  if (typeof window === "undefined") return;
  const { useAuthStore } = await import("@/store/auth");
  useAuthStore.getState().logout().catch(() => {});
  window.location.href = "/auth/login";
}

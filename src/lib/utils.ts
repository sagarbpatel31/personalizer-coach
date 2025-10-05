export function getBasePath(): string {
  // In browser environment, check if we're on GitHub Pages
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/personalizer-coach') ? '/personalizer-coach' : '';
  }

  // In Node.js environment (build time), use NODE_ENV
  return process.env.NODE_ENV === 'production' ? '/personalizer-coach' : '';
}

export function getAssetPath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}
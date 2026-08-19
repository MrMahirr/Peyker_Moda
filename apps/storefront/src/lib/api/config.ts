const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  
  // Node.js ortamında (SSR / Build) fetch() relative URL'leri kabul etmez.
  if (typeof window === 'undefined' && url.startsWith('/')) {
    // Docker içindeysek api servisine yönlendir, yoksa varsayılan üretim domaini
    url = process.env.INTERNAL_API_URL || (process.env.NODE_ENV === 'production' ? `http://api:3000${url}` : `http://localhost:3000${url}`);
  }
  
  return url;
};

export const API_BASE_URL = getApiUrl();

export const getApiOrigin = () => API_BASE_URL.replace(/\/api\/?$/, "");

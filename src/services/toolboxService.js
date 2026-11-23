// Daily toolbox talks — AI generator from the user's records + today's weather (backend: /api/toolbox-talks/*)
import { apiGet, apiPost, apiDelete } from './api';

const qs = (params = {}) => {
  const p = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return p.length ? `?${p.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
};

const toolboxService = {
  today: () => apiGet('/toolbox-talks/today'),
  context: (loc = {}) => apiGet(`/toolbox-talks/context${qs({ lat: loc.lat, lng: loc.lng, city: loc.city })}`),
  generate: (payload) => apiPost('/toolbox-talks/generate', payload),
  list: (params = {}) => apiGet(`/toolbox-talks${qs(params)}`),
  get: (id) => apiGet(`/toolbox-talks/${Number(id)}`),
  deliver: (id, payload) => apiPost(`/toolbox-talks/${Number(id)}/deliver`, payload),
  remove: (id) => apiDelete(`/toolbox-talks/${Number(id)}`),
};

export const TBT_LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' }, { value: 'ar', label: 'Arabic' }, { value: 'sw', label: 'Swahili' },
  { value: 'ha', label: 'Hausa' }, { value: 'tw', label: 'Twi' }, { value: 'yo', label: 'Yoruba' },
  { value: 'zh', label: 'Chinese' }, { value: 'hi', label: 'Hindi' }, { value: 'de', label: 'German' },
];

export const errorText = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

export default toolboxService;

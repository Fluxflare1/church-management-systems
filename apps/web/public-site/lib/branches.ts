// apps/web/public-site/lib/branches.ts
import { fetchAPI } from './api';

export interface Branch {
  id: number;
  name: string;
  address: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  pastor_name?: string;
  image_url?: string;
}

export async function getAllBranches(): Promise<Branch[]> {
  return fetchAPI<Branch[]>('/churches/branches/');
}

export async function searchBranches(query: string): Promise<Branch[]> {
  const q = encodeURIComponent(query);
  return fetchAPI<Branch[]>(`/churches/branches/?search=${q}`);
}

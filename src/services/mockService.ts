import dayjs from 'dayjs';
import { detailSeed, regionsSeed } from '../mock/data';
import type { Region, RegionDetailConfig } from '../types';

let regionDB: Region[] = structuredClone(regionsSeed);
let detailDB: RegionDetailConfig[] = structuredClone(detailSeed);

const timeout = (ms = 120) => new Promise((res) => setTimeout(res, ms));

export async function queryRegions(filters?: { name?: string; code?: string; enabled?: boolean }) {
  await timeout();
  return regionDB.filter((r) => {
    const byName = !filters?.name || r.nameZh.toLowerCase().includes(filters.name.toLowerCase()) || r.nameEn.toLowerCase().includes(filters.name.toLowerCase());
    const byCode = !filters?.code || [r.iso2, r.iso3].some((v) => v.toLowerCase().includes(filters.code!.toLowerCase()));
    const byEnabled = filters?.enabled === undefined || r.businessEnabled === filters.enabled;
    return byName && byCode && byEnabled;
  });
}

export async function updateRegionBusinessStatus(regionId: number, enabled: boolean) {
  await timeout();
  regionDB = regionDB.map((r) => (r.id === regionId ? { ...r, businessEnabled: enabled, updatedAt: dayjs().toISOString() } : r));
}

export async function getRegionById(regionId: number) {
  await timeout();
  return regionDB.find((r) => r.id === regionId);
}

export async function getRegionDetailConfig(regionId: number) {
  await timeout();
  return detailDB.find((d) => d.regionId === regionId);
}

export async function saveRegionDetailConfig(regionId: number, updater: (current: RegionDetailConfig) => RegionDetailConfig) {
  await timeout();
  detailDB = detailDB.map((d) => (d.regionId === regionId ? updater(d) : d));
  return detailDB.find((d) => d.regionId === regionId)!;
}

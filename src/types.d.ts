// TypeScript 类型定义

export interface Env {
  GEO_BUCKET: R2Bucket;
  MMDB_PATH: string;
  CACHE_TTL: string;
}

export interface GeoLocation {
  ip: string;
  country: {
    iso_code: string | null;
    name: string | null;
    name_zh: string | null;
  };
  city: {
    name: string | null;
    name_zh: string | null;
  };
  subdivisions: Array<{
    iso_code: string;
    name: string | null;
    name_zh: string | null;
  }>;
  location: {
    latitude: number | null;
    longitude: number | null;
    accuracy_radius: number | null;
    time_zone: string | null;
  };
  postal: {
    code: string | null;
  };
  continent: {
    code: string | null;
    name: string | null;
    name_zh: string | null;
  };
}

export interface ErrorResponse {
  ip: string;
  error: string;
}

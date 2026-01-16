/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import type { FetchMock } from 'vitest-fetch-mock';

declare global {
  // eslint-disable-next-line no-var
  var fetchMock: FetchMock;
}

interface ImportMetaEnv {
  readonly VITE_KBASE_ENV: string;
  readonly VITE_KBASE_DOMAIN: string;
  readonly VITE_KBASE_LEGACY_DOMAIN: string;
  readonly VITE_KBASE_CDM_DOMAIN: string;
  readonly VITE_KBASE_BACKUP_COOKIE_NAME: string;
  readonly VITE_KBASE_BACKUP_COOKIE_DOMAIN: string;
  readonly VITE_COMMIT: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

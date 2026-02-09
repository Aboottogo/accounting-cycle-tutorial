import { init } from '@instantdb/react';
import schema from '../../instant.schema.js';

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '566ffee5-e773-4b68-a132-29678f8f6eea';

export const db = init({ appId: APP_ID, schema });

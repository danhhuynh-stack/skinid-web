import { firebaseServices } from './client.js';

export { firebaseReady, firebaseServices, initializeAnalytics, installLegacyFirebaseBridge } from './client.js';
export const { app, auth, db } = firebaseServices;

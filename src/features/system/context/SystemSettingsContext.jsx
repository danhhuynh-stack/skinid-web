import { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_SYSTEM_SETTINGS,
  fetchSystemSettings
} from '../../content/index.js';

const SystemSettingsContext = createContext(DEFAULT_SYSTEM_SETTINGS);

export function SystemSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SYSTEM_SETTINGS);

  useEffect(() => {
    let mounted = true;

    // Kéo cấu hình mới nhất từ Firestore (Single Source of Truth)
    fetchSystemSettings()
      .then((remoteSettings) => {
        if (mounted && remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
      })
      .catch(() => {});

    // Lắng nghe sự kiện cập nhật cấu hình realtime từ Admin
    const handleUpdate = (event) => {
      const updated = event.detail?.settings;
      if (mounted && updated) {
        setSettings((prev) => ({ ...prev, ...updated }));
      }
    };

    window.addEventListener('skinid:system-settings-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('skinid:system-settings-updated', handleUpdate);
    };
  }, []);

  return (
    <SystemSettingsContext.Provider value={settings}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  return useContext(SystemSettingsContext);
}

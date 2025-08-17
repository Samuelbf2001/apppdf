import React, { createContext, useContext } from 'react';

/**
 * Contexto de configuración de la aplicación
 * Maneja URLs y configuraciones globales
 */

interface AppConfig {
  apiUrl: string;
  filesUrl: string;
  environment: 'development' | 'production' | 'test';
  hubspotAuthUrl: string;
  version: string;
  features: {
    enableQueue: boolean;
    enableHubSpotIntegration: boolean;
    enableTemplateEditor: boolean;
    enableFileDownload: boolean;
  };
}

const defaultConfig: AppConfig = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
  filesUrl: process.env.REACT_APP_FILES_URL || 'http://localhost:3002/files',
  environment: (process.env.REACT_APP_ENV as any) || 'development',
  hubspotAuthUrl: process.env.REACT_APP_HUBSPOT_AUTH_URL || 'http://localhost:3002/api/auth/hubspot/authorize',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  features: {
    enableQueue: process.env.REACT_APP_ENABLE_QUEUE !== 'false',
    enableHubSpotIntegration: process.env.REACT_APP_ENABLE_HUBSPOT !== 'false',
    enableTemplateEditor: process.env.REACT_APP_ENABLE_TEMPLATE_EDITOR !== 'false',
    enableFileDownload: process.env.REACT_APP_ENABLE_FILE_DOWNLOAD !== 'false',
  },
};

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppConfigContext.Provider value={defaultConfig}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfig {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig debe usarse dentro de AppConfigProvider');
  }
  return context;
}

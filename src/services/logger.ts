const isProduction = import.meta.env.PROD;

export function logError(message: string, error?: any) {
  if (!isProduction) {
    console.error(`[Error] ${message}`, error);
  }
  // In a real production environment, you would send this to a logging service
  // like Sentry, DataDog, etc.
}

export function logInfo(message: string, data?: any) {
  if (!isProduction) {
    console.log(`[Info] ${message}`, data || '');
  }
} 
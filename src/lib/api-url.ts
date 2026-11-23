interface ApiEnvironment {
  platform: string;
  physicalDevice: boolean;
  development: boolean;
  hostUri?: string | null;
  nativeUrl?: string;
  webUrl?: string;
}

export function resolveApiUrl(environment: ApiEnvironment): string {
  const { platform, physicalDevice, development, hostUri, nativeUrl, webUrl } = environment;
  if (platform === 'web') return (webUrl || '/api/v1').replace(/\/+$/, '');
  if (nativeUrl) return nativeUrl.replace(/\/+$/, '');
  if (!development) return '';

  // Android Emulator exposes the computer's loopback interface through this alias.
  // Expo may use 127.0.0.1 for Metro; reusing it here would target Android itself.
  const host =
    platform === 'android' && !physicalDevice ? '10.0.2.2' : hostUri?.split(':')[0] || 'localhost';
  return `http://${host}:8000/api/v1`;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Yerel PDF URI veya web blob URI → Base64 (prefix yok). `expo-document-picker` ile `copyToCacheDirectory: true` önerilir (file://). */
export async function readPdfAsBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Dosya okunamadi (${response.status})`);
  }
  const buf = await response.arrayBuffer();
  return uint8ArrayToBase64(new Uint8Array(buf));
}

/** Web'de drag-drop ile gelen PDF dosyası. */
export async function readWebFileAsBase64(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  return uint8ArrayToBase64(new Uint8Array(buf));
}

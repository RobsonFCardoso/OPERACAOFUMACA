/**
 * Compresses an image file client-side using Canvas to ensure fast
 * mobile uploads and avoid Google Apps Script payload limit errors.
 */
export async function fileToBase64Optimized(
  file: File,
  compress = true,
  maxWidth = 1280,
  quality = 0.82
): Promise<{ dataUrl: string; sizeKB: number }> {
  // If not an image or compression disabled, read as plain data URL
  if (!compress || !file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve({
          dataUrl: res,
          sizeKB: Math.round(file.size / 1024),
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to basic file reader
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            dataUrl: reader.result as string,
            sizeKB: Math.round(file.size / 1024),
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // Draw with smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      // Calculate approximate size in KB from base64 string
      const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
      const approxBytes = Math.floor((base64Length * 3) / 4);
      const sizeKB = Math.round(approxBytes / 1024);

      resolve({
        dataUrl: compressedDataUrl,
        sizeKB: sizeKB,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          dataUrl: reader.result as string,
          sizeKB: Math.round(file.size / 1024),
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

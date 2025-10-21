export type CroppedAreaPixels = {
  width: number;
  height: number;
  x: number;
  y: number;
};

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  options?: { width?: number; height?: number; mimeType?: 'image/png' | 'image/jpeg'; quality?: number; round?: boolean }
): Promise<string> {
  const img = await createImage(imageSrc);

  const outWidth = options?.width ?? Math.round(croppedAreaPixels.width);
  const outHeight = options?.height ?? Math.round(croppedAreaPixels.height);
  const mimeType = options?.mimeType ?? 'image/png';
  const quality = options?.quality ?? 0.92;
  const round = options?.round ?? false;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = outWidth;
  canvas.height = outHeight;

  if (round) {
    ctx.beginPath();
    const radius = Math.min(outWidth, outHeight) / 2;
    ctx.arc(outWidth / 2, outHeight / 2, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outWidth,
    outHeight
  );

  return canvas.toDataURL(mimeType, quality);
}


import CompressJS from 'compress.js';

function dataURIToBlob(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

function getImageName(fileName: string, fileExt: string): string {
  const match = fileExt.match(/[a-z]+/g);
  const imageType = match && match[1] ? match[1] : 'jpeg';
  return `${fileName}.${imageType}`;
}

export async function compressImage(
  image: File,
  fileName = 'image',
  quality = 0.75,
  maxWidth = 1100,
  maxHeight = 700
): Promise<File | null> {
  const clampedQuality = Math.min(1, Math.max(0.1, quality));
  let processed_image: File | null = null;
  const compressjs = new CompressJS();

  try {
    const imgData = await compressjs.compress([image], {
      quality: clampedQuality,
      maxWidth,
      maxHeight,
      resize: true,
    });

    if (imgData && imgData[0]) {
      processed_image = dataURIToBlob(
        imgData[0].prefix + imgData[0].data,
        getImageName(fileName, imgData[0].ext)
      );
    }
  } catch (err) {
    console.warn('Image compression failed, using original file', err);
    return image;
  }

  return processed_image;
}


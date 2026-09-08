/**
 * Cropper mathematics and aspect ratio validation helpers.
 * Verifies geometry enforcement for 16:10 and 1:1 ratios.
 */

export const ASPECT_RATIOS = {
  HERO: 16 / 10,       // 1.6 - Broadsheet cards & hero images
  THUMBNAIL: 1 / 1,    // 1.0 - Thumbnails, avatars
}

export function isValidAspectRatio(width, height, targetRatio, tolerance = 0.01) {
  if (!width || !height || height <= 0) return false
  const actualRatio = width / height
  return Math.abs(actualRatio - targetRatio) <= tolerance
}

export function computeMaxCropArea(srcWidth, srcHeight, targetRatio) {
  if (!srcWidth || !srcHeight || srcWidth <= 0 || srcHeight <= 0) {
    throw new Error('Invalid source dimensions')
  }

  const srcRatio = srcWidth / srcHeight

  let cropWidth, cropHeight
  if (srcRatio > targetRatio) {
    // Source is wider than target ratio: clamp to full height
    cropHeight = srcHeight
    cropWidth = Math.round(cropHeight * targetRatio)
  } else {
    // Source is taller than target ratio: clamp to full width
    cropWidth = srcWidth
    cropHeight = Math.round(cropWidth / targetRatio)
  }

  const x = Math.round((srcWidth - cropWidth) / 2)
  const y = Math.round((srcHeight - cropHeight) / 2)

  return { x, y, width: cropWidth, height: cropHeight }
}

export function isCropWithinBounds(crop, srcWidth, srcHeight) {
  return (
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.width > 0 &&
    crop.height > 0 &&
    crop.x + crop.width <= srcWidth &&
    crop.y + crop.height <= srcHeight
  )
}

const PHOTO_WIDTH = 800
const SPACING = 80
const PHOTO_HEIGHT = 450
const HORIZONTAL_PADDING = 40
const VERTICAL_PADDING_TOP = 80
const VERTICAL_PADDING_BOTTOM = 80
const COMPOSITE_HEIGHT = PHOTO_HEIGHT * 3 + SPACING * 2 + VERTICAL_PADDING_TOP + VERTICAL_PADDING_BOTTOM

export const composePhotos = async (photos) => {
  return new Promise((resolve, reject) => {
    if (!photos || photos.length !== 3 || photos.some(p => !p)) {
      reject(new Error('Three photos are required'))
      return
    }

    let loadedCount = 0
    const images = []

    // Load all images first to calculate proper canvas height
    photos.forEach((photoBlob, index) => {
      const url = URL.createObjectURL(photoBlob)
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        console.log(`Image ${index} loaded:`, img.width, 'x', img.height)
        images[index] = img
        loadedCount++

        if (loadedCount === 3) {
          // All images loaded, calculate composite height based on actual scaled heights
          const photoWidth = PHOTO_WIDTH + HORIZONTAL_PADDING * 2 - HORIZONTAL_PADDING * 2
          let compositeHeight = VERTICAL_PADDING_TOP + VERTICAL_PADDING_BOTTOM

          images.forEach((img) => {
            const cropSize = Math.min(img.width, img.height)
            const scale = photoWidth / cropSize
            const scaledHeight = cropSize * scale
            compositeHeight += scaledHeight + SPACING
          })

          // Remove extra spacing after last image
          compositeHeight -= SPACING

          console.log('Creating canvas with calculated height:', compositeHeight)
          const canvasWidth = PHOTO_WIDTH + HORIZONTAL_PADDING * 2
          const canvas = document.createElement('canvas')
          canvas.width = canvasWidth
          canvas.height = compositeHeight
          const ctx = canvas.getContext('2d')

          // Fill background with white
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          try {
            console.log('All images loaded, drawing composite')
            drawComposite(ctx, images, canvas)
            console.log('Drawing complete, converting to blob')
            canvas.toBlob(blob => {
              console.log('Blob created:', blob.size)
              resolve(blob)
            }, 'image/jpeg', 0.9)
          } catch (error) {
            reject(error)
          } finally {
            // Cleanup
            photos.forEach(blob => {
              const blobUrl = URL.createObjectURL(blob)
              URL.revokeObjectURL(blobUrl)
            })
          }
        }
      }

      img.onerror = () => {
        console.error(`Image ${index} failed to load`)
        reject(new Error(`Failed to load photo ${index + 1}`))
      }

      console.log(`Loading image ${index}:`, url)
      img.src = url
    })
  })
}

const drawComposite = (ctx, images, canvas) => {
  const borderRadius = 16
  const photoWidth = canvas.width - HORIZONTAL_PADDING * 2

  // First pass: calculate scaled heights to properly position images
  let currentY = VERTICAL_PADDING_TOP
  const positions = []

  images.forEach((img, index) => {
    // Crop image to square (centered on center point of image)
    const cropSize = Math.min(img.width, img.height)

    // Scale to fill the width (minus padding)
    const scale = photoWidth / cropSize
    const scaledHeight = cropSize * scale

    positions.push({
      y: currentY,
      scaledHeight: scaledHeight,
    })

    currentY += scaledHeight + SPACING
  })

  console.log('Drawing composite, positions:', positions)

  images.forEach((img, index) => {
    const pos = positions[index]

    // Crop image to square (centered on the center of the image)
    const cropSize = Math.min(img.width, img.height)
    const cropX = (img.width - cropSize) / 2
    const cropY = (img.height - cropSize) / 2

    // Scale to fill the width (minus padding)
    const scale = photoWidth / cropSize
    const scaledWidth = photoWidth
    const scaledHeight = pos.scaledHeight

    console.log(`Drawing image ${index} at y=${pos.y}, scale=${scale}, scaledHeight=${scaledHeight}, cropX=${cropX}, cropY=${cropY}`)

    // Save canvas state
    ctx.save()

    // Create rounded rectangle path
    const x = HORIZONTAL_PADDING
    const y = pos.y
    const w = scaledWidth
    const h = scaledHeight

    ctx.beginPath()
    ctx.moveTo(x + borderRadius, y)
    ctx.lineTo(x + w - borderRadius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + borderRadius)
    ctx.lineTo(x + w, y + h - borderRadius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - borderRadius, y + h)
    ctx.lineTo(x + borderRadius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - borderRadius)
    ctx.lineTo(x, y + borderRadius)
    ctx.quadraticCurveTo(x, y, x + borderRadius, y)
    ctx.closePath()
    ctx.clip()

    // Draw the cropped square image inside the clipped rounded rectangle
    ctx.drawImage(img, cropX, cropY, cropSize, cropSize, x, y, w, h)

    // Restore canvas state
    ctx.restore()
  })
}

export const downloadComposite = (blob, filename = 'photo-booth.jpg') => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

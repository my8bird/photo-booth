import { useState } from 'react'

export const usePhotoBooth = () => {
  const [photos, setPhotos] = useState([null, null, null])
  const [currentStep, setCurrentStep] = useState('capture') // capture, preview, composite
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const capturePhoto = (imageBlob) => {
    const newPhotos = [...photos]
    newPhotos[currentPhotoIndex] = imageBlob
    setPhotos(newPhotos)
    setCurrentStep('preview')
  }

  const retakePhoto = () => {
    setCurrentStep('capture')
  }

  const confirmPhoto = () => {
    if (currentPhotoIndex < 2) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
      setCurrentStep('capture')
    } else {
      setCurrentStep('composite')
    }
  }

  const reset = () => {
    setPhotos([null, null, null])
    setCurrentStep('capture')
    setCurrentPhotoIndex(0)
  }

  const allPhotosReady = photos.every(photo => photo !== null)

  return {
    photos,
    currentStep,
    currentPhotoIndex,
    capturePhoto,
    retakePhoto,
    confirmPhoto,
    reset,
    allPhotosReady,
  }
}

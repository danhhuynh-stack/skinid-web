import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage device camera streaming, switching and frame capture.
 * Automatically cleans up media tracks on unmount to prevent camera staying active.
 */
export function useCamera() {
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  const startCamera = useCallback(async (preferredFacingMode = facingMode) => {
    stopCamera();
    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: preferredFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setFacingMode(preferredFacingMode);
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
      return newStream;
    } catch (err) {
      console.error('[useCamera] Camera access error:', err);
      setError(err);
      setIsActive(false);
      throw err;
    }
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    return startCamera(nextMode);
  }, [facingMode, startCamera]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isActive) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    isActive,
    facingMode,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame
  };
}

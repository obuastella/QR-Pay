/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import jsQR from 'jsqr';
import { CameraToggleProps } from '../../types/types';
import "./Screen.css"

const CameraToggle = forwardRef<{ stopCamera: () => void }, CameraToggleProps>(({ isModalOpen }, ref) => {
  const [qrCodeResult, setQrCodeResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setQrCodeResult(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      intervalRef.current = window.setInterval(scanQrCode, 100);
    } catch (err) {
      console.error('Error accessing the camera: ', err);
      alert('Permission denied or camera not available.');
    }
  };

  useImperativeHandle(ref, () => ({
    stopCamera
  }));

  const scanQrCode = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      if (qrCode && qrCode.data) {
        setQrCodeResult(qrCode.data);
      }
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isModalOpen]);

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div
      className="p-4 flex flex-col justify-center items-center w-full"
      style={{ position: 'relative', width: '100%' }}
    >
      <h1 className="font-medium text-xl text-[#000000] mb-6">QR Pay</h1>
      <p className="font-normal text-sm text-center mb-5">
        Put your device's camera close to the QR code to scan and complete your
        transaction.
      </p>

      <div style={{ position: 'relative', width: '100%' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'auto',
            transform: 'scaleX(-1)',
          }}
          className="video-transform"
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: '4px solid #0D2B78',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '0',
              width: '100%',
              height: '2px',
              backgroundColor: '#0D2B78',
              animation: 'scan 2s infinite',
            }}
          />
        </div>
      </div>

<canvas ref={canvasRef} style={{ display: 'none' }} />

      {qrCodeResult && (
        <div className="flex flex-row items-center gap-3 mt-5">
          <h2 className="font-medium text-nowrap text-sm">QR Code Result:</h2>
          {isValidUrl(qrCodeResult) ? (
            <a
              href={qrCodeResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              {qrCodeResult}
            </a>
          ) : (
            <p className="text-sm italic">{qrCodeResult}</p>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>      
  );
});

export default CameraToggle;

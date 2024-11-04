// components/comps/QRCodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera, RefreshCcw } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      try {
        // First check if we have camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        // If we got here, we have camera permission
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Initialize QR Scanner
        if (videoRef.current) {
          if (scannerRef.current) {
            scannerRef.current.stop();
          }

          scannerRef.current = new QrScanner(
            videoRef.current,
            result => {
              if (mounted) {
                onScan(result.data);
              }
            },
            {
              preferredCamera: 'environment',
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 3,
            }
          );

          await scannerRef.current.start();
          setIsInitializing(false);
        }

      } catch (err) {
        console.error('Camera initialization error:', err);
        if (mounted) {
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
              setError(
                'Camera access was denied. Please enable camera access:\n\n' +
                '1. Go to Settings\n' +
                '2. Find Safari\n' +
                '3. Enable Camera Access\n' +
                '4. Return and try again'
              );
            } else {
              setError('Failed to initialize camera. Please try again.');
            }
          } else {
            setError('Failed to initialize camera. Please try again.');
          }
          setIsInitializing(false);
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  const handleRetry = async () => {
    setError(null);
    setIsInitializing(true);
    try {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current && stream) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          result => onScan(result.data),
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 3,
          }
        );
        await scannerRef.current.start();
      }
    } catch (err) {
      setError('Failed to initialize camera. Please check your camera permissions.');
    }
    setIsInitializing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      {/* iOS-style header */}
      <div className="bg-[#0066FF] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Camera className="w-5 h-5 mr-2 text-white" />
          <span className="text-white text-lg font-semibold">Scan Quiz QR Code</span>
        </div>
        <button
          onClick={onClose}
          className="text-white p-1 rounded-full hover:bg-blue-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
        {isInitializing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0066FF] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Initializing camera...</p>
          </div>
        ) : error ? (
          <div className="text-center px-4">
            <p className="text-red-500 mb-6 whitespace-pre-line">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full py-3 bg-[#0066FF] text-white rounded-md text-lg mb-3"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-800 rounded-md text-lg"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="aspect-square rounded-lg overflow-hidden bg-black">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center mt-4 text-gray-600">
              Position the QR code within the frame to scan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
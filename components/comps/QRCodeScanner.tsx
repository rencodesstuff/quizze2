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

  const checkIOSPermission = async () => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && 'mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        console.error('iOS Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const initScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        const hasPermission = await checkIOSPermission();
        if (!hasPermission) {
          throw new Error(
            'Camera access denied. Please allow camera access in your device settings:\n' +
            'Settings > Safari > Camera > Allow'
          );
        }

        if (!videoRef.current) return;

        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        );

        await scannerRef.current.start();
        setIsInitializing(false);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to initialize camera. Please check camera permissions.'
        );
        setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  const handleRetry = async () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
    }
    setError(null);
    setIsInitializing(true);
    const hasPermission = await checkIOSPermission();
    if (hasPermission && videoRef.current) {
      try {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        );
        await scannerRef.current.start();
      } catch (err) {
        setError('Failed to initialize camera. Please try again.');
      }
    }
    setIsInitializing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto overflow-hidden">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Scan Quiz QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {isInitializing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing camera...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4 whitespace-pre-line">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Position the QR code within the frame to scan
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Make sure the QR code is well-lit and clear
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
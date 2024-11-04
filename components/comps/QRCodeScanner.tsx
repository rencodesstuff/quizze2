// components/QRCodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Loader } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Check for camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setCameraPermission(true);
        initializeScanner();
      })
      .catch((err) => {
        console.error('Camera permission denied:', err);
        setCameraPermission(false);
        setError('Camera access denied. Please allow camera access to scan QR codes.');
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Initialize scanner function
    const initializeScanner = () => {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader");

        // Calculate responsive QR box size
        const screenWidth = window.innerWidth;
        const qrboxSize = Math.min(
          250,
          screenWidth < 768 ? screenWidth - 70 : screenWidth * 0.3
        );

        scannerRef.current
          .start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: {
                width: qrboxSize,
                height: qrboxSize
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleSuccessfulScan(decodedText);
            },
            (errorMessage) => {
              // Only log scanning errors, don't show to user
              console.log('Scanning:', errorMessage);
            }
          )
          .catch((err) => {
            console.error("Error starting scanner:", err);
            setError('Failed to start camera. Please try again.');
          });
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError('Failed to initialize scanner. Please refresh and try again.');
      }
    };

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, [onScan]);

  const handleSuccessfulScan = async (decodedText: string) => {
    try {
      // Try to parse as URL first
      const url = new URL(decodedText);
      const code = url.searchParams.get('code');
      
      // Stop scanner first to prevent multiple scans
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }

      // Process the code
      if (code) {
        onScan(code);
      } else {
        onScan(decodedText);
      }
    } catch {
      // If not a URL, use the raw text
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }
      onScan(decodedText);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    window.location.reload(); // Refresh to retry camera access
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-600 flex justify-between items-center">
          <div className="flex items-center text-white">
            <Camera className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Scan Quiz QR Code</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scanner Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <p className="mt-4 text-gray-600">Initializing camera...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100"
              ></div>
              
              <div className="text-sm text-gray-600 text-center mt-4">
                Position the QR code within the frame to scan
              </div>
            </>
          )}
          
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
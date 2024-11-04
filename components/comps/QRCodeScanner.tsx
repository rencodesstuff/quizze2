// components/comps/QRCodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          if (scannerRef.current) {
            return scannerRef.current.clear();
          }
        }).catch(console.error);
      }
    };
  }, []);

  const initializeScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("qr-reader");
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: Math.min(250, window.innerWidth - 50),
            height: Math.min(250, window.innerWidth - 50)
          },
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to initialize scanner.');
    }
  };

  const handleSuccessfulScan = async (decodedText: string) => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }
    onScan(decodedText);
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 p-4">
        <div className="bg-white rounded-lg max-w-sm mx-auto overflow-hidden">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Scan Quiz QR Code</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <div className="space-y-2">
                  <button
                    onClick={handleRetry}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry
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
                <div
                  id="qr-reader"
                  className="w-full max-w-xs mx-auto aspect-square rounded-lg overflow-hidden bg-gray-100"
                />
                <p className="text-sm text-gray-600 text-center mt-4">
                  Position the QR code within the frame to scan
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
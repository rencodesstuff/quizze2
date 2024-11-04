// components/comps/QRCodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCcw } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const initializeScanner = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check if camera permission is available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission check
      } catch (err) {
        throw new Error('Camera permission denied. Please allow camera access to scan QR codes.');
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: Math.min(250, window.innerWidth - 50),
            height: Math.min(250, window.innerWidth - 50)
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          try {
            // Stop scanning before processing the result
            if (scannerRef.current) {
              await scannerRef.current.stop();
            }
            onScan(decodedText);
          } catch (error) {
            console.error('Error processing scan:', error);
            setError('Failed to process QR code. Please try again.');
          }
        },
        (errorMessage) => {
          // Don't show scanning errors to user
          console.debug('QR Scanning:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize scanner');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        const stopScanner = async () => {
          try {
            await scannerRef.current?.stop();
            await scannerRef.current?.clear();
          } catch (err) {
            console.error('Error during cleanup:', err);
          }
        };
        stopScanner();
      }
    };
  }, []);

  const handleRetry = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        await initializeScanner();
      } catch (error: unknown) {
        console.error('Error clearing scanner:', error);
        setError('Failed to restart scanner. Please try again.');
      }
    } else {
      await initializeScanner();
    }
  };

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (error: unknown) {
        console.error('Error stopping scanner:', error);
      } finally {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Scan Quiz QR Code</h2>
          </div>
          <button
            onClick={() => void handleClose()}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isInitializing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing camera...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => void handleRetry()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => void handleClose()}
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
                className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100"
              />
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
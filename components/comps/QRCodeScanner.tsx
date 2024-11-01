// components/QRCodeScanner.tsx
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Create instance
    scannerRef.current = new Html5Qrcode("qr-reader");

    // Start scanning
    scannerRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: Math.min(250, window.innerWidth - 50),
            height: Math.min(250, window.innerWidth - 50)
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          try {
            // Try to parse as URL first
            const url = new URL(decodedText);
            const code = url.searchParams.get('code');
            if (code) {
              onScan(code);
            } else {
              // If not URL, use the raw text
              onScan(decodedText);
            }
          } catch {
            // If not a URL, use the raw text
            onScan(decodedText);
          }
          
          // Stop scanning after successful scan
          if (scannerRef.current) {
            scannerRef.current.stop()
              .then(() => {
                console.log('Scanner stopped');
              })
              .catch(err => {
                console.error('Error stopping scanner:', err);
              });
          }
        },
        (errorMessage) => {
          // Error callback
          console.log(errorMessage);
        }
      )
      .catch((err) => {
        console.error("Error starting scanner:", err);
      });

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
            className="text-white hover:text-gray-200 p-1"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scanner */}
        <div className="p-4">
          <div 
            id="qr-reader" 
            className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100"
          ></div>
          
          <div className="text-sm text-gray-600 text-center mt-4">
            Position the QR code within the frame to scan
          </div>
          
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
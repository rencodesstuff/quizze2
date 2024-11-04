import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCcw } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const requestIOSPermissions = async () => {
    try {
      // Request permission explicitly
      const permissionResult = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" }, // Try to use back camera first
        },
      });

      // Stop the stream immediately after getting permission
      permissionResult.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      // If back camera fails, try any camera
      try {
        const fallbackResult = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        fallbackResult.getTracks().forEach((track) => track.stop());
        return true;
      } catch (fallbackErr) {
        console.error("Camera permission error:", fallbackErr);
        return false;
      }
    }
  };

  const initializeScanner = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // For iOS devices
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const hasPermission = await requestIOSPermissions();
        if (!hasPermission) {
          throw new Error(
            "Camera access denied.\n\n" +
              "To enable camera access:\n" +
              "1. Close this window\n" +
              "2. Go to iOS Settings\n" +
              "3. Find Safari settings\n" +
              '4. Select "Camera"\n' +
              '5. Choose "Allow"\n' +
              "6. Return and try again"
          );
        }
      }

      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }

      scannerRef.current = new Html5Qrcode("qr-reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: Math.min(250, window.innerWidth - 50),
            height: Math.min(250, window.innerWidth - 50),
          },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: { ideal: "environment" },
          },
        },
        async (decodedText) => {
          try {
            if (scannerRef.current) {
              await scannerRef.current.stop();
            }
            onScan(decodedText);
          } catch (error) {
            console.error("Error processing scan:", error);
            setError("Failed to process QR code. Please try again.");
          }
        },
        undefined
      );
    } catch (err) {
      console.error("Scanner initialization error:", err);
      if (err instanceof Error) {
        if (err.message.includes("Camera access denied")) {
          setError(err.message);
        } else if (err.message.includes("NotAllowedError")) {
          setError(
            "Camera access denied.\n\n" +
              "To enable camera access:\n" +
              "1. Close this window\n" +
              "2. Go to iOS Settings\n" +
              "3. Find Safari settings\n" +
              '4. Select "Camera"\n' +
              '5. Choose "Allow"\n' +
              "6. Return and try again"
          );
        } else {
          setError(
            "Failed to initialize camera. Please check camera permissions and try again."
          );
        }
      } else {
        setError(
          "Failed to initialize camera. Please check camera permissions and try again."
        );
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeScanner();

    return () => {
      const cleanup = async () => {
        try {
          if (scannerRef.current) {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, []);

  const handleRetry = async () => {
    await initializeScanner();
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

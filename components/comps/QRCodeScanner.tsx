// components/comps/QRCodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const getErrorMessage = (error: Error | string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
};

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => `${prev}\n${info}`);
  };

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      try {
        // Basic environment checks
        addDebugInfo('Browser Environment:');
        addDebugInfo(`Secure Context: ${window.isSecureContext}`);
        addDebugInfo(`User Agent: ${navigator.userAgent}`);
        addDebugInfo(`mediaDevices available: ${!!navigator.mediaDevices}`);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available on this device/browser');
        }

        // List available devices
        addDebugInfo('Checking available devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        addDebugInfo(`Found video devices: ${videoDevices.length}`);
        videoDevices.forEach((device, index) => {
          addDebugInfo(`Camera ${index + 1}: ${device.label || 'unnamed device'}`);
        });

        // Request camera permissions
        addDebugInfo('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!mounted) {
          addDebugInfo('Component unmounted, cleaning up...');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Log active track settings
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          addDebugInfo('Active camera settings:');
          addDebugInfo(JSON.stringify(settings, null, 2));
        }

        // Initialize QR Scanner
        if (videoRef.current) {
          addDebugInfo('Initializing QR scanner...');
          
          if (scannerRef.current) {
            addDebugInfo('Stopping existing scanner...');
            scannerRef.current.stop();
          }

          scannerRef.current = new QrScanner(
            videoRef.current,
            result => {
              addDebugInfo(`QR code detected: ${result.data}`);
              if (mounted) {
                onScan(result.data);
              }
            },
            {
              preferredCamera: 'environment',
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 3,
              returnDetailedScanResult: true,
              onDecodeError: (error: Error | string) => {
                const errorMessage = getErrorMessage(error);
                if (!errorMessage.includes('No QR code found')) {
                  addDebugInfo(`Decode error: ${errorMessage}`);
                }
              },
            }
          );

          await scannerRef.current.start();
          addDebugInfo('QR scanner started successfully');
          setIsInitializing(false);
        }

      } catch (err) {
        addDebugInfo('Error occurred during initialization:');
        if (err instanceof Error) {
          addDebugInfo(err.stack || err.message);
        } else {
          addDebugInfo(String(err));
        }
        
        if (mounted) {
          let errorMessage = 'Camera initialization failed:\n';
          
          if (err instanceof Error) {
            switch (err.name) {
              case 'NotSupportedError':
                errorMessage += 'Camera API not supported in this browser.';
                break;
              case 'NotAllowedError':
                errorMessage += 'Camera access denied. Please check your browser settings and permissions.';
                break;
              case 'NotFoundError':
                errorMessage += 'No camera found on this device.';
                break;
              case 'NotReadableError':
                errorMessage += 'Camera is already in use by another application.';
                break;
              case 'SecurityError':
                errorMessage += 'Camera access blocked by browser security settings.';
                break;
              default:
                errorMessage += `${err.name}: ${err.message}`;
            }
          } else {
            errorMessage += 'An unexpected error occurred while initializing the camera.';
          }
          
          setError(errorMessage);
          setIsInitializing(false);
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        addDebugInfo('Cleaning up scanner...');
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  const handleRetry = async () => {
    setError(null);
    setIsInitializing(true);
    setDebugInfo('Retrying camera initialization...');
    
    try {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available after retry');
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
        addDebugInfo('Scanner restarted successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugInfo('Retry failed:');
      addDebugInfo(errorMessage);
      setError('Failed to initialize camera. Please check your camera permissions.');
    }
    setIsInitializing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
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
            <pre className="mt-4 text-xs text-gray-500 whitespace-pre-wrap break-words max-w-xs mx-auto overflow-auto h-48 p-2 bg-gray-50 rounded">
              {debugInfo}
            </pre>
          </div>
        ) : error ? (
          <div className="text-center px-4">
            <p className="text-red-500 mb-6 whitespace-pre-line">{error}</p>
            <pre className="mt-4 text-xs text-gray-500 whitespace-pre-wrap break-words max-w-xs mx-auto overflow-auto h-48 p-2 bg-gray-50 rounded">
              {debugInfo}
            </pre>
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
            <pre className="mt-4 text-xs text-gray-500 whitespace-pre-wrap break-words max-w-xs mx-auto overflow-auto h-24 p-2 bg-gray-50 rounded">
              {debugInfo}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { X, Monitor, ArrowLeft } from 'lucide-react';
import { Card } from '@/ui/card';

// Enhanced device and viewport detection hook
const useDeviceAndViewport = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    viewportWidth: 0,
    viewportHeight: 0
  });

  useEffect(() => {
    const checkDevice = () => {
      setDeviceInfo({
        isMobile: window.innerWidth <= 768,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      });
    };

    // Initial check
    checkDevice();

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceInfo;
};

const DeviceRestrictionModal = () => {
  const router = useRouter();
  const { viewportWidth, viewportHeight } = useDeviceAndViewport();

  const handleGoBack = () => {
    router.push('/stdquiz');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-red-600">Device & Display Requirements</h2>
          <X className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4">
            <Monitor className="w-12 h-12 text-blue-500" />
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-red-700 text-sm font-medium">
              Your current display configuration:
            </p>
            <p className="text-red-600 text-sm mt-1">
              Width: {viewportWidth}px, Height: {viewportHeight}px
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <p className="text-amber-800 text-sm">
              This quiz requires:
            </p>
            <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
              <li>Desktop device</li>
              <li>Minimum viewport width: 1024px</li>
              <li>Minimum viewport height: 768px</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h3 className="text-blue-800 font-medium mb-2">Why these requirements?</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Ensure proper display of quiz content</li>
              <li>• Maintain academic integrity</li>
              <li>• Support all question types properly</li>
              <li>• Enable security features</li>
            </ul>
          </div>

          <button
            onClick={handleGoBack}
            className="w-full mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back to Quiz List
          </button>
        </div>
      </Card>
    </div>
  );
};

// Enhanced Device Control Component
const DeviceControl = ({ 
  children, 
  strictMode 
}: { 
  children: React.ReactNode;
  strictMode: boolean;
}) => {
  const { isMobile, viewportWidth, viewportHeight } = useDeviceAndViewport();
  const isValidViewport = viewportWidth >= 1024 && viewportHeight >= 768;

  if (strictMode && (isMobile || !isValidViewport)) {
    return <DeviceRestrictionModal />;
  }

  return <>{children}</>;
};

export default DeviceControl;
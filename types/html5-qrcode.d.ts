declare module 'html5-qrcode' {
    export class Html5Qrcode {
      constructor(elementId: string);
      start(
        cameraIdOrConfig: string | MediaTrackConstraints,
        config: {
          fps: number;
          qrbox?: { width: number; height: number } | number;
          aspectRatio?: number;
        },
        onScanSuccess: (decodedText: string, decodedResult: any) => void,
        onScanError: (errorMessage: string, error: any) => void
      ): Promise<void>;
      stop(): Promise<void>;
      clear(): void;
      isScanning: boolean;
    }
  }
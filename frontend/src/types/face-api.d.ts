// Type declarations for face-api.js
// This file helps TypeScript recognize face-api.js module
// The actual types will come from the installed package

declare module 'face-api.js' {
  export interface Point {
    x: number;
    y: number;
  }

  export interface FaceDetection {
    score: number;
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }

  export interface FaceLandmarks68 {
    positions: Point[];
    getLeftEye(): Point[];
    getRightEye(): Point[];
    getNose(): Point[];
    getMouth(): Point[];
  }

  export interface FaceDetectionWithLandmarks extends FaceDetection {
    landmarks: FaceLandmarks68;
  }

  export interface TinyFaceDetectorOptions {
    inputSize?: number;
    scoreThreshold?: number;
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: TinyFaceDetectorOptions);
  }

  export namespace nets {
    export const tinyFaceDetector: {
      loadFromUri(uri: string): Promise<void>;
    };
    export const faceLandmark68Net: {
      loadFromUri(uri: string): Promise<void>;
    };
  }

  export function detectAllFaces(
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): Promise<FaceDetectionWithLandmarks[]>;
  };
}


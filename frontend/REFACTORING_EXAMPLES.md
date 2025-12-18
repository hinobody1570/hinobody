# Refactoring Code Examples

This document shows concrete examples of how code should be refactored from the current structure to the improved structure.

---

## Example 1: Type Definitions

### Before (Current)

```typescript
// EyeMaskingForm.tsx - Types scattered or using `any`
const [masks, setMasks] = useState<any>([]);
const [croppedMasks, setCroppedMasks] = useState<any>([]);
const [imageFile, setImageFile] = useState<any>(null);
```

### After (Refactored)

**File: `src/features/eye-masking/types/mask.types.ts`**
```typescript
export interface Mask {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CroppedMask extends Mask {
  image: Blob;
  dataURL: string;
  index: number;
}

export interface MaskBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**File: `src/features/eye-masking/types/detection.types.ts`**
```typescript
export interface FaceDetectionResult {
  keypoints: Array<{ x: number; y: number } | [number, number]>;
  box: {
    xMin?: number;
    yMin?: number;
    xMax?: number;
    yMax?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export interface DetectionValidation {
  isValid: boolean;
  issues: string[];
}

export interface HumanFaceValidation {
  isHuman: boolean;
  reason: string;
}

export interface EyeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**File: `src/features/eye-masking/types/index.ts`**
```typescript
export * from './mask.types';
export * from './detection.types';
```

**Usage in Component:**
```typescript
import type { Mask, CroppedMask } from '@/features/eye-masking/types';

const [masks, setMasks] = useState<Mask[]>([]);
const [croppedMasks, setCroppedMasks] = useState<CroppedMask[]>([]);
```

---

## Example 2: Extract Constants

### Before (Current)

```typescript
// EyeMaskingForm.tsx - Magic values scattered
const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
if (keypoints.length < 200) { ... }
if (faceRatio < 0.01 || faceRatio > 0.8) { ... }
if (glassesScore > 0.5) { ... }
```

### After (Refactored)

**File: `src/features/eye-masking/constants/detection.constants.ts`**
```typescript
// MediaPipe Face Mesh landmark indices
export const LEFT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
] as const;

export const RIGHT_EYE_INDICES = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
] as const;

export const NOSE_INDICES = [
  1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 281, 363, 360
] as const;

export const MOUTH_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318
] as const;

// Detection thresholds
export const MIN_LANDMARKS_FOR_HUMAN_FACE = 200;
export const MIN_FACE_RATIO = 0.01;
export const MAX_FACE_RATIO = 0.8;
export const MIN_FACE_ASPECT_RATIO = 0.4;
export const MAX_FACE_ASPECT_RATIO = 1.3;
export const GLASSES_DETECTION_THRESHOLD = 0.5;

// Image processing constants
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const;

export const CANVAS_QUALITY = 0.85;
export const CROP_QUALITY = 0.9;
```

**Usage:**
```typescript
import {
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  MIN_LANDMARKS_FOR_HUMAN_FACE,
  GLASSES_DETECTION_THRESHOLD,
} from '@/features/eye-masking/constants/detection.constants';

if (keypoints.length < MIN_LANDMARKS_FOR_HUMAN_FACE) { ... }
if (glassesScore > GLASSES_DETECTION_THRESHOLD) { ... }
```

---

## Example 3: Extract Utility Functions

### Before (Current)

```typescript
// EyeMaskingForm.tsx - Utilities embedded in component
const getBoundingBox = (points: any) => {
  if (!points || points.length === 0) return null;
  const xCoords = points.map((p: any) => p.x);
  const yCoords = points.map((p: any) => p.y);
  // ... 15 lines
};

const getCanvasCoordinates = (e: any) => {
  const canvas: any = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  // ... 10 lines
};
```

### After (Refactored)

**File: `src/features/eye-masking/utils/canvas.utils.ts`**
```typescript
import type { MaskBounds } from '../types';

export interface Point {
  x: number;
  y: number;
}

/**
 * Get bounding box from an array of points
 */
export function getBoundingBox(points: Point[]): MaskBounds | null {
  if (!points || points.length === 0) return null;

  const xCoords = points.map((p) => p.x);
  const yCoords = points.map((p) => p.y);

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get canvas coordinates from mouse event
 */
export function getCanvasCoordinates(
  event: MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}
```

**File: `src/features/eye-masking/utils/image.utils.ts`**
```typescript
import imageCompression from 'browser-image-compression';
import { IMAGE_COMPRESSION_OPTIONS } from '../constants/detection.constants';

/**
 * Compress image client-side
 */
export async function compressImage(blob: Blob): Promise<Blob> {
  try {
    return await imageCompression(blob, IMAGE_COMPRESSION_OPTIONS);
  } catch (error) {
    console.error('Error compressing image:', error);
    return blob; // Return original if compression fails
  }
}

/**
 * Create image preview from file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**Usage:**
```typescript
import { getBoundingBox, getCanvasCoordinates } from '@/features/eye-masking/utils/canvas.utils';
import { compressImage } from '@/features/eye-masking/utils/image.utils';
```

---

## Example 4: Extract Service Classes

### Before (Current)

```typescript
// EyeMaskingForm.tsx - S3 upload logic embedded
const uploadToS3 = async (blob: any, fileName: any) => {
  const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
  });
  // ... 20 lines
};
```

### After (Refactored)

**File: `src/lib/aws/s3.client.ts`**
```typescript
import { S3Client } from '@aws-sdk/client-s3';

export function createS3Client() {
  return new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
    },
  });
}
```

**File: `src/features/eye-masking/services/s3Upload.service.ts`**
```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/lib/aws/s3.client';

export class S3UploadService {
  private client = createS3Client();
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '';
    if (!this.bucketName) {
      throw new Error(
        'AWS S3 bucket name not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET environment variable.'
      );
    }
  }

  async uploadImage(blob: Blob, fileName: string): Promise<string> {
    const key = `masked-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: blob,
      ContentType: 'image/jpeg',
    });

    await this.client.send(command);
    return key;
  }
}
```

**Usage:**
```typescript
import { S3UploadService } from '@/features/eye-masking/services/s3Upload.service';

const uploadService = new S3UploadService();
const s3Key = await uploadService.uploadImage(blob, fileName);
```

---

## Example 5: Extract Custom Hooks

### Before (Current)

```typescript
// EyeMaskingForm.tsx - All logic in component
const EyeMaskingForm = () => {
  const [model, setModel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // ... 50+ lines of state
  // ... 200+ lines of detection logic
  // ... 100+ lines of upload logic
};
```

### After (Refactored)

**File: `src/features/eye-masking/hooks/useFaceDetection.ts`**
```typescript
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { createDetector, SupportedModels } from '@tensorflow-models/face-landmarks-detection';
import { FaceDetectionService } from '../services/faceDetection.service';
import type { Mask } from '../types';

export function useFaceDetection() {
  const [model, setModel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const detectionService = new FaceDetectionService();

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsProcessing(true);
        await tf.ready();

        let faceLandmarksModel;
        try {
          faceLandmarksModel = await createDetector(SupportedModels.MediaPipeFaceMesh, {
            runtime: 'mediapipe',
            maxFaces: 5,
            refineLandmarks: true,
          });
        } catch (mediapipeError) {
          console.warn('MediaPipe runtime failed, trying TensorFlow.js runtime...', mediapipeError);
          faceLandmarksModel = await createDetector(SupportedModels.MediaPipeFaceMesh, {
            runtime: 'tfjs',
            maxFaces: 5,
            refineLandmarks: true,
          });
        }

        setModel(faceLandmarksModel);
        setError(null);
      } catch (err: any) {
        console.error('Error loading model:', err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };

    loadModel();
  }, []);

  const detectEyes = async (
    imagePreview: string,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    if (!model || !canvasRef.current || !imagePreview) {
      throw new Error('Model not loaded or image not selected');
    }

    setIsProcessing(true);
    try {
      const detectedMasks = await detectionService.detectAndMaskEyes(
        imagePreview,
        canvasRef.current,
        model
      );
      setMasks(detectedMasks);
      return detectedMasks;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    model,
    isProcessing,
    masks,
    error,
    detectEyes,
    setMasks,
  };
}
```

**File: `src/features/eye-masking/hooks/useS3Upload.ts`**
```typescript
import { useState } from 'react';
import { S3UploadService } from '../services/s3Upload.service';
import { compressImage } from '../utils/image.utils';

export function useS3Upload() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadService = new S3UploadService();

  const uploadImage = async (blob: Blob, fileName: string) => {
    setIsUploading(true);
    setUploadStatus('Processing...');
    setError(null);

    try {
      // Compress image
      setUploadStatus('Compressing image...');
      const compressedBlob = await compressImage(blob);

      // Upload to S3
      setUploadStatus('Uploading to S3...');
      const s3Key = await uploadService.uploadImage(compressedBlob, fileName);

      setUploadStatus(`Success! Image uploaded to S3: ${s3Key}`);
      return s3Key;
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      setUploadStatus(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    uploadStatus,
    isUploading,
    error,
  };
}
```

**Usage in Component:**
```typescript
import { useFaceDetection } from '@/features/eye-masking/hooks/useFaceDetection';
import { useS3Upload } from '@/features/eye-masking/hooks/useS3Upload';

const EyeMaskingForm = () => {
  const { detectEyes, isProcessing: isDetecting, masks } = useFaceDetection();
  const { uploadImage, uploadStatus, isUploading } = useS3Upload();
  
  // Clean, focused component
};
```

---

## Example 6: Split Large Component

### Before (Current)

```typescript
// EyeMaskingForm.tsx - 1160 lines, everything in one file
const EyeMaskingForm = () => {
  // 200+ lines of state
  // 300+ lines of detection logic
  // 200+ lines of validation
  // 100+ lines of upload
  // 200+ lines of canvas
  // 200+ lines of UI
  
  return (
    <div>
      {/* All UI in one component */}
    </div>
  );
};
```

### After (Refactored)

**File: `src/features/eye-masking/components/CanvasViewer.tsx`**
```typescript
'use client';

import { useEffect, useRef } from 'react';
import type { Mask } from '../types';
import styles from './CanvasViewer.module.css';

interface CanvasViewerProps {
  imagePreview: string | null;
  masks: Mask[];
  currentMask: Mask | null;
  mode: 'auto' | 'manual';
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: () => void;
}

export function CanvasViewer({
  imagePreview,
  masks,
  currentMask,
  mode,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: CanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imagePreview) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw existing masks
      masks.forEach((mask) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(mask.x, mask.y, mask.width, mask.height);
      });

      // Draw current mask
      if (currentMask) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(currentMask.x, currentMask.y, currentMask.width, currentMask.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(currentMask.x, currentMask.y, currentMask.width, currentMask.height);
      }
    };

    img.src = imagePreview;
  }, [imagePreview, masks, currentMask]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: mode === 'manual' ? 'crosshair' : 'default' }}
      />
    </div>
  );
}
```

**File: `src/features/eye-masking/components/MaskControls.tsx`**
```typescript
'use client';

import type { Mask } from '../types';
import styles from './MaskControls.module.css';

interface MaskControlsProps {
  masks: Mask[];
  onClear: () => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function MaskControls({ masks, onClear, onRemove, disabled }: MaskControlsProps) {
  if (masks.length === 0) return null;

  return (
    <div className={styles.controls}>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className={styles.clearButton}
      >
        Clear All Masks ({masks.length})
      </button>

      <div className={styles.masksList}>
        {masks.map((mask, index) => (
          <div key={index} className={styles.maskItem}>
            <span>Mask {index + 1}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className={styles.removeButton}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**File: `src/features/eye-masking/components/EyeMaskingForm.tsx` (Refactored)**
```typescript
'use client';

import { useState } from 'react';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useS3Upload } from '../hooks/useS3Upload';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { CanvasViewer } from './CanvasViewer';
import { MaskControls } from './MaskControls';
import { UploadStatus } from './UploadStatus';
import styles from './EyeMaskingForm.module.css';

export function EyeMaskingForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  const { detectEyes, isProcessing: isDetecting, masks, setMasks, model, error: detectionError } = useFaceDetection();
  const { uploadImage, uploadStatus, isUploading } = useS3Upload();
  const { canvasRef, currentMask, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvasDrawing(
    imagePreview,
    mode,
    setMasks
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setMasks([]);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectEyes = async () => {
    if (!imagePreview || !canvasRef.current) return;
    await detectEyes(imagePreview, canvasRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || masks.length === 0) return;

    try {
      const blob = await getMaskedImageBlob();
      if (blob) {
        await uploadImage(blob, imageFile.name);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getMaskedImageBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    return new Promise((resolve) => {
      canvasRef.current?.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  };

  return (
    <div className={styles.container}>
      <h1>Eye Detection & Masking Tool</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="image-upload">Select Image:</label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isDetecting || isUploading}
          />
        </div>

        {imagePreview && (
          <>
            <div className={styles.modeSelector}>
              <label>
                <input
                  type="radio"
                  value="auto"
                  checked={mode === 'auto'}
                  onChange={(e) => setMode(e.target.value as 'auto' | 'manual')}
                  disabled={isDetecting || isUploading}
                />
                Automatic (AI Detection)
              </label>
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={(e) => setMode(e.target.value as 'auto' | 'manual')}
                  disabled={isDetecting || isUploading}
                />
                Manual Masking
              </label>
            </div>

            <CanvasViewer
              imagePreview={imagePreview}
              masks={masks}
              currentMask={currentMask}
              mode={mode}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            <div className={styles.controls}>
              {mode === 'auto' && (
                <button
                  type="button"
                  onClick={handleDetectEyes}
                  disabled={isDetecting || !model}
                  className={styles.primaryButton}
                >
                  {isDetecting ? 'Detecting...' : 'Detect & Mask Eyes'}
                </button>
              )}

              <MaskControls
                masks={masks}
                onClear={() => setMasks([])}
                onRemove={(index) => setMasks(masks.filter((_, i) => i !== index))}
                disabled={isDetecting || isUploading}
              />

              <button
                type="submit"
                disabled={isUploading || masks.length === 0}
                className={styles.submitButton}
              >
                {isUploading ? 'Processing...' : 'Upload Masked Image'}
              </button>
            </div>

            {uploadStatus && <UploadStatus status={uploadStatus} />}
          </>
        )}
      </form>
    </div>
  );
}
```

**Result**: Main component reduced from 1160 lines to ~150 lines, with clear separation of concerns.

---

## Example 7: Update Import in page.tsx

### Before

```typescript
// src/app/[locale]/page.tsx
import dynamic from "next/dynamic";
import EyeMaskingForm from '@/pages/EyeMaskingForm';

const EyeMaskingForm = dynamic(() => import("@/pages/EyeMaskingForm"), {
  ssr: false,
  loading: LoadingComponent,
});
```

### After

```typescript
// src/app/[locale]/page.tsx
import dynamic from "next/dynamic";
import { EyeMaskingForm } from '@/features/eye-masking/components/EyeMaskingForm';

const EyeMaskingFormDynamic = dynamic(
  () => import('@/features/eye-masking/components/EyeMaskingForm').then(mod => ({ default: mod.EyeMaskingForm })),
  {
    ssr: false,
    loading: LoadingComponent,
  }
);
```

---

## Summary

These examples demonstrate:

1. **Type Safety**: Moving from `any` to proper TypeScript types
2. **Separation of Concerns**: Splitting UI, logic, and data access
3. **Reusability**: Creating hooks and services that can be reused
4. **Maintainability**: Smaller, focused files that are easier to understand
5. **Testability**: Pure functions and services that are easy to test
6. **Scalability**: Structure that supports adding new features easily


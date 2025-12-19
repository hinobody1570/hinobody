# Next.js Project Refactoring Guide

## Executive Summary

This guide provides a comprehensive refactoring plan to transform your Next.js project from a basic structure to a production-ready, scalable architecture following industry best practices.

---

## 📊 Current Structure Analysis

### Current Folder Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # Only 1 component
│   └── LanguageSwitcher.tsx
├── pages/                  # ❌ Confusing - not Next.js Pages Router
│   ├── EyeMaskingForm.tsx  # 1160 lines - mixed concerns
│   └── EyeMaskingForm.css
├── i18n/                   # i18n configuration
│   ├── config.ts
│   ├── request.ts
│   └── routing.ts
└── middleware.ts
```

### Identified Issues

#### 🔴 Critical Issues

1. **Misleading `pages/` folder**: Not using Next.js Pages Router, but has a `pages/` folder
2. **Monolithic component**: `EyeMaskingForm.tsx` (1160 lines) violates Single Responsibility Principle
3. **Mixed concerns**: UI, business logic, data access, and utilities all in one file
4. **No separation of concerns**: No clear boundaries between layers
5. **Missing structure**: No hooks, services, utils, types, or API routes organization

#### 🟡 Medium Issues

6. **No feature-based organization**: Everything is flat
7. **No path aliases for features**: Only basic `@/*` alias
8. **No type definitions**: Types likely scattered or inline
9. **No utility functions**: Helpers likely embedded in components
10. **No custom hooks**: Logic not reusable

#### 🟢 Minor Issues

11. **CSS co-location**: CSS file separate from component
12. **No constants/config**: Magic values scattered
13. **No error boundaries**: No error handling structure

---

## 🎯 Proposed Improved Structure

### New Folder Structure

```
frontend/src/
├── app/                          # Next.js App Router (routes & layouts)
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── loading.tsx           # Loading UI
│   ├── api/                      # API routes (if needed)
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── not-found.tsx             # 404 page
│
├── features/                     # ✨ Feature-based organization
│   └── eye-masking/
│       ├── components/           # Feature-specific components
│       │   ├── EyeMaskingForm.tsx
│       │   ├── EyeMaskingForm.module.css
│       │   ├── CanvasViewer.tsx
│       │   ├── MaskControls.tsx
│       │   └── UploadStatus.tsx
│       ├── hooks/                # Feature-specific hooks
│       │   ├── useFaceDetection.ts
│       │   ├── useImageProcessing.ts
│       │   ├── useCanvasDrawing.ts
│       │   └── useS3Upload.ts
│       ├── services/             # Business logic & data access
│       │   ├── faceDetection.service.ts
│       │   ├── imageProcessing.service.ts
│       │   ├── s3Upload.service.ts
│       │   └── validation.service.ts
│       ├── types/                # Feature-specific types
│       │   ├── detection.types.ts
│       │   ├── mask.types.ts
│       │   └── index.ts
│       ├── utils/                # Feature-specific utilities
│       │   ├── canvas.utils.ts
│       │   ├── image.utils.ts
│       │   └── validation.utils.ts
│       ├── constants/            # Feature constants
│       │   └── detection.constants.ts
│       └── index.ts              # Public API (barrel export)
│
├── components/                   # Shared/global components
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Select/
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   └── LoadingSpinner/
│   │       ├── LoadingSpinner.tsx
│   │       └── index.ts
│   ├── layout/                   # Layout components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       └── index.ts
│   └── common/                   # Common shared components
│       ├── LanguageSwitcher/
│       │   ├── LanguageSwitcher.tsx
│       │   └── index.ts
│       └── ErrorBoundary/
│           ├── ErrorBoundary.tsx
│           └── index.ts
│
├── lib/                          # Third-party integrations & configs
│   ├── aws/                      # AWS SDK configuration
│   │   ├── s3.client.ts
│   │   └── config.ts
│   ├── tensorflow/               # TensorFlow setup
│   │   └── model.loader.ts
│   └── i18n/                     # i18n configuration (moved from src/i18n)
│       ├── config.ts
│       ├── request.ts
│       └── routing.ts
│
├── hooks/                        # Shared/global hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── utils/                        # Shared utilities
│   ├── format.ts
│   ├── validation.ts
│   └── error.ts
│
├── types/                        # Global types & schemas
│   ├── common.types.ts
│   ├── api.types.ts
│   └── index.ts
│
├── constants/                    # Global constants
│   ├── routes.constants.ts
│   └── config.constants.ts
│
├── styles/                       # Global styles
│   ├── globals.css
│   └── variables.css
│
└── middleware.ts                 # Next.js middleware
```

---

## 🔄 Before vs After Comparison

### Component Organization

#### Before
```
src/
├── components/
│   └── LanguageSwitcher.tsx
└── pages/                        # ❌ Confusing name
    └── EyeMaskingForm.tsx        # ❌ 1160 lines, mixed concerns
```

#### After
```
src/
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── layout/                   # Layout components
│   └── common/                   # Shared components
│       └── LanguageSwitcher/
│           ├── LanguageSwitcher.tsx
│           └── index.ts
└── features/
    └── eye-masking/
        ├── components/           # Feature-specific components
        │   ├── EyeMaskingForm.tsx
        │   ├── CanvasViewer.tsx
        │   └── MaskControls.tsx
        └── ...
```

### Business Logic Separation

#### Before
```typescript
// EyeMaskingForm.tsx - Everything in one file
const EyeMaskingForm = () => {
  // 200+ lines of state management
  // 300+ lines of face detection logic
  // 200+ lines of validation logic
  // 100+ lines of S3 upload logic
  // 200+ lines of canvas manipulation
  // 200+ lines of UI rendering
}
```

#### After
```typescript
// features/eye-masking/components/EyeMaskingForm.tsx
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useS3Upload } from '../hooks/useS3Upload';
import { CanvasViewer } from './CanvasViewer';
import { MaskControls } from './MaskControls';

const EyeMaskingForm = () => {
  const { detectEyes, isProcessing } = useFaceDetection();
  const { uploadImage, uploadStatus } = useS3Upload();
  // Clean, focused component (~100 lines)
}
```

### Type Definitions

#### Before
```typescript
// Types scattered or inline
const [masks, setMasks] = useState<any>([]);
const [imageFile, setImageFile] = useState<any>(null);
```

#### After
```typescript
// features/eye-masking/types/mask.types.ts
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

// Usage
import type { Mask, CroppedMask } from '../types';
const [masks, setMasks] = useState<Mask[]>([]);
```

---

## 🚀 Migration Strategy

### Phase 1: Foundation (Non-Breaking)

#### Step 1.1: Create New Folder Structure
```bash
# Create feature-based structure
mkdir -p src/features/eye-masking/{components,hooks,services,types,utils,constants}
mkdir -p src/components/{ui,layout,common}
mkdir -p src/lib/{aws,tensorflow}
mkdir -p src/{hooks,utils,types,constants,styles}
```

#### Step 1.2: Move i18n to lib
```bash
mv src/i18n src/lib/i18n
```

**Update imports:**
```typescript
// Before
import { routing } from '@/i18n/routing';

// After
import { routing } from '@/lib/i18n/routing';
```

#### Step 1.3: Update Path Aliases in tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"]
    }
  }
}
```

### Phase 2: Extract Types (Non-Breaking)

#### Step 2.1: Create Type Definitions

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
  keypoints: Array<{ x: number; y: number }>;
  box: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
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
```

**File: `src/features/eye-masking/types/index.ts`**
```typescript
export * from './mask.types';
export * from './detection.types';
```

#### Step 2.2: Update Component to Use Types
```typescript
// Replace `any` types gradually
import type { Mask, CroppedMask } from '../types';

const [masks, setMasks] = useState<Mask[]>([]);
const [croppedMasks, setCroppedMasks] = useState<CroppedMask[]>([]);
```

### Phase 3: Extract Services (Non-Breaking)

#### Step 3.1: Extract Face Detection Service

**File: `src/features/eye-masking/services/faceDetection.service.ts`**
```typescript
import type { FaceDetectionResult, DetectionValidation, HumanFaceValidation } from '../types';

export class FaceDetectionService {
  // Move detectAndMaskEyes logic here
  // Move validateHumanFace logic here
  // Move validateEyeDetection logic here
  // Move detectGlasses logic here
}
```

#### Step 3.2: Extract Image Processing Service

**File: `src/features/eye-masking/services/imageProcessing.service.ts`**
```typescript
export class ImageProcessingService {
  // Move compressImage logic here
  // Move cropMaskedRegions logic here
  // Move getBoundingBox logic here
}
```

#### Step 3.3: Extract S3 Upload Service

**File: `src/features/eye-masking/services/s3Upload.service.ts`**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3UploadService {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(blob: Blob, fileName: string): Promise<string> {
    // Move uploadToS3 logic here
  }
}
```

#### Step 3.4: Extract Validation Service

**File: `src/features/eye-masking/services/validation.service.ts`**
```typescript
export class ValidationService {
  validateHumanFace(prediction: any, img: any, leftEyeBounds: any, rightEyeBounds: any): HumanFaceValidation {
    // Move validateHumanFace logic here
  }

  validateEyeDetection(keypoints: any, leftEyeBounds: any, rightEyeBounds: any, img: any, canvas: any): DetectionValidation {
    // Move validateEyeDetection logic here
  }
}
```

### Phase 4: Extract Hooks (Non-Breaking)

#### Step 4.1: Create useFaceDetection Hook

**File: `src/features/eye-masking/hooks/useFaceDetection.ts`**
```typescript
import { useState, useEffect } from 'react';
import { FaceDetectionService } from '../services/faceDetection.service';
import type { Mask } from '../types';

export function useFaceDetection() {
  const [model, setModel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masks, setMasks] = useState<Mask[]>([]);
  const detectionService = new FaceDetectionService();

  // Move model loading logic here
  // Move detectAndMaskEyes logic here

  return {
    model,
    isProcessing,
    masks,
    detectEyes: async (imagePreview: string, canvasRef: React.RefObject<HTMLCanvasElement>) => {
      // Detection logic
    },
  };
}
```

#### Step 4.2: Create useS3Upload Hook

**File: `src/features/eye-masking/hooks/useS3Upload.ts`**
```typescript
import { useState } from 'react';
import { S3UploadService } from '../services/s3Upload.service';

export function useS3Upload() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const uploadService = new S3UploadService();

  const uploadImage = async (blob: Blob, fileName: string) => {
    // Upload logic
  };

  return { uploadImage, uploadStatus, isUploading };
}
```

#### Step 4.3: Create useCanvasDrawing Hook

**File: `src/features/eye-masking/hooks/useCanvasDrawing.ts`**
```typescript
import { useState, useRef, useEffect } from 'react';
import type { Mask } from '../types';

export function useCanvasDrawing(
  imagePreview: string | null,
  mode: 'auto' | 'manual'
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  // Move canvas drawing logic here

  return {
    canvasRef,
    masks,
    setMasks,
    // ... other canvas-related state and methods
  };
}
```

### Phase 5: Split Component (Breaking - Requires Testing)

#### Step 5.1: Create Sub-Components

**File: `src/features/eye-masking/components/CanvasViewer.tsx`**
```typescript
'use client';

import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import type { Mask } from '../types';

interface CanvasViewerProps {
  imagePreview: string | null;
  masks: Mask[];
  mode: 'auto' | 'manual';
  onMaskChange: (masks: Mask[]) => void;
}

export function CanvasViewer({ imagePreview, masks, mode, onMaskChange }: CanvasViewerProps) {
  // Canvas rendering logic
}
```

**File: `src/features/eye-masking/components/MaskControls.tsx`**
```typescript
'use client';

interface MaskControlsProps {
  masks: Mask[];
  onClear: () => void;
  onRemove: (index: number) => void;
}

export function MaskControls({ masks, onClear, onRemove }: MaskControlsProps) {
  // Mask controls UI
}
```

#### Step 5.2: Refactor Main Component

**File: `src/features/eye-masking/components/EyeMaskingForm.tsx`**
```typescript
'use client';

import { useFaceDetection } from '../hooks/useFaceDetection';
import { useS3Upload } from '../hooks/useS3Upload';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { CanvasViewer } from './CanvasViewer';
import { MaskControls } from './MaskControls';
import { UploadStatus } from './UploadStatus';

export function EyeMaskingForm() {
  const { detectEyes, isProcessing: isDetecting } = useFaceDetection();
  const { uploadImage, uploadStatus, isUploading } = useS3Upload();
  const { canvasRef, masks, setMasks } = useCanvasDrawing(imagePreview, mode);

  // Much cleaner component (~100-150 lines)
}
```

### Phase 6: Move Files (Breaking - Update Imports)

#### Step 6.1: Move EyeMaskingForm
```bash
# Create feature directory structure
mkdir -p src/features/eye-masking/components

# Move and rename
mv src/pages/EyeMaskingForm.tsx src/features/eye-masking/components/EyeMaskingForm.tsx
mv src/pages/EyeMaskingForm.css src/features/eye-masking/components/EyeMaskingForm.module.css
```

#### Step 6.2: Update Import in page.tsx
```typescript
// Before
import EyeMaskingForm from '@/pages/EyeMaskingForm';

// After
import { EyeMaskingForm } from '@/features/eye-masking/components/EyeMaskingForm';
```

#### Step 6.3: Move LanguageSwitcher
```bash
mkdir -p src/components/common/LanguageSwitcher
mv src/components/LanguageSwitcher.tsx src/components/common/LanguageSwitcher/LanguageSwitcher.tsx
```

Create `src/components/common/LanguageSwitcher/index.ts`:
```typescript
export { default } from './LanguageSwitcher';
```

Update imports:
```typescript
// Before
import LanguageSwitcher from '@/components/LanguageSwitcher';

// After
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
```

### Phase 7: Extract Constants

#### Step 7.1: Create Constants Files

**File: `src/features/eye-masking/constants/detection.constants.ts`**
```typescript
// MediaPipe Face Mesh landmark indices
export const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
export const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
export const NOSE_INDICES = [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 281, 363, 360];
export const MOUTH_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];

// Detection thresholds
export const MIN_LANDMARKS_FOR_HUMAN_FACE = 200;
export const MIN_FACE_RATIO = 0.01;
export const MAX_FACE_RATIO = 0.8;
export const MIN_FACE_ASPECT_RATIO = 0.4;
export const MAX_FACE_ASPECT_RATIO = 1.3;
export const GLASSES_DETECTION_THRESHOLD = 0.5;
```

### Phase 8: Extract Utilities

#### Step 8.1: Create Utility Files

**File: `src/features/eye-masking/utils/canvas.utils.ts`**
```typescript
export function getCanvasCoordinates(
  e: MouseEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

export function getBoundingBox(points: Array<{ x: number; y: number }>) {
  if (!points || points.length === 0) return null;

  const xCoords = points.map((p) => p.x);
  const yCoords = points.map((p) => p.y);

  return {
    x: Math.min(...xCoords),
    y: Math.min(...yCoords),
    width: Math.max(...xCoords) - Math.min(...xCoords),
    height: Math.max(...yCoords) - Math.min(...yCoords),
  };
}
```

**File: `src/features/eye-masking/utils/image.utils.ts`**
```typescript
import imageCompression from 'browser-image-compression';

export async function compressImage(blob: Blob): Promise<Blob> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  return await imageCompression(blob, options);
}
```

---

## 📝 Updated Import Paths

### Component Imports

#### Before
```typescript
import EyeMaskingForm from '@/pages/EyeMaskingForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { routing } from '@/i18n/routing';
```

#### After
```typescript
import { EyeMaskingForm } from '@/features/eye-masking/components/EyeMaskingForm';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { routing } from '@/lib/i18n/routing';
```

### Service Imports

#### Before
```typescript
// Services embedded in component
```

#### After
```typescript
import { FaceDetectionService } from '@/features/eye-masking/services/faceDetection.service';
import { S3UploadService } from '@/features/eye-masking/services/s3Upload.service';
import { ImageProcessingService } from '@/features/eye-masking/services/imageProcessing.service';
```

### Hook Imports

#### Before
```typescript
// Logic embedded in component
```

#### After
```typescript
import { useFaceDetection } from '@/features/eye-masking/hooks/useFaceDetection';
import { useS3Upload } from '@/features/eye-masking/hooks/useS3Upload';
import { useCanvasDrawing } from '@/features/eye-masking/hooks/useCanvasDrawing';
```

### Type Imports

#### Before
```typescript
const [masks, setMasks] = useState<any>([]);
```

#### After
```typescript
import type { Mask, CroppedMask } from '@/features/eye-masking/types';

const [masks, setMasks] = useState<Mask[]>([]);
```

### Utility Imports

#### Before
```typescript
// Utilities embedded in component
```

#### After
```typescript
import { getBoundingBox } from '@/features/eye-masking/utils/canvas.utils';
import { compressImage } from '@/features/eye-masking/utils/image.utils';
```

---

## 🎨 Naming Conventions

### Files & Folders

1. **Components**: PascalCase
   - `EyeMaskingForm.tsx`
   - `CanvasViewer.tsx`

2. **Hooks**: camelCase with `use` prefix
   - `useFaceDetection.ts`
   - `useS3Upload.ts`

3. **Services**: camelCase with `.service.ts` suffix
   - `faceDetection.service.ts`
   - `s3Upload.service.ts`

4. **Utils**: camelCase with `.utils.ts` suffix
   - `canvas.utils.ts`
   - `image.utils.ts`

5. **Types**: camelCase with `.types.ts` suffix
   - `mask.types.ts`
   - `detection.types.ts`

6. **Constants**: camelCase with `.constants.ts` suffix
   - `detection.constants.ts`
   - `routes.constants.ts`

7. **Folders**: kebab-case for features, camelCase for others
   - `eye-masking/` (feature)
   - `components/` (shared)

### Barrel Exports (index.ts)

Each feature/module should have an `index.ts` for clean imports:

```typescript
// features/eye-masking/index.ts
export { EyeMaskingForm } from './components/EyeMaskingForm';
export { useFaceDetection } from './hooks/useFaceDetection';
export * from './types';
```

Usage:
```typescript
import { EyeMaskingForm, useFaceDetection, type Mask } from '@/features/eye-masking';
```

---

## 🔒 Avoiding Circular Dependencies

### Rules

1. **Dependency Direction**:
   ```
   components → hooks → services → utils → types
   ```

2. **No Cross-Feature Dependencies**: Features should not import from other features directly

3. **Shared Code**: Use `src/components`, `src/utils`, `src/hooks` for shared code

4. **Barrel Exports**: Use carefully - only export what's needed

### Example Structure

```
features/eye-masking/
├── components/          # Can import from hooks, services, utils, types
├── hooks/              # Can import from services, utils, types
├── services/           # Can import from utils, types
├── utils/              # Can import from types only
└── types/              # No imports (pure types)
```

---

## ✅ Migration Checklist

### Phase 1: Foundation
- [ ] Create new folder structure
- [ ] Move i18n to lib
- [ ] Update tsconfig.json path aliases
- [ ] Test that existing code still works

### Phase 2: Extract Types
- [ ] Create type definition files
- [ ] Replace `any` types gradually
- [ ] Test type safety

### Phase 3: Extract Services
- [ ] Extract FaceDetectionService
- [ ] Extract ImageProcessingService
- [ ] Extract S3UploadService
- [ ] Extract ValidationService
- [ ] Test each service independently

### Phase 4: Extract Hooks
- [ ] Create useFaceDetection hook
- [ ] Create useS3Upload hook
- [ ] Create useCanvasDrawing hook
- [ ] Test hooks in isolation

### Phase 5: Split Component
- [ ] Create CanvasViewer component
- [ ] Create MaskControls component
- [ ] Create UploadStatus component
- [ ] Refactor main EyeMaskingForm component
- [ ] Test UI functionality

### Phase 6: Move Files
- [ ] Move EyeMaskingForm to features
- [ ] Move LanguageSwitcher to components/common
- [ ] Update all imports
- [ ] Test application

### Phase 7: Extract Constants
- [ ] Create detection constants
- [ ] Replace magic values
- [ ] Test functionality

### Phase 8: Extract Utilities
- [ ] Create canvas utilities
- [ ] Create image utilities
- [ ] Test utilities

### Final
- [ ] Remove old `pages/` folder
- [ ] Update all imports
- [ ] Run full test suite
- [ ] Code review
- [ ] Deploy to staging

---

## 🚨 Common Anti-Patterns & Fixes

### Anti-Pattern 1: Everything in One File

**Problem:**
```typescript
// 1160 lines in one component
const EyeMaskingForm = () => {
  // State, logic, UI all mixed
}
```

**Fix:**
- Split into smaller components
- Extract hooks for reusable logic
- Extract services for business logic
- Extract utils for pure functions

### Anti-Pattern 2: Type Safety Ignored

**Problem:**
```typescript
const [masks, setMasks] = useState<any>([]);
```

**Fix:**
```typescript
import type { Mask } from '../types';
const [masks, setMasks] = useState<Mask[]>([]);
```

### Anti-Pattern 3: Business Logic in Components

**Problem:**
```typescript
const detectAndMaskEyes = async () => {
  // 200 lines of detection logic in component
}
```

**Fix:**
```typescript
// In service
class FaceDetectionService {
  async detectAndMaskEyes(image: string) {
    // Detection logic
  }
}

// In component
const { detectEyes } = useFaceDetection();
```

### Anti-Pattern 4: No Separation of Concerns

**Problem:**
- UI, business logic, data access all mixed

**Fix:**
- Components: UI only
- Hooks: State management & side effects
- Services: Business logic & data access
- Utils: Pure functions

### Anti-Pattern 5: Flat Structure

**Problem:**
```
src/
├── components/
├── hooks/
├── services/
└── utils/
```

**Fix:**
- Group by feature for feature-specific code
- Keep shared code at root level

---

## 📚 Additional Best Practices

### 1. Error Handling

Create error boundaries and error handling utilities:

```typescript
// components/common/ErrorBoundary/ErrorBoundary.tsx
'use client';

export class ErrorBoundary extends React.Component {
  // Error boundary implementation
}
```

### 2. Loading States

Create loading components:

```typescript
// components/ui/LoadingSpinner/LoadingSpinner.tsx
export function LoadingSpinner() {
  // Loading UI
}
```

### 3. Environment Variables

Use typed environment variables:

```typescript
// lib/config/env.ts
export const env = {
  AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION!,
  AWS_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
  // ...
} as const;
```

### 4. API Client

If you add API routes, create a typed API client:

```typescript
// lib/api/client.ts
export const apiClient = {
  upload: async (file: File) => {
    // API call
  },
};
```

---

## 🎯 Summary

This refactoring transforms your project from a basic structure to a production-ready, scalable architecture by:

1. **Organizing by feature** instead of by type
2. **Separating concerns** (UI, business logic, data access)
3. **Improving type safety** with proper TypeScript types
4. **Enabling reusability** with hooks and services
5. **Making code testable** by extracting pure functions
6. **Improving maintainability** with clear structure

The migration is designed to be **incremental and non-breaking** where possible, allowing you to refactor gradually while maintaining functionality.




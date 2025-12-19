# Folder Structure: Before vs After

## Visual Comparison

### Current Structure (Before)

```
frontend/src/
│
├── app/                          # Next.js App Router
│   ├── [locale]/
│   │   ├── layout.tsx           # Locale-specific layout
│   │   └── page.tsx             # Home page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   └── globals.css               # Global styles
│
├── components/                   # ❌ Only 1 component
│   └── LanguageSwitcher.tsx     # Language switcher
│
├── pages/                        # ❌ MISLEADING - Not Next.js Pages Router
│   ├── EyeMaskingForm.tsx        # ❌ 1160 lines - MONOLITHIC
│   └── EyeMaskingForm.css        # Separate CSS file
│
├── i18n/                         # i18n configuration
│   ├── config.ts
│   ├── request.ts
│   └── routing.ts
│
└── middleware.ts                 # Next.js middleware
```

**Issues:**
- ❌ `pages/` folder is confusing (not using Pages Router)
- ❌ Monolithic component (1160 lines)
- ❌ Mixed concerns (UI + business logic + data access)
- ❌ No separation of concerns
- ❌ No feature-based organization
- ❌ No hooks, services, utils, types folders
- ❌ Types likely scattered or using `any`

---

### Proposed Structure (After)

```
frontend/src/
│
├── app/                          # Next.js App Router (routes & layouts)
│   ├── [locale]/
│   │   ├── layout.tsx            # Locale-specific layout
│   │   ├── page.tsx              # Home page
│   │   └── loading.tsx           # Loading UI (optional)
│   ├── api/                      # API routes (if needed)
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   ├── globals.css               # Global styles
│   └── not-found.tsx             # 404 page (optional)
│
├── features/                     # ✨ Feature-based organization
│   └── eye-masking/              # Eye masking feature
│       ├── components/           # Feature-specific components
│       │   ├── EyeMaskingForm.tsx
│       │   ├── EyeMaskingForm.module.css
│       │   ├── CanvasViewer.tsx
│       │   ├── MaskControls.tsx
│       │   ├── UploadStatus.tsx
│       │   └── index.ts          # Barrel export
│       │
│       ├── hooks/                # Feature-specific hooks
│       │   ├── useFaceDetection.ts
│       │   ├── useImageProcessing.ts
│       │   ├── useCanvasDrawing.ts
│       │   ├── useS3Upload.ts
│       │   └── index.ts
│       │
│       ├── services/             # Business logic & data access
│       │   ├── faceDetection.service.ts
│       │   ├── imageProcessing.service.ts
│       │   ├── s3Upload.service.ts
│       │   ├── validation.service.ts
│       │   └── index.ts
│       │
│       ├── types/                # Feature-specific types
│       │   ├── detection.types.ts
│       │   ├── mask.types.ts
│       │   └── index.ts
│       │
│       ├── utils/                # Feature-specific utilities
│       │   ├── canvas.utils.ts
│       │   ├── image.utils.ts
│       │   ├── validation.utils.ts
│       │   └── index.ts
│       │
│       ├── constants/            # Feature constants
│       │   └── detection.constants.ts
│       │
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
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       └── index.ts
│   │
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
│   │
│   ├── tensorflow/               # TensorFlow setup
│   │   └── model.loader.ts
│   │
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

**Benefits:**
- ✅ Clear feature-based organization
- ✅ Separation of concerns (UI, logic, data)
- ✅ Reusable hooks and services
- ✅ Type safety with proper TypeScript
- ✅ Scalable structure for new features
- ✅ Easy to test and maintain

---

## File Count Comparison

### Before
- **Components**: 2 files (1 in components/, 1 in pages/)
- **Hooks**: 0 files
- **Services**: 0 files
- **Types**: 0 files (types likely inline or `any`)
- **Utils**: 0 files
- **Total**: ~8 files

### After
- **Components**: ~15 files (organized by feature + shared)
- **Hooks**: ~8 files (feature + shared)
- **Services**: ~5 files
- **Types**: ~5 files
- **Utils**: ~5 files
- **Total**: ~40 files (but much more maintainable)

---

## Import Path Comparison

### Before

```typescript
// Confusing import from "pages" folder
import EyeMaskingForm from '@/pages/EyeMaskingForm';

// Basic component import
import LanguageSwitcher from '@/components/LanguageSwitcher';

// i18n import
import { routing } from '@/i18n/routing';

// No type imports (using `any`)
const [masks, setMasks] = useState<any>([]);
```

### After

```typescript
// Clear feature-based import
import { EyeMaskingForm } from '@/features/eye-masking/components/EyeMaskingForm';

// Or using barrel export
import { EyeMaskingForm, useFaceDetection } from '@/features/eye-masking';

// Organized component import
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

// Moved i18n to lib
import { routing } from '@/lib/i18n/routing';

// Type-safe imports
import type { Mask, CroppedMask } from '@/features/eye-masking/types';
const [masks, setMasks] = useState<Mask[]>([]);

// Service imports
import { FaceDetectionService } from '@/features/eye-masking/services/faceDetection.service';

// Hook imports
import { useFaceDetection } from '@/features/eye-masking/hooks/useFaceDetection';

// Utility imports
import { getBoundingBox } from '@/features/eye-masking/utils/canvas.utils';
```

---

## Component Size Comparison

### Before

```
EyeMaskingForm.tsx: 1160 lines
├── State management: ~200 lines
├── Face detection logic: ~300 lines
├── Validation logic: ~200 lines
├── S3 upload logic: ~100 lines
├── Canvas manipulation: ~200 lines
└── UI rendering: ~200 lines
```

### After

```
EyeMaskingForm.tsx: ~100 lines (main component)
├── CanvasViewer.tsx: ~150 lines
├── MaskControls.tsx: ~80 lines
├── UploadStatus.tsx: ~50 lines
├── useFaceDetection.ts: ~150 lines
├── useS3Upload.ts: ~80 lines
├── useCanvasDrawing.ts: ~120 lines
├── faceDetection.service.ts: ~300 lines
├── imageProcessing.service.ts: ~150 lines
├── s3Upload.service.ts: ~80 lines
└── validation.service.ts: ~200 lines
```

**Result**: Each file has a single responsibility and is much easier to understand and maintain.

---

## Dependency Flow

### Before

```
EyeMaskingForm.tsx
└── Everything mixed together
    ├── UI code
    ├── Business logic
    ├── Data access
    └── Utilities
```

### After

```
EyeMaskingForm.tsx (Component - UI only)
├── useFaceDetection (Hook - state management)
│   └── FaceDetectionService (Service - business logic)
│       └── validation.utils.ts (Utils - pure functions)
│           └── detection.types.ts (Types)
│
├── useS3Upload (Hook - state management)
│   └── S3UploadService (Service - data access)
│       └── s3.client.ts (Lib - AWS config)
│
└── useCanvasDrawing (Hook - state management)
    └── canvas.utils.ts (Utils - pure functions)
```

**Result**: Clear dependency direction, no circular dependencies, easy to test.




// Stub module for @mediapipe/face_mesh
// This is used during build time to avoid import errors
// MediaPipe is loaded dynamically at runtime when using MediaPipe runtime
// When using tfjs runtime, this import is not needed

// Export FaceMesh as a class to satisfy the static import check
// This will never be used at runtime since MediaPipe is loaded dynamically
export class FaceMesh {
  constructor() {
    // Stub class - never actually instantiated
  }
}

// Default export
export default FaceMesh;





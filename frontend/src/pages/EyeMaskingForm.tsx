"use client";

import { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { createDetector, SupportedModels } from "@tensorflow-models/face-landmarks-detection";
import imageCompression from "browser-image-compression";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "./EyeMaskingForm.css";
import "@tensorflow/tfjs-backend-webgl";

const EyeMaskingForm = () => {
  const [imageFile, setImageFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [masks, setMasks] = useState<any>([]); // Array of {x, y, width, height}
  const [croppedMasks, setCroppedMasks] = useState([]); // Array of {image: blob/dataURL, x, y, width, height}
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentMask, setCurrentMask] = useState<any>(null);
  const [mode, setMode] = useState("auto"); // 'auto' or 'manual'
  const [uploadStatus, setUploadStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});

  const canvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);

  // Initialize TensorFlow.js model
  //   useEffect(() => {
  //   const loadModel = async () => {
  //     if (typeof window === "undefined") return;

  //     try {
  //       setIsProcessing(true);

  //       await tf.setBackend("webgl");
  //       await tf.ready();

  //       const faceLandmarksDetection = await import(
  //         "@tensorflow-models/face-landmarks-detection"
  //       );

  //       const { createDetector, SupportedModels } = faceLandmarksDetection;

  //       let detector;

  //       try {
  //         detector = await createDetector(
  //           SupportedModels.MediaPipeFaceMesh,
  //           {
  //             runtime: "mediapipe",
  //             solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
  //             maxFaces: 5,
  //             refineLandmarks: true,
  //           }
  //         );
  //       } catch (err) {
  //         console.warn("MediaPipe failed, falling back to tfjs", err);

  //         detector = await createDetector(
  //           SupportedModels.MediaPipeFaceMesh,
  //           {
  //             runtime: "tfjs",
  //             maxFaces: 5,
  //             refineLandmarks: true,
  //           }
  //         );
  //       }

  //       setModel(detector);
  //       setDebugInfo((prev: any) => ({
  //         ...prev,
  //         modelLoaded: true,
  //         modelError: null,
  //       }));
  //     } catch (error: any) {
  //       console.error("Model loading error:", error);

  //       setDebugInfo((prev: any) => ({
  //         ...prev,
  //         modelLoaded: false,
  //         modelError: error.message,
  //       }));
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };

  //   loadModel();
  // }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsProcessing(true);

        // Ensure TensorFlow.js is ready
        console.log("🔧 Initializing TensorFlow.js...");
        await tf.ready();
        console.log("✅ TensorFlow.js ready");
        console.log("📦 TensorFlow version:", tf.version);

        console.log("🔧 Loading face landmarks model...");
        console.log("📦 SupportedModels:", SupportedModels);
        console.log("📦 createDetector type:", typeof createDetector);

        // Use createDetector with SupportedModels enum
        // Try MediaPipe runtime first (faster, better accuracy)
        console.log("📦 Creating detector with MediaPipe runtime...");
        let faceLandmarksModel;

        try {
          faceLandmarksModel = await createDetector(SupportedModels.MediaPipeFaceMesh, {
            runtime: "mediapipe",
            maxFaces: 5,
            refineLandmarks: true,
          });
          console.log("✅ MediaPipe runtime loaded successfully");
        } catch (mediapipeError) {
          console.warn("⚠️ MediaPipe runtime failed, trying TensorFlow.js runtime...", mediapipeError);
          // Fallback to TensorFlow.js runtime
          faceLandmarksModel = await createDetector(SupportedModels.MediaPipeFaceMesh, {
            runtime: "tfjs",
            maxFaces: 5,
            refineLandmarks: true,
          });
          console.log("✅ TensorFlow.js runtime loaded successfully (fallback)");
        }

        console.log("✅ Model created:", typeof faceLandmarksModel);
        console.log("✅ Model methods:", Object.keys(faceLandmarksModel));

        setModel(faceLandmarksModel);
        console.log("✅ Face landmarks model loaded successfully");
        setDebugInfo((prev:any) => ({ ...prev, modelLoaded: true, modelError: null }));
      } catch (error:any) {
        console.error("❌ Error loading model:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error name:", error.name);
        console.error("❌ Error stack:", error.stack);
        console.error("❌ Full error object:", error);

        // Try to get more details about the error
        if (error.toString) {
          console.error("❌ Error toString:", error.toString());
        }

        setDebugInfo((prev:any) => ({
          ...prev,
          modelLoaded: false,
          modelError: `${error.name}: ${error.message}`,
        }));

        // Don't show alert if it's just a loading issue - let user try manual mode
        if (!error.message.includes("z2")) {
          alert(
            `Failed to load AI model: ${error.message}\n\nYou can still use Manual Masking mode.\n\nPlease check:\n1. Internet connection (model downloads from CDN)\n2. Browser console for details\n3. Try refreshing the page`
          );
        }
      } finally {
        setIsProcessing(false);
      }
    };

    loadModel();
  }, []);

  
  // Handle image file selection
  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📷 Image selected:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
      setImageFile(file);
      setMasks([]); // Reset masks when new image is selected
      setCroppedMasks([]); // Reset cropped masks
      setUploadStatus("");
      setDebugInfo((prev: any) => ({
        ...prev,
        imageLoaded: true,
        imageName: file.name,
        imageSize: file.size,
        croppedMasksCount: 0,
        croppedMasks: [],
      }));

      // Create preview URL (will be revoked after processing)
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setImagePreview(event.target.result);
        console.log("✅ Image preview created");
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw image and masks on canvas
  const drawCanvas = async () => {
    if (!canvasRef.current || !imagePreview) return;

    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw existing masks with semi-transparent overlay and border
      masks.forEach((mask: any) => {
        // Draw semi-transparent overlay (not fully black)
        ctx.fillStyle = "rgba(0, 0, 0, 1)"; // 60% opacity overlay
        ctx.fillRect(mask.x, mask.y, mask.width, mask.height);

        // Draw border around mask
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"; // Darker border
        ctx.lineWidth = 2;
        ctx.strokeRect(mask.x, mask.y, mask.width, mask.height);
      });

      // Draw current mask being drawn (more transparent while drawing)
      if (currentMask) {
        ctx.fillStyle = "rgba(0, 0, 0, 1)"; // More transparent while drawing
        ctx.fillRect(currentMask.x, currentMask.y, currentMask.width, currentMask.height);

        // Draw border for current mask
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.lineWidth = 2;
        ctx.strokeRect(currentMask.x, currentMask.y, currentMask.width, currentMask.height);
      }
    };

    img.src = imagePreview;
    imageRef.current = img;
  };

  useEffect(() => {
    drawCanvas();
  }, [imagePreview, masks, currentMask]);

  // Crop all masks whenever masks array changes
  useEffect(() => {
    if (masks.length > 0 && imageRef.current && imagePreview) {
      console.log(`🔄 Masks array changed (${masks.length} mask(s)), cropping ALL regions...`);
      console.log(
        "📋 Current masks:",
        masks.map((m: any, i: any) => `Mask ${i + 1}: (${m.x}, ${m.y}) ${m.width}×${m.height}`)
      );
      // Use a small delay to ensure imageRef is ready
      const timer = setTimeout(() => {
        if (imageRef.current) {
          cropMaskedRegions(masks, imageRef.current);
        } else {
          console.warn("⚠️ imageRef.current is not available for cropping");
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (masks.length === 0) {
      // Clear cropped masks when all masks are cleared
      console.log("🔄 All masks cleared, clearing cropped masks");
      setCroppedMasks([]);
      setDebugInfo((prev: any) => ({ ...prev, croppedMasksCount: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masks, imagePreview]);

  // Automatic eye detection and masking
  const detectAndMaskEyes = async () => {
    if (!model || !canvasRef.current || !imagePreview) {
      alert("Please wait for the model to load and select an image.");
      return;
    }

    setIsProcessing(true);
    setMasks([]); // Clear existing masks

    try {
      const canvas: any = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Draw image first
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Detect faces and landmarks - use image element for better compatibility
      console.log("🔍 Starting face detection...");
      console.log("📸 Image dimensions:", img.width, "x", img.height);
      console.log("🤖 Model type:", typeof model, model);

      const predictions = await model.estimateFaces(img, {
        flipHorizontal: false,
        staticImageMode: true,
      });

      console.log("✅ Predictions received:", predictions.length, "face(s)");

      console.log(`✅ Detected ${predictions.length} face(s)`);
      setDebugInfo((prev: any) => ({ ...prev, facesDetected: predictions.length }));

      const newMasks: any[] = [];

      // Use for loop instead of forEach to allow continue statement
      for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        const keypoints = prediction.keypoints || prediction.scaledMesh || [];

        if (!keypoints || keypoints.length === 0) return;

        // Eye landmarks indices (MediaPipe Face Mesh)
        // Left eye: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
        // Right eye: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398

        // Get bounding box for left eye
        const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
        const leftEyeCoords = leftEyeIndices
          .map((idx) => keypoints[idx])
          .filter((coord) => coord && (coord.x !== undefined || coord[0] !== undefined));

        // Handle different keypoint formats (object with x,y or array [x,y])
        const normalizedLeftCoords = leftEyeCoords.map((coord) => ({
          x: coord.x !== undefined ? coord.x : coord[0],
          y: coord.y !== undefined ? coord.y : coord[1],
        }));

        const leftEyeBounds = getBoundingBox(normalizedLeftCoords);

        // Get bounding box for right eye
        const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
        const rightEyeCoords = rightEyeIndices
          .map((idx) => keypoints[idx])
          .filter((coord) => coord && (coord.x !== undefined || coord[0] !== undefined));

        const normalizedRightCoords = rightEyeCoords.map((coord) => ({
          x: coord.x !== undefined ? coord.x : coord[0],
          y: coord.y !== undefined ? coord.y : coord[1],
        }));

        const rightEyeBounds = getBoundingBox(normalizedRightCoords);

        // First validate if this is actually a human face (not an object like basket, mobile, etc.)
        const faceValidation = validateHumanFace(prediction, img, leftEyeBounds, rightEyeBounds);
        console.log("faceValidation", faceValidation);
        if (!faceValidation.isHuman) {
          console.error("❌ Non-human object detected:", faceValidation.reason);
          console.error("❌ REJECTING this detection - will NOT create masks");
          setDebugInfo((prev: any) => ({
            ...prev,
            detectionError: `Non-human object detected: ${faceValidation.reason}. Please use an image with a human face.`,
            validationFailed: true,
          }));
          continue; // CRITICAL: Skip this detection - it's not a human face
        }

        console.log("✅ Human face validated:", faceValidation.reason);

        // Validate eye detection quality and check for glasses
        const validation = validateEyeDetection(keypoints, leftEyeBounds, rightEyeBounds, img, canvas);

        if (!validation.isValid) {
          console.error("❌ Eye detection validation failed:", validation.issues);
          setDebugInfo((prev: any) => ({
            ...prev,
            detectionError: validation.issues.join("; "),
            validationFailed: true,
          }));

          // Don't create mask if validation fails
          const errorMessage = `⚠️ Eye Detection Issue:\n\n${validation.issues.join(
            "\n"
          )}\n\nPlease:\n- Remove glasses if wearing them\n- Ensure eyes are clearly visible\n- Use Manual Masking mode instead`;
          alert(errorMessage);
          return; // Skip this face
        }

        // Create a SINGLE mask covering BOTH eyes (full eye area)
        if (
          leftEyeBounds &&
          rightEyeBounds &&
          leftEyeBounds.width > 0 &&
          leftEyeBounds.height > 0 &&
          rightEyeBounds.width > 0 &&
          rightEyeBounds.height > 0
        ) {
          // Calculate bounding box that covers both eyes
          const minX = Math.min(leftEyeBounds.x, rightEyeBounds.x);
          const maxX = Math.max(leftEyeBounds.x + leftEyeBounds.width, rightEyeBounds.x + rightEyeBounds.width);
          const minY = Math.min(leftEyeBounds.y, rightEyeBounds.y);
          const maxY = Math.max(leftEyeBounds.y + leftEyeBounds.height, rightEyeBounds.y + rightEyeBounds.height);

          // Add some padding for full eye coverage
          const paddingX = (maxX - minX) * 0.1; // 10% padding horizontally
          const paddingY = (maxY - minY) * 0.2; // 20% padding vertically

          const combinedMask = {
            x: Math.max(0, minX - paddingX),
            y: Math.max(0, minY - paddingY),
            width: maxX - minX + paddingX * 2,
            height: maxY - minY + paddingY * 2,
          };

          newMasks.push(combinedMask);
          console.log("✅ Created combined eye mask covering both eyes:", combinedMask);
          console.log("✅ Eye validation passed:", validation.issues);
        } else if (leftEyeBounds && leftEyeBounds.width > 0 && leftEyeBounds.height > 0) {
          // Fallback: if only left eye detected, use it with padding
          const paddingX = leftEyeBounds.width * 0.2;
          const paddingY = leftEyeBounds.height * 0.2;
          newMasks.push({
            x: Math.max(0, leftEyeBounds.x - paddingX),
            y: Math.max(0, leftEyeBounds.y - paddingY),
            width: leftEyeBounds.width + paddingX * 2,
            height: leftEyeBounds.height + paddingY * 2,
          });
        } else if (rightEyeBounds && rightEyeBounds.width > 0 && rightEyeBounds.height > 0) {
          // Fallback: if only right eye detected, use it with padding
          const paddingX = rightEyeBounds.width * 0.2;
          const paddingY = rightEyeBounds.height * 0.2;
          newMasks.push({
            x: Math.max(0, rightEyeBounds.x - paddingX),
            y: Math.max(0, rightEyeBounds.y - paddingY),
            width: rightEyeBounds.width + paddingX * 2,
            height: rightEyeBounds.height + paddingY * 2,
          });
        }
      }

      setMasks(newMasks);
      console.log(`✅ Created ${newMasks.length} eye mask(s):`, newMasks);
      setDebugInfo((prev: any) => ({ ...prev, masksCreated: newMasks.length, masks: newMasks }));

      if (newMasks.length === 0) {
        console.warn("⚠️ No valid masks created after validation.");
        const errorMsg = debugInfo.detectionError
          ? `Detection Failed:\n\n${debugInfo.detectionError}\n\nPlease use an image with a clear human face, or use Manual Masking mode instead.`
          : "No eyes detected. You can use manual masking instead.";
        alert(errorMsg);
        setDebugInfo((prev: any) => ({ ...prev, validationFailed: true }));
        setMasks([]); // Ensure no masks are set
        setCroppedMasks([]); // Clear any cropped masks
      } else {
        console.log("✅ Eye masking completed successfully!");
        console.log('📝 Masks are now applied to the image. Click "Upload Masked Image" to save and upload.');
        setDebugInfo((prev: any) => ({ ...prev, validationFailed: false, detectionError: null }));

        // Note: Cropping will happen automatically via useEffect when masks state updates
      }

      // After detection, the masks are stored in state and displayed on canvas
      // The masked image is ready but NOT uploaded yet
      // User must click "Upload Masked Image" button to upload to S3
    } catch (error: any) {
      console.error("❌ Error detecting eyes:", error);
      setDebugInfo((prev: any) => ({ ...prev, detectionError: error.message }));
      alert("Error detecting eyes. Please try manual masking.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get bounding box from points
  const getBoundingBox = (points: any) => {
    if (!points || points.length === 0) return null;

    const xCoords = points.map((p: any) => p.x);
    const yCoords = points.map((p: any) => p.y);

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
  };

  // Validate if detection is actually a human face (not an object)
  const validateHumanFace = (prediction: any, img: any, leftEyeBounds: any, rightEyeBounds: any) => {
    const keypoints = prediction.keypoints || prediction.scaledMesh || [];

    if (!keypoints || keypoints.length === 0) {
      return { isHuman: false, reason: "No face landmarks detected" };
    }

    // Check if we have enough keypoints (human faces have many landmarks)
    // MediaPipe Face Mesh has 468 landmarks for human faces
    if (keypoints.length < 200) {
      console.log(`⚠️ Only ${keypoints.length} landmarks detected - human faces typically have 400+ landmarks`);
      return { isHuman: false, reason: "Insufficient landmarks detected - this is not a human face" };
    }

    // Get face bounding box from prediction
    const box = prediction.box;
    if (!box) {
      return { isHuman: false, reason: "No face bounding box detected" };
    }

    // Validate face size - human faces should be reasonably sized
    const boxWidth = box.width || box.xMax - box.xMin || box.right - box.left;
    const boxHeight = box.height || box.yMax - box.yMin || box.bottom - box.top;

    if (!boxWidth || !boxHeight) {
      return { isHuman: false, reason: "Invalid face bounding box" };
    }

    const faceArea = boxWidth * boxHeight;
    const imageArea = img.width * img.height;
    const faceRatio = faceArea / imageArea;

    // Face should be at least 1% of image and at most 80%
    if (faceRatio < 0.01 || faceRatio > 0.8) {
      return { isHuman: false, reason: "Face size abnormal - likely not a human face" };
    }

    // Validate face aspect ratio - human faces are roughly vertical rectangles
    const faceAspectRatio = boxWidth / boxHeight;
    // Human faces typically have aspect ratio between 0.5 and 1.2
    if (faceAspectRatio < 0.4 || faceAspectRatio > 1.3) {
      return { isHuman: false, reason: "Face shape abnormal - likely not a human face" };
    }

    // Check keypoint distribution - human faces have specific landmark patterns
    // Get eye, nose, and mouth keypoints
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    const noseIndices = [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 281, 363, 360];
    const mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];

    const hasLeftEye = leftEyeIndices.some((idx) => keypoints[idx] && (keypoints[idx].x !== undefined || keypoints[idx][0] !== undefined));
    const hasRightEye = rightEyeIndices.some((idx) => keypoints[idx] && (keypoints[idx].x !== undefined || keypoints[idx][0] !== undefined));
    const hasNose = noseIndices.some((idx) => keypoints[idx] && (keypoints[idx].x !== undefined || keypoints[idx][0] !== undefined));
    const hasMouth = mouthIndices.some((idx) => keypoints[idx] && (keypoints[idx].x !== undefined || keypoints[idx][0] !== undefined));

    // Human faces must have eyes, nose, and mouth - all are required
    if (!hasLeftEye || !hasRightEye || !hasNose || !hasMouth) {
      const missingFeatures = [];
      if (!hasLeftEye) missingFeatures.push("left eye");
      if (!hasRightEye) missingFeatures.push("right eye");
      if (!hasNose) missingFeatures.push("nose");
      if (!hasMouth) missingFeatures.push("mouth");
      console.log(`❌ Missing facial features: ${missingFeatures.join(", ")}`);
      return { isHuman: false, reason: `Missing facial features (${missingFeatures.join(", ")}) - this is not a human face` };
    }

    // Validate eye positions relative to face box if eye bounds are available
    if (leftEyeBounds && rightEyeBounds) {
      const leftEyeCenterY = leftEyeBounds.y + leftEyeBounds.height / 2;
      const rightEyeCenterY = rightEyeBounds.y + rightEyeBounds.height / 2;

      // Get face box coordinates
      const faceTop = box.yMin || box.y || 0;
      const faceHeight = boxHeight;
      const faceMiddle = faceTop + faceHeight * 0.5;

      // Eyes should be above the middle of the face (in upper portion)
      if (leftEyeCenterY > faceMiddle || rightEyeCenterY > faceMiddle) {
        return { isHuman: false, reason: "Eye position abnormal - likely not a human face" };
      }

      // Eyes should be horizontally aligned (similar Y position)
      const eyeYDifference = Math.abs(leftEyeCenterY - rightEyeCenterY);
      const avgEyeHeight = (leftEyeBounds.height + rightEyeBounds.height) / 2;
      if (eyeYDifference > avgEyeHeight * 0.6) {
        return { isHuman: false, reason: "Eyes not aligned - likely not a human face" };
      }
    }

    return { isHuman: true, reason: "Valid human face detected" };
  };

  // Validate eye detection quality and check for glasses
  const validateEyeDetection = (keypoints: any, leftEyeBounds: any, rightEyeBounds: any, img: any, canvas: any) => {
    const issues = [];

    // Check if both eyes are detected - this is critical
    if (!leftEyeBounds || !rightEyeBounds) {
      issues.push("Both eyes not clearly detected");
      return { isValid: false, issues };
    }

    // Only check for glasses - this is the main concern
    // Other validations are too strict and cause false positives
    try {
      const ctx = canvas.getContext("2d");
      const eyeRegion = {
        x: Math.max(0, Math.min(leftEyeBounds.x, rightEyeBounds.x) - 20),
        y: Math.max(0, Math.min(leftEyeBounds.y, rightEyeBounds.y) - 20),
        width: Math.min(canvas.width, Math.abs(rightEyeBounds.x + rightEyeBounds.width - leftEyeBounds.x) + 40),
        height: Math.min(canvas.height, Math.max(leftEyeBounds.height, rightEyeBounds.height) + 40),
      };

      // Extract eye region image data
      const imageData = ctx.getImageData(
        eyeRegion.x,
        eyeRegion.y,
        Math.min(eyeRegion.width, canvas.width - eyeRegion.x),
        Math.min(eyeRegion.height, canvas.height - eyeRegion.y)
      );

      // Detect glasses using horizontal edge detection
      const glassesScore = detectGlasses(imageData);

      console.log("🔍 Glasses detection score:", glassesScore.toFixed(3));

      // Higher threshold to reduce false positives - only flag obvious glasses
      if (glassesScore > 0.5) {
        issues.push("Glasses detected - please remove glasses or use manual masking");
        console.log("❌ Glasses detected with score:", glassesScore);
      } else {
        console.log("✅ No glasses detected, eyes appear clear");
      }
    } catch (error) {
      console.warn("⚠️ Could not perform glasses detection:", error);
      // Don't fail validation if glasses detection fails - assume eyes are clear
    }

    return {
      isValid: issues.length === 0,
      issues: issues.length > 0 ? issues : ["Eyes detected successfully"],
    };
  };

  // Improved glasses detection using edge detection
  const detectGlasses = (imageData: any) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    if (width === 0 || height === 0) return 0;

    let strongHorizontalEdges = 0;
    let totalPixels = 0;
    let edgeStrengths = [];

    // Focus on upper portion of eye region where glasses frames typically are
    const upperHeight = Math.floor(height * 0.4); // Top 40% of eye region

    // Sample pixels more densely in the upper region
    for (let y = 0; y < upperHeight; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        if (idx + 3 < data.length) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r + g + b) / 3;

          // Check horizontal gradient (glasses frames create strong horizontal edges)
          if (x + 2 < width) {
            const nextIdx = (y * width + x + 2) * 4;
            if (nextIdx + 2 < data.length) {
              const nextR = data[nextIdx];
              const nextG = data[nextIdx + 1];
              const nextB = data[nextIdx + 2];
              const nextBrightness = (nextR + nextG + nextB) / 3;

              const gradient = Math.abs(brightness - nextBrightness);

              // Only count strong edges (glasses frames are very distinct)
              if (gradient > 50) {
                strongHorizontalEdges++;
                edgeStrengths.push(gradient);
              }
            }
          }
          totalPixels++;
        }
      }
    }

    // Calculate score based on density of strong horizontal edges
    const edgeDensity = totalPixels > 0 ? strongHorizontalEdges / totalPixels : 0;

    // Also consider average edge strength
    const avgEdgeStrength = edgeStrengths.length > 0 ? edgeStrengths.reduce((a, b) => a + b, 0) / edgeStrengths.length : 0;

    // Combine both factors - glasses have both high density and high strength
    const combinedScore = edgeDensity * (avgEdgeStrength / 100);

    console.log("📊 Glasses detection details:", {
      edgeDensity: edgeDensity.toFixed(3),
      avgEdgeStrength: avgEdgeStrength.toFixed(1),
      combinedScore: combinedScore.toFixed(3),
    });

    return Math.min(combinedScore, 1.0); // Cap at 1.0
  };

  // Crop masked regions from the original image and store with coordinates
  const cropMaskedRegions = async (maskArray: any, sourceImage: any) => {
    if (!maskArray || maskArray.length === 0 || !sourceImage) return;

    console.log("✂️ Cropping masked regions...");
    const croppedPromises = [];

    for (let i = 0; i < maskArray.length; i++) {
      const mask = maskArray[i];

      // Ensure coordinates are within image bounds
      const x = Math.max(0, Math.floor(mask.x));
      const y = Math.max(0, Math.floor(mask.y));
      const width = Math.min(sourceImage.width - x, Math.floor(mask.width));
      const height = Math.min(sourceImage.height - y, Math.floor(mask.height));

      if (width <= 0 || height <= 0) {
        console.warn(`⚠️ Invalid mask dimensions for mask ${i + 1}, skipping`);
        continue;
      }

      // Create a promise for each crop
      const cropPromise = new Promise((resolve) => {
        // Create a temporary canvas to crop the region
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = width;
        cropCanvas.height = height;
        const cropCtx: any = cropCanvas.getContext("2d");

        // Draw the cropped region
        cropCtx.drawImage(
          sourceImage,
          x,
          y,
          width,
          height, // Source region
          0,
          0,
          width,
          height // Destination (full canvas)
        );

        // Convert to blob/dataURL
        cropCanvas.toBlob(
          (blob: any) => {
            const croppedData = {
              image: blob,
              dataURL: cropCanvas.toDataURL("image/jpeg", 0.9),
              x: x,
              y: y,
              width: width,
              height: height,
              index: i,
            };

            console.log(`✅ Cropped mask ${i + 1}:`, {
              x,
              y,
              width,
              height,
              size: `${(blob.size / 1024).toFixed(2)} KB`,
            });

            resolve(croppedData);
          },
          "image/jpeg",
          0.9
        );
      });

      croppedPromises.push(cropPromise);
    }

    // Wait for all crops to complete
    if (croppedPromises.length === 0) {
      console.warn("⚠️ No valid masks to crop after validation");
      setCroppedMasks([]);
      return;
    }

    try {
      console.log(`⏳ Waiting for ${croppedPromises.length} crop(s) to complete...`);
      const croppedImages: any = await Promise.all(croppedPromises);
      console.log(`✅ Successfully cropped and stored ${croppedImages.length} masked region(s)`);
      console.log(
        "📦 Cropped masks details:",
        croppedImages.map((c: any, i: any) => ({
          index: i + 1,
          position: `(${c.x}, ${c.y})`,
          size: `${c.width}×${c.height}`,
          hasImage: !!c.image,
          hasDataURL: !!c.dataURL,
        }))
      );
      setCroppedMasks(croppedImages);
      setDebugInfo((prev: any) => ({
        ...prev,
        croppedMasksCount: croppedImages.length,
        croppedMasks: croppedImages,
      }));
    } catch (error: any) {
      console.error("❌ Error cropping masks:", error);
      console.error("❌ Error stack:", error.stack);
      setCroppedMasks([]);
    }
  };

  // Manual masking - Mouse events
  const getCanvasCoordinates = (e: any) => {
    const canvas: any = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: any) => {
    if (mode !== "manual") return;
    const pos = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentMask({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || mode !== "manual") return;
    const pos = getCanvasCoordinates(e);

    setCurrentMask({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || mode !== "manual") return;

    if (currentMask && currentMask.width > 5 && currentMask.height > 5) {
      const updatedMasks = [...masks, currentMask];
      setMasks(updatedMasks);
      console.log("✅ Manual mask added:", currentMask);
      console.log(`📊 Total masks: ${updatedMasks.length}`);
      setDebugInfo((prev: any) => ({ ...prev, masksCreated: updatedMasks.length }));

      // Note: Cropping will happen automatically via useEffect when masks state updates
    }

    setIsDrawing(false);
    setCurrentMask(null);
  };

  // Compress image client-side
  const compressImage = async (blob: any) => {
    try {
      const originalSize = (blob.size / 1024).toFixed(2);
      console.log(`🗜️ Compressing image... Original size: ${originalSize} KB`);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(blob, options);
      const compressedSize = (compressedFile.size / 1024).toFixed(2);
      const compressionRatio = ((1 - compressedFile.size / blob.size) * 100).toFixed(1);
      console.log(`✅ Image compressed: ${compressedSize} KB (${compressionRatio}% reduction)`);
      setDebugInfo((prev: any) => ({ ...prev, originalSize, compressedSize, compressionRatio }));
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return blob; // Return original if compression fails
    }
  };

  // Get masked image as blob
  // Note: Canvas already has semi-transparent masks with borders drawn on it via drawCanvas()
  const getMaskedImageBlob = async () => {
    if (!canvasRef.current) return null;

    return new Promise((resolve) => {
      // Canvas already has the image and semi-transparent masks with borders
      canvasRef.current.toBlob(
        async (blob: any) => {
          // Compress the image
          const compressedBlob = await compressImage(blob);
          resolve(compressedBlob);
        },
        "image/jpeg",
        0.85 // Quality
      );
    });
  };

  // Upload to AWS S3
  const uploadToS3 = async (blob: any, fileName: any) => {
    // NOTE: AWS credentials should be configured via environment variables
    // or AWS credentials file. For security, never hardcode credentials.
    console.log("blob", blob);
    console.log("fileName", fileName);
    const s3Client = new S3Client({
      // region: import.meta.env.VITE_AWS_REGION || "us-east-1",
      // credentials: {
      //   accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      //   secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
      // },
    });

    // const bucketName = import.meta.env.VITE_AWS_S3_BUCKET || "";
      const bucketName = ""
    if (!bucketName) {
      throw new Error("AWS S3 bucket name not configured. Please set VITE_AWS_S3_BUCKET environment variable.");
    }

    const key = `masked-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: blob,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);
    return key;
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please select an image first.");
      return;
    }

    if (masks.length === 0) {
      if (mode === "auto") {
        alert('Please detect eyes first by clicking "Detect & Mask Eyes" button.');
      } else {
        alert("Please create at least one mask by dragging on the image.");
      }
      return;
    }

    setIsProcessing(true);
    setUploadStatus("Processing...");
    console.log(`📤 Starting upload process... Mode: ${mode}, Masks: ${masks.length}`);

    try {
      // Get masked image blob (this creates the final masked image)
      // The canvas already has masks drawn on it, so toBlob() captures the masked version
      console.log("🎨 Creating masked image blob from canvas...");
      const maskedBlob = await getMaskedImageBlob();

      if (!maskedBlob) {
        throw new Error("Failed to create masked image");
      }

      console.log("✅ Masked image blob created successfully");
      console.log("🔒 Original image remains in browser memory only (not uploaded)");

      // Upload to S3 (only the masked image, not the original)
      setUploadStatus("Uploading to S3...");
      console.log("☁️ Uploading masked image to S3...");
      console.log("⚠️ Note: Only the masked image is uploaded. Original image stays in browser.");
      const s3Key = await uploadToS3(maskedBlob, imageFile.name);

      console.log(`✅ Success! Image uploaded to S3: ${s3Key}`);
      setUploadStatus(`Success! Image uploaded to S3: ${s3Key}`);
      setDebugInfo((prev: any) => ({ ...prev, s3Key, uploadSuccess: true }));

      // Clear the original image from memory (privacy requirement)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Reset form after a delay
      setTimeout(() => {
        setImageFile(null);
        setImagePreview(null);
        setMasks([]);
        setUploadStatus("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error processing image:", error);
      setUploadStatus(`Error: ${error.message}`);
      setDebugInfo((prev: any) => ({ ...prev, uploadError: error.message, uploadSuccess: false }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all masks
  const clearMasks = () => {
    setMasks([]);
    setCroppedMasks([]);
    setCurrentMask(null);
    setDebugInfo((prev: any) => ({ ...prev, croppedMasksCount: 0, croppedMasks: [] }));
  };

  // Remove a specific mask
  const removeMask = (index: any) => {
    const updatedMasks = masks.filter((_: any, i: any) => i !== index);
    setMasks(updatedMasks);
    // Also remove corresponding cropped mask
    const updatedCropped = croppedMasks.filter((_, i) => i !== index);
    setCroppedMasks(updatedCropped);
    setDebugInfo((prev: any) => ({
      ...prev,
      croppedMasksCount: updatedCropped.length,
    }));
  };

  return (
    <div className="eye-masking-form-container">
      <h1>Eye Detection & Masking Tool</h1>

      <form onSubmit={handleSubmit} className="masking-form">
        <div className="form-group">
          <label htmlFor="image-upload">Select Image:</label>
          <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} disabled={isProcessing} />
        </div>

        {imagePreview && (
          <>
            <div className="mode-selector">
              <label>
                <input type="radio" value="auto" checked={mode === "auto"} onChange={(e) => setMode(e.target.value)} disabled={isProcessing} />
                Automatic (AI Detection)
              </label>
              <label>
                <input type="radio" value="manual" checked={mode === "manual"} onChange={(e) => setMode(e.target.value)} disabled={isProcessing} />
                Manual Masking
              </label>
            </div>

            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                className="masking-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ maxWidth: "100%", height: "auto", cursor: mode === "manual" ? "crosshair" : "default" }}
              />
            </div>

            <div className="controls">
              {mode === "auto" && (
                <>
                  <button type="button" onClick={detectAndMaskEyes} disabled={isProcessing || !model} className="btn btn-primary">
                    {isProcessing ? "Detecting..." : "Detect & Mask Eyes"}
                  </button>
                  {masks.length === 0 && !debugInfo.validationFailed && (
                    <p className="info-text">
                      👆 Click "Detect & Mask Eyes" to automatically find and mask eyes. Then click "Upload Masked Image" below to save.
                      <br />
                      <small>⚠️ Note: Works best with clear, unobstructed eyes (no glasses).</small>
                    </p>
                  )}
                  {debugInfo.validationFailed && (
                    <div className="validation-error">
                      <strong>⚠️ Detection Failed</strong>
                      <p>{debugInfo.detectionError || "Eyes not clearly detected"}</p>
                      <p>
                        Please use <strong>Manual Masking</strong> mode instead, or ensure eyes are clearly visible without glasses.
                      </p>
                    </div>
                  )}
                </>
              )}

              {mode === "manual" && <p className="manual-instructions">Click and drag on the image to create masks</p>}

              {masks.length > 0 && (
                <>
                  <button type="button" onClick={clearMasks} disabled={isProcessing} className="btn btn-secondary">
                    Clear All Masks ({masks.length})
                  </button>

                  <div className="masks-list">
                    {masks.map((mask: any, index: any) => (
                      <div key={index} className="mask-item">
                        <span>Mask {index + 1}</span>
                        <button type="button" onClick={() => removeMask(index)} className="btn-small">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button type="submit" disabled={isProcessing || masks.length === 0} className="btn btn-success">
                {isProcessing ? "Processing..." : "Upload Masked Image"}
              </button>
              {masks.length > 0 && (
                <p className="info-text">
                  ✅ {masks.length} mask(s) applied. Click "Upload Masked Image" to compress and upload to S3.
                  <br />
                  <small>🔒 Original image stays in browser - only masked version is uploaded.</small>
                </p>
              )}
            </div>

            {uploadStatus && <div className={`upload-status ${uploadStatus.includes("Error") ? "error" : "success"}`}>{uploadStatus}</div>}
          </>
        )}

        {!model && !debugInfo.modelError && <div className="loading-model">Loading AI model... Please wait.</div>}

        {debugInfo.modelError && (
          <div className="model-error-notice">
            <strong>⚠️ AI Model Not Available</strong>
            <p>Error: {debugInfo.modelError}</p>
            <p>
              You can still use <strong>Manual Masking</strong> mode to create masks by dragging on the image.
            </p>
            <button type="button" onClick={() => window.location.reload()} className="btn btn-secondary">
              Retry Loading Model
            </button>
          </div>
        )}
      </form>

      <div className="privacy-notice">
        <strong>Privacy Notice:</strong> Your original image is processed entirely in your browser and never stored. Only the masked image is uploaded
        to AWS S3.
      </div>

      {/* Debug Panel - Remove in production */}
      {Object.keys(debugInfo).length > 0 && (
        <div className="debug-panel">
          <h3>🔍 Debug Information</h3>
          <div className="debug-content">
            <p>
              <strong>Model Status:</strong> {debugInfo.modelLoaded ? "✅ Loaded" : "❌ Not Loaded"}
            </p>
            {debugInfo.modelError && (
              <p>
                <strong>Model Error:</strong> {debugInfo.modelError}
              </p>
            )}
            {debugInfo.imageLoaded && (
              <>
                <p>
                  <strong>Image:</strong> {debugInfo.imageName} ({(debugInfo.imageSize / 1024).toFixed(2)} KB)
                </p>
              </>
            )}
            {debugInfo.facesDetected !== undefined && (
              <p>
                <strong>Faces Detected:</strong> {debugInfo.facesDetected}
              </p>
            )}
            {debugInfo.masksCreated !== undefined && (
              <p>
                <strong>Masks Created:</strong> {debugInfo.masksCreated}
              </p>
            )}
            {croppedMasks.length > 0 && (
              <>
                <p>
                  <strong>Cropped Regions:</strong> {croppedMasks.length}
                </p>
                <div className="cropped-masks-preview">
                  {croppedMasks.map((cropped: any, idx) => (
                    <div key={idx} className="cropped-mask-item">
                      <img src={cropped.dataURL} alt={`Cropped mask ${idx + 1}`} className="cropped-preview-img" />
                      <div className="cropped-info">
                        <p>
                          <strong>Mask {idx + 1}</strong>
                        </p>
                        <p>
                          Position: ({cropped.x}, {cropped.y})
                        </p>
                        <p>
                          Size: {cropped.width} × {cropped.height}px
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {debugInfo.originalSize && (
              <p>
                <strong>Compression:</strong> {debugInfo.originalSize} KB → {debugInfo.compressedSize} KB ({debugInfo.compressionRatio}% reduction)
              </p>
            )}
            {debugInfo.s3Key && (
              <p>
                <strong>S3 Key:</strong> {debugInfo.s3Key}
              </p>
            )}
            {debugInfo.uploadError && (
              <p>
                <strong>Upload Error:</strong> {debugInfo.uploadError}
              </p>
            )}
            <button type="button" onClick={() => setDebugInfo({})} className="btn btn-small">
              Clear Debug Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EyeMaskingForm;

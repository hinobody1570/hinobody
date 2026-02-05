"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiUpload, FiCamera } from "react-icons/fi";
import EyeMaskingForm from "@/components/EyeMaskingForm";
import { useAuth } from "@/contexts/AuthContext";

interface PostImageUploadCardProps {
  onImagesReady: (imageIds: string[]) => void;
  imageIds: string[];
}

export const PostImageUploadCard = ({ onImagesReady, imageIds }: PostImageUploadCardProps) => {
  const t = useTranslations("eyeMasking");
  const tCreate = useTranslations("createPost");
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [initialAction, setInitialAction] = useState<"upload" | "camera" | null>(null);

  const handleOpenModal = (action: "upload" | "camera") => {
    setInitialAction(action);
    setShowModal(true);
  };

  const handleImagesReady = (ids: string[]) => {
    onImagesReady([...imageIds, ...ids]);
    setShowModal(false);
    setInitialAction(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setInitialAction(null);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-xs">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          {tCreate("addImages") || "Add Images"}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {tCreate("addImagesHint") || "Upload or capture with eye masking"}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal("upload")}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <FiUpload size={18} />
            {t("selectImage") || "Upload Image"}
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal("camera")}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <FiCamera size={18} />
            {t("takePhoto") || "Open Camera"}
          </button>
        </div>
        {imageIds.length > 0 && (
          <p className="text-xs text-green-600 mt-3 font-medium">
            {imageIds.length} {tCreate("imagesAttached") || "image(s) attached"}
          </p>
        )}
      </div>

      {/* Modal with Eye Masking Form */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {tCreate("addImageWithMasking") || "Add Image (Eye Masking)"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <EyeMaskingFormWithInitialAction
                compact
                initialAction={initialAction}
                onPostImagesReady={handleImagesReady}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrapper to pass initialAction and trigger it on mount
interface EyeMaskingFormWithInitialActionProps {
  compact?: boolean;
  initialAction: "upload" | "camera" | null;
  onPostImagesReady: (imageIds: string[]) => void;
}

const EyeMaskingFormWithInitialAction = ({
  compact,
  initialAction,
  onPostImagesReady,
}: EyeMaskingFormWithInitialActionProps) => {
  return (
    <EyeMaskingForm
      compact={compact}
      initialAction={initialAction}
      onPostImagesReady={onPostImagesReady}
    />
  );
};

export default PostImageUploadCard;

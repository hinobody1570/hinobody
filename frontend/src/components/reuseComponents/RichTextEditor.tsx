"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { s3Api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor = ({ value = "", onChange }: QuillEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const { showError, showSuccess } = useToast();
  const t = useTranslations('richTextEditor');

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Configure toolbar with image upload support
    // Note: Table support temporarily disabled due to quill-table compatibility issues
    const toolbarOptions = [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      ["clean"],
    ];

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: t('placeholder'),
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            image: function () {
              // Create file input
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();

              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  showError(t('imageSizeError'));
                  return;
                }

                // Validate file type
                if (!file.type.startsWith("image/")) {
                  showError(t('invalidImageError'));
                  return;
                }

                try {
                  // Show loading indicator
                  const range = quillRef.current!.getSelection(true);
                  const uploadingText = t('uploadingImage');
                  quillRef.current!.insertText(range.index, uploadingText, "user");
                  quillRef.current!.setSelection(range.index + uploadingText.length);

                  // Upload to S3
                  const uploadResult = await s3Api.uploadFile(file, "uploads/contractor");

                  // Remove loading text
                  quillRef.current!.deleteText(range.index, uploadingText.length);

                  // Insert image into editor
                  const index = range.index;
                  quillRef.current!.insertEmbed(index, "image", uploadResult.url);
                  quillRef.current!.setSelection(index + 1);

                  showSuccess(t('imageUploadSuccess'));
                } catch (error: any) {
                  // Remove loading text
                  const currentRange = quillRef.current!.getSelection();
                  if (currentRange) {
                    const uploadingText = t('uploadingImage');
                    quillRef.current!.deleteText(currentRange.index - uploadingText.length, uploadingText.length);
                  }
                  showError(error?.message || t('imageUploadError'));
                }
              };
            },
          },
        },
      },
    });

    quillRef.current.on("text-change", () => {
      const html = editorRef.current!.querySelector(".ql-editor")?.innerHTML || "";
      onChange?.(html);
    });
  }, [onChange, showError, showSuccess, t]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="bg-white border border-gray-300 rounded-md">
      <div ref={editorRef} className="min-h-[200px] ql-conitainer-area" />
    </div>
  );
};

export default RichTextEditor;

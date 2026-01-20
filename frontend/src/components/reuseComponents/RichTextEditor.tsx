"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { s3Api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor = ({ value = "", onChange }: QuillEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const { showError, showSuccess } = useToast();

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
      placeholder: "Write something...",
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
                  showError("Image size must be less than 5MB");
                  return;
                }

                // Validate file type
                if (!file.type.startsWith("image/")) {
                  showError("Please select a valid image file");
                  return;
                }

                try {
                  // Show loading indicator
                  const range = quillRef.current!.getSelection(true);
                  quillRef.current!.insertText(range.index, "Uploading image...", "user");
                  quillRef.current!.setSelection(range.index + 20);

                  // Upload to S3
                  const uploadResult = await s3Api.uploadFile(file, "uploads/contractor");

                  // Remove loading text
                  quillRef.current!.deleteText(range.index, 20);

                  // Insert image into editor
                  const index = range.index;
                  quillRef.current!.insertEmbed(index, "image", uploadResult.url);
                  quillRef.current!.setSelection(index + 1);

                  showSuccess("Image uploaded successfully!");
                } catch (error: any) {
                  // Remove loading text
                  const currentRange = quillRef.current!.getSelection();
                  if (currentRange) {
                    quillRef.current!.deleteText(currentRange.index - 20, 20);
                  }
                  showError(error?.message || "Failed to upload image. Please try again.");
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
  }, [onChange, showError, showSuccess]);

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

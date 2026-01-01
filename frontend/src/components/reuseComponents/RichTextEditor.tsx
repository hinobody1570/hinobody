"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor = ({ value = "", onChange }: QuillEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Write something...",
    });

    quillRef.current.on("text-change", () => {
      const html = editorRef.current!.querySelector(".ql-editor")?.innerHTML || "";
      onChange?.(html);
    });
  }, [onChange]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);
  return (
    <div className="bg-white border border-gray-300 rounded-md">
      <div ref={editorRef} className="min-h-[200px]" />
    </div>
  );
};

export default RichTextEditor;

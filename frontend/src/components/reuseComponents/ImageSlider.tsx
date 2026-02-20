"use client";

import Image from "next/image";
import { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
}

export const ImageSlider = ({ images, alt = "Post image", className = "" }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const hasMultiple = images.length > 1;

  return (
    <div className={`relative bg-[#f5f5f5] ${className}`}>
      <div className="relative w-full overflow-hidden">
        <Image
          src={images[currentIndex]}
          width={400}
          height={400}
          alt={`${alt} ${currentIndex + 1}`}
          className="mx-auto object-contain w-full"
          unoptimized={images[currentIndex]?.startsWith("http")}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer z-10"
              aria-label="Previous image"
            >
              <IoChevronBack size={24} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer z-10"
              aria-label="Next image"
            >
              <IoChevronForward size={24} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;

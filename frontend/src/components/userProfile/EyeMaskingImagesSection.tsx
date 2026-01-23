'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { EyeMaskedImage } from '@/lib/api';
import { FaImages } from 'react-icons/fa';

interface EyeMaskingImagesSectionProps {
  images: EyeMaskedImage[];
  loading: boolean;
}

export function EyeMaskingImagesSection({ images, loading }: EyeMaskingImagesSectionProps) {
  const t = useTranslations('userProfile');

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaImages size={24} />
        <span>{t('eyeMaskingImages')} ({images.length})</span>
      </h2>
      
      {loading ? (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      ) : images.length > 0 ? (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => window.open(image.url, "_blank")}
              >
                <Image
                  src={image.url}
                  alt="Eye masked image"
                  fill
                  className="object-contain h-8 group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t('noEyeMaskingImages')}</p>
        </div>
      )}
    </div>
  );
}


import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  fallbackSrc = '/images/default-avatar.svg',
  fallbackIcon
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  // If no src or has error and no fallback works, show icon or placeholder
  if (!imgSrc || (hasError && !fallbackIcon)) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        {fallbackIcon || (
          <div className="text-gray-400 text-xl">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // If has error but has fallback icon, show icon
  if (hasError && fallbackIcon) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        {fallbackIcon}
      </div>
    );
  }

  // Render image
  const imageProps = {
    src: imgSrc!,
    alt,
    className,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height })
  };

  return <Image {...imageProps} />;
}
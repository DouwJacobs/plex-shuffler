import useSettings from '@app/hooks/useSettings';
import type { ImageLoader, ImageProps } from 'next/image';
import Image from 'next/image';

/**
 * The CachedImage component should be used wherever
 * we want to offer the option to locally cache images.
 **/
const CachedImage = ({ src, ...props }: ImageProps) => {
  const { currentSettings } = useSettings();

  let imageUrl = src as string;

  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.host === 'image.tmdb.org' && currentSettings.cacheImages) {
      imageUrl = imageUrl.replace('https://image.tmdb.org', '/imageproxy');
    }
  }

  if (imageUrl.toString().startsWith("/library")){
    imageUrl = "/imageproxy/image" + imageUrl
  }

  return <img src={imageUrl} {...props} />;
};

export default CachedImage;
"use client";

import React, { useState, useEffect } from 'react';

/**
 * Props for the CustomAvatar component.
 */
interface CustomAvatarProps {
  /** The URL of the image to display. */
  src?: string | null;
  /** The text to use for generating fallback initials (e.g., a user's name). */
  fallbackText: string;
  /** Optional alt text for the image. */
  alt?: string;
  /** Optional className to be applied to the root element for layout purposes. */
  className?: string;
}

/**
 * A self-contained, theme-independent Avatar component that displays an image
 * or falls back to initials if the image is missing or fails to load.
 */
export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  src,
  fallbackText,
  alt = 'User Avatar',
  className = '',
}) => {
  // State to track if the image has failed to load.
  const [hasError, setHasError] = useState(false);

  // When the src prop changes, reset the error state.
  useEffect(() => {
    setHasError(false);
  }, [src]);

  /**
   * Generates initials from the fallback text.
   * e.g., "Bhumika Pandey" -> "BP"
   */
  const getInitials = (text: string = ''): string => {
    return text
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';
  };

  // Define all styles inline to be completely theme-independent.
  const styles: { [key: string]: React.CSSProperties } = {
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      verticalAlign: 'middle',
      overflow: 'hidden',
      userSelect: 'none',
      width: '8rem', // 128px
      height: '8rem', // 128px
      borderRadius: '9999px',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    fallback: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#E5E7EB', // Safe light gray
      color: '#374151', // Safe dark gray
      fontSize: '3rem', // ~5xl
      lineHeight: 1,
      fontWeight: 500,
    },
  };

  const showFallback = !src || hasError;

  return (
    <span style={styles.root} className={className}>
      {showFallback ? (
        <span style={styles.fallback}>
          {getInitials(fallbackText)}
        </span>
      ) : (
        <img
          style={styles.image}
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
        />
      )}
    </span>
  );
};
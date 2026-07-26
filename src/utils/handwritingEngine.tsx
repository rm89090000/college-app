import React from 'react';
import { HandwritingStyle } from '../types';

export const DEFAULT_HANDWRITING_STYLE: HandwritingStyle = {
  fontFamily: "'Caveat', 'Dancing Script', 'Indie Flower', 'Cedarville Cursive', cursive",
  slantAngle: 3,
  strokeWeight: 1.8,
  letterSpacing: 0.8,
  lineHeight: 1.5,
  jitterAmount: 2,
  inkColor: '#1d4ed8', // Royal Blue Gel
  penType: 'Gel Ballpoint',
  baselineWiggle: 1.5,
  characterScale: 1.0,
};

export const PEN_PRESETS: { name: string; style: Partial<HandwritingStyle> }[] = [
  {
    name: 'Royal Blue Gel Pen',
    style: { inkColor: '#1d4ed8', strokeWeight: 2.0, penType: 'Gel Ballpoint' }
  },
  {
    name: 'Classic Dark Navy',
    style: { inkColor: '#1e293b', strokeWeight: 1.8, penType: 'Gel Ballpoint' }
  },
  {
    name: 'Fountain Pen Black',
    style: { inkColor: '#0f172a', strokeWeight: 2.2, penType: 'Fountain Pen' }
  },
  {
    name: 'Graphite Pencil',
    style: { inkColor: '#475569', strokeWeight: 1.4, penType: 'Graphite Pencil' }
  }
];

// Helper to inject Google Handwriting Web Fonts dynamically if not present
export const ensureHandwritingFontsLoaded = () => {
  if (typeof document === 'undefined' || document.getElementById('handwriting-fonts-link')) return;
  const link = document.createElement('link');
  link.id = 'handwriting-fonts-link';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Indie+Flower&family=Cedarville+Cursive&family=Reenie+Beanie&family=Shadows+Into+Light&family=Patrick+Hand&display=swap';
  document.head.appendChild(link);
};

// Generates CSS style object for elements rendered in handwritten style
export const getHandwritingCssStyle = (style: HandwritingStyle, isSignature = false): React.CSSProperties => {
  ensureHandwritingFontsLoaded();

  const font = isSignature ? "'Dancing Script', 'Caveat', cursive" : style.fontFamily;

  return {
    fontFamily: font,
    color: style.inkColor,
    fontSize: isSignature ? '1.5rem' : `${style.characterScale * 1.15}rem`,
    letterSpacing: `${style.letterSpacing}px`,
    lineHeight: style.lineHeight,
    transform: `rotate(${style.slantAngle * 0.2}deg) skewX(${-style.slantAngle * 0.5}deg)`,
    display: 'inline-block',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    filter: style.penType === 'Fountain Pen' 
      ? 'contrast(120%) drop-shadow(0.2px 0.2px 0.2px rgba(15,23,42,0.3))' 
      : style.penType === 'Graphite Pencil'
      ? 'opacity(0.88)'
      : 'none',
  };
};

// Generates pseudo-random baseline offsets for letters to create realistic organic human handwriting
export const renderOrganicHandwritingSpan = (text: string, style: HandwritingStyle) => {
  if (!text) return null;
  
  ensureHandwritingFontsLoaded();

  const chars = text.split('');
  return chars.map((char, index) => {
    // Generate deterministic yet organic-looking jitter based on index and char code
    const seed = (index * 37 + char.charCodeAt(0) * 17) % 100;
    const yWiggle = ((seed % 10) - 5) * (style.baselineWiggle * 0.15);
    const rotJitter = (((seed * 3) % 10) - 5) * (style.jitterAmount * 0.2);
    const sizeVariation = 1 + (((seed * 7) % 8) - 4) * 0.015 * style.jitterAmount;

    return (
      <span
        key={index}
        style={{
          display: 'inline-block',
          fontFamily: style.fontFamily,
          color: style.inkColor,
          fontSize: `${style.characterScale * 1.1 * sizeVariation}rem`,
          letterSpacing: `${style.letterSpacing}px`,
          transform: `translateY(${yWiggle}px) rotate(${rotJitter + style.slantAngle * 0.2}deg) skewX(${-style.slantAngle * 0.4}deg)`,
          fontWeight: style.strokeWeight > 2 ? 600 : 400,
          whiteSpace: char === ' ' ? 'pre' : 'normal',
        }}
      >
        {char}
      </span>
    );
  });
};

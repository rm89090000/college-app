import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, PenTool, Sparkles, Check } from 'lucide-react';

interface HandwritingCanvasProps {
  onCaptureSample: (base64Image: string) => void;
  inkColor: string;
  strokeWidth: number;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onCaptureSample,
  inkColor,
  strokeWidth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas with ruled guide lines
  const clearAndDrawLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw notebook guidelines
    ctx.strokeStyle = '#e2e8f0'; // Light slate line
    ctx.lineWidth = 1;

    // Margin line on left
    ctx.beginPath();
    ctx.strokeStyle = '#fca5a5'; // Red margin line
    ctx.moveTo(40, 0);
    ctx.lineTo(40, canvas.height);
    ctx.stroke();

    // Horizontal ruled lines
    ctx.strokeStyle = '#cbd5e1';
    for (let y = 60; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash

    // Sample guide watermark text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Write sample here: "The quick brown fox jumps over 1234567890"', 50, 35);

    setHasDrawn(false);
  };

  useEffect(() => {
    clearAndDrawLines();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth * 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onCaptureSample(dataUrl);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <PenTool className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Interactive Handwriting Drawing Pad</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAndDrawLines}
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          
          <button
            disabled={!hasDrawn}
            onClick={handleCapture}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capture & Calibrate</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 shadow-inner bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-auto touch-none"
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
        <span>Draw or write a sample sentence above with your mouse or stylus.</span>
        <span>Tip: Try writing a cursive or natural signature!</span>
      </p>
    </div>
  );
};

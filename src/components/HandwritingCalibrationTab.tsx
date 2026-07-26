import React, { useState } from 'react';
import { HandwritingStyle, HandwritingAnalysisResult } from '../types';
import { HandwritingCanvas } from './HandwritingCanvas';
import { DEFAULT_HANDWRITING_STYLE, PEN_PRESETS, getHandwritingCssStyle, renderOrganicHandwritingSpan } from '../utils/handwritingEngine';
import { PenTool, Sparkles, Sliders, CheckCircle2, RotateCcw, Palette, Image as ImageIcon, Type } from 'lucide-react';

interface HandwritingCalibrationTabProps {
  style: HandwritingStyle;
  setStyle: React.Dispatch<React.SetStateAction<HandwritingStyle>>;
  onCalibrateComplete: () => void;
}

export const HandwritingCalibrationTab: React.FC<HandwritingCalibrationTabProps> = ({
  style,
  setStyle,
  onCalibrateComplete,
}) => {
  const [testSentence, setTestSentence] = useState('The quick brown fox jumps over the lazy dog 1234567890');
  const [analysisResult, setAnalysisResult] = useState<HandwritingAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeInputMethod, setActiveInputMethod] = useState<'draw' | 'upload'>('draw');

  // Handle drawing sample capture
  const handleCaptureFromCanvas = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
        if (json.data.suggestedStyle) {
          setStyle((prev) => ({
            ...prev,
            ...json.data.suggestedStyle,
          }));
        }
        onCalibrateComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle uploaded image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleCaptureFromCanvas(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateStyleField = <K extends keyof HandwritingStyle>(field: K, val: HandwritingStyle[K]) => {
    setStyle((prev) => ({ ...prev, [field]: val }));
    onCalibrateComplete();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50 mb-1">
              Step 3 of 4 • Handwriting Calibration Engine
            </p>
            <h2 className="text-2xl font-serif font-light text-[#1A1A1A]">Personal Handwriting Style Capture</h2>
            <p className="text-xs font-serif italic text-[#1A1A1A]/80 mt-1 max-w-2xl">
              Draw a quick sample line or upload a photo of your handwriting. Gemini Vision will extract your natural pen pressure, slant, and character spacing!
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#F9F7F2] p-1.5 border border-[#1A1A1A]">
            <button
              onClick={() => setActiveInputMethod('draw')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeInputMethod === 'draw'
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              Draw Sample
            </button>
            <button
              onClick={() => setActiveInputMethod('upload')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeInputMethod === 'upload'
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              Upload Notebook Photo
            </button>
          </div>
        </div>
      </div>

      {/* Input Methods: Draw Canvas or Image Upload */}
      {activeInputMethod === 'draw' ? (
        <HandwritingCanvas
          onCaptureSample={handleCaptureFromCanvas}
          inkColor={style.inkColor}
          strokeWidth={style.strokeWeight}
        />
      ) : (
        <div className="bg-[#F9F7F2] border-2 border-dashed border-[#1A1A1A] hover:bg-[#F2EDE4] p-8 text-center transition-all">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="handwriting-photo-upload"
          />
          <label htmlFor="handwriting-photo-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <ImageIcon className="w-10 h-10 text-[#1A1A1A] mb-3" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">Upload a photo of your handwritten notebook page or essay</span>
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 mt-1 font-semibold">Supports PNG, JPG, HEIC photos</span>
          </label>
        </div>
      )}

      {/* AI Vision Analysis Results Badge */}
      {isAnalyzing && (
        <div className="bg-[#F2EDE4] border border-[#1A1A1A] p-4 text-center text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center justify-center space-x-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Gemini Vision is analyzing pen pressure, slant, and letter curvature...</span>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white border border-[#1A1A1A] p-5 text-[#1A1A1A] shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Handwriting Profile Calibrated</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#F9F7F2] p-3 border border-[#1A1A1A]">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 block mb-0.5">Style Classification</span>
              <span className="text-[#1A1A1A] font-bold text-xs">{analysisResult.neatnessRating}</span>
            </div>

            <div className="bg-[#F9F7F2] p-3 border border-[#1A1A1A]">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 block mb-0.5">Slant & Flow</span>
              <span className="text-[#1A1A1A] font-bold text-xs">{analysisResult.slantDescription}</span>
            </div>

            <div className="bg-[#F9F7F2] p-3 border border-[#1A1A1A]">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 block mb-0.5">Detected Sample Text</span>
              <span className="text-[#1A1A1A] font-serif italic text-xs">"{analysisResult.detectedText || 'Sample Analyzed'}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & Fine-Tuning Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders & Parameters */}
        <div className="lg:col-span-7 bg-white border border-[#1A1A1A] p-6 text-[#1A1A1A] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>Handwriting Physics & Pen Controls</span>
            </h3>

            <button
              onClick={() => setStyle(DEFAULT_HANDWRITING_STYLE)}
              className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Pen Preset Palette */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-2 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5 text-[#1A1A1A]" />
              <span>Ink & Pen Style Presets</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PEN_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setStyle((prev) => ({ ...prev, ...preset.style }))}
                  className={`p-2 text-[10px] uppercase tracking-wider font-bold border transition-all text-left flex items-center space-x-2 ${
                    style.penType === preset.style.penType && style.inkColor === preset.style.inkColor
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.style.inkColor }}
                  />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Slant Angle */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                <span>Slant Angle</span>
                <span className="font-mono">{style.slantAngle}°</span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={style.slantAngle}
                onChange={(e) => updateStyleField('slantAngle', parseFloat(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Stroke Weight */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                <span>Pen Thickness</span>
                <span className="font-mono">{style.strokeWeight}px</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.5}
                step={0.1}
                value={style.strokeWeight}
                onChange={(e) => updateStyleField('strokeWeight', parseFloat(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Letter Spacing */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                <span>Letter Spacing</span>
                <span className="font-mono">{style.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min={-0.5}
                max={4.0}
                step={0.1}
                value={style.letterSpacing}
                onChange={(e) => updateStyleField('letterSpacing', parseFloat(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Human Jitter / Imperfection */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                <span>Human Jitter / Wobble</span>
                <span className="font-mono">{style.jitterAmount}</span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={0.5}
                value={style.jitterAmount}
                onChange={(e) => updateStyleField('jitterAmount', parseFloat(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Baseline Wiggle */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                <span>Baseline Curvature</span>
                <span className="font-mono">{style.baselineWiggle}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={style.baselineWiggle}
                onChange={(e) => updateStyleField('baselineWiggle', parseFloat(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Custom Ink Color Picker */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Ink Color Selection</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={style.inkColor}
                  onChange={(e) => updateStyleField('inkColor', e.target.value)}
                  className="w-8 h-8 border border-[#1A1A1A] bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={style.inkColor}
                  onChange={(e) => updateStyleField('inkColor', e.target.value)}
                  className="bg-[#F9F7F2] border border-[#1A1A1A] px-2.5 py-1 text-xs text-[#1A1A1A] font-mono w-24"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Live Rendering Realtime Preview Box */}
        <div className="lg:col-span-5 bg-white border border-[#1A1A1A] p-6 text-[#1A1A1A] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center space-x-2">
                <Type className="w-4 h-4 text-[#1A1A1A]" />
                <span>Live Style Preview</span>
              </h3>
              <span className="text-[8px] uppercase font-bold text-white bg-[#1A1A1A] px-2 py-0.5">
                Realtime Render
              </span>
            </div>

            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Test Sentence Input</label>
            <input
              type="text"
              value={testSentence}
              onChange={(e) => setTestSentence(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none mb-4"
            />

            {/* Lined Notebook Paper Render Card */}
            <div className="bg-[#FFFDF9] p-5 border border-[#1A1A1A] shadow-sm min-h-[160px] relative overflow-hidden">
              {/* Notebook Margins */}
              <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-rose-300 pointer-events-none" />
              
              <div className="pl-6 space-y-3">
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 border-b border-blue-200 pb-1">
                  Sample Handwriting Output
                </p>

                <div className="py-2 border-b border-blue-200 min-h-[40px]">
                  {renderOrganicHandwritingSpan(testSentence, style)}
                </div>

                <div className="pt-2 border-b border-blue-200 flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/60">Student Signature:</span>
                  <span style={getHandwritingCssStyle(style, true)}>Your Signature</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 text-center bg-[#F9F7F2] p-2.5 border border-[#1A1A1A]">
            This handwriting profile will be used to autofill official application forms in Step 4!
          </p>
        </div>

      </div>

    </div>
  );
};

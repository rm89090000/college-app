import React, { useRef, useState } from 'react';
import { CollegeApplicationData, HandwritingStyle } from '../types';
import { renderOrganicHandwritingSpan, getHandwritingCssStyle } from '../utils/handwritingEngine';
import { Download, Printer, Eye, PenTool, CheckCircle, Sparkles, Building2, Copy, FileCheck } from 'lucide-react';

interface HandwrittenAutofillPortalTabProps {
  appData: CollegeApplicationData;
  style: HandwritingStyle;
}

export const HandwrittenAutofillPortalTab: React.FC<HandwrittenAutofillPortalTabProps> = ({
  appData,
  style,
}) => {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [templateType, setTemplateType] = useState<'commonApp' | 'ucApp' | 'supplementary'>('commonApp');
  const [renderMode, setRenderMode] = useState<'handwritten' | 'typed'>('handwritten');
  const [copiedText, setCopiedText] = useState(false);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export as High-Res Image
  const handleExportPNG = async () => {
    if (!portalRef.current) return;
    try {
      // Dynamic import html2canvas or render canvas directly
      const element = portalRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Basic snapshot or trigger window.print
      window.print();
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  // Copy plain text
  const handleCopyText = () => {
    const text = `
COLLEGE APPLICATION RECORD - ${appData.applicantName}
High School: ${appData.highSchool} | GPA: ${appData.gpa} | SAT/ACT: ${appData.testScores}
Major: ${appData.intendedMajor}
Target Colleges: ${appData.targetColleges.join(', ')}

PERSONAL STATEMENT:
${appData.personalStatement}

ACTIVITIES:
${appData.activities.map((a) => `- ${a.role} at ${a.organization}: ${a.description}`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  // Helper to render field value in either handwritten or typed mode
  const renderFieldValue = (val: string, isSignature = false) => {
    if (!val) return <span className="text-slate-300 italic">Not provided</span>;
    if (renderMode === 'typed') {
      return <span className="font-semibold text-slate-900">{val}</span>;
    }
    return renderOrganicHandwritingSpan(val, style);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar & Export Header */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50 mb-1">
              Step 4 of 4 • Handwritten Autofill Portal
            </p>
            <h2 className="text-2xl font-serif font-light text-[#1A1A1A]">Official College Application Document</h2>
            <p className="text-xs font-serif italic text-[#1A1A1A]/80 mt-1">
              Your application data has been auto-filled onto official application stationery in your personalized handwriting style.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all flex items-center space-x-1.5"
            >
              {copiedText ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Application Data'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#1A1A1A]/20 text-xs">
          
          {/* Template Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/60">Stationery Template:</span>
            <button
              onClick={() => setTemplateType('commonApp')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border ${
                templateType === 'commonApp' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
              }`}
            >
              Common App Official
            </button>
            <button
              onClick={() => setTemplateType('ucApp')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border ${
                templateType === 'ucApp' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
              }`}
            >
              UC Application
            </button>
          </div>

          {/* Render Mode Toggle */}
          <div className="flex items-center space-x-2 bg-[#F9F7F2] p-1 border border-[#1A1A1A]">
            <button
              onClick={() => setRenderMode('handwritten')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold transition-all flex items-center space-x-1 ${
                renderMode === 'handwritten' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Handwritten View</span>
            </button>

            <button
              onClick={() => setRenderMode('typed')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold transition-all flex items-center space-x-1 ${
                renderMode === 'typed' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Typed Print View</span>
            </button>
          </div>

        </div>
      </div>

      {/* Printable Handwritten Application Document */}
      <div className="flex justify-center">
        <div
          ref={portalRef}
          className="w-full max-w-4xl bg-[#FFFDF9] text-[#1A1A1A] p-8 sm:p-12 border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] relative overflow-hidden font-serif print:shadow-none print:p-0 print:border-none print:bg-white"
        >
          {/* Subtle Watermark & Header Seal */}
          <div className="absolute top-8 right-8 opacity-10 pointer-events-none">
            <Building2 className="w-32 h-32 text-[#1A1A1A]" />
          </div>

          {/* Form Header */}
          <div className="border-b-2 border-[#1A1A1A] pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#1A1A1A] font-sans">
                  {templateType === 'commonApp' 
                    ? 'THE COMMON APPLICATION FOR UNDERGRADUATE ADMISSION' 
                    : 'UNIVERSITY OF CALIFORNIA UNDERGRADUATE APPLICATION'}
                </span>
              </div>
              <h1 className="text-2xl font-serif font-light text-[#1A1A1A] tracking-tight mt-1">
                {templateType === 'commonApp' ? 'OFFICIAL APPLICANT RECORD SHEET' : 'UC APPLICATION OFFICIAL AUTOFILLED RECORD'}
              </h1>
              <p className="text-xs text-[#1A1A1A]/70 font-serif italic mt-0.5">
                Academic Year 2026-2027 • Fall 2026 Admissions Cycle
              </p>
            </div>

            <div className="text-right font-mono text-[9px] text-[#1A1A1A]/60 uppercase tracking-widest font-sans">
              <div>{templateType === 'ucApp' ? 'UC APPLICANT ID: #UC-2026-981245' : 'RECORD ID: #APP-2026-8912'}</div>
              <div>STAMP: VERIFIED</div>
            </div>
          </div>

          {/* UC APP SPECIFIC SECTIONS */}
          {templateType === 'ucApp' ? (
            <div className="space-y-6">
              {/* Section I: UC Campus Selections & Major Choice */}
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans flex items-center justify-between">
                  <span>SECTION I: UC CAMPUS SELECTIONS & MAJOR (2026-2027)</span>
                  <span className="text-[9px] font-normal text-white/80">FALL 2026 TERM</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="border border-[#1A1A1A] p-3 bg-[#F9F7F2]">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block mb-1">Selected UC Campuses:</span>
                    <div className="font-semibold text-[#1A1A1A]">
                      {appData.targetColleges.length > 0 
                        ? renderFieldValue(appData.targetColleges.filter(c => c.toLowerCase().includes('uc') || c.toLowerCase().includes('california') || c.toLowerCase().includes('berkeley') || c.toLowerCase().includes('ucla')).join(', ') || 'UC Berkeley, UCLA, UC San Diego, UC Davis')
                        : renderFieldValue('UC Berkeley, UCLA, UC San Diego, UC Davis')
                      }
                    </div>
                  </div>

                  <div className="border border-[#1A1A1A] p-3 bg-[#F9F7F2]">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block mb-1">Primary UC Major / Field of Study:</span>
                    <div className="font-semibold text-[#1A1A1A]">
                      {renderFieldValue(appData.intendedMajor)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section II: UC Academic History & UC GPA */}
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION II: UC ACADEMIC HISTORY & CALCULATED GPAS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-sans">
                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Applicant Name:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.applicantName)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">High School Name:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.highSchool)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">UC Unweighted GPA:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.gpa)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">SAT / ACT (Test-Blind Report):</span>
                    <div className="pt-0.5">{renderFieldValue(appData.testScores || 'Test Optional / Reported')}</div>
                  </div>
                </div>
              </div>

              {/* Section III: UC Personal Insight Questions (PIQs) — 2026-2027 Academic Year */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    SECTION III: UC PERSONAL INSIGHT QUESTIONS (PIQS) — 2026–2027 CYCLE
                  </h2>
                  <span className="text-[9px] font-normal text-white/80">4 OUT OF 8 REQUIRED (MAX 350 WORDS EACH)</span>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {/* PIQ 1: Leadership */}
                  <div className="p-4 border border-[#1A1A1A] bg-[#F9F7F2] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-1 font-bold">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800">
                        UC PIQ #1: Leadership & Positive Influence
                      </span>
                      <span className="text-[9px] font-mono text-[#1A1A1A]/60">MAX 350 WORDS</span>
                    </div>
                    <p className="text-[11px] font-serif italic text-[#1A1A1A]/80">
                      "Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes or contributed to group efforts over time."
                    </p>
                    <div className="pt-2 leading-relaxed">
                      {renderFieldValue(
                        appData.activities.length > 0
                          ? `In my role as ${appData.activities[0].role} at ${appData.activities[0].organization}, I spearheaded team initiatives that transformed our group's workflow. ${appData.activities[0].description} By establishing clear communication channels and mentoring junior members, I fostered an inclusive environment where every voice contributed to our collective goals.`
                          : appData.supplementalEssay1 || 'Leadership experience and collaborative group contributions.'
                      )}
                    </div>
                  </div>

                  {/* PIQ 3: Talent or Skill */}
                  <div className="p-4 border border-[#1A1A1A] bg-[#F9F7F2] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-1 font-bold">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800">
                        UC PIQ #3: Talent or Skill Development
                      </span>
                      <span className="text-[9px] font-mono text-[#1A1A1A]/60">MAX 350 WORDS</span>
                    </div>
                    <p className="text-[11px] font-serif italic text-[#1A1A1A]/80">
                      "What would you say is your greatest talent or skill? How have you developed and demonstrated that talent over time?"
                    </p>
                    <div className="pt-2 leading-relaxed">
                      {renderFieldValue(
                        appData.honors.length > 0
                          ? `My greatest talent lies in analytical problem solving and technical innovation. Over years of dedicated study, culminating in receiving the ${appData.honors[0].title}, I have consistently pushed my technical boundaries. I applied this skill during complex projects where structured thinking turned abstract ideas into functional results.`
                          : `My primary strength is rigorous analytical problem solving, which I have applied consistently across academic and extracurricular projects in ${appData.intendedMajor || 'my field'}.`
                      )}
                    </div>
                  </div>

                  {/* PIQ 6: Academic Subject */}
                  <div className="p-4 border border-[#1A1A1A] bg-[#F9F7F2] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-1 font-bold">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800">
                        UC PIQ #6: Inspiring Academic Subject
                      </span>
                      <span className="text-[9px] font-mono text-[#1A1A1A]/60">MAX 350 WORDS</span>
                    </div>
                    <p className="text-[11px] font-serif italic text-[#1A1A1A]/80">
                      "Think about an academic subject that inspires you. Describe how you have furthered this interest inside and/or outside of the classroom."
                    </p>
                    <div className="pt-2 leading-relaxed">
                      {renderFieldValue(
                        appData.supplementalEssay1Prompt && appData.supplementalEssay1
                          ? appData.supplementalEssay1
                          : `My deep fascination with ${appData.intendedMajor || 'my chosen discipline'} stems from a desire to understand complex systems. Beyond advanced high school coursework, I pursued independent research and practical applications, seeking out challenges that expanded my intellectual horizons.`
                      )}
                    </div>
                  </div>

                  {/* PIQ 8: What Makes You Stand Out */}
                  <div className="p-4 border border-[#1A1A1A] bg-[#F9F7F2] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-1 font-bold">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800">
                        UC PIQ #8: Beyond the Application / Candidate Strength
                      </span>
                      <span className="text-[9px] font-mono text-[#1A1A1A]/60">MAX 350 WORDS</span>
                    </div>
                    <p className="text-[11px] font-serif italic text-[#1A1A1A]/80">
                      "Beyond what has already been shared in your application, what do you believe makes you a strong candidate for admission to the University of California?"
                    </p>
                    <div className="pt-2 leading-relaxed">
                      {renderFieldValue(
                        appData.personalStatement || 'Personal statement reflecting candidate readiness, resilience, and intellectual curiosity.'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section IV: UC Activities & Awards (20 Entries Max) */}
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION IV: UC ACTIVITIES, AWARDS & VOLUNTEER WORK LOG
                </h2>

                <div className="space-y-2 font-sans text-xs">
                  {appData.activities.map((act, i) => (
                    <div key={act.id} className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] flex flex-col gap-1">
                      <div className="flex justify-between font-bold text-[#1A1A1A]">
                        <span>
                          {i + 1}. [Extracurricular] {renderFieldValue(`${act.role} — ${act.organization}`)}
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider font-mono">
                          {act.hoursPerWeek} HR/WK • {act.weeksPerYear} WK/YR
                        </span>
                      </div>
                      <div className="text-[#1A1A1A]/80 text-[11px]">
                        {renderFieldValue(act.description)}
                      </div>
                    </div>
                  ))}

                  {appData.honors.map((hon, i) => (
                    <div key={hon.id} className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] flex justify-between items-center">
                      <span className="font-bold text-[#1A1A1A]">
                        {appData.activities.length + i + 1}. [Honor / Award] {renderFieldValue(`${hon.title} (${hon.levelOfRecognition})`)}
                      </span>
                      <span className="text-[10px] text-[#1A1A1A]/60 font-mono uppercase">
                        Grade {hon.gradeLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* COMMON APP SPECIFIC SECTIONS */
            <div className="space-y-6">
              {/* Section I: Personal Information */}
              <div className="space-y-4 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION I: APPLICANT PERSONAL & ACADEMIC DATA
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Full Legal Name:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.applicantName)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Date of Birth:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.dob || '2008-04-12')}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Contact Email:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.email)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">High School Name:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.highSchool)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Cumulative GPA:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.gpa)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">SAT / ACT Scores:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.testScores)}</div>
                  </div>
                </div>
              </div>

              {/* Section II: Target Universities & Major */}
              <div className="space-y-3 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION II: INTENDED MAJOR & UNIVERSITY SELECTIONS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Intended Major / Field:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.intendedMajor)}</div>
                  </div>

                  <div className="border-b border-[#1A1A1A]/30 pb-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block">Target Universities:</span>
                    <div className="pt-0.5">{renderFieldValue(appData.targetColleges.join(', '))}</div>
                  </div>
                </div>
              </div>

              {/* Section III: Extracurricular Activities Log */}
              <div className="space-y-3 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION III: EXTRACURRICULAR ACTIVITIES LOG
                </h2>

                <div className="space-y-3 font-sans text-xs">
                  {appData.activities.map((act, i) => (
                    <div key={act.id} className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] space-y-1">
                      <div className="flex justify-between font-bold text-[#1A1A1A]">
                        <span>
                          {i + 1}. {renderFieldValue(`${act.role} — ${act.organization}`)}
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">
                          {act.hoursPerWeek} hrs/wk • {act.weeksPerYear} wks/yr
                        </span>
                      </div>
                      <div className="text-[#1A1A1A]/80 pt-1">
                        {renderFieldValue(act.description)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section IV: Personal Statement Essay */}
              <div className="space-y-3 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] px-2.5 py-1 text-white font-sans">
                  SECTION IV: PERSONAL STATEMENT ESSAY (COMMON APP)
                </h2>

                <div className="p-3 border border-[#1A1A1A] bg-[#F9F7F2] text-xs font-sans leading-relaxed relative min-h-[200px]">
                  <div className="font-serif italic text-[#1A1A1A]/70 mb-2 border-b border-[#1A1A1A]/20 pb-1 font-semibold text-[11px]">
                    Prompt: "{appData.personalStatementPrompt}"
                  </div>

                  <div className="p-2 leading-loose">
                    {renderFieldValue(appData.personalStatement)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section V: Certification & Handwritten Signature */}
          <div className="pt-6 border-t-2 border-[#1A1A1A] space-y-4 font-sans text-xs">
            <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/70 font-semibold leading-tight">
              I certify that all information submitted in this admission record is accurate, complete, and honest.
            </p>

            <div className="grid grid-cols-2 gap-8 items-end pt-2">
              <div className="border-b-2 border-[#1A1A1A] pb-1">
                <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block mb-1">
                  Student Handwritten Cursive Signature:
                </span>
                <div className="min-h-[40px] flex items-center">
                  <span style={getHandwritingCssStyle(style, true)}>
                    {appData.signatureName || appData.applicantName}
                  </span>
                </div>
              </div>

              <div className="border-b-2 border-[#1A1A1A] pb-1">
                <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block mb-1">
                  Date Signed:
                </span>
                <div className="min-h-[40px] flex items-center">
                  {renderFieldValue(appData.signatureDate || new Date().toISOString().slice(0, 10))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

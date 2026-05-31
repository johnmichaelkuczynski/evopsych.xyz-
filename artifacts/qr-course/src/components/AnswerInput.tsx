import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  KeystrokeTrace,
  DetectionResult,
  useScanText,
} from "@workspace/api-client-react";
import { MathKeyboard } from "@/components/MathKeyboard";
import { QuickPickBar } from "@/components/QuickPickBar";
import { Switch } from "@/components/ui/switch";

interface AnswerInputProps {
  value: string;
  onChange: (val: string, trace: KeystrokeTrace) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Source text (the question prompt) used to derive the per-question quick-pick symbol bar. */
  promptSource?: string;
}

// Minimum characters before a real-time AI score is meaningful.
const MIN_SCAN_CHARS = 20;
const SCAN_DEBOUNCE_MS = 900;

// Background highlight for a text segment, keyed by its AI probability.
// Red = likely AI, yellow = uncertain / indeterminate, green = likely human.
function segmentClass(score: number): string {
  if (score >= 0.66) return "bg-red-500/30";
  if (score >= 0.34) return "bg-yellow-400/30";
  return "bg-green-500/20";
}

function overallClass(score: number): string {
  if (score >= 0.66) return "bg-red-500 text-white";
  if (score >= 0.34) return "bg-yellow-400 text-black";
  return "bg-green-600 text-white";
}

function overallLabel(score: number): string {
  if (score >= 0.66) return "Likely AI-generated";
  if (score >= 0.34) return "Uncertain";
  return "Likely human-written";
}

export function AnswerInput({ value, onChange, placeholder, disabled, promptSource }: AnswerInputProps) {
  const [sessionValue, setSessionValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const traceRef = useRef<KeystrokeTrace>({
    keystrokeCount: 0,
    eraseCount: 0,
    bulkInsertCount: 0,
    longestBulkInsertChars: 0,
    rewriteSegments: 0,
    durationMs: 0,
  });

  const sessionStartRef = useRef<number>(Date.now());
  const lastKeyWasEraseRef = useRef<boolean>(false);

  const [aiMode, setAiMode] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const scan = useScanText();
  const lastScannedRef = useRef<string>("");
  // Always holds the newest text typed, so we can discard stale (out-of-order) scan responses.
  const latestTextRef = useRef<string>(value);

  useEffect(() => {
    setSessionValue(value);
  }, [value]);

  useEffect(() => {
    latestTextRef.current = sessionValue;
  }, [sessionValue]);

  // Real-time AI detection: when the toggle is on, debounce-scan the current answer.
  useEffect(() => {
    if (!aiMode || disabled) return;
    const text = sessionValue.trim();
    if (text.length < MIN_SCAN_CHARS) {
      setDetection(null);
      return;
    }
    if (sessionValue === lastScannedRef.current) return;
    const handle = setTimeout(() => {
      const dispatched = sessionValue;
      lastScannedRef.current = dispatched;
      const trace: KeystrokeTrace = {
        ...traceRef.current,
        durationMs: Date.now() - sessionStartRef.current,
      };
      scan.mutate(
        { data: { text: dispatched, trace } },
        {
          onSuccess: (data) => {
            // Ignore late responses that no longer match what the user has typed.
            if (dispatched === latestTextRef.current) setDetection(data);
          },
          onError: () => {
            // Allow this exact text to be retried on the next keystroke.
            if (lastScannedRef.current === dispatched) lastScannedRef.current = "";
          },
        },
      );
    }, SCAN_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [sessionValue, aiMode, disabled, scan]);

  const emitChange = useCallback(
    (newVal: string) => {
      const trace = {
        ...traceRef.current,
        durationMs: Date.now() - sessionStartRef.current,
      };
      onChange(newVal, trace);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const diff = newVal.length - sessionValue.length;

    if (diff > 5) {
      traceRef.current.bulkInsertCount = (traceRef.current.bulkInsertCount || 0) + 1;
      if (diff > (traceRef.current.longestBulkInsertChars || 0)) {
        traceRef.current.longestBulkInsertChars = diff;
      }
    }

    setSessionValue(newVal);
    emitChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isErase = e.key === "Backspace" || e.key === "Delete";

    if (isErase) {
      traceRef.current.eraseCount += 1;
      if (!lastKeyWasEraseRef.current) {
        traceRef.current.rewriteSegments = (traceRef.current.rewriteSegments || 0) + 1;
      }
      lastKeyWasEraseRef.current = true;
    } else if (e.key.length === 1 || e.key === "Enter") {
      traceRef.current.keystrokeCount += 1;
      lastKeyWasEraseRef.current = false;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => e.preventDefault();

  const insertAtCursor = useCallback(
    (text: string) => {
      if (!text) return;
      const ta = textareaRef.current;
      const current = sessionValue;
      let next: string;
      let nextCaret: number;
      if (ta && document.activeElement === ta) {
        const start = ta.selectionStart ?? current.length;
        const end = ta.selectionEnd ?? current.length;
        next = current.slice(0, start) + text + current.slice(end);
        nextCaret = start + text.length;
      } else {
        next = current + text;
        nextCaret = next.length;
      }
      traceRef.current.keystrokeCount += text.length;
      setSessionValue(next);
      emitChange(next);
      requestAnimationFrame(() => {
        if (!ta) return;
        ta.focus();
        try {
          ta.setSelectionRange(nextCaret, nextCaret);
        } catch {}
      });
    },
    [sessionValue, emitChange],
  );

  const backspaceAtCursor = useCallback(() => {
    const ta = textareaRef.current;
    const current = sessionValue;
    let next: string;
    let nextCaret: number;
    if (ta && document.activeElement === ta) {
      const start = ta.selectionStart ?? current.length;
      const end = ta.selectionEnd ?? current.length;
      if (start === end) {
        if (start === 0) return;
        next = current.slice(0, start - 1) + current.slice(end);
        nextCaret = start - 1;
      } else {
        next = current.slice(0, start) + current.slice(end);
        nextCaret = start;
      }
    } else {
      if (current.length === 0) return;
      next = current.slice(0, -1);
      nextCaret = next.length;
    }
    traceRef.current.eraseCount += 1;
    if (!lastKeyWasEraseRef.current) {
      traceRef.current.rewriteSegments = (traceRef.current.rewriteSegments || 0) + 1;
    }
    lastKeyWasEraseRef.current = true;
    setSessionValue(next);
    emitChange(next);
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      try {
        ta.setSelectionRange(nextCaret, nextCaret);
      } catch {}
    });
  }, [sessionValue, emitChange]);

  const clearAll = useCallback(() => {
    traceRef.current.eraseCount += sessionValue.length;
    setSessionValue("");
    emitChange("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [sessionValue.length, emitChange]);

  const tooShortToScan = sessionValue.trim().length < MIN_SCAN_CHARS;
  const segments = detection?.segments ?? [];

  return (
    <div className="flex flex-col gap-2 w-full">
      {!disabled && promptSource ? (
        <QuickPickBar source={promptSource} onInsert={insertAtCursor} />
      ) : null}

      {/* AI detection toggle */}
      <div className="flex items-center justify-between gap-3 rounded-md border border-input bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Switch
            id="ai-detect-toggle"
            checked={aiMode}
            onCheckedChange={setAiMode}
            disabled={disabled}
          />
          <label htmlFor="ai-detect-toggle" className="text-sm font-medium cursor-pointer select-none">
            AI detection
          </label>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            See your AI score as you write
          </span>
        </div>
        {aiMode && !tooShortToScan && detection && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-md ${overallClass(detection.aiScore)}`}
            >
              {Math.round(detection.aiScore * 100)}% AI
            </span>
            <span className="text-xs text-muted-foreground hidden md:inline">
              {overallLabel(detection.aiScore)}
            </span>
          </div>
        )}
        {aiMode && scan.isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">Analyzing…</span>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={sessionValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        placeholder={placeholder || "Type your answer here..."}
        disabled={disabled}
        className="w-full min-h-[180px] p-5 bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-3xl leading-relaxed resize-y"
      />
      <span className="text-xs text-muted-foreground px-1">Pasting is disabled.</span>

      {/* Real-time AI analysis panel */}
      {aiMode && !disabled && (
        <div className="rounded-md border border-input bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold">AI authorship analysis</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-500/40 inline-block" /> human
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-yellow-400/50 inline-block" /> uncertain
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-500/50 inline-block" /> AI
              </span>
            </div>
          </div>

          {tooShortToScan ? (
            <p className="text-sm text-muted-foreground">
              Write at least {MIN_SCAN_CHARS} characters to see a reliable, color-coded AI score.
            </p>
          ) : !detection ? (
            <p className="text-sm text-muted-foreground">
              {scan.isPending ? "Analyzing your answer…" : "Pause typing to analyze your answer."}
            </p>
          ) : (
            <>
              <p className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
                {segments.length > 0
                  ? segments.map((seg, i) => (
                      <span key={i} className={`${segmentClass(seg.score)} rounded-[2px]`}>
                        {seg.text}
                      </span>
                    ))
                  : sessionValue}
              </p>
              <p className="text-xs text-muted-foreground border-t border-input pt-2">
                {detection.rationale}
                {detection.diachronicFlagged
                  ? " Typing pattern also looks like reworded paste."
                  : ""}
              </p>
            </>
          )}
        </div>
      )}

      {!disabled && (
        <MathKeyboard
          onInsert={insertAtCursor}
          onBackspace={backspaceAtCursor}
          onClear={clearAll}
        />
      )}
    </div>
  );
}

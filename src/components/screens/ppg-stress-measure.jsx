"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    PiX,
    PiHeartbeat,
    PiCamera,
    PiHandPalm,
    PiTimer,
    PiArrowRight,
    PiCheck,
    PiWarning,
} from "react-icons/pi";
import { Button } from "../ui";

/**
 * ──────────────────────────────────────────────────────────────────
 *  PPG Stress Measurement Screen
 *
 *  Uses the rear camera + torch to read finger-tip PPG and derive
 *  HRV-based stress via RMSSD → logarithmic 0-100 score.
 *
 *  Phases:
 *   1. Tutorial overlay (3 steps)
 *   2. Camera capture – 30 s of red-channel sampling
 *   3. Signal processing & score display
 * ──────────────────────────────────────────────────────────────────
 */

// ── Duration (seconds) for sampling – 30 s is a good PPG window ──
const MEASURE_DURATION = 30;

// ─── Signal Processing Helpers ──────────────────────────────────────

/**
 * Simple moving-average smoother.
 * Returns a new array of the same length with values averaged over `windowSize`.
 */
function movingAverage(data, windowSize = 5) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
        let sum = 0;
        for (let j = start; j < end; j++) sum += data[j];
        result.push(sum / (end - start));
    }
    return result;
}

/**
 * Detect peaks in a 1-D signal using a simple neighbourhood-maximum algorithm.
 * Returns an array of indices where peaks occur.
 */
function detectPeaks(signal, minDistance = 10) {
    const peaks = [];
    for (let i = 1; i < signal.length - 1; i++) {
        if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
            // Enforce minimum distance between peaks
            if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
                peaks.push(i);
            }
        }
    }
    return peaks;
}

/**
 * Calculate RMSSD from RR-intervals (ms).
 */
function calculateRMSSD(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    let sumSquared = 0;
    let count = 0;
    for (let i = 0; i < rrIntervals.length - 1; i++) {
        const diff = rrIntervals[i + 1] - rrIntervals[i];
        sumSquared += diff * diff;
        count++;
    }
    return Math.sqrt(sumSquared / count);
}

/**
 * Convert raw RMSSD (ms) into a 0-100 stress score.
 * Higher RMSSD → lower stress, lower RMSSD → higher stress.
 */
function rmssdToStressScore(rmssd) {
    if (rmssd <= 0) return 100;
    const normalised = Math.log(rmssd) * 20;
    return Math.max(0, Math.min(100, Math.round(100 - normalised)));
}

/**
 * Map a 0-100 stress score to an HRV value in the 20-100 ms range
 * (for compatibility with existing stress-utils getStressLevel).
 */
function stressScoreToHRV(score) {
    // Score 0 = very relaxed → HRV ~100, Score 100 = very stressed → HRV ~20
    return Math.round(100 - (score * 0.8));
}

/**
 * Get a colour & label for the result display.
 */
function getStressInfo(score) {
    if (score <= 30) return { label: "Relaxed", color: "#22C55E", bg: "bg-green-50", emoji: "😌" };
    if (score <= 55) return { label: "Balanced", color: "#F59E0B", bg: "bg-amber-50", emoji: "🙂" };
    if (score <= 75) return { label: "Moderate", color: "#F97316", bg: "bg-orange-50", emoji: "😐" };
    return { label: "Elevated", color: "#EF4444", bg: "bg-red-50", emoji: "😟" };
}

// ── Tutorial Steps ──────────────────────────────────────────────────

const TUTORIAL_STEPS = [
    {
        icon: PiHandPalm,
        title: "Find a quiet place",
        description: "Sit down comfortably and relax. Try to stay still during the measurement.",
    },
    {
        icon: PiCamera,
        title: "Cover the rear camera",
        description: "Gently place your fingertip fully covering your phone's rear camera and flash.",
    },
    {
        icon: PiTimer,
        title: `Hold for ${MEASURE_DURATION} seconds`,
        description: "Keep your finger steady while we measure your heart rhythm through the camera.",
    },
];

// ─── Main Component ─────────────────────────────────────────────────

export default function PPGStressMeasure({ open, onClose, onResult }) {
    // Phase: "tutorial" | "measuring" | "processing" | "result" | "error"
    const [phase, setPhase] = useState("tutorial");
    const [tutorialStep, setTutorialStep] = useState(0);
    const [progress, setProgress] = useState(0); // 0-100 during measurement
    const [bpm, setBpm] = useState(null);
    const [stressScore, setStressScore] = useState(null);
    const [hrvValue, setHrvValue] = useState(null);
    const [rmssdValue, setRmssdValue] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [fingerDetected, setFingerDetected] = useState(false);

    // Refs for camera & canvas
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const frameDataRef = useRef([]); // { t: timestamp, r: avgRed }
    const animFrameRef = useRef(null);
    const startTimeRef = useRef(null);

    // Cleanup on unmount or close
    useEffect(() => {
        if (!open) {
            stopCamera();
            setPhase("tutorial");
            setTutorialStep(0);
            setProgress(0);
            setStressScore(null);
            setHrvValue(null);
            setRmssdValue(null);
            setBpm(null);
            setErrorMsg("");
            setFingerDetected(false);
            frameDataRef.current = [];
        }
    }, [open]);

    // ─── Camera Control ──────────────────────────────────────────────

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            // Request rear camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            });
            streamRef.current = stream;

            // Attach to hidden video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // Try to enable torch / flashlight
            const track = stream.getVideoTracks()[0];
            try {
                await track.applyConstraints({ advanced: [{ torch: true }] });
            } catch {
                // torch not supported – that's fine, PPG still works in well-lit conditions
                console.warn("Torch API not supported on this device.");
            }

            // Begin measurement
            setPhase("measuring");
            frameDataRef.current = [];
            startTimeRef.current = performance.now();
            captureFrames();
        } catch (err) {
            console.error("Camera error:", err);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setErrorMsg("Camera permission was denied. Please allow camera access in your browser settings and try again.");
            } else if (err.name === "NotFoundError") {
                setErrorMsg("No rear camera found on this device.");
            } else {
                setErrorMsg("Could not access the camera. Please try again.");
            }
            setPhase("error");
        }
    }, []);

    // ─── Frame Capture Loop ──────────────────────────────────────────

    const captureFrames = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = 64;  // Small canvas for speed
        canvas.height = 48;

        const loop = () => {
            const now = performance.now();
            const elapsed = (now - startTimeRef.current) / 1000;

            if (elapsed >= MEASURE_DURATION) {
                // Done capturing — process
                setPhase("processing");
                processSignal();
                return;
            }

            // Update UI progress
            setProgress(Math.min(100, (elapsed / MEASURE_DURATION) * 100));

            // Draw current video frame onto small canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // Calculate average red channel brightness
            let redSum = 0;
            let greenSum = 0;
            const pixelCount = pixels.length / 4;
            for (let i = 0; i < pixels.length; i += 4) {
                redSum += pixels[i];       // Red
                greenSum += pixels[i + 1]; // Green
            }
            const avgRed = redSum / pixelCount;
            const avgGreen = greenSum / pixelCount;

            // Finger detection: when finger covers camera+torch, red channel is high (>100)
            // and green is relatively low. This gives a warm reddish tint.
            const isFingerOn = avgRed > 100 && avgRed > avgGreen * 1.3;
            setFingerDetected(isFingerOn);

            frameDataRef.current.push({ t: now, r: avgRed });
            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
    }, []);

    // ─── Signal Processing ───────────────────────────────────────────

    const processSignal = useCallback(() => {
        const frames = frameDataRef.current;

        if (frames.length < 60) {
            // Not enough data
            setErrorMsg("Not enough data was captured. Please ensure your finger fully covers the camera and try again.");
            setPhase("error");
            stopCamera();
            return;
        }

        // Extract red-channel values and timestamps
        const rawSignal = frames.map(f => f.r);
        const timestamps = frames.map(f => f.t);

        // Smooth signal with moving average (window ~7 frames ≈ 0.2s @ 30fps)
        const smoothed = movingAverage(rawSignal, 7);

        // Estimate FPS for minimum-distance parameter
        const totalTime = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
        const fps = frames.length / totalTime;

        // Peaks should be at least 0.4s apart (max ~150 bpm)
        const minDist = Math.max(5, Math.round(fps * 0.4));
        const peakIndices = detectPeaks(smoothed, minDist);

        if (peakIndices.length < 3) {
            setErrorMsg("Could not detect enough heartbeats. Please try again in a well-lit environment with your finger firmly on the camera.");
            setPhase("error");
            stopCamera();
            return;
        }

        // Calculate RR-intervals in milliseconds
        const rrIntervals = [];
        for (let i = 1; i < peakIndices.length; i++) {
            const dt = timestamps[peakIndices[i]] - timestamps[peakIndices[i - 1]];
            // Filter physiologically plausible intervals (40-180 bpm → 333-1500 ms)
            if (dt >= 333 && dt <= 1500) {
                rrIntervals.push(dt);
            }
        }

        if (rrIntervals.length < 3) {
            setErrorMsg("Heart rhythm data was inconsistent. Please hold your finger steady and try again.");
            setPhase("error");
            stopCamera();
            return;
        }

        // Calculate heart rate from median RR interval
        const sortedRR = [...rrIntervals].sort((a, b) => a - b);
        const medianRR = sortedRR[Math.floor(sortedRR.length / 2)];
        const heartRate = Math.round(60000 / medianRR);

        // Calculate RMSSD
        const rmssd = calculateRMSSD(rrIntervals);

        // Convert to stress score
        const score = rmssdToStressScore(rmssd);
        const hrv = stressScoreToHRV(score);

        setBpm(heartRate);
        setRmssdValue(Math.round(rmssd));
        setStressScore(score);
        setHrvValue(hrv);
        setPhase("result");
        stopCamera();
    }, [stopCamera]);

    // ─── Event Handlers ──────────────────────────────────────────────

    const handleStartMeasurement = () => {
        startCamera();
    };

    const handleSaveResult = () => {
        if (onResult && stressScore !== null) {
            onResult({
                stressScore,
                hrv: hrvValue,
                rmssd: rmssdValue,
                bpm,
                source: "camera",
            });
        }
        onClose();
    };

    const handleRetry = () => {
        stopCamera();
        setPhase("tutorial");
        setTutorialStep(0);
        setProgress(0);
        setStressScore(null);
        setErrorMsg("");
        setFingerDetected(false);
        frameDataRef.current = [];
    };

    if (!open) return null;

    const stressInfo = stressScore !== null ? getStressInfo(stressScore) : null;

    // ─── Render ──────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 bg-[#0F0F14] flex flex-col font-sans">
            {/* Hidden video + canvas for camera processing */}
            <video ref={videoRef} playsInline muted className="hidden" />
            <canvas ref={canvasRef} className="hidden" />

            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-6 pt-14 pb-4">
                <h1 className="text-white text-lg font-bold tracking-tight">
                    {phase === "tutorial" && "Stress Measurement"}
                    {phase === "measuring" && "Measuring..."}
                    {phase === "processing" && "Analyzing..."}
                    {phase === "result" && "Your Result"}
                    {phase === "error" && "Oops"}
                </h1>
                <button
                    onClick={() => { stopCamera(); onClose(); }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <PiX size={20} className="text-white" />
                </button>
            </div>

            {/* ── Phase Content ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">

                {/* ────── TUTORIAL ────── */}
                {phase === "tutorial" && (
                    <div className="flex flex-col items-center text-center w-full max-w-sm animate-fadeIn">
                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mb-10">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === tutorialStep
                                            ? "w-8 bg-purple-400"
                                            : idx < tutorialStep
                                                ? "w-4 bg-purple-400/40"
                                                : "w-4 bg-white/15"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Icon */}
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                            {React.createElement(TUTORIAL_STEPS[tutorialStep].icon, {
                                size: 36,
                                className: "text-purple-300",
                            })}
                        </div>

                        {/* Text */}
                        <h2 className="text-white text-xl font-bold tracking-tight mb-3">
                            {TUTORIAL_STEPS[tutorialStep].title}
                        </h2>
                        <p className="text-neutral-400 text-[15px] leading-relaxed font-medium max-w-[280px] mb-12">
                            {TUTORIAL_STEPS[tutorialStep].description}
                        </p>

                        {/* Button */}
                        {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                            <button
                                onClick={() => setTutorialStep(s => s + 1)}
                                className="w-full max-w-[260px] h-14 rounded-full bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 hover:bg-white/15 active:scale-[0.98] transition-all"
                            >
                                Next <PiArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleStartMeasurement}
                                className="w-full max-w-[260px] h-14 rounded-full text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                style={{ backgroundImage: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(236,72,153,0.8))" }}
                            >
                                <PiHeartbeat size={20} /> Start Measurement
                            </button>
                        )}
                    </div>
                )}

                {/* ────── MEASURING ────── */}
                {phase === "measuring" && (
                    <div className="flex flex-col items-center text-center w-full max-w-sm">
                        {/* Pulsing ring */}
                        <div className="relative w-48 h-48 mb-10">
                            {/* Outer glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
                            {/* Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                                <circle
                                    cx="50" cy="50" r="44" fill="none"
                                    stroke="url(#ppgGrad)" strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${progress * 2.76} 276`}
                                    className="transition-all duration-200"
                                />
                                <defs>
                                    <linearGradient id="ppgGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#A78BFA" />
                                        <stop offset="100%" stopColor="#EC4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white tabular-nums">
                                    {Math.round(progress)}%
                                </span>
                                <span className="text-xs text-neutral-400 font-medium mt-1">
                                    {Math.ceil(MEASURE_DURATION - (progress / 100) * MEASURE_DURATION)}s left
                                </span>
                            </div>
                        </div>

                        {/* Finger detection status */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${fingerDetected
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-red-500/10 border-red-500/20"
                            }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${fingerDetected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${fingerDetected ? "text-green-400" : "text-red-400"}`}>
                                {fingerDetected ? "Finger detected" : "Place finger on camera"}
                            </span>
                        </div>

                        <p className="text-neutral-500 text-sm mt-6 font-medium">
                            Keep your finger still on the camera...
                        </p>
                    </div>
                )}

                {/* ────── PROCESSING ────── */}
                {phase === "processing" && (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                            <PiHeartbeat size={32} className="text-purple-300" />
                        </div>
                        <h2 className="text-white text-xl font-bold mb-2">Analyzing your heart rhythm</h2>
                        <p className="text-neutral-400 text-sm font-medium">This will only take a moment...</p>
                    </div>
                )}

                {/* ────── RESULT ────── */}
                {phase === "result" && stressInfo && (
                    <div className="flex flex-col items-center text-center w-full max-w-sm">
                        {/* Score display */}
                        <div className="relative w-44 h-44 mb-8">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                <circle
                                    cx="50" cy="50" r="44" fill="none"
                                    stroke={stressInfo.color} strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeDasharray={`${stressScore * 2.76} 276`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl mb-1">{stressInfo.emoji}</span>
                                <span className="text-3xl font-bold text-white tabular-nums">{stressScore}</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                    Stress Score
                                </span>
                            </div>
                        </div>

                        {/* Label */}
                        <div className="px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: stressInfo.color + "20" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: stressInfo.color }}>
                                {stressInfo.label}
                            </span>
                        </div>

                        {/* Metrics row */}
                        <div className="flex items-center gap-4 mb-10 w-full max-w-xs">
                            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                                <span className="text-2xl font-bold text-white tabular-nums">{hrvValue}</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                                    ms HRV
                                </span>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                                <span className="text-2xl font-bold text-white tabular-nums">{bpm}</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                                    BPM
                                </span>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                                <span className="text-2xl font-bold text-white tabular-nums">{rmssdValue}</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                                    RMSSD
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 w-full max-w-[260px]">
                            <button
                                onClick={handleSaveResult}
                                className="w-full h-14 rounded-full text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                style={{ backgroundImage: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(236,72,153,0.8))" }}
                            >
                                <PiCheck size={20} /> Save Result
                            </button>
                            <button
                                onClick={handleRetry}
                                className="w-full h-12 rounded-full bg-white/8 border border-white/10 text-neutral-300 font-bold uppercase tracking-wide text-sm flex items-center justify-center hover:bg-white/12 active:scale-[0.98] transition-all"
                            >
                                Measure Again
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <div className="flex items-start gap-2 mt-8 px-2">
                            <PiWarning size={14} className="text-neutral-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-neutral-500 leading-relaxed text-left">
                                This measurement is for informational purposes only. Camera-based PPG may be less accurate than clinical devices.
                            </p>
                        </div>
                    </div>
                )}

                {/* ────── ERROR ────── */}
                {phase === "error" && (
                    <div className="flex flex-col items-center text-center w-full max-w-sm">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                            <PiWarning size={32} className="text-red-400" />
                        </div>
                        <h2 className="text-white text-xl font-bold mb-3">Measurement Failed</h2>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-[280px] mb-10">
                            {errorMsg}
                        </p>
                        <div className="flex flex-col gap-3 w-full max-w-[260px]">
                            <button
                                onClick={handleRetry}
                                className="w-full h-14 rounded-full text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                style={{ backgroundImage: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(236,72,153,0.8))" }}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => { stopCamera(); onClose(); }}
                                className="w-full h-12 rounded-full bg-white/8 border border-white/10 text-neutral-300 font-bold uppercase tracking-wide text-sm flex items-center justify-center hover:bg-white/12 active:scale-[0.98] transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

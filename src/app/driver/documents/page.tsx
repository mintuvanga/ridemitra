"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const requiredDocs = [
  { key: "licence", title: "Driving licence", detail: "Front and back, clearly readable", accept: "image/*,.pdf" },
  { key: "rc", title: "Vehicle Registration Certificate (RC)", detail: "For the vehicle you will use", accept: "image/*,.pdf" },
  { key: "insurance", title: "Vehicle insurance", detail: "Current policy showing vehicle details", accept: "image/*,.pdf" },
  { key: "selfie", title: "Live selfie / face match", detail: "Use the live camera to capture your face", accept: "image/*" },
] as const;


export default function DriverDocumentsPage() {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [faceStatus, setFaceStatus] = useState("Position your face inside the oval");
  const [faceReady, setFaceReady] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const checkingRef = useRef(false);
  const selectedCount = requiredDocs.filter(doc => files[doc.key]).length;

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setFaceReady(false);
  }

  async function openCamera() {
    setCameraError("");
    setFaceReady(false);
    setFaceStatus("Opening camera…");
    let stage: "face-detection" | "camera" = "face-detection";
    try {
      setFaceStatus("Loading automatic face detection…");
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
        );
      } catch {
        vision = await FilesetResolver.forVisionTasks(
          "https://unpkg.com/@mediapipe/tasks-vision@0.10.22/wasm"
        );
      }

      const detectorOptions = {
        baseOptions: {
          delegate: "CPU" as const,
        },
        runningMode: "VIDEO" as const,
        minDetectionConfidence: 0.6,
      };
      const modelUrls = [
        "https://raw.githubusercontent.com/noname0310/mediapipe-annotation-gen/master/blaze_face_short_range.tflite",
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      ];
      let lastModelError: unknown;
      for (const modelAssetPath of modelUrls) {
        try {
          detectorRef.current = await FaceDetector.createFromOptions(vision, {
            ...detectorOptions,
            baseOptions: { ...detectorOptions.baseOptions, modelAssetPath },
          });
          break;
        } catch (error) {
          lastModelError = error;
        }
      }
      if (!detectorRef.current) {
        throw lastModelError ?? new Error("FACE_MODEL_LOAD_FAILED");
      }
      stage = "camera";
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMERA_API_UNAVAILABLE");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setFaceStatus("Keep your face centered and look at the camera");
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => setCameraError("Could not start the camera preview. Please allow camera access and try again."));
        }
      }, 100);
    } catch (error) {
      detectorRef.current?.close();
      detectorRef.current = null;
      const name = error instanceof Error ? error.name : "";
      if (name === "NotAllowedError") {
        setCameraError("Camera permission was denied or blocked. In your browser address-bar site settings, allow Camera, then reload this page and try again.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera was found. Connect or enable a webcam, then try again.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError("The camera is busy or unavailable. Close other apps or browser tabs using the camera, then try again.");
      } else if (name === "OverconstrainedError") {
        setCameraError("The camera cannot meet the requested settings. Try another camera or browser.");
      } else if (name === "CAMERA_API_UNAVAILABLE") {
        setCameraError("Camera access is unavailable. Open this page directly at its HTTPS address and allow camera access in your browser settings.");
      } else if (stage === "face-detection") {
        setCameraError("The face-detection model could not load. Check your internet connection or network restrictions, then refresh and try again.");
      } else {
        setCameraError("Camera could not start. Check site camera permission, make sure no other app is using the camera, and try again.");
      }
    }
  }

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;
    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (!video || !detector || video.readyState < 2 || checkingRef.current) return;
      checkingRef.current = true;
      try {
        const faces = detector.detectForVideo(video, performance.now()).detections;
        if (!active) return;
        if (faces.length !== 1) {
          setFaceReady(false);
          setFaceStatus(faces.length === 0 ? "No face detected — move into the oval and face the camera" : "Only one person should be visible");
          return;
        }
        const box = faces[0].boundingBox;
        if (!box) {
          setFaceReady(false);
          setFaceStatus("Could not measure your face — adjust your position");
          return;
        }
        const cx = (box.originX + box.width / 2) / video.videoWidth;
        const cy = (box.originY + box.height / 2) / video.videoHeight;
        const widthRatio = box.width / video.videoWidth;
        if (cx < 0.3 || cx > 0.7 || cy < 0.22 || cy > 0.78 || widthRatio < 0.18 || widthRatio > 0.65) {
          setFaceReady(false);
          setFaceStatus("Move closer or adjust your face to fit inside the oval");
          return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 160;
        canvas.height = 90;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let total = 0;
        for (let i = 0; i < pixels.length; i += 4) total += (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114);
        const brightness = total / (pixels.length / 4);
        if (brightness < 55) {
          setFaceReady(false);
          setFaceStatus("Too dark — move to a brighter place");
          return;
        }
        if (brightness > 225) {
          setFaceReady(false);
          setFaceStatus("Too bright — avoid strong light behind you");
          return;
        }
        setFaceReady(true);
        setFaceStatus("Face detected and centered — ready to capture");
      } catch {
        if (active) {
          setFaceReady(false);
          setFaceStatus("Checking face… keep still and look at the camera");
        }
      } finally {
        checkingRef.current = false;
      }
    }, 600);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [cameraOpen]);

  function captureSelfie() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !faceReady) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture the image. Please try again.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) {
        setCameraError("Unable to create the selfie image. Please try again.");
        return;
      }
      const file = new File([blob], "ridemitra-live-selfie.jpg", { type: "image/jpeg" });
      setFiles(current => ({ ...current, selfie: file }));
      setCapturedPreview(URL.createObjectURL(blob));
      setCameraError("");
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (selectedCount !== requiredDocs.length) {
      setMessage("Please select all four required documents before continuing.");
      return;
    }
    // This endpoint currently receives file metadata only. Secure file storage and real identity/liveness verification must be configured before accepting documents.
    setBusy(true);
    try {
      const response = await fetch("/api/driver/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: requiredDocs.map(doc => ({
            type: doc.key,
            fileName: files[doc.key]?.name ?? "",
            fileSize: files[doc.key]?.size ?? 0,
            mimeType: files[doc.key]?.type ?? "",
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Secure document submission is not ready yet.");
      setMessage(result.message || "Your documents were received for review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit documents.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
          <Link href="/" className="text-lg font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span> <span className="text-sm font-medium text-slate-500">Driver</span></Link>
          <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Contact Support ↗</Link>
        </header>
        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/60 sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">🛡️</div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Step 1 of driver approval</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Verify your documents</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Upload clear, genuine documents that belong to you and your vehicle. Your driver account stays unapproved until the checks are completed.</p>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Important:</strong> Selecting files here does not upload or verify them. Secure file storage and a real identity-verification provider must be connected before submissions can be accepted. We will not mark documents as verified without those checks.</div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {requiredDocs.map((doc, index) => (
              <div key={doc.key} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-sky-300">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-bold text-sky-700">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{doc.title} <span className="text-red-500">*</span></p>
                    <p className="mt-1 text-sm text-slate-500">{doc.detail}</p>
                    {doc.key !== "selfie" ? (
                      <>
                        <input required type="file" accept={doc.accept} onChange={event => setFiles(current => ({ ...current, [doc.key]: event.target.files?.[0] ?? null }))} className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:font-semibold file:text-sky-800" />
                        {files[doc.key] && <p className="mt-2 break-all text-xs text-sky-700">Selected: {files[doc.key]?.name}</p>}
                      </>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {capturedPreview && <img src={capturedPreview} alt="Captured live selfie preview" className="h-32 w-32 rounded-2xl border border-sky-200 object-cover" />}
                        {files.selfie && <p className="break-all text-xs text-sky-700">Captured: {files.selfie.name}</p>}
                        <button type="button" onClick={() => { setCameraError(""); void openCamera(); }} className="w-full rounded-xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700">{files.selfie ? "Retake live selfie" : "Open camera and take selfie"}</button>
                        <p className="text-xs leading-5 text-slate-500">Camera access is requested only when you tap the button. Keep one face centered, clearly lit, and close enough to fit the oval.</p>
                        {cameraError && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{cameraError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {cameraOpen && (
              <div className="rounded-2xl border border-sky-200 bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold">Live selfie camera</h2>
                  <button type="button" onClick={stopCamera} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">Close</button>
                </div>
                <div className="relative mt-3 overflow-hidden rounded-2xl bg-black">
                  <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover [transform:scaleX(-1)]" />
                  <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-sky-300 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
                </div>
                <p className={`mt-3 rounded-xl p-3 text-sm font-semibold ${faceReady ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-sky-100"}`} role="status">{faceStatus}</p>
                <button type="button" disabled={!faceReady} onClick={captureSelfie} className="mt-3 w-full rounded-xl bg-sky-500 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-600">Capture photo</button>
                <p className="mt-2 text-xs leading-5 text-slate-300">Face position and lighting are checked in your browser. This is not a liveness or identity verification check.</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{selectedCount} of 4 required files selected</div>
            <button disabled={busy} type="submit" className="w-full rounded-xl bg-sky-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:opacity-60">{busy ? "Checking setup…" : "Submit documents for verification"}</button>
            {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{message}</p>}
          </form>
          <p className="mt-5 text-xs leading-5 text-slate-500">Your identity documents are sensitive personal information. We will only accept them once secure storage, restricted access, retention rules, and verification checks are in place.</p>
        </section>
      </div>
    </main>
  );
}

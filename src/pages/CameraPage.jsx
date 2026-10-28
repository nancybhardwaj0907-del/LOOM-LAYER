import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  Info,
  FlipHorizontal,
  Sparkles,
  ArrowRight,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';
import { 
  requestCameraStream, 
  stopCameraStream, 
  captureVideoFrame, 
  listCameraDevices,
  checkCameraEnvironment
} from '../utils/cameraUtils';
import { identifyFabricFromImage } from '../utils/fabricIdentificationEngine';
import { FabricIdentificationCard } from '../components/fabric/FabricIdentificationCard';
import { Button } from '../components/common/Button';

export function CameraPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const activeStreamRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraDevices, setCameraDevices] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [retryCounter, setRetryCounter] = useState(0);

  const [fabricIdentification, setFabricIdentification] = useState(null);
  const [isAnalyzingFabric, setIsAnalyzingFabric] = useState(false);

  // Initialize camera stream
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setCameraError(null);
    setIsVideoReady(false);

    async function initCamera() {
      try {
        const streamResult = await requestCameraStream({ facingMode });
        if (isCancelled) {
          stopCameraStream(streamResult);
          return;
        }

        activeStreamRef.current = streamResult;
        setStream(streamResult);

        if (videoRef.current) {
          videoRef.current.srcObject = streamResult;
          videoRef.current.onloadedmetadata = () => {
            if (!isCancelled) {
              videoRef.current.play().catch(() => {});
              setIsVideoReady(true);
              setIsLoading(false);
            }
          };
        }

        const devices = await listCameraDevices();
        if (!isCancelled) {
          setCameraDevices(devices);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[CameraPage] Initialization failed:', err);
          setCameraError({
            title: 'Camera Access Unavailable',
            message: err.message || 'Unable to open camera stream. Please check permissions or upload an image.'
          });
          setIsLoading(false);
        }
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      if (activeStreamRef.current) {
        stopCameraStream(activeStreamRef.current);
        activeStreamRef.current = null;
      }
    };
  }, [facingMode, retryCounter]);

  // Capture snapshot & automatically trigger AI fabric identification
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      const captured = captureVideoFrame(video, { quality: 0.92 });
      setCapturedPhoto(captured);

      // Automatic AI fabric identification immediately after taking the photo
      setIsAnalyzingFabric(true);
      setFabricIdentification(null);

      identifyFabricFromImage(captured.dataUrl)
        .then((idResult) => {
          setFabricIdentification(idResult);
        })
        .catch((err) => {
          console.error('[CameraPage] AI identification error:', err);
          setFabricIdentification({
            success: false,
            isClear: false,
            unclearMessage: 'Could not complete AI analysis on this image. Please retake the photo.'
          });
        })
        .finally(() => {
          setIsAnalyzingFabric(false);
        });
    } catch (err) {
      console.error('[CameraPage] Snapshot failed:', err);
      setCameraError({
        title: 'Capture Failed',
        message: 'Could not capture frame from camera stream. Please try again or use file upload.'
      });
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setFabricIdentification(null);
    setIsAnalyzingFabric(false);
    if (videoRef.current && activeStreamRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleToggleFacingMode = () => {
    setCapturedPhoto(null);
    setFabricIdentification(null);
    setIsVideoReady(false);
    if (activeStreamRef.current) {
      stopCameraStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      const fakeCapture = {
        dataUrl,
        width: 1024,
        height: 768,
        formattedSize: `${Math.round(file.size / 1024)} KB`
      };
      setCapturedPhoto(fakeCapture);
      setIsAnalyzingFabric(true);
      setFabricIdentification(null);

      try {
        const idResult = await identifyFabricFromImage(dataUrl);
        setFabricIdentification(idResult);
      } catch (err) {
        console.error('[CameraPage] Upload identification error:', err);
        setFabricIdentification({
          success: false,
          isClear: false,
          unclearMessage: 'Could not complete AI analysis on this image.'
        });
      } finally {
        setIsAnalyzingFabric(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartProjectWithFabric = () => {
    navigate('/project/new');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272332]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8E2B45]/20 text-[#E2A97E] border border-[#8E2B45]/40 flex items-center justify-center shadow-xs shrink-0">
            <Camera className="w-5 h-5 text-[#E2A97E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F3F8]">
                AI Camera • Fabric Scanner
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1B27] text-[#E2A97E] border border-[#272332] font-semibold">
                Computer Vision
              </span>
            </div>
            <p className="text-xs text-[#9E97A9] font-sans mt-0.5">
              Photograph fabric yardage or cut swatches for automated weave detection, characteristics analysis, and care instructions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E1B27] text-[#D8D2E1] hover:bg-[#272332] border border-[#272332] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#E2A97E]" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* 2. Main Camera Viewfinder & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Camera View / Freeze-frame (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#16141D] rounded-3xl border border-[#272332] p-4 sm:p-5 space-y-4 shadow-sm relative overflow-hidden">
            
            {/* Viewfinder Window */}
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#272332]">
              
              {/* Live Video Feed */}
              {!capturedPhoto ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isVideoReady ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Loading spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-[#E2A97E] space-y-2">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#8E2B45]" />
                      <span className="text-xs font-mono font-medium">Opening camera sensor...</span>
                    </div>
                  )}

                  {/* Camera Error / Permission Banner */}
                  {cameraError && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#F5F3F8]">{cameraError.title}</h4>
                        <p className="text-xs text-[#9E97A9] max-w-sm">{cameraError.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRetryCounter(c => c + 1)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors cursor-pointer"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}

                  {/* Viewfinder Alignment Framing Reticle */}
                  {isVideoReady && !cameraError && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 animate-in fade-in">
                      <div className="w-full max-w-xs h-40 sm:h-52 my-auto border-2 border-dashed border-white/60 rounded-2xl relative shadow-2xs">
                        <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4 border-[#E2A97E] rounded-tl-sm"></div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4 border-[#E2A97E] rounded-tr-sm"></div>
                        <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4 border-[#E2A97E] rounded-bl-sm"></div>
                        <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4 border-[#E2A97E] rounded-br-sm"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20">
                            Align Fabric Flat in Frame
                          </span>
                        </div>
                      </div>

                      {/* Flip Camera Button */}
                      {cameraDevices.length > 1 && (
                        <button
                          type="button"
                          onClick={handleToggleFacingMode}
                          className="absolute top-4 right-4 pointer-events-auto bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border border-white/20 shadow-md cursor-pointer transition-colors"
                          title="Switch Camera (Front/Rear)"
                        >
                          <FlipHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Freeze-frame Captured Image */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img
                    src={capturedPhoto.dataUrl}
                    alt="Captured Fabric Swatch"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/20">
                    {capturedPhoto.width} × {capturedPhoto.height} px • {capturedPhoto.formattedSize}
                  </div>
                </div>
              )}
            </div>

            {/* Viewfinder Controls Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1E1B27] text-[#D8D2E1] hover:bg-[#272332] border border-[#272332] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartProjectWithFabric}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-[#8E2B45]/20"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create Project with this Fabric</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  disabled={isLoading || Boolean(cameraError) || !isVideoReady}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors shadow-lg shadow-[#8E2B45]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4 text-[#E2A97E]" />
                  <span>Capture &amp; Analyze Fabric</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: AI Fabric Identification Card & Real-time Analysis (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {capturedPhoto ? (
            <FabricIdentificationCard
              identification={fabricIdentification}
              isAnalyzing={isAnalyzingFabric}
              onRetakePhoto={handleRetake}
            />
          ) : (
            /* Standby Card Before Photo Capture */
            <div className="p-5 rounded-3xl bg-[#16141D] border border-[#272332] space-y-4 shadow-sm text-[#F5F3F8]">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#272332]">
                <div className="p-2 rounded-xl bg-[#8E2B45]/20 text-[#E2A97E] border border-[#8E2B45]/40 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F5F3F8]">
                    AI Fabric Identification Ready
                  </h3>
                  <p className="text-[11px] text-[#9E97A9]">
                    Automatic neural analysis begins the instant you take a photograph.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#D8D2E1]">
                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1">
                  <span className="font-semibold text-[#E2A97E] block text-[11px] uppercase font-mono">
                    Supported Fabric Classifications:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Cotton', 'Denim', 'Linen', 'Silk', 'Polyester', 'Wool', 'Rayon', 'Blended Fabric'].map((f) => (
                      <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#16141D] border border-[#272332] text-[#F5F3F8]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1">
                  <span className="font-semibold text-[#E2A97E] block text-[11px] uppercase font-mono">
                    Automatic Metrics Provided:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#A8A1B4]">
                    <li>Fabric name / type classification</li>
                    <li>Estimated confidence percentage (80%–96%)</li>
                    <li>Visible characteristics (weave structure &amp; texture)</li>
                    <li>Common garment &amp; product uses</li>
                    <li>Basic care &amp; laundering instructions</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1E1B27]/60 border border-[#272332] flex items-start gap-2 text-[10px] text-[#9E97A9]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Privacy protected: All local computer vision processing executes entirely in your browser. No photos are sent to third parties without your configured API keys.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

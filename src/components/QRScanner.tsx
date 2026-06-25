import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, CameraOff, RefreshCw, Upload } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const scanImageFile = async (file: File) => {
    setIsInitializing(true);
    setErrorMsg(null);

    try {
      const scanner = scannerRef.current || new Html5Qrcode("qr-reader");
      if (!scannerRef.current) {
        scannerRef.current = scanner;
      }

      if (scanner.isScanning) {
        try {
          await scanner.stop();
        } catch (e) {
          console.warn("Stopping camera failed before scanning file:", e);
        }
      }

      const decodedText = await scanner.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.error("Error scanning file:", err);
      setErrorMsg("Não foi possível detectar um código QR válido nesta imagem. Certifique-se de que o código QR está bem visível, nítido e tente novamente.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      scanImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      scanImageFile(file);
    }
  };

  useEffect(() => {
    const elementId = "qr-reader";
    const qrCode = new Html5Qrcode(elementId);
    scannerRef.current = qrCode;

    const startScanner = async () => {
      setIsInitializing(true);
      setErrorMsg(null);

      try {
        // Try starting with the rear-facing camera first
        await qrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height, 250);
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            // High efficiency: stop the camera before delivering the value
            if (qrCode.isScanning) {
              qrCode.stop().then(() => {
                onScan(decodedText);
              }).catch((err) => {
                console.error("Error stopping qrCode on success:", err);
                onScan(decodedText);
              });
            } else {
              onScan(decodedText);
            }
          },
          () => {
            // Mute scanning cycle error frames
          }
        );
        setIsInitializing(false);
      } catch (err) {
        console.warn("Could not start environment (back) camera, attempting user (front) camera fallback:", err);
        
        try {
          // Fallback to front camera or default camera
          await qrCode.start(
            { facingMode: "user" },
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height, 250);
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              if (qrCode.isScanning) {
                qrCode.stop().then(() => {
                  onScan(decodedText);
                }).catch((err) => {
                  onScan(decodedText);
                });
              } else {
                onScan(decodedText);
              }
            },
            () => {}
          );
          setIsInitializing(false);
        } catch (fallbackErr) {
          console.error("All camera requests failed:", fallbackErr);
          setErrorMsg("Não foi possível acessar a câmera do seu dispositivo (Permissão negada ou não disponível). Mas não se preocupe! Você pode enviar uma foto do seu código QR abaixo.");
          setIsInitializing(false);
        }
      }
    };

    // Delay slightly to ensure browser has complete frame layouts
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch((e) => console.warn("Cleanup scanner stop fail", e));
          }
        } catch (e) {
          console.warn("Cleanup state error", e);
        }
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative flex flex-col items-center">
        {/* Header */}
        <div className="w-full p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest text-[10px]">
              Escaneamento Ativo (Câmera)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Simulator Screen Container */}
        <div className="w-full p-6 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-2xl border bg-black/60 aspect-square w-full flex flex-col items-center justify-center transition-all ${
              isDragging ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]" : "border-white/5"
            }`}
          >
            {/* The qr-reader video viewport */}
            <div id="qr-reader" className="w-full h-full" />

            {/* Overlay indicators during scanning & load */}
            {isInitializing && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-10">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <p className="text-[10px] text-gray-400 font-mono">Iniciando câmera...</p>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center gap-4 z-20">
                <CameraOff className="w-8 h-8 text-rose-500" />
                <p className="text-xs font-sans text-rose-400 font-medium leading-relaxed">
                  {errorMsg}
                </p>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary rounded-xl text-xs font-bold transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Imagem do QR Code</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}

            {/* Custom Scan Box overlay helper (semi-transparent border box for target focus) */}
            {!isInitializing && !errorMsg && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[200px] h-[200px] border-2 border-dashed border-emerald-500/60 rounded-xl relative">
                  {/* Glowing corners */}
                  <div className="absolute -top-[2px] -left-[2px] w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                  <div className="absolute -top-[2px] -right-[2px] w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                  <div className="absolute -bottom-[2px] -left-[2px] w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                  <div className="absolute -bottom-[2px] -right-[2px] w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl space-y-2">
            <p className="text-[10px] text-indigo-400 font-mono leading-relaxed text-center">
              Aproxime seu crachá ou o código QR fornecido. Caso não funcione, você pode arrastar o arquivo de imagem do código QR para a caixa acima ou enviá-lo pelo botão abaixo:
            </p>
            <div className="flex justify-center">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white rounded-lg transition-all border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher Arquivo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="w-full p-4 bg-slate-950/50 flex justify-center border-t border-white/5">
          <button
            onClick={onClose}
            className="text-[10px] font-sans font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all cursor-pointer"
          >
            Cancelar e Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

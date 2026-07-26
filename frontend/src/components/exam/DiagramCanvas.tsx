'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Paintbrush, Circle as CircleIcon, Square, Trash2, Download } from 'lucide-react';

interface DiagramCanvasProps {
  initialData?: string;
  onChange: (canvasDataUrl: string) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ initialData, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#0ea5e9');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (initialData) {
      const img = new Image();
      img.src = initialData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs ${
              tool === 'pen' ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Brush</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs ${
              tool === 'eraser' ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={clearCanvas}
          className="p-2 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Canvas</span>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={750}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-80 rounded-lg border border-slate-800 cursor-crosshair touch-none"
      />
    </div>
  );
};

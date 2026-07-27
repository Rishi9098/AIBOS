'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Eraser,
  Paintbrush,
  Square,
  Circle as CircleIcon,
  Minus,
  MoveRight,
  Type,
  Grid,
  Ruler,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Hand
} from 'lucide-react';

export type ToolType = 'pen' | 'eraser' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'pan';

interface DiagramCanvasProps {
  initialData?: string;
  onChange: (canvasDataUrl: string, jsonState?: string) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ initialData, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // State
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#0ea5e9');
  const [lineWidth, setLineWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Text Tool Modal state
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });

  const gridStep = 20;

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, currentData];
    });
    setHistoryIndex((prev) => prev + 1);

    onChange(canvas.toDataURL('image/png'));
  }, [historyIndex, onChange]);

  // Initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const img = new Image();
      img.src = initialData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const initData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initData]);
        setHistoryIndex(0);
      };
    } else {
      const initData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initData]);
      setHistoryIndex(0);
    }
  }, []);

  const snap = (val: number) => (snapToGrid ? Math.round(val / gridStep) * gridStep : val);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;
    return { x: snap(rawX), y: snap(rawY) };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pan') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (tool === 'text') {
      setTextPos({ x, y });
      setTextModalOpen(true);
      return;
    }

    setIsDrawing(true);
    startPosRef.current = { x, y };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
      return;
    }

    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !snapshotRef.current) return;

    const { x, y } = getCanvasCoords(e);
    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
      ctx.lineWidth = tool === 'eraser' ? 24 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();

      // Trigger continuous change event
      onChange(canvas.toDataURL('image/png'));
      return;
    }

    // Restore snapshot before previewing shapes
    ctx.putImageData(snapshotRef.current, 0, 0);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Arrowhead
      const headLength = 15;
      const angle = Math.atan2(y - startY, x - startX);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (tool === 'rectangle') {
      ctx.beginPath();
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (tool === 'circle') {
      const radius = Math.hypot(x - startX, y - startY);
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory();
  };

  const handleAddText = () => {
    if (!textInput.trim()) {
      setTextModalOpen(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '16px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);

    setTextInput('');
    setTextModalOpen(false);
    saveToHistory();
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    onChange(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    onChange(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Export as PNG
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `diagram_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl">
      {/* Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'pen' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Brush Pen"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'eraser' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('line')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'line' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Line Tool"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'arrow' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Arrow Tool"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span>Arrow</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'rectangle' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Rectangle Tool"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Rect</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('circle')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'circle' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Circle Tool"
          >
            <CircleIcon className="w-3.5 h-3.5" />
            <span>Circle</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('text')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'text' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Label Text Tool"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Label</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('pan')}
            className={`p-2 rounded-md border transition flex items-center gap-1 ${
              tool === 'pan' ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Pan Canvas"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Pan</span>
          </button>
        </div>

        {/* Color & Stroke */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            title="Stroke Color"
          />

          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs"
          >
            <option value={1}>Thin (1px)</option>
            <option value={3}>Medium (3px)</option>
            <option value={6}>Thick (6px)</option>
          </select>
        </div>

        {/* Utilities & History */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 hover:bg-slate-800"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 hover:bg-slate-800"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded border ${
              showGrid ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1.5 rounded border text-[10px] font-mono ${
              snapToGrid ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Snap to Grid"
          >
            SNAP
          </button>

          <button
            type="button"
            onClick={() => setShowRuler(!showRuler)}
            className={`p-1.5 rounded border ${
              showRuler ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Ruler Guide"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
            className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={exportImage}
            className="p-1.5 text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded hover:bg-sky-500/20"
            title="Export PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded hover:bg-rose-500/20"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[350px]"
      >
        {/* Ruler Guide Overlay */}
        {showRuler && (
          <div className="absolute top-0 left-0 right-0 h-5 bg-slate-900/80 border-b border-slate-700/60 z-10 pointer-events-none flex items-center text-[9px] font-mono text-slate-400 px-2 justify-between">
            <span>0px</span>
            <span>200px</span>
            <span>400px</span>
            <span>600px</span>
          </div>
        )}

        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          width={750}
          height={380}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            backgroundImage: showGrid
              ? `radial-gradient(circle, #334155 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${gridStep * zoom}px ${gridStep * zoom}px`,
          }}
          className={`w-full h-[380px] rounded-lg cursor-${
            tool === 'pan' ? 'grab' : tool === 'text' ? 'text' : 'crosshair'
          } touch-none`}
        />
      </div>

      {/* Text Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-80 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Add Text Label</h4>
            <input
              type="text"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddText();
              }}
              placeholder="Enter text label..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTextModalOpen(false)}
                className="px-3 py-1.5 text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddText}
                className="px-3 py-1.5 text-white bg-sky-500 rounded-lg hover:bg-sky-400 font-medium"
              >
                Add Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

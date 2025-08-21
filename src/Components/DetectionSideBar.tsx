import React, { useRef, useState, type RefObject } from 'react';
import type { DetectedPII } from '../App';

interface SideBarProps{
    detected:DetectedPII[]
    canvasRef:RefObject<HTMLCanvasElement | null>
    drawBoxesPreview:()=>void


}

const PIISidebar = ({canvasRef,detected,drawBoxesPreview}:SideBarProps) => {
  
  

  const highlightPII = (piiItem:DetectedPII) => {
    if(!canvasRef) return
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const pad = 20;
    const { x, y, width, height } = piiItem.coordinates;
    
    // Save current state
    ctx.save();
    
    // Set highlight style
    ctx.strokeStyle = "rgba(0, 140, 255, 1)";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]); // Dashed line for better visibility
    
    // Draw highlight rectangle
    ctx.strokeRect(
      Math.max(0, x - pad),
      Math.max(0, y - pad),
      width + pad * 2,
      height + pad * 2
    );
    
    // Restore state after timeout
    setTimeout(() => {
      ctx.restore();
      drawBoxesPreview();
    }, 1200);
  };

  const getConfidenceColor = (confidence:number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence:number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Detected PII</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {detected.length} items
        </span>
      </div>

      {/* PII List Container */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {detected.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm text-gray-500">No PII detected yet</div>
            <div className="text-xs text-gray-400 mt-1">Upload an image to start detection</div>
          </div>
        ) : (
          detected.map((piiItem, index) => (
            <div
              key={`pii-${index}-${piiItem.type}`}
              className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
            >
              {/* PII Header */}
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {piiItem.type}
                    </span>
                    <span className={`text-xs font-medium ${getConfidenceColor(piiItem.confidence)}`}>
                      {getConfidenceLabel(piiItem.confidence)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 break-all font-mono bg-gray-50 px-2 py-1 rounded">
                    {piiItem.value}
                  </div>
                </div>
                
                {/* Confidence and Dimensions */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-semibold ${getConfidenceColor(piiItem.confidence)}`}>
                    {Math.round(piiItem.confidence * 100)}%
                  </div>
                  {piiItem.coordinates && piiItem.coordinates.width > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {piiItem.coordinates.width}×{piiItem.coordinates.height}px
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => highlightPII(piiItem)}
                  className="flex-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors font-medium"
                  disabled={!piiItem.coordinates || piiItem.coordinates.width <= 0}
                >
                  <span className="flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Highlight
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(piiItem.value).then(() => {
                      // You could add a toast notification here
                      console.log('Copied to clipboard');
                    });
                  }}
                  className="text-xs px-3 py-1.5 text-gray-600 border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  title="Copy value"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Coordinates Info (collapsible) */}
              {piiItem.coordinates && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 select-none">
                    Coordinates
                  </summary>
                  <div className="text-xs text-gray-600 mt-1 ml-4 font-mono">
                    x: {piiItem.coordinates.x}, y: {piiItem.coordinates.y}<br/>
                    w: {piiItem.coordinates.width}, h: {piiItem.coordinates.height}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Use <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">process-image</code> endpoint</span>
          </div>
          <div className="text-xs text-gray-500 ml-5">
            to get both JSON data and base64 masked image
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
        width={800}
        height={600}
      />
    </div>
  );
};

export default PIISidebar;
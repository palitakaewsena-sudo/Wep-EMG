import React, { useEffect, useRef } from 'react';

/**
 * 100% Authentic Oscilloscope Display Component
 * Powered by HTML5 Canvas & requestAnimationFrame for rock-solid 60 FPS
 */
const Oscilloscope = ({
  dataRef,             // Mutable array of data points: { time, rawMv } or number[]
  isConnected = false,
  isSessionActive = false,
  startGripMv = 1200,
  stopGripMv = 600,
  dcOffset = 1650,
  vpp = 0,
  rawAdc = 0,
  gripCount = 0,
  timebase = '100ms/div',
  sampleRate = '500 Sa/s',
  vRange = 4000,       // +/- 4000 mV range (total span 8000 mV across 8 divisions = 1000 mV/div)
  lang = 'th'
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Store latest props in a ref to decouple high-speed 60 FPS canvas loop from React re-renders
  const propsRef = useRef({});
  propsRef.current = {
    dataRef,
    isConnected,
    isSessionActive,
    startGripMv,
    stopGripMv,
    dcOffset,
    vpp,
    rawAdc,
    gripCount,
    timebase,
    sampleRate,
    vRange,
    lang
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });

    // Handle high DPI screens
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // Oscilloscope Rendering Engine (60 FPS)
    const render = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width <= 0 || height <= 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const {
        dataRef: curDataRef,
        isConnected: curConnected,
        isSessionActive: curActive,
        startGripMv: curStartMv,
        stopGripMv: curStopMv,
        dcOffset: curDcOffset,
        vpp: curVpp,
        rawAdc: curAdc,
        gripCount: curGrips,
        timebase: curTimebase,
        sampleRate: curSampleRate,
        vRange: curVRange,
        lang: curLang
      } = propsRef.current;

      // 1. Oscilloscope CRT Display Background
      // Deep obsidian dark screen with high-contrast lab styling
      ctx.fillStyle = '#090D12';
      ctx.fillRect(0, 0, width, height);

      // Grid Area Layout
      const topPad = 32;     // Space for OSD Top Bar
      const bottomPad = 24;  // Space for Timebase status
      const leftPad = 48;    // Space for Voltage Scale labels
      const rightPad = 36;   // Space for Trigger Cursors
      
      const gridW = width - leftPad - rightPad;
      const gridH = height - topPad - bottomPad;
      const centerY = topPad + gridH / 2;
      const centerX = leftPad + gridW / 2;

      // 2. Oscilloscope Reticle Grid (10 Horizontal Divisions x 8 Vertical Divisions)
      const hDivs = 10;
      const vDivs = 8;
      const dx = gridW / hDivs;
      const dy = gridH / vDivs;

      ctx.save();

      // Outer Bezel Frame
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftPad, topPad, gridW, gridH);

      // Grid Inner Lines (Dotted/Dashed like physical oscilloscope glass reticle)
      ctx.strokeStyle = 'rgba(40, 75, 105, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      // Vertical divisions
      for (let i = 1; i < hDivs; i++) {
        if (i === hDivs / 2) continue; // Skip center line for solid crosshair
        const x = leftPad + i * dx;
        ctx.beginPath();
        ctx.moveTo(x, topPad);
        ctx.lineTo(x, topPad + gridH);
        ctx.stroke();
      }

      // Horizontal divisions
      for (let j = 1; j < vDivs; j++) {
        if (j === vDivs / 2) continue; // Skip center line for solid crosshair
        const y = topPad + j * dy;
        ctx.beginPath();
        ctx.moveTo(leftPad, y);
        ctx.lineTo(leftPad + gridW, y);
        ctx.stroke();
      }

      // 3. Center Crosshair Axes (Solid lines with precision sub-division tick marks)
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(70, 130, 180, 0.7)';
      ctx.lineWidth = 1;

      // Center X Axis (0V Baseline)
      ctx.beginPath();
      ctx.moveTo(leftPad, centerY);
      ctx.lineTo(leftPad + gridW, centerY);
      ctx.stroke();

      // Center Y Axis
      ctx.beginPath();
      ctx.moveTo(centerX, topPad);
      ctx.lineTo(centerX, topPad + gridH);
      ctx.stroke();

      // Sub-division Ticks (5 minor ticks per division along central axes)
      ctx.strokeStyle = 'rgba(90, 150, 200, 0.6)';
      ctx.lineWidth = 1;
      const subTicks = 5;
      const tickSize = 3;

      // Ticks along Center X (0V)
      for (let i = 0; i <= hDivs; i++) {
        for (let s = 1; s < subTicks; s++) {
          const x = leftPad + i * dx + (s * dx) / subTicks;
          if (x < leftPad + gridW) {
            ctx.beginPath();
            ctx.moveTo(x, centerY - tickSize);
            ctx.lineTo(x, centerY + tickSize);
            ctx.stroke();
          }
        }
      }

      // Ticks along Center Y
      for (let j = 0; j <= vDivs; j++) {
        for (let s = 1; s < subTicks; s++) {
          const y = topPad + j * dy + (s * dy) / subTicks;
          if (y < topPad + gridH) {
            ctx.beginPath();
            ctx.moveTo(centerX - tickSize, y);
            ctx.lineTo(centerX + tickSize, y);
            ctx.stroke();
          }
        }
      }

      // 4. Voltage Scale Labels (Left margin)
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const mvPerDiv = curVRange / (vDivs / 2); // 4000 / 4 = 1000 mV/div = 1.0V/div
      for (let j = 0; j <= vDivs; j++) {
        const valMv = ((vDivs / 2) - j) * mvPerDiv;
        const y = topPad + j * dy;
        let label = `${valMv > 0 ? '+' : ''}${(valMv / 1000).toFixed(0)}V`;
        if (valMv === 0) label = '0V';
        ctx.fillText(label, leftPad - 8, y);
      }

      // 5. Channel 1 Ground Indicator (CH1 Marker: 1 ▶ on left edge)
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Arrow pointing right at (leftPad, centerY)
      ctx.moveTo(leftPad - 2, centerY);
      ctx.lineTo(leftPad - 12, centerY - 6);
      ctx.lineTo(leftPad - 22, centerY - 6);
      ctx.lineTo(leftPad - 22, centerY + 6);
      ctx.lineTo(leftPad - 12, centerY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', leftPad - 15, centerY);

      // 6. Trigger / Threshold Cursor Lines
      const thresholdToY = (thrMv) => {
        const adjustedMv = thrMv - curDcOffset;
        const clampedMv = Math.max(-curVRange, Math.min(curVRange, adjustedMv));
        return centerY - (clampedMv / curVRange) * (gridH / 2);
      };

      const startY = thresholdToY(curStartMv);
      const stopY = thresholdToY(curStopMv);

      // T1 (Start Grip Threshold) Cursor
      ctx.strokeStyle = '#0D9488'; // Teal
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(leftPad, startY);
      ctx.lineTo(leftPad + gridW, startY);
      ctx.stroke();

      // Cursor T1 Marker on right edge
      ctx.fillStyle = '#0D9488';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(leftPad + gridW + 2, startY);
      ctx.lineTo(leftPad + gridW + 10, startY - 5);
      ctx.lineTo(leftPad + gridW + 28, startY - 5);
      ctx.lineTo(leftPad + gridW + 28, startY + 5);
      ctx.lineTo(leftPad + gridW + 10, startY + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T1', leftPad + gridW + 18, startY);

      // T2 (Stop Grip Threshold) Cursor
      ctx.strokeStyle = '#F97316'; // Orange
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(leftPad, stopY);
      ctx.lineTo(leftPad + gridW, stopY);
      ctx.stroke();

      // Cursor T2 Marker on right edge
      ctx.fillStyle = '#F97316';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(leftPad + gridW + 2, stopY);
      ctx.lineTo(leftPad + gridW + 10, stopY - 5);
      ctx.lineTo(leftPad + gridW + 28, stopY - 5);
      ctx.lineTo(leftPad + gridW + 28, stopY + 5);
      ctx.lineTo(leftPad + gridW + 10, stopY + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T2', leftPad + gridW + 18, stopY);

      // 7. Phosphor Glowing Waveform Line (The Heart of the Oscilloscope!)
      const points = curDataRef ? curDataRef.current : [];
      const numPoints = points.length;

      if (numPoints > 1) {
        ctx.save();
        // Clip to grid area so beam stays cleanly inside oscilloscope screen
        ctx.beginPath();
        ctx.rect(leftPad, topPad, gridW, gridH);
        ctx.clip();

        // Phosphor Beam Glow effect
        ctx.shadowColor = 'rgba(255, 235, 59, 0.65)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#FACC15'; // Authentic Oscilloscope Neon Yellow
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        const stepX = gridW / Math.max(numPoints - 1, 1);

        for (let i = 0; i < numPoints; i++) {
          const pt = points[i];
          const val = typeof pt === 'number' ? pt : (pt.rawMv !== undefined ? pt.rawMv : 0);
          
          const x = leftPad + i * stepX;
          const y = centerY - (val / curVRange) * (gridH / 2);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      } else {
        // Flat 0V center trace when idle / waiting for signal
        ctx.save();
        ctx.beginPath();
        ctx.rect(leftPad, topPad, gridW, gridH);
        ctx.clip();
        ctx.shadowColor = 'rgba(255, 235, 59, 0.4)';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(leftPad, centerY);
        ctx.lineTo(leftPad + gridW, centerY);
        ctx.stroke();
        ctx.restore();
      }

      // 8. OSD Header Status Bar (Digital Scope Status on Top)
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      
      // RUN / STOP Indicator
      const isRunning = curConnected;
      const statusText = isRunning ? '● RUN' : '● STOP';
      ctx.fillStyle = isRunning ? '#22C55E' : '#EF4444';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(statusText, leftPad, topPad / 2);

      // Channel 1 Spec
      ctx.fillStyle = '#FACC15';
      ctx.fillText(`CH1: ${(mvPerDiv / 1000).toFixed(2)}V/div  AC`, leftPad + 60, topPad / 2);

      // Timebase & Sample rate
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`TB: ${curTimebase}   ${curSampleRate}`, leftPad + 220, topPad / 2);

      // Live Quick-Stats on Top Right (Vpp, Raw ADC)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38BDF8'; // Sky blue
      ctx.fillText(`Vp-p: ${curVpp.toFixed(1)} mV`, leftPad + gridW - 100, topPad / 2);
      ctx.fillStyle = '#A78BFA'; // Purple
      ctx.fillText(`ADC: ${curAdc}`, leftPad + gridW, topPad / 2);

      // 9. Bottom status bar
      ctx.font = '10px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'left';
      ctx.fillText(curLang === 'th' ? `เกณฑ์กระตุ้นกำมือ T1: ${curStartMv.toFixed(0)} mV | T2: ${curStopMv.toFixed(0)} mV` : `Trigger T1: ${curStartMv.toFixed(0)} mV | T2: ${curStopMv.toFixed(0)} mV`, leftPad, height - 9);

      ctx.textAlign = 'right';
      ctx.fillText(curActive ? (curLang === 'th' ? `สถานะ: กำลังบันทึก (${curGrips} ครั้ง)` : `Recording (${curGrips} grips)`) : (curLang === 'th' ? 'สถานะ: เฝ้าตรวจสัญญาณสด (Live Scope)' : 'Status: Live Monitor'), leftPad + gridW, height - 9);

      ctx.restore();

      // Loop at native 60 FPS
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '360px',
        backgroundColor: '#090D12',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #1E293B',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%' 
        }} 
      />
    </div>
  );
};

export default React.memo(Oscilloscope);

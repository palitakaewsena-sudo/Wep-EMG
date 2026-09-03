import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

/**
 * Oscilloscope-grade WaveformCanvas
 * Calibrated 100% to match Keysight EDUX1052G Oscilloscope:
 * - Timebase: 200.0 ms / div (10 divisions = 2.000 seconds total span)
 * - Voltage Scale: 1.00 V / div (8 divisions = -4.00 V to +4.00 V)
 * - Authentic Keysight Yellow (#FACC15) Trace with dense vector rendering
 */
const WaveformCanvas = forwardRef(({
  isSessionActive,
  startGripMv = 1200,
  stopGripMv = 600,
  t = {},
}, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 1,000 points covers exactly 2.0 seconds at 500 Hz (pure 1:1 raw sample stream)
  const maxPoints = 1000;
  const samplesRef = useRef([]);

  useImperativeHandle(ref, () => ({
    pushSample: (plotMv, timeSec) => {
      samplesRef.current.push({ mv: plotMv, time: timeSec });
      if (samplesRef.current.length > maxPoints) {
        samplesRef.current.shift();
      }
    },
    reset: () => {
      samplesRef.current = [];
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear with clean card background
      ctx.clearRect(0, 0, width, height);

      // Margins aligned for oscilloscope-style presentation
      const margin = { top: 20, right: 90, bottom: 25, left: 50 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;

      // 8 vertical divisions @ 1.00V / div = -4000 mV to +4000 mV
      const yMin = -4000;
      const yMax = 4000;
      const yRange = yMax - yMin;

      const getY = (val) => {
        const clamped = Math.max(yMin, Math.min(yMax, val));
        return margin.top + plotHeight * (1 - (clamped - yMin) / yRange);
      };

      // 1. Draw 10 Horizontal Time Divisions (Vertical Grid Lines @ 200ms/div)
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);

      for (let div = 0; div <= 10; div++) {
        const x = margin.left + (div / 10) * plotWidth;
        ctx.beginPath();
        if (div === 5) {
          ctx.strokeStyle = '#E2E8F0'; // Center time line
        } else {
          ctx.strokeStyle = '#F1F5F9';
        }
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + plotHeight);
        ctx.stroke();
      }

      // 2. Draw 8 Vertical Voltage Divisions (Horizontal Grid Lines @ 1.00V/div)
      const vTicks = [-4000, -3000, -2000, -1000, 0, 1000, 2000, 3000, 4000];
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      vTicks.forEach((tickVal) => {
        const y = getY(tickVal);

        ctx.beginPath();
        if (tickVal === 0) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#CBD5E1'; // Center ground line (0V)
          ctx.lineWidth = 1.2;
        } else {
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = '#F1F5F9';
          ctx.lineWidth = 1;
        }
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + plotWidth, y);
        ctx.stroke();

        // Voltage label text on left
        ctx.setLineDash([]);
        ctx.fillStyle = tickVal === 0 ? '#64748B' : '#94A3B8';
        ctx.fillText(`${(tickVal / 1000).toFixed(0)}V`, margin.left - 8, y);
      });

      // 3. Threshold Reference Lines (เริ่มทำ / หยุดทำ)
      const yStart = getY(startGripMv);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#00BCA3';
      ctx.lineWidth = 1.2;
      ctx.moveTo(margin.left, yStart);
      ctx.lineTo(margin.left + plotWidth, yStart);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#00BCA3';
      ctx.textAlign = 'left';
      ctx.font = '11px Inter, system-ui, sans-serif';
      const startLabel = t.startAt ? `${t.startAt} ${(startGripMv / 1000).toFixed(2)}V` : `เริ่มทำ ${(startGripMv / 1000).toFixed(2)}V`;
      ctx.fillText(startLabel, margin.left + plotWidth + 6, yStart + 8);

      const yStop = getY(stopGripMv);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.2;
      ctx.moveTo(margin.left, yStop);
      ctx.lineTo(margin.left + plotWidth, yStop);
      ctx.stroke();

      ctx.fillStyle = '#F97316';
      const stopLabel = t.stopAt ? `${t.stopAt} ${(stopGripMv / 1000).toFixed(2)}V` : `หยุดทำ ${(stopGripMv / 1000).toFixed(2)}V`;
      ctx.fillText(stopLabel, margin.left + plotWidth + 6, yStop - 6);

      // 4. Draw Oscilloscope Waveform Trace (Keysight Yellow #FACC15)
      const samples = samplesRef.current;
      if (isSessionActive && samples.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(margin.left, margin.top, plotWidth, plotHeight);
        ctx.clip(); // Clip strictly within plot area

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 0; i < samples.length; i++) {
          const x = margin.left + (i / (maxPoints - 1)) * plotWidth;
          const y = getY(samples[i].mv);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();

        // 5. Draw Timebase Marks at Bottom (0.0s to 2.0s, exactly matching 200ms/div)
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const lastTime = samples[samples.length - 1].time || 0;
        const startT = Math.max(0, lastTime - 2.0);
        for (let div = 0; div <= 10; div += 2) {
          const x = margin.left + (div / 10) * plotWidth;
          const timeText = (startT + div * 0.2).toFixed(1) + 's';
          ctx.fillText(timeText, x, margin.top + plotHeight + 6);
        }
      } else {
        // Flat ground baseline at 0V when in Standby
        const yZero = getY(0);
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1.5;
        ctx.moveTo(margin.left, yZero);
        ctx.lineTo(margin.left + plotWidth, yZero);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let div = 0; div <= 10; div += 2) {
          const x = margin.left + (div / 10) * plotWidth;
          ctx.fillText(`${(div * 0.2).toFixed(1)}s`, x, margin.top + plotHeight + 6);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSessionActive, startGripMv, stopGripMv, t]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
});

export default WaveformCanvas;

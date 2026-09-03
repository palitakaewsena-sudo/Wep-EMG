import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const WaveformCanvas = forwardRef(({
  isSessionActive,
  startGripMv = 1200,
  stopGripMv = 600,
  dcBaseline = 1650,
  t = {},
}, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Ring buffer for waveform data points
  // 300 points covers ~1.2 - 1.5 seconds of high-fidelity EMG signal at 250 Hz
  const maxPoints = 300;
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

      // Clear canvas with transparent/card background
      ctx.clearRect(0, 0, width, height);

      // Margins to match Recharts layout precisely
      const margin = { top: 20, right: 85, bottom: 25, left: 45 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;

      const yMin = -4000;
      const yMax = 4000;
      const yRange = yMax - yMin;

      const getY = (val) => {
        const clamped = Math.max(yMin, Math.min(yMax, val));
        return margin.top + plotHeight * (1 - (clamped - yMin) / yRange);
      };

      // 1. Draw Grid Lines and Y-Axis Ticks (-4000 to +4000)
      const ticks = [-4000, -3000, -2000, -1000, 0, 1000, 2000, 3000, 4000];
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      ticks.forEach((tickVal) => {
        const y = getY(tickVal);

        // Grid line
        ctx.beginPath();
        if (tickVal === 0) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
        } else {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#F1F5F9';
          ctx.lineWidth = 1;
        }
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + plotWidth, y);
        ctx.stroke();

        // Y-axis label text
        ctx.setLineDash([]);
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(tickVal.toString(), margin.left - 10, y);
      });

      // 2. Reference Lines (เริ่มทำ / หยุดทำ Thresholds)
      const startThr = startGripMv - dcBaseline;
      const stopThr = stopGripMv - dcBaseline;

      // Start Threshold line (Teal)
      const yStart = getY(startThr);
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
      const startLabel = t.startAt ? `${t.startAt} ${startGripMv.toFixed(0)} mV` : `เริ่มทำ ${startGripMv.toFixed(0)} mV`;
      ctx.fillText(startLabel, margin.left + plotWidth + 6, yStart + 8);

      // Stop Threshold line (Orange)
      const yStop = getY(stopThr);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.2;
      ctx.moveTo(margin.left, yStop);
      ctx.lineTo(margin.left + plotWidth, yStop);
      ctx.stroke();

      ctx.fillStyle = '#F97316';
      const stopLabel = t.stopAt ? `${t.stopAt} ${stopGripMv.toFixed(0)} mV` : `หยุดทำ ${stopGripMv.toFixed(0)} mV`;
      ctx.fillText(stopLabel, margin.left + plotWidth + 6, yStop - 6);

      // 3. Draw Waveform Signal (Yellow #FACC15)
      const samples = samplesRef.current;
      if (isSessionActive && samples.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(margin.left, margin.top, plotWidth, plotHeight);
        ctx.clip(); // Prevent waveform from drawing outside the plot area

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

        // 4. Draw X-Axis Time Ticks
        ctx.fillStyle = '#666666';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const tickStep = Math.floor(maxPoints / 6);
        for (let i = 0; i < samples.length; i += tickStep) {
          const x = margin.left + (i / (maxPoints - 1)) * plotWidth;
          const timeText = samples[i].time ? `${samples[i].time.toFixed(1)}s` : '';
          ctx.fillText(timeText, x, margin.top + plotHeight + 6);
        }
      } else {
        // Standby baseline when not training
        const yZero = getY(0);
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1.5;
        ctx.moveTo(margin.left, yZero);
        ctx.lineTo(margin.left + plotWidth, yZero);
        ctx.stroke();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSessionActive, startGripMv, stopGripMv, dcBaseline, t]);

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

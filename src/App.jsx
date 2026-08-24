import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Power, Settings, ChevronRight, Play, Square, Bluetooth } from 'lucide-react';
import './index.css';

// Custom Hook to generate mock EMG data
const useMockEMGData = (isRecording) => {
  const [data, setData] = useState(Array.from({ length: 50 }, (_, i) => ({ time: i, value: 0 })));
  const [currentValue, setCurrentValue] = useState(0);
  const timeRef = useRef(50);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        // Generate a random bursty signal resembling EMG
        const baseNoise = Math.random() * 10 - 5; // -5 to 5
        const burstChance = Math.random() > 0.8;
        const burst = burstChance ? (Math.random() * 80 + 20) : 0; // 20 to 100
        const newValue = Math.max(0, Math.min(100, Math.abs(baseNoise + burst)));
        
        setCurrentValue(Math.round(newValue));
        
        setData(prevData => {
          const newData = [...prevData.slice(1), { time: timeRef.current++, value: newValue }];
          return newData;
        });
      }, 100); // 10Hz update rate
    } else {
      setCurrentValue(0);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  return { data, currentValue };
};

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const { data: emgData, currentValue } = useMockEMGData(isRecording);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(!isConnected);
      if (isConnected) setIsRecording(false); // Stop if disconnecting
    }, 500);
  };

  const toggleRecording = () => {
    if (!isConnected) return; // Must be connected
    setIsRecording(!isRecording);
  };

  // Calculate moving average
  const avgStrength = Math.round(emgData.reduce((acc, curr) => acc + curr.value, 0) / emgData.length);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div>
          <h1>EMG Grip Therapy</h1>
          <p className="subtitle">Real-time muscle activation monitoring</p>
        </div>
        <div className="status-badge" style={{ 
          background: isConnected ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: isConnected ? 'var(--accent-green)' : 'var(--text-secondary)',
          borderColor: isConnected ? 'rgba(57, 255, 20, 0.2)' : 'var(--border-color)'
        }}>
          {isConnected && <div className="status-dot"></div>}
          {isConnected ? 'Device Connected' : 'Disconnected'}
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="dashboard-grid">
        
        {/* Signal Chart (Span 8 cols) */}
        <section className="card col-span-8">
          <div className="card-title">
            <Activity size={24} />
            <h2>Live EMG Signal</h2>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emgData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" hide={true} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-blue)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent-blue)" 
                  strokeWidth={3} 
                  dot={false}
                  isAnimationActive={false} // Important for real-time feel
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Grip Meter & Controls (Span 4 cols) */}
        <section className="card col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <Power size={24} />
            <h2>Current Strength</h2>
          </div>
          
          <div className="meter-container">
            {/* SVG Circular Progress */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle 
                cx="100" cy="100" r="90" 
                fill="none" 
                stroke="var(--border-color)" 
                strokeWidth="15" 
                strokeDasharray="565.48" // 2 * pi * 90
                strokeDashoffset="141.37" // 1/4 gap at bottom (optional, doing full circle for simplicity)
              />
              <circle 
                cx="100" cy="100" r="90" 
                fill="none" 
                stroke={currentValue > 70 ? "var(--accent-green)" : currentValue > 40 ? "var(--accent-blue)" : "var(--border-color)"} 
                strokeWidth="15" 
                strokeDasharray="565.48"
                strokeDashoffset={565.48 - (565.48 * currentValue) / 100}
                style={{ transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease' }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="meter-value-large">
              <span>{currentValue}</span>
              <span className="meter-unit">% MVC</span>
            </div>
          </div>

          {/* Control Panel */}
          <div style={{ marginTop: 'auto' }}>
            <div className="control-grid">
              <button 
                className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleConnect}
              >
                <Bluetooth size={18} />
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
              
              <button 
                className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleRecording}
                disabled={!isConnected}
              >
                {isRecording ? <Square size={18} /> : <Play size={18} />}
                {isRecording ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="card col-span-4">
          <h3 className="stat-label">Session Duration</h3>
          <div className="stat-value">{formatTime(sessionTime)}</div>
          <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            <Activity size={14} style={{ marginRight: '4px' }}/> Active Timer
          </div>
        </section>

        <section className="card col-span-4">
          <h3 className="stat-label">Average Strength</h3>
          <div className="stat-value">{avgStrength} <span className="stat-label" style={{ fontSize: '1rem' }}>%</span></div>
          <div className="stat-trend trend-up">
            Target: &gt; 50%
          </div>
        </section>

        <section className="card col-span-4">
          <h3 className="stat-label">Repetitions</h3>
          <div className="stat-value">{Math.floor(sessionTime / 5)}</div>
          <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            Estimated based on activity
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;

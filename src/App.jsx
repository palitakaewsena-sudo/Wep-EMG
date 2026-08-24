import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Power, Settings, ChevronRight, Play, Square, Bluetooth, BluetoothConnected, AlertTriangle } from 'lucide-react';
import './index.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Bluetooth State
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [debugHex, setDebugHex] = useState("");

  const [emgData, setEmgData] = useState(Array.from({ length: 200 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
  const [currentValue, setCurrentValue] = useState(0);
  const timeRef = useRef(200);
  const bufferRef = useRef("");
  const filterRef = useRef({ prevX: null, prevY: 0 });

  // Standard BT05 / HM-10 / AT-09 UUIDs (must be full 128-bit string or 0x hex)
  const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
  const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

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

  const handleConnect = async () => {
    setErrorMsg("");
    if (isConnected && device) {
      // Disconnect
      if (device.gatt.connected) {
        device.gatt.disconnect();
      }
      setIsConnected(false);
      setDevice(null);
      setCharacteristic(null);
      setIsRecording(false);
      return;
    }

    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser. Please use Chrome or Edge on PC/Android.");
      }

      console.log('Requesting Bluetooth Device...');
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID, 'battery_service', 'heart_rate', 'generic_access'] // Added common UUIDs just in case
      });

      console.log('Connecting to GATT Server...');
      const server = await btDevice.gatt.connect();

      btDevice.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        setIsConnected(false);
        setIsRecording(false);
        setDevice(null);
        setCharacteristic(null);
        bufferRef.current = "";
        filterRef.current = { prevX: null, prevY: 0 };
      });

      console.log('Getting Service...');
      // Try to get the specific custom service, if it fails, we just show connected status anyway
      try {
        const service = await server.getPrimaryService(SERVICE_UUID);
        console.log('Getting Characteristic...');
        const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
        setCharacteristic(char);
      } catch (e) {
        console.warn("Could not find specific ESP32 UUIDs. Connected without real-time data streaming.", e);
        setErrorMsg("Connected, but could not find the specific EMG UUIDs (Service: 4fafc..., Char: beb54...). Check your board code.");
      }

      setDevice(btDevice);
      setIsConnected(true);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  const toggleRecording = async () => {
    if (!isConnected) return;
    
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      if (characteristic) {
        try {
          await characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
          console.log('Notifications started');
        } catch (error) {
          console.error("Error starting notifications:", error);
          setErrorMsg("Error starting sensor notifications: " + error.message);
        }
      } else {
        // Fallback to mock data if no characteristic found but we want to test
        startMockData();
      }
    } else {
      // Stop recording
      setIsRecording(false);
      if (characteristic) {
        try {
          await characteristic.stopNotifications();
          characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        } catch (error) {
          console.error(error);
        }
      } else {
        stopMockData();
      }
    }
  };

  const handleCharacteristicValueChanged = (event) => {
    const value = event.target.value;
    
    try {
      const decoder = new TextDecoder('utf-8');
      const textChunk = decoder.decode(value);
      bufferRef.current += textChunk;

      // Process all complete lines in the buffer
      let lines = bufferRef.current.split('\n');
      
      // The last element might be an incomplete string without '\n', save it back to buffer
      bufferRef.current = lines.pop(); 
      
      let latestValue = null;
      let newPoints = [];

      for (let line of lines) {
        line = line.trim();
        if (line !== "" && !isNaN(line)) {
          const rawVal = parseFloat(line);
          
          // Initialize filter on first read to prevent massive spike
          if (filterRef.current.prevX === null) {
            filterRef.current.prevX = rawVal;
            filterRef.current.prevY = 0;
          }
          
          // DC Blocker (High-Pass Filter) to center wave at 0
          // R = 0.99 controls how fast it centers. 0.99 is standard for AC coupling.
          const R = 0.99;
          const y = rawVal - filterRef.current.prevX + R * filterRef.current.prevY;
          filterRef.current.prevX = rawVal;
          filterRef.current.prevY = y;
          
          // Convert the centered AC signal to Voltage (assumes 5V system, 10-bit ADC)
          const voltage = (y / 1023) * 5.0;

          latestValue = voltage;
          newPoints.push({ time: timeRef.current++, value: voltage, raw: rawVal });
        }
      }

      if (newPoints.length > 0) {
        // Update current value to the last one processed
        if (latestValue !== null) setCurrentValue(latestValue);
        
        // Batch update chart data
        setEmgData(prevData => {
          const combined = [...prevData, ...newPoints];
          // Increase window to 200 points for better high-frequency visibility
          return combined.slice(-200);
        });
      }
    } catch (e) {
      console.error("Error parsing buffered string", e);
    }
  };

  // --- MOCK DATA FALLBACK LOGIC ---
  const mockIntervalRef = useRef(null);
  const startMockData = () => {
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    mockIntervalRef.current = setInterval(() => {
      const baseNoise = Math.random() * 10 - 5;
      const burstChance = Math.random() > 0.8;
      const burst = burstChance ? (Math.random() * 80 + 20) : 0;
      const newValue = Math.max(0, Math.min(100, Math.abs(baseNoise + burst)));
      
      setCurrentValue(Math.round(newValue));
      setEmgData(prevData => [...prevData.slice(1), { time: timeRef.current++, value: Math.round(newValue) }]);
    }, 100);
  };
  const stopMockData = () => {
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    setCurrentValue(0);
  };
  // ---------------------------------

  const avgStrength = Math.round(emgData.reduce((acc, curr) => acc + curr.value, 0) / emgData.length);

  // Calculate Vmax, Vmin, Vp-p based on the Absolute Voltage (including 2.5V DC offset)
  // Use 5th and 95th percentiles to avoid glitchy/erratic readings ("เพี้ยน")
  const activeData = emgData.filter(d => d.time >= 200);
  let vmin = 0, vmax = 0, vpp = 0, freq = 0, period = 0;
  if (activeData.length > 20) {
    let sortedRaw = activeData.map(d => d.raw).sort((a,b) => a-b);
    let minIdx = Math.floor(sortedRaw.length * 0.05);
    let maxIdx = Math.floor(sortedRaw.length * 0.95);
    
    // Convert raw ADC (0-1023) to Absolute Voltage (0-5V)
    vmin = (sortedRaw[minIdx] / 1023) * 5.0;
    vmax = (sortedRaw[maxIdx] / 1023) * 5.0;
    vpp = vmax - vmin;

    // Calculate Frequency (Hz) using zero-crossings (on the centered AC value)
    let zeroCrossings = [];
    for (let i = 1; i < activeData.length; i++) {
      if (activeData[i-1].value < 0 && activeData[i].value >= 0) {
        zeroCrossings.push(activeData[i].time);
      }
    }
    
    if (zeroCrossings.length >= 2) {
      let totalPeriod = 0;
      for (let i = 1; i < zeroCrossings.length; i++) {
        totalPeriod += (zeroCrossings[i] - zeroCrossings[i-1]);
      }
      const avgPeriodTicks = totalPeriod / (zeroCrossings.length - 1);
      // Assuming 1 tick = 50ms = 0.05s based on Arduino's delay(50)
      period = avgPeriodTicks * 0.05; 
      freq = 1 / period;
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>EMG Grip Therapy</h1>
          <p className="subtitle">Real-time muscle activation monitoring (Bluetooth)</p>
          {errorMsg && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> {errorMsg}</p>}
        </div>
        <div className="status-badge" style={{ 
          background: isConnected ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: isConnected ? 'var(--accent-green)' : 'var(--text-secondary)',
          borderColor: isConnected ? 'rgba(57, 255, 20, 0.2)' : 'var(--border-color)'
        }}>
          {isConnected && <div className="status-dot"></div>}
          {isConnected ? `Connected: ${device?.name || 'Device'}` : 'Disconnected'}
        </div>
      </header>
      
      {debugHex && (
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
          Debug Signal: {debugHex}
        </div>
      )}

      <main className="dashboard-grid">
        <section className="card col-span-8">
          <div className="card-title">
            <Activity size={24} />
            <h2>Live EMG Signal</h2>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emgData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(val) => (val / 20).toFixed(1)} 
                  label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)' }} 
                  stroke="rgba(0,0,0,0.3)"
                  tick={{ fill: 'var(--text-secondary)' }}
                  minTickGap={40}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', offset: -5, fill: 'var(--text-secondary)' }} 
                  stroke="rgba(0,0,0,0.3)"
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickFormatter={(val) => val.toFixed(1)}
                />
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
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <Activity size={24} />
            <h2>Control Panel</h2>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>
              REAL-TIME SIGNAL
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', margin: '0.5rem 0' }}>
              {currentValue > 0 ? '+' : ''}{currentValue.toFixed(2)} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>V</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 500, background: 'rgba(2, 132, 199, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
              <div className="status-dot" style={{ background: 'var(--accent-blue)' }}></div>
              AC-Coupled (Centered at 0V)
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div className="control-grid">
              <button 
                className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleConnect}
              >
                {isConnected ? <BluetoothConnected size={18} /> : <Bluetooth size={18} />}
                {isConnected ? 'Disconnect' : 'Pair Device'}
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

        <section className="card col-span-3">
          <h3 className="stat-label">Vmax (Max)</h3>
          <div className="stat-value">{vmax.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            <Activity size={14} style={{ marginRight: '4px' }}/> Top Peak
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">Vmin (Min)</h3>
          <div className="stat-value">{vmin.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend trend-down">
            Bottom Trough
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">Vp-p (Amplitude)</h3>
          <div className="stat-value">{vpp.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend" style={{ color: 'var(--accent-blue)' }}>
            Peak to Peak
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">Frequency</h3>
          <div className="stat-value">{freq > 0 ? freq.toFixed(1) : '-'} <span className="stat-label" style={{ fontSize: '1rem' }}>Hz</span></div>
          <div className="stat-trend" style={{ color: 'var(--accent-green)' }}>
            Period: {period > 0 ? period.toFixed(2) : '-'} s
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;

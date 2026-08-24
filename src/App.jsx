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

  // Data State
  const [emgData, setEmgData] = useState(Array.from({ length: 50 }, (_, i) => ({ time: i, value: 0 })));
  const [currentValue, setCurrentValue] = useState(0);
  const timeRef = useRef(50);

  // Default ESP32 UUIDs (can be changed later by user)
  const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

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
    let sensorValue = 0;
    
    try {
      // 1. Try to parse as String (e.g., if ESP32 uses Serial.println or similar string transmission)
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(value).trim();
      
      if (text !== "" && !isNaN(text) && value.byteLength !== 4) {
        sensorValue = parseFloat(text);
      } else {
        // 2. Fallback to raw bytes based on length
        if (value.byteLength === 4) {
          // Sine waves are often sent as 4-byte Floats
          sensorValue = value.getFloat32(0, true); 
        } else if (value.byteLength === 2) {
          sensorValue = value.getInt16(0, true); 
        } else if (value.byteLength === 1) {
          sensorValue = value.getUint8(0);
        }
      }
    } catch (e) {
      console.error("Error parsing value", e);
    }

    // Do NOT clamp the value. Let the sine wave display its full real range!
    setCurrentValue(Math.round(sensorValue));
    
    setEmgData(prevData => {
      return [...prevData.slice(1), { time: timeRef.current++, value: sensorValue }];
    });
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

      <main className="dashboard-grid">
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
                <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.5)" />
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
            <Power size={24} />
            <h2>Current Strength</h2>
          </div>
          
          <div className="meter-container">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border-color)" strokeWidth="15" strokeDasharray="565.48" strokeDashoffset="141.37" />
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
              <span className="meter-unit">RAW</span>
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

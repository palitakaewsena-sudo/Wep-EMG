import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Settings, Play, Square, Bluetooth, BluetoothConnected, History, Home, Globe } from 'lucide-react';
import './index.css';

const i18n = {
  th: {
    appTitle: "EMG Signal Monitor",
    tabDashboard: "แดชบอร์ด",
    tabHistory: "ประวัติการฝึก",
    tabSettings: "ตั้งค่า",
    connect: "เชื่อมต่ออุปกรณ์",
    disconnect: "ตัดการเชื่อมต่อ",
    start: "เริ่มเซสชัน",
    stop: "หยุดซ้อม",
    liveSignal: "สัญญาณเรียลไทม์",
    acCoupled: "AC-Coupled",
    vmax: "Vmax (สูงสุด)",
    vmin: "Vmin (ต่ำสุด)",
    vpp: "Vp-p (กว้าง)",
    frequency: "ความถี่",
    period: "รอบเวลา",
    topPeak: "จุดยอดคลื่น",
    bottomTrough: "จุดท้องคลื่น",
    peakToPeak: "ความกว้างรวม",
    gripCount: "จำนวนกำมือ",
    totalGrips: "ครั้ง",
    trainingSession: "โหมดฝึกซ้อม",
    timeRemaining: "เวลาที่เหลือ",
    presets: "เวลาด่วน:",
    noHistory: "ยังไม่มีประวัติการฝึก",
    date: "วันที่",
    duration: "เวลาฝึก",
    peakVpp: "ค่า Vp-p สูงสุด",
    settingsGripTitle: "เกณฑ์การกำมือ (Grip Threshold)",
    settingsGripDesc: "ระดับโวลต์ที่จะนับว่ากำมือ (เส้นสีส้ม)",
    settingsBaseTitle: "เกณฑ์พัก (Resting Baseline)",
    settingsBaseDesc: "ระดับโวลต์ที่จะนับว่าคลายมือแล้ว (เส้นสีเขียว)",
    customMin: "นาที",
  },
  en: {
    appTitle: "EMG Signal Monitor",
    tabDashboard: "Dashboard",
    tabHistory: "History",
    tabSettings: "Settings",
    connect: "Connect Device",
    disconnect: "Disconnect",
    start: "Start Session",
    stop: "Stop",
    liveSignal: "REAL-TIME SIGNAL",
    acCoupled: "AC-Coupled",
    vmax: "Vmax (Max)",
    vmin: "Vmin (Min)",
    vpp: "Vp-p (Amp)",
    frequency: "Frequency",
    period: "Period",
    topPeak: "Top Peak",
    bottomTrough: "Bottom Trough",
    peakToPeak: "Peak to Peak",
    gripCount: "Grip Count",
    totalGrips: "grips",
    trainingSession: "Training Session",
    timeRemaining: "Time Remaining",
    presets: "Presets:",
    noHistory: "No training history yet",
    date: "Date",
    duration: "Duration",
    peakVpp: "Peak Vp-p",
    settingsGripTitle: "Grip Threshold",
    settingsGripDesc: "Voltage level to count as a grip (Orange line)",
    settingsBaseTitle: "Resting Baseline",
    settingsBaseDesc: "Voltage level to count as released (Green line)",
    customMin: "mins",
  }
};

function App() {
  const [lang, setLang] = useState('th');
  const t = i18n[lang];
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [emgData, setEmgData] = useState(Array.from({ length: 200 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
  const [currentValue, setCurrentValue] = useState(0);
  const timeRef = useRef(200);
  const bufferRef = useRef("");
  const filterRef = useRef({ prevX: null, prevY: 0 });

  // Settings
  const [gripThreshold, setGripThreshold] = useState(() => parseFloat(localStorage.getItem('emgGripThreshold')) || 1.0);
  const [restingBaseline, setRestingBaseline] = useState(() => parseFloat(localStorage.getItem('emgRestingBaseline')) || 0.2);

  // History
  const [historyLogs, setHistoryLogs] = useState(() => JSON.parse(localStorage.getItem('emgHistory')) || []);

  // Timer Session
  const [sessionPreset, setSessionPreset] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Grip State for UI
  const [gripCount, setGripCount] = useState(0);
  
  // Refs for inside event listener
  const sessionRef = useRef({ 
    isActive: false, 
    threshold: 1.0, 
    baseline: 0.2,
    isGripping: false,
    gripCount: 0,
    maxVoltage: 0,
    minVoltage: 0
  });

  useEffect(() => {
    sessionRef.current.isActive = isSessionActive;
    sessionRef.current.threshold = gripThreshold;
    sessionRef.current.baseline = restingBaseline;
  }, [isSessionActive, gripThreshold, restingBaseline]);

  const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
  const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

  // Timer Countdown Logic
  useEffect(() => {
    let interval;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isSessionActive && timeLeft === 0) {
      finishSession();
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setGripCount(0);
    sessionRef.current.gripCount = 0;
    sessionRef.current.isGripping = false;
    sessionRef.current.maxVoltage = 0;
    sessionRef.current.minVoltage = 0;
    setTimeLeft(sessionPreset);
    setIsSessionActive(true);
  };

  const finishSession = () => {
    setIsSessionActive(false);
    const finalGrips = sessionRef.current.gripCount;
    const finalVpp = (sessionRef.current.maxVoltage - sessionRef.current.minVoltage).toFixed(2);
    
    if (finalGrips > 0 || sessionPreset - timeLeft > 5) {
      const newLog = {
        date: new Date().toISOString(),
        duration: sessionPreset - timeLeft,
        grips: finalGrips,
        peakVpp: finalVpp
      };
      const updatedHistory = [newLog, ...historyLogs];
      setHistoryLogs(updatedHistory);
      localStorage.setItem('emgHistory', JSON.stringify(updatedHistory));
    }
    setTimeLeft(sessionPreset);
  };

  const saveSettings = (newThreshold, newBaseline) => {
    setGripThreshold(newThreshold);
    setRestingBaseline(newBaseline);
    localStorage.setItem('emgGripThreshold', newThreshold);
    localStorage.setItem('emgRestingBaseline', newBaseline);
  };

  const handleConnect = async () => {
    setErrorMsg("");
    if (isConnected && device) {
      if (device.gatt.connected) device.gatt.disconnect();
      setIsConnected(false);
      setDevice(null);
      setCharacteristic(null);
      setIsSessionActive(false);
      return;
    }

    try {
      if (!navigator.bluetooth) throw new Error("Web Bluetooth API is not supported.");
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID]
      });

      const server = await btDevice.gatt.connect();
      btDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setIsSessionActive(false);
        setDevice(null);
        setCharacteristic(null);
        bufferRef.current = "";
        filterRef.current = { prevX: null, prevY: 0 };
      });

      try {
        const service = await server.getPrimaryService(SERVICE_UUID);
        const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
        setCharacteristic(char);
      } catch (e) {
        setErrorMsg("Connected, but could not find the specific EMG UUIDs.");
      }

      setDevice(btDevice);
      setIsConnected(true);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  useEffect(() => {
    if (!characteristic) return;

    const handleCharacteristicValueChanged = (event) => {
      const value = event.target.value;
      const decoder = new TextDecoder('utf-8');
      const textChunk = decoder.decode(value);
      bufferRef.current += textChunk;

      let lines = bufferRef.current.split('\n');
      bufferRef.current = lines.pop(); 
      
      let latestValue = null;
      let newPoints = [];
      let newGripCount = sessionRef.current.gripCount;

      for (let line of lines) {
        line = line.trim();
        if (line !== "" && !isNaN(line)) {
          const rawVal = parseFloat(line);
          
          if (filterRef.current.prevX === null) {
            filterRef.current.prevX = rawVal;
            filterRef.current.prevY = 0;
          }
          
          const R = 0.99;
          const y = rawVal - filterRef.current.prevX + R * filterRef.current.prevY;
          filterRef.current.prevX = rawVal;
          filterRef.current.prevY = y;
          
          const voltage = (y / 1023) * 5.0;
          latestValue = voltage;
          newPoints.push({ time: timeRef.current++, value: voltage, raw: rawVal });

          if (sessionRef.current.isActive) {
             if (voltage > sessionRef.current.maxVoltage) sessionRef.current.maxVoltage = voltage;
             if (voltage < sessionRef.current.minVoltage) sessionRef.current.minVoltage = voltage;

             if (!sessionRef.current.isGripping && voltage >= sessionRef.current.threshold) {
               sessionRef.current.isGripping = true;
               newGripCount++;
               sessionRef.current.gripCount = newGripCount;
             } else if (sessionRef.current.isGripping && voltage <= sessionRef.current.baseline) {
               sessionRef.current.isGripping = false;
             }
          }
        }
      }

      if (newPoints.length > 0) {
        if (latestValue !== null) setCurrentValue(latestValue);
        if (sessionRef.current.isActive && newGripCount !== gripCount) setGripCount(newGripCount);
        
        setEmgData(prevData => {
          const combined = [...prevData, ...newPoints];
          return combined.slice(-200);
        });
      }
    };

    characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    characteristic.startNotifications();

    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    };
  }, [characteristic]);

  const renderDashboard = () => {
    const activeData = emgData.filter(d => d.time >= 200);
    let vmin = 0, vmax = 0, vpp = 0, freq = 0, period = 0;
    if (activeData.length > 20) {
      let sortedRaw = activeData.map(d => d.raw).sort((a,b) => a-b);
      vmin = (sortedRaw[Math.floor(sortedRaw.length * 0.05)] / 1023) * 5.0;
      vmax = (sortedRaw[Math.floor(sortedRaw.length * 0.95)] / 1023) * 5.0;
      vpp = vmax - vmin;

      let zeroCrossings = [];
      for (let i = 1; i < activeData.length; i++) {
        if (activeData[i-1].value < 0 && activeData[i].value >= 0) zeroCrossings.push(activeData[i].time);
      }
      if (zeroCrossings.length >= 2) {
        let totalPeriod = 0;
        for (let i = 1; i < zeroCrossings.length; i++) totalPeriod += (zeroCrossings[i] - zeroCrossings[i-1]);
        period = (totalPeriod / (zeroCrossings.length - 1)) * 0.05; 
        freq = 1 / period;
      }
    }

    return (
      <div className="dashboard-grid">
        <section className="card col-span-8">
          <div className="card-title">
            <Activity size={24} />
            <h2>{t.appTitle}</h2>
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
                <ReferenceLine y={gripThreshold} stroke="orange" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: `Threshold (${gripThreshold}V)`, fill: 'orange' }} />
                <ReferenceLine y={restingBaseline} stroke="green" strokeDasharray="4 4" label={{ position: 'insideBottomLeft', value: `Baseline (${restingBaseline}V)`, fill: 'green' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-blue)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--accent-blue)" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <Bluetooth size={24} />
            <h2>{t.liveSignal}</h2>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', margin: '0.5rem 0' }}>
              {currentValue > 0 ? '+' : ''}{currentValue.toFixed(2)} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>V</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 500, background: 'rgba(2, 132, 199, 0.1)', padding: '4px 12px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
              <div className="status-dot" style={{ background: 'var(--accent-blue)', flexShrink: 0 }}></div>
              {t.acCoupled}
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.trainingSession}</div>
            
            {!isSessionActive ? (
              <div className="timer-presets">
                {[60, 180, 300, 600].map(secs => (
                  <button 
                    key={secs} 
                    className={`preset-btn ${sessionPreset === secs ? 'active' : ''}`}
                    onClick={() => setSessionPreset(secs)}
                  >
                    {secs / 60}m
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-green)' }}>
                {formatTime(timeLeft)}
              </div>
            )}

            <div className="control-grid">
              <button className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'}`} onClick={handleConnect}>
                {isConnected ? <BluetoothConnected size={18} /> : <Bluetooth size={18} />}
                {isConnected ? t.disconnect : t.connect}
              </button>
              
              <button 
                className={`btn ${isSessionActive ? 'btn-danger' : 'btn-primary'}`}
                onClick={isSessionActive ? finishSession : handleStartSession}
                disabled={!isConnected}
              >
                {isSessionActive ? <Square size={18} /> : <Play size={18} />}
                {isSessionActive ? t.stop : t.start}
              </button>
            </div>
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">{t.vmax}</h3>
          <div className="stat-value">{vmax.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            <Activity size={14} style={{ marginRight: '4px' }}/> {t.topPeak}
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">{t.vmin}</h3>
          <div className="stat-value">{vmin.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend trend-down">
            {t.bottomTrough}
          </div>
        </section>

        <section className="card col-span-3">
          <h3 className="stat-label">{t.vpp}</h3>
          <div className="stat-value">{vpp.toFixed(2)} <span className="stat-label" style={{ fontSize: '1rem' }}>V</span></div>
          <div className="stat-trend" style={{ color: 'var(--accent-blue)' }}>
            {t.peakToPeak}
          </div>
        </section>

        <section className="card col-span-3" style={{ background: isSessionActive ? 'rgba(34, 197, 94, 0.05)' : '', borderColor: isSessionActive ? 'var(--accent-green)' : '' }}>
          <h3 className="stat-label" style={{ color: isSessionActive ? 'var(--accent-green)' : '' }}>{t.gripCount}</h3>
          <div className="stat-value" style={{ color: isSessionActive ? 'var(--accent-green)' : '' }}>
            {gripCount} <span className="stat-label" style={{ fontSize: '1rem' }}>{t.totalGrips}</span>
          </div>
          <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            {t.frequency}: {freq > 0 ? freq.toFixed(1) : '-'} Hz
          </div>
        </section>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="history-container">
      <div className="card-title" style={{ marginBottom: '2rem' }}>
        <History size={24} />
        <h2>{t.tabHistory}</h2>
      </div>
      
      {historyLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          {t.noHistory}
        </div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>{t.date}</th>
              <th>{t.duration}</th>
              <th>{t.gripCount}</th>
              <th>{t.peakVpp}</th>
            </tr>
          </thead>
          <tbody>
            {historyLogs.map((log, i) => (
              <tr key={i}>
                <td>{new Date(log.date).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}</td>
                <td>{formatTime(log.duration)}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{log.grips}</td>
                <td>{log.peakVpp} V</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <div className="card-title" style={{ marginBottom: '2rem' }}>
        <Settings size={24} />
        <h2>{t.tabSettings}</h2>
      </div>

      <div className="form-group">
        <label>{t.settingsGripTitle}</label>
        <div className="desc">{t.settingsGripDesc}</div>
        <input 
          type="range" 
          className="range-slider" 
          min="0" max="2.5" step="0.1" 
          value={gripThreshold}
          onChange={(e) => saveSettings(parseFloat(e.target.value), restingBaseline)}
        />
        <div className="value-display">+{gripThreshold.toFixed(1)} V</div>
      </div>

      <div className="form-group" style={{ marginTop: '3rem' }}>
        <label>{t.settingsBaseTitle}</label>
        <div className="desc">{t.settingsBaseDesc}</div>
        <input 
          type="range" 
          className="range-slider" 
          min="0" max="2.5" step="0.1" 
          value={restingBaseline}
          onChange={(e) => saveSettings(gripThreshold, parseFloat(e.target.value))}
        />
        <div className="value-display">+{restingBaseline.toFixed(1)} V</div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <nav className="nav-tabs">
            <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Home size={18} /> {t.tabDashboard}
            </button>
            <button className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <History size={18} /> {t.tabHistory}
            </button>
            <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={18} /> {t.tabSettings}
            </button>
            <button className="lang-toggle" onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
              <Globe size={18} /> {lang === 'th' ? 'EN' : 'TH'}
            </button>
          </nav>
        </div>
      </header>
      
      {errorMsg && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          {errorMsg}
        </div>
      )}

      <main>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
}

export default App;

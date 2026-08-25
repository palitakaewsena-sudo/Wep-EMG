import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar 
} from 'recharts';
import { 
  Activity, Settings as SettingsIcon, Play, Square, Bluetooth, BluetoothConnected, 
  History, Globe, Zap, Hand, Clock, BarChart2, Target, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import './index.css';

const i18n = {
  th: {
    appTitle: "EMG Grip Therapy",
    appSub: "Medical Technology · Rehabilitation",
    tabDashboard: "หน้าแรก",
    tabHistory: "ประวัติ",
    tabSettings: "ตั้งค่า",
    notConnected: "ยังไม่เชื่อมต่อ",
    deviceSub: "อุปกรณ์ EMG ผ่าน BLE (HM-10)",
    connectBtn: "เชื่อมต่อ Bluetooth",
    disconnectBtn: "ยกเลิกการเชื่อมต่อ",
    emgVal: "ค่า EMG",
    emgSub: "mV Vpp · Raw ADC: 0",
    vmax: "Vmax (สูงสุด)",
    vmin: "Vmin (ต่ำสุด)",
    freq: "ความถี่ (Hz)",
    gripVal: "กำมือ",
    gripSub: "ครั้ง",
    timeVal: "เวลาคงเหลือ",
    timeSub: "MM:SS",
    statusVal: "สถานะ",
    statusSub: "- BLE",
    statusReady: "พร้อมใช้งาน",
    statusWait: "รอเชื่อมต่อ",
    statusTraining: "กำลังฝึก",
    chartTitle: "EMG · Standby",
    chartY: "แรงดันสัญญาณ EMG (mV)",
    stopAt: "หยุดทำ",
    startAt: "เริ่มทำ",
    timeBottom: "Time",
    controlTitle: "ควบคุมการฝึก",
    controlSub: "ตั้งเวลาและเริ่ม/หยุดเซสชัน",
    calibTitle: "คาลิเบรต threshold",
    calibSub: "วางมือพัก 3 วิ แล้วกด →",
    calibBtn: "Calibrate",
    startBtn: "เริ่มฝึก",
    stopBtn: "หยุดฝึก",
    resetBtn: "รีเซ็ต",
    connectPrompt: "กรุณาเชื่อมต่ออุปกรณ์ก่อน",
    
    // Settings
    setMainTitle: "ตั้งค่าการตรวจจับ",
    setMainSub: "ปรับเกณฑ์ความไวและระยะเวลาฝึกให้เหมาะกับผู้ใช้",
    setAdaptTitle: "Adaptive Threshold",
    setAdaptSub: "คำนวณ threshold จาก baseline EMG ขณะพัก ปรับได้ตามผิวและตำแหน่งอิเล็กโทรด",
    setAdaptNotCalib: "ยังไม่ได้คาลิเบรต",
    setAdaptNotCalibSub: "กดปุ่ม Calibrate ในหน้าหลัก แล้ววางมือพัก 3 วินาที",
    setTrigMult: "triggerMultiplier (baseline × นี้ = trigger)",
    setTrigDesc: "เลือก 1.25 จากการทดลอง: noise ceiling ≈ 1.1×, grip ปกติพุ่งสูง ≥ 1.4× → จุดตัดปลอดภัยที่ 1.25×",
    setRelMult: "releaseMultiplier (baseline × นี้ = release)",
    setRelDesc: "ต้องน้อยกว่า triggerMultiplier — ช่วยป้องกัน re-trigger ทันทีหลังปล่อยมือ",
    setGripTitle: "เกณฑ์การตรวจจับกำมือ",
    setGripSub: "กำหนดค่าสัญญาณ EMG ที่ถือว่าเริ่มกำมือและหยุดกำมือ",
    setStartGrip: "เริ่มกำมือที่ค่า (mV)",
    setStopGrip: "หยุดกำมือที่ค่า (mV)",
    setTimeTitle: "ระยะเวลาฝึกเริ่มต้น",
    setTimeSub: "ระยะเวลานี้จะถูกใช้ทุกครั้งที่เริ่มฝึกในหน้าแรก",
    setTargetTitle: "จำนวนครั้งเป้าหมาย",
    setTargetSub: "ตั้งจำนวนครั้งที่ต้องการกำมือให้ครบในแต่ละเซสชัน",
    custom: "กำหนดเอง",
    resetDefault: "คืนค่าเริ่มต้น",
    
    // History
    histMainTitle: "ประวัติการฝึก",
    histMainSub: "ดูและวิเคราะห์ประวัติการฝึกกำมือย้อนหลัง",
    histStatTitle: "สถิติการกำมือ",
    histStatSub: "เฉลี่ย 0 ครั้ง/วัน",
    week: "สัปดาห์",
    month: "เดือน",
    noData: "ยังไม่มีข้อมูลในช่วงเวลานี้",
    noHistory: "ยังไม่มีประวัติการฝึก",
    colDate: "วันที่และเวลา",
    colSetTime: "ตั้งเวลา",
    colRealTime: "เวลาจริง",
    colGrip: "กำมือ (ครั้ง)",
    colEMG: "EMG (mV)",
    colAvg: "เฉลี่ย (วิ)"
  },
  en: {
    appTitle: "EMG Grip Therapy",
    appSub: "Medical Technology · Rehabilitation",
    tabDashboard: "Dashboard",
    tabHistory: "History",
    tabSettings: "Settings",
    notConnected: "Not Connected",
    deviceSub: "EMG device via BLE (HM-10)",
    connectBtn: "Connect Bluetooth",
    disconnectBtn: "Disconnect",
    emgVal: "EMG Value",
    emgSub: "mV Vpp · Raw ADC: 0",
    vmax: "Vmax (Max)",
    vmin: "Vmin (Min)",
    freq: "Freq (Hz)",
    gripVal: "Grips",
    gripSub: "count",
    timeVal: "Time Left",
    timeSub: "MM:SS",
    statusVal: "Status",
    statusSub: "- BLE",
    statusReady: "Ready",
    statusWait: "Waiting",
    statusTraining: "Training",
    chartTitle: "EMG · Standby",
    chartY: "EMG Signal (mV)",
    stopAt: "Stop at",
    startAt: "Start at",
    timeBottom: "Time",
    controlTitle: "Session Control",
    controlSub: "Set time and start/stop session",
    calibTitle: "Calibrate threshold",
    calibSub: "Rest hand for 3s then press →",
    calibBtn: "Calibrate",
    startBtn: "Start",
    stopBtn: "Stop",
    resetBtn: "Reset",
    connectPrompt: "Please connect a device first",
    
    // Settings
    setMainTitle: "Detection Settings",
    setMainSub: "Adjust sensitivity and training duration",
    setAdaptTitle: "Adaptive Threshold",
    setAdaptSub: "Calculate threshold from resting baseline EMG",
    setAdaptNotCalib: "Not calibrated yet",
    setAdaptNotCalibSub: "Press Calibrate on dashboard and rest hand for 3 seconds",
    setTrigMult: "triggerMultiplier (baseline × this = trigger)",
    setTrigDesc: "1.25 recommended for stable triggering",
    setRelMult: "releaseMultiplier (baseline × this = release)",
    setRelDesc: "Must be lower than triggerMultiplier",
    setGripTitle: "Grip Detection Threshold",
    setGripSub: "EMG voltage to start/stop counting a grip",
    setStartGrip: "Start grip at (mV)",
    setStopGrip: "Stop grip at (mV)",
    setTimeTitle: "Initial Training Time",
    setTimeSub: "Default time for new sessions",
    setTargetTitle: "Target Grips",
    setTargetSub: "Target grip count per session",
    custom: "Custom",
    resetDefault: "Reset Defaults",
    
    // History
    histMainTitle: "Training History",
    histMainSub: "View and analyze past training sessions",
    histStatTitle: "Grip Statistics",
    histStatSub: "Average 0 grips/day",
    week: "Week",
    month: "Month",
    noData: "No data in this period",
    noHistory: "No training history",
    colDate: "Date & Time",
    colSetTime: "Set Time",
    colRealTime: "Actual Time",
    colGrip: "Grips",
    colEMG: "EMG (mV)",
    colAvg: "Avg (s)"
  }
};

function App() {
  const [lang, setLang] = useState('th');
  const t = i18n[lang];
  const [activeTab, setActiveTab] = useState('dashboard');

  // Bluetooth State
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  // EMG Data
  const [emgData, setEmgData] = useState(Array.from({ length: 150 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
  const [currentVpp, setCurrentVpp] = useState(0);
  const [currentVmax, setCurrentVmax] = useState(0);
  const [currentVmin, setCurrentVmin] = useState(0);
  const [currentFreq, setCurrentFreq] = useState(0);
  const [rawAdc, setRawAdc] = useState(0);
  const timeRef = useRef(150);
  const bufferRef = useRef("");
  const filterRef = useRef({ prevX: null, prevY: 0, dcOffset: 2500 });

  // Settings State
  const [triggerMult, setTriggerMult] = useState(1.25);
  const [releaseMult, setReleaseMult] = useState(1.12);
  const [startGripMv, setStartGripMv] = useState(978.0);
  const [stopGripMv, setStopGripMv] = useState(880.0);
  const [sessionTimePreset, setSessionTimePreset] = useState(5); // minutes
  const [targetGrips, setTargetGrips] = useState(20);

  // Session State
  const [timeLeft, setTimeLeft] = useState(sessionTimePreset * 60);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [gripCount, setGripCount] = useState(0);
  
  // History
  const [historyLogs, setHistoryLogs] = useState([]);
  const [histPeriod, setHistPeriod] = useState('week');

  const sessionRef = useRef({ 
    isActive: false, 
    startMv: 978.0, 
    stopMv: 880.0,
    isGripping: false,
    gripCount: 0,
  });

  useEffect(() => {
    sessionRef.current.isActive = isSessionActive;
    sessionRef.current.startMv = startGripMv;
    sessionRef.current.stopMv = stopGripMv;
  }, [isSessionActive, startGripMv, stopGripMv]);

  useEffect(() => {
    setTimeLeft(sessionTimePreset * 60);
  }, [sessionTimePreset]);

  const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
  const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

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
    if (!isConnected) return;
    setGripCount(0);
    sessionRef.current.gripCount = 0;
    sessionRef.current.isGripping = false;
    setTimeLeft(sessionTimePreset * 60);
    setIsSessionActive(true);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setGripCount(0);
    setTimeLeft(sessionTimePreset * 60);
    setEmgData(Array.from({ length: 150 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
    setCurrentVpp(0);
  };

  const finishSession = () => {
    setIsSessionActive(false);
    // Add to history logic would go here
  };

  const handleConnect = async () => {
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
      });

      const service = await server.getPrimaryService(SERVICE_UUID);
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
      setCharacteristic(char);
      setDevice(btDevice);
      setIsConnected(true);
    } catch (error) {
      console.error(error);
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
      
      let newPoints = [];
      let newGripCount = sessionRef.current.gripCount;
      let lastRaw = 0;
      let maxV = 0, minV = 5000;

      for (let line of lines) {
        line = line.trim();
        if (line !== "" && !isNaN(line)) {
          const rawVal = parseFloat(line); // Assuming ADC 0-1023
          lastRaw = rawVal;
          
          // 2.5V shifting circuit (assuming 5V reference ADC)
          const rawMv = (rawVal / 1023) * 5000; 
          
          // Dynamic DC offset tracking (High-pass filter for baseline wander)
          // Adjusts slowly to the real center voltage (starts at 2500)
          filterRef.current.dcOffset = (filterRef.current.dcOffset * 0.999) + (rawMv * 0.001);
          
          // Signal centered at 0 for Oscilloscope view
          const acMv = rawMv - filterRef.current.dcOffset; 
          
          // Use rawMv for absolute Vmax and Vmin (includes the 2.5V shift)
          if (rawMv > maxV) maxV = rawMv;
          if (rawMv < minV) minV = rawMv;

          newPoints.push({ time: timeRef.current++, value: acMv, raw: rawVal, rawMv: rawMv });

          if (sessionRef.current.isActive) {
             if (!sessionRef.current.isGripping && rawMv >= sessionRef.current.startMv) {
               sessionRef.current.isGripping = true;
               newGripCount++;
               sessionRef.current.gripCount = newGripCount;
             } else if (sessionRef.current.isGripping && rawMv <= sessionRef.current.stopMv) {
               sessionRef.current.isGripping = false;
             }
          }
        }
      }

      if (newPoints.length > 0) {
        setRawAdc(lastRaw);
        
        setEmgData(prevData => {
          const combined = [...prevData, ...newPoints].slice(-150);
          
          if (combined.length > 20) {
            let winMax = -5000, winMin = 5000;
            let zeroCrossings = 0;
            for (let i = 1; i < combined.length; i++) {
              if (combined[i].rawMv > winMax) winMax = combined[i].rawMv;
              if (combined[i].rawMv < winMin) winMin = combined[i].rawMv;
              // Detect zero crossings on the AC signal (centered at 0)
              if (combined[i-1].value < 0 && combined[i].value >= 0) zeroCrossings++;
            }
            if (winMin === 5000) winMin = 0;
            if (winMax === -5000) winMax = 0;
            setCurrentVmax(winMax);
            setCurrentVmin(winMin);
            setCurrentVpp(winMax - winMin);
            setCurrentFreq(zeroCrossings / 3.0); // Approx freq based on a 3-second window
          }
          
          return combined;
        });

        if (sessionRef.current.isActive && newGripCount !== gripCount) setGripCount(newGripCount);
      }
    };

    characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    characteristic.startNotifications();

    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    };
  }, [characteristic]);

  const renderDashboard = () => (
    <div className="dashboard-grid">
      {/* Banner */}
      <div className="card banner-card col-span-12">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`metric-icon ${isConnected ? 'teal' : 'gray'}`}>
            <Bluetooth size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: isConnected ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
              {isConnected ? 'เชื่อมต่อแล้ว' : t.notConnected}
            </h3>
            <div className="subtitle">{t.deviceSub}</div>
          </div>
        </div>
        <button 
          className={`btn ${isConnected ? 'btn-outline' : 'btn-teal'}`} 
          onClick={handleConnect}
          style={{ borderRadius: '24px' }}
        >
          {isConnected ? t.disconnectBtn : t.connectBtn}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="card metric-card col-span-3">
        <div className="metric-header"><Zap size={16} /> {t.emgVal}</div>
        <div className="metric-value teal">{currentVpp.toFixed(1)}</div>
        <div className="metric-sub">{t.emgSub.replace('0', rawAdc.toFixed(0))}</div>
      </div>
      <div className="card metric-card col-span-3">
        <div className="metric-header"><Hand size={16} /> {t.gripVal}</div>
        <div className="metric-value teal">{gripCount}</div>
        <div className="metric-sub">{t.gripSub}</div>
      </div>
      <div className="card metric-card col-span-3">
        <div className="metric-header"><Clock size={16} /> {t.timeVal}</div>
        <div className="metric-value">{formatTime(timeLeft)}</div>
        <div className="metric-sub">{t.timeSub}</div>
      </div>
      <div className="card metric-card col-span-3">
        <div className="metric-header"><BarChart2 size={16} /> {t.statusVal}</div>
        <div className="metric-value" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', height: '100%' }}>
          {isSessionActive ? t.statusTraining : (isConnected ? t.statusReady : t.statusWait)}
        </div>
        <div className="metric-sub">{t.statusSub}</div>
      </div>

      {/* Chart */}
      <div className="card col-span-8" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? 'var(--accent-teal)' : '#CBD5E1' }} />
            {t.chartTitle}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.chartY}</div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emgData} margin={{ top: 20, right: 40, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[-2500, 2500]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              
              <ReferenceLine y={startGripMv} stroke="var(--accent-teal)" strokeDasharray="4 4" 
                label={{ position: 'right', value: `${t.startAt} ${startGripMv} mV`, fill: 'var(--accent-teal)', fontSize: 12 }} />
              <ReferenceLine y={stopGripMv} stroke="var(--accent-orange)" strokeDasharray="4 4" 
                label={{ position: 'right', value: `${t.stopAt} ${stopGripMv} mV`, fill: 'var(--accent-orange)', fontSize: 12, dy: -15 }} />
                
              <Line type="monotone" dataKey="value" stroke="var(--text-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.vmin}</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>{currentVmin.toFixed(1)} mV</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.vmax}</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{currentVmax.toFixed(1)} mV</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vp-p</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{currentVpp.toFixed(1)} mV</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.freq}</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{currentFreq.toFixed(1)} Hz</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card control-card col-span-4">
        <div className="control-header">
          <Clock size={18} /> {t.controlTitle}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.controlSub}</div>
        
        <div className="timer-select">
          <span>{sessionTimePreset} นาที</span>
          <SettingsIcon size={16} color="var(--accent-teal)" />
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', margin: '1rem 0' }}></div>
        
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.calibTitle}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{t.calibSub}</div>
        
        <button className="btn btn-purple" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Target size={16} /> {t.calibBtn}
        </button>

        <div className="action-grid">
          <button className="action-btn" onClick={handleStartSession} style={{ color: isSessionActive ? 'var(--text-muted)' : 'var(--accent-teal)', borderColor: isSessionActive ? 'var(--border-color)' : 'var(--accent-teal)', background: isSessionActive ? 'var(--bg-main)' : 'rgba(0,188,163,0.05)' }}>
            <Play size={20} />
            {t.startBtn}
          </button>
          <button className="action-btn" onClick={handleStopSession} style={{ color: !isSessionActive ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            <Square size={20} />
            {t.stopBtn}
          </button>
          <button className="action-btn" onClick={handleResetSession}>
            <RefreshCw size={20} />
            {t.resetBtn}
          </button>
        </div>

        {!isConnected && (
          <div className="connect-prompt">
            {t.connectPrompt}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div className="page-title">
        <h2>{t.setMainTitle}</h2>
        <p>{t.setMainSub}</p>
      </div>
      
      <div className="settings-grid">
        <div className="card setting-card">
          <div className="setting-icon"><Target size={20} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem' }}>{t.setAdaptTitle}</h3>
            <p className="subtitle">{t.setAdaptSub}</p>
            
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.setAdaptNotCalib}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.setAdaptNotCalibSub}</div>
            </div>

            <div className="slider-group">
              <div className="slider-col">
                <div className="slider-label teal">
                  <span>{t.setTrigMult}</span>
                  <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{triggerMult.toFixed(2)}</span>
                </div>
                <input type="range" className="range-slider" min="1.0" max="2.0" step="0.01" value={triggerMult} onChange={e => setTriggerMult(parseFloat(e.target.value))} />
                <div className="slider-sub">{t.setTrigDesc}</div>
              </div>
              <div className="slider-col">
                <div className="slider-label orange">
                  <span>{t.setRelMult}</span>
                  <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{releaseMult.toFixed(2)}</span>
                </div>
                <input type="range" className="range-slider orange" min="1.0" max="2.0" step="0.01" value={releaseMult} onChange={e => setReleaseMult(parseFloat(e.target.value))} />
                <div className="slider-sub">{t.setRelDesc}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card setting-card">
          <div className="setting-icon"><SlidersHorizontal size={20} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem' }}>{t.setGripTitle}</h3>
            <p className="subtitle">{t.setGripSub}</p>

            <div className="slider-group">
              <div className="slider-col">
                <div className="slider-label teal">
                  <span>{t.setStartGrip}</span>
                  <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{startGripMv.toFixed(1)}</span>
                </div>
                <input type="range" className="range-slider" min="0" max="2500" step="10" value={startGripMv} onChange={e => setStartGripMv(parseFloat(e.target.value))} />
              </div>
              <div className="slider-col">
                <div className="slider-label orange">
                  <span>{t.setStopGrip}</span>
                  <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{stopGripMv.toFixed(1)}</span>
                </div>
                <input type="range" className="range-slider orange" min="0" max="2500" step="10" value={stopGripMv} onChange={e => setStopGripMv(parseFloat(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        <div className="card setting-card">
          <div className="setting-icon"><Clock size={20} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem' }}>{t.setTimeTitle}</h3>
            <p className="subtitle">{t.setTimeSub}</p>
            <div className="preset-pills">
              {[1, 3, 5, 10].map(m => (
                <button key={m} className={`pill ${sessionTimePreset === m ? 'active' : ''}`} onClick={() => setSessionTimePreset(m)}>
                  {m} นาที
                </button>
              ))}
              <button className="pill">{t.custom}</button>
            </div>
          </div>
        </div>

        <div className="card setting-card">
          <div className="setting-icon"><Hand size={20} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem' }}>{t.setTargetTitle}</h3>
            <p className="subtitle">{t.setTargetSub}</p>
            <div className="preset-pills">
              {[10, 20, 30, 50].map(c => (
                <button key={c} className={`pill ${targetGrips === c ? 'active' : ''}`} onClick={() => setTargetGrips(c)}>
                  {c} ครั้ง
                </button>
              ))}
              <button className="pill">{t.custom}</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem', alignSelf: 'flex-start' }}>
          <RefreshCw size={16} /> {t.resetDefault}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div>
      <div className="page-title">
        <h2>{t.histMainTitle}</h2>
        <p>{t.histMainSub}</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem' }}>{t.histStatTitle}</h3>
            <div className="subtitle">{t.histStatSub}</div>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '20px', padding: '4px' }}>
            <button className={`pill ${histPeriod === 'week' ? 'active' : ''}`} onClick={() => setHistPeriod('week')} style={{ border: 'none', background: histPeriod === 'week' ? 'white' : 'transparent', color: histPeriod === 'week' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: histPeriod === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>{t.week}</button>
            <button className={`pill ${histPeriod === 'month' ? 'active' : ''}`} onClick={() => setHistPeriod('month')} style={{ border: 'none', background: histPeriod === 'month' ? 'white' : 'transparent', color: histPeriod === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: histPeriod === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>{t.month}</button>
          </div>
        </div>
        
        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
          {/* Chart Mock */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30px', borderBottom: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
             {[4,3,2,1,0].map(v => (
               <div key={v} style={{ position: 'relative', height: '0', width: '100%' }}>
                 <div style={{ position: 'absolute', top: '-10px', left: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{v}</div>
                 <div style={{ borderTop: '1px dashed var(--border-color)', width: 'calc(100% - 30px)', marginLeft: '30px' }}></div>
               </div>
             ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: '30px', right: 0, display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>จ.</span><span>อ.</span><span>พ.</span><span>พฤ.</span><span>ศ.</span><span>ส.</span><span>อา.</span>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {t.noData}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>วันในสัปดาห์</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="history-table">
          <thead>
            <tr>
              <th>{t.colDate}</th>
              <th>{t.colSetTime}</th>
              <th>{t.colRealTime}</th>
              <th>{t.colGrip}</th>
              <th>{t.colEMG}</th>
              <th>{t.colAvg}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                {t.noHistory}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header-container">
        <div className="header-top">
          <div className="logo-area">
            <div className="logo-icon">
              <Activity size={24} />
            </div>
            <div className="logo-text">
              <h1>{t.appTitle}</h1>
              <div className="subtitle">{t.appSub}</div>
            </div>
          </div>
          <button className="lang-toggle" onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
            <Globe size={16} /> {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
        <nav className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Activity size={18} /> {t.tabDashboard}
          </button>
          <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SlidersHorizontal size={18} /> {t.tabSettings}
          </button>
          <button className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={18} /> {t.tabHistory}
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
}

export default App;

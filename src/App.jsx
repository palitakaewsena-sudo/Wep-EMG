import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar 
} from 'recharts';
import { 
  Activity, Settings as SettingsIcon, Play, Square, Bluetooth, BluetoothConnected, 
  History, Globe, Zap, Hand, Clock, BarChart2, Target, SlidersHorizontal, RefreshCw,
  UserPlus, User, Lock, LogOut, Users, Check
} from 'lucide-react';
import './index.css';

const i18n = {
  th: {
    appTitle: "EMG Grip Therapy",
    appSub: "Medical Technology · Rehabilitation",
    tabConnect: "การเชื่อมต่อ",
    tabTesters: "คลังข้อมูลผู้ทดสอบ",
    tabMonitor: "มอนิเตอร์สัญญาณ",
    tabSettings: "การตั้งค่า",
    tabHistory: "ประวัติ",
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
    colAvg: "เฉลี่ย (วิ)",
    
    // Auth
    authLogin: "เข้าสู่ระบบ",
    authRegister: "ลงทะเบียนผู้ใช้ใหม่",
    authSelectUser: "เลือกผู้ใช้งาน",
    authName: "ชื่อ",
    authGender: "เพศ",
    authAge: "อายุ",
    authPassword: "รหัสผ่าน",
    authMale: "ชาย",
    authFemale: "หญิง",
    authOther: "อื่นๆ",
    authLimitReached: "ไม่สามารถลงทะเบียนได้ (สูงสุด 3 คนแล้ว)",
    authWrongPass: "รหัสผ่านไม่ถูกต้อง",
    authEnterPass: "กรุณาใส่รหัสผ่าน",
    authLogout: "ออกจากระบบ"
  },
  en: {
    appTitle: "EMG Grip Therapy",
    appSub: "Medical Technology · Rehabilitation",
    tabConnect: "Connection",
    tabTesters: "Tester Repository",
    tabMonitor: "Signal Monitor",
    tabSettings: "Settings",
    tabHistory: "History",
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
    colAvg: "Avg (s)",
    
    // Auth
    authLogin: "Login",
    authRegister: "Register New User",
    authSelectUser: "Select User",
    authName: "Name",
    authGender: "Gender",
    authAge: "Age",
    authPassword: "Password",
    authMale: "Male",
    authFemale: "Female",
    authOther: "Other",
    authLimitReached: "Registration limit reached (max 3 users)",
    authWrongPass: "Incorrect password",
    authEnterPass: "Please enter password",
    authLogout: "Logout"
  }
};

function App() {
  const [lang, setLang] = useState('th');
  const t = i18n[lang];
  const [activeTab, setActiveTab] = useState('testers');

  // Testers State
  const [testers, setTesters] = useState(() => {
    const saved = localStorage.getItem('emg_testers');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTesterId, setActiveTesterId] = useState(() => {
    return localStorage.getItem('emg_active_tester') || null;
  });
  
  const activeTester = testers.find(t => t.id === activeTesterId) || null;

  // New Tester Form
  const [isAddingTester, setIsAddingTester] = useState(false);
  const [testName, setTestName] = useState('');
  const [testAge, setTestAge] = useState('');
  const [testGender, setTestGender] = useState('ชาย / Male');
  const [testWeight, setTestWeight] = useState('');
  const [testHeight, setTestHeight] = useState('');
  const [testHand, setTestHand] = useState('ขวา / Right');

  const handleAddTester = (e) => {
    e.preventDefault();
    if (!testName) return;

    const newTester = {
      id: Date.now().toString(),
      name: testName,
      age: testAge,
      gender: testGender,
      weight: testWeight,
      height: testHeight,
      hand: testHand,
      createdAt: new Date().toISOString()
    };
    
    const newTesters = [newTester, ...testers];
    setTesters(newTesters);
    localStorage.setItem('emg_testers', JSON.stringify(newTesters));
    
    // Reset forms
    setTestName('');
    setTestAge('');
    setTestWeight('');
    setTestHeight('');
    setIsAddingTester(false);
  };

  const handleSelectTester = (id) => {
    setActiveTesterId(id);
    localStorage.setItem('emg_active_tester', id);
  };

  const handleDeleteTester = (id) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ทดสอบนี้?')) {
      const newTesters = testers.filter(t => t.id !== id);
      setTesters(newTesters);
      localStorage.setItem('emg_testers', JSON.stringify(newTesters));
      if (activeTesterId === id) {
        setActiveTesterId(null);
        localStorage.removeItem('emg_active_tester');
      }
    }
  };

  // History State
  const [historyLogs, setHistoryLogs] = useState([]);
  const [histPeriod, setHistPeriod] = useState('week');

  useEffect(() => {
    if (activeTesterId) {
      const savedHistory = localStorage.getItem(`emg_history_${activeTesterId}`);
      setHistoryLogs(savedHistory ? JSON.parse(savedHistory) : []);
    } else {
      setHistoryLogs([]);
    }
  }, [activeTesterId]);

  // Custom Settings State
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customMin, setCustomMin] = useState(5);
  const [customSec, setCustomSec] = useState(0);
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(20);

  // BLE & Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  // Session & Training State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gripCount, setGripCount] = useState(0);
  
  // Data & Signal State
  const [emgData, setEmgData] = useState(Array.from({ length: 150 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
  const [currentVpp, setCurrentVpp] = useState(0);
  const [currentVmax, setCurrentVmax] = useState(0);
  const [currentVmin, setCurrentVmin] = useState(0);
  const [currentFreq, setCurrentFreq] = useState(0);
  const [rawAdc, setRawAdc] = useState(0);
  const [dcOffsetState, setDcOffsetState] = useState(2500);

  // Settings State
  const [sessionTimePreset, setSessionTimePreset] = useState(5);
  const [targetGrips, setTargetGrips] = useState(20);
  const [startGripMv, setStartGripMv] = useState(978.0);
  const [stopGripMv, setStopGripMv] = useState(880.0);
  const [triggerMult, setTriggerMult] = useState(1.25);
  const [releaseMult, setReleaseMult] = useState(1.10);

  // Refs for real-time processing
  const bufferRef = useRef("");
  const timeRef = useRef(0);
  const filterRef = useRef({ dcOffset: 2500, freq: 5.0 });

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
    if (!isCustomTime) {
      setTimeLeft(sessionTimePreset * 60);
    } else {
      setTimeLeft(customMin * 60 + customSec);
    }
  }, [sessionTimePreset, isCustomTime, customMin, customSec]);

  useEffect(() => {
    if (isSessionActive && gripCount >= (isCustomTarget ? customTargetInput : targetGrips)) {
      finishSession();
    }
  }, [gripCount, isSessionActive, targetGrips, isCustomTarget, customTargetInput]);

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
    setTimeLeft(isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60);
    setIsSessionActive(true);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setEmgData(Array.from({ length: 150 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
    setCurrentVpp(0);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setGripCount(0);
    setTimeLeft(isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60);
    setEmgData(Array.from({ length: 150 }, (_, i) => ({ time: i, value: 0, raw: 0 })));
    setCurrentVpp(0);
  };

  function finishSession() {
    setIsSessionActive(false);
    const targetSetTime = isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60;
    const actualTime = targetSetTime - timeLeft;
    
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-US'),
      setTime: formatTime(targetSetTime),
      realTime: formatTime(actualTime),
      grips: sessionRef.current.gripCount,
      emg: currentVpp.toFixed(1),
      avg: sessionRef.current.gripCount > 0 ? (actualTime / sessionRef.current.gripCount).toFixed(1) : 0
    };
    
    setHistoryLogs(prev => {
      const updated = [newLog, ...prev];
      if (activeTesterId) {
        localStorage.setItem(`emg_history_${activeTesterId}`, JSON.stringify(updated));
      }
      return updated;
    });
  }

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
          
          // Signal centered at 0 
          const acMv = rawMv - filterRef.current.dcOffset; 
          
          // No software calibration. Display exact hardware measurements (matching Oscilloscope).
          const calibratedMv = acMv;

          // Use calibratedMv for absolute Vmax and Vmin
          if (calibratedMv > maxV) maxV = calibratedMv;
          if (calibratedMv < minV) minV = calibratedMv;

          if (sessionRef.current.isActive) {
            newPoints.push({ time: timeRef.current++, value: rawMv, zeroCenteredValue: acMv, raw: rawVal, rawMv: rawMv, calibratedMv: acMv });

            // เช็ค calibratedMv เทียบกับ threshold (ไม่ต้อง + 2500 แล้ว เพราะหัก offset ออกแล้ว)
            if (!sessionRef.current.isGripping && calibratedMv >= sessionRef.current.startMv) {
               sessionRef.current.isGripping = true;
             } else if (sessionRef.current.isGripping && calibratedMv <= sessionRef.current.stopMv) {
               sessionRef.current.isGripping = false;
               // นับการกำเมื่อทำครบรอบ (เกินเกณฑ์ Start และตกลงมาต่ำกว่า Stop)
               newGripCount++;
               sessionRef.current.gripCount = newGripCount;
             }
          }
        }
      }

      if (newPoints.length > 0) {
        setRawAdc(lastRaw);
        
        if (sessionRef.current.isActive) {
          setEmgData(prevData => {
          const combined = [...prevData, ...newPoints].slice(-150);
          
          if (combined.length > 20) {
            let winMax = -5000, winMin = 5000;
            let zcIndices = [];
            
            for (let i = 1; i < combined.length; i++) {
              // Use value (which now includes +2500 offset) for min/max display
              if (combined[i].value > winMax) winMax = combined[i].value;
              if (combined[i].value < winMin) winMin = combined[i].value;
              
              // Record indices of positive-going zero crossings (must use zero-centered data)
              if (combined[i-1].zeroCenteredValue < 0 && combined[i].zeroCenteredValue >= 0) {
                zcIndices.push(combined[i].time);
              }
            }
            
            if (winMin === 5000) winMin = 0;
            if (winMax === -5000) winMax = 0;
            setCurrentVmax(winMax);
            setCurrentVmin(winMin);
            setCurrentVpp(winMax - winMin);
            
            // Calculate frequency based on zero crossing average period
            // Calibrated sampling interval to 0.066s (~15.15Hz) to match Function Generator 5.0 Hz
            const SAMPLING_INTERVAL = 0.066;
            let newFreq = filterRef.current.freq;
            if (zcIndices.length >= 2) {
              let totalPeriod = 0;
              for (let i = 1; i < zcIndices.length; i++) {
                totalPeriod += (zcIndices[i] - zcIndices[i-1]);
              }
              const periodInSamples = totalPeriod / (zcIndices.length - 1);
              const periodInSeconds = periodInSamples * SAMPLING_INTERVAL;
              newFreq = 1 / periodInSeconds;
            } else if (zcIndices.length === 0 && combined.length > 100) {
              newFreq = 0;
            }
            
            // Clamp frequency to prevent extreme calibration values
            if (newFreq < 0.5 && newFreq > 0) newFreq = 0.5;
            if (newFreq > 50) newFreq = 50.0;
            
            // Update filterRef freq only if > 0 so that calibration doesn't blow up
            if (newFreq > 0) {
              filterRef.current.freq = newFreq;
            }
            setCurrentFreq(newFreq);
          }
          
          return combined;
        });
        setDcOffsetState(filterRef.current.dcOffset);
        }

        if (sessionRef.current.isActive && newGripCount !== gripCount) setGripCount(newGripCount);
      }
    };

    characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    characteristic.startNotifications();

    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    };
  }, [characteristic]);

  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTesters = testers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.includes(searchQuery)
  );

  const renderTesterRepository = () => (
    <div>
      <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>คลังข้อมูลผู้ทดสอบ</h2>
          <p>จัดการและค้นหารายชื่อผู้เข้ารับการทดสอบทั้งหมด</p>
        </div>
        <button className="btn btn-teal" onClick={() => setIsAddingTester(true)}>
          + เพิ่มทดสอบใหม่ (Add Tester)
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="ค้นหาด้วยชื่อหรือ ID..." 
          className="form-control"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'white' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredTesters.length > 0 ? (
          filteredTesters.map(t => (
            <div key={t.id} className="tester-card" style={{ border: activeTesterId === t.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)' }}>
              <div className="tester-card-header">
                <div className="tester-avatar">
                  {t.name.charAt(0)}
                </div>
                <div className="tester-info">
                  <h3>{t.name}</h3>
                  <p>{t.age} ปี | {t.gender.split(' / ')[0]} | มือ{t.hand.split(' / ')[0]}</p>
                </div>
              </div>
              <div className="tester-actions">
                <button 
                  className={`btn-select ${activeTesterId === t.id ? 'active' : ''}`} 
                  onClick={() => handleSelectTester(t.id)}
                  style={{
                    backgroundColor: activeTesterId === t.id ? 'var(--accent-teal)' : 'transparent',
                    color: activeTesterId === t.id ? 'white' : 'var(--text-primary)',
                    border: activeTesterId === t.id ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  {activeTesterId === t.id ? (lang === 'th' ? '✓ เลือกแล้ว' : '✓ Selected') : (lang === 'th' ? 'ยังไม่ได้เลือก' : 'Not Selected')}
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-edit" onClick={() => alert('ฟังก์ชันแก้ไขกำลังอยู่ในระหว่างการพัฒนา')}>
                    ✎ แก้ไข
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteTester(t.id)}>
                    🗑 ลบ
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>ยังไม่มีข้อมูลผู้ทดสอบ คลิก 'เพิ่มทดสอบใหม่' เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {isAddingTester && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>เพิ่มผู้ทดสอบใหม่ (Add Tester)</h3>
              <button className="modal-close" onClick={() => setIsAddingTester(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTester}>
              <div className="form-group">
                <label>ชื่อ-นามสกุล (Name)</label>
                <input type="text" className="form-control" value={testName} onChange={e => setTestName(e.target.value)} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>อายุ (Age)</label>
                  <input type="number" min="1" className="form-control" value={testAge} onChange={e => setTestAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>เพศ (Gender)</label>
                  <select className="form-control" value={testGender} onChange={e => setTestGender(e.target.value)} required>
                    <option value="ชาย / Male">ชาย / Male</option>
                    <option value="หญิง / Female">หญิง / Female</option>
                    <option value="อื่นๆ / Other">อื่นๆ / Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>น้ำหนัก (Weight) - kg</label>
                  <input type="number" min="1" className="form-control" value={testWeight} onChange={e => setTestWeight(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>ส่วนสูง (Height) - cm</label>
                  <input type="number" min="1" className="form-control" value={testHeight} onChange={e => setTestHeight(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>ข้างที่ทดสอบ (Testing Hand)</label>
                <select className="form-control" value={testHand} onChange={e => setTestHand(e.target.value)} required>
                  <option value="ขวา / Right">ขวา / Right</option>
                  <option value="ซ้าย / Left">ซ้าย / Left</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddingTester(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-teal">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderConnection = () => (
    <div className="dashboard-grid">
      <div className="card banner-card col-span-12" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className={`metric-icon ${isConnected ? 'teal' : 'gray'}`} style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
            <Bluetooth size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: isConnected ? 'var(--accent-teal)' : 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isConnected ? 'เชื่อมต่อแล้ว' : t.notConnected}
          </h3>
          <div className="subtitle" style={{ fontSize: '1.1rem' }}>{t.deviceSub}</div>
        </div>
        <button 
          className={`btn ${isConnected ? 'btn-outline' : 'btn-teal'}`} 
          onClick={handleConnect}
          style={{ borderRadius: '24px', padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}
        >
          {isConnected ? t.disconnectBtn : t.connectBtn}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-grid">
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
              <YAxis domain={[0, 5000]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              
              <ReferenceLine y={startGripMv + dcOffsetState} stroke="var(--accent-teal)" strokeDasharray="4 4" 
                label={{ position: 'right', value: `${t.startAt} ${(startGripMv + dcOffsetState).toFixed(0)} mV`, fill: 'var(--accent-teal)', fontSize: 12 }} />
              <ReferenceLine y={stopGripMv + dcOffsetState} stroke="var(--accent-orange)" strokeDasharray="4 4" 
                label={{ position: 'right', value: `${t.stopAt} ${(stopGripMv + dcOffsetState).toFixed(0)} mV`, fill: 'var(--accent-orange)', fontSize: 12, dy: -15 }} />
                
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
          <span>{isCustomTime ? `${customMin}:${customSec.toString().padStart(2, '0')} นาที` : `${sessionTimePreset} นาที`}</span>
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
                <button key={m} className={`pill ${!isCustomTime && sessionTimePreset === m ? 'active' : ''}`} onClick={() => { setSessionTimePreset(m); setIsCustomTime(false); }}>
                  {m} นาที
                </button>
              ))}
              <button className={`pill ${isCustomTime ? 'active' : ''}`} onClick={() => setIsCustomTime(true)}>{t.custom}</button>
            </div>
            {isCustomTime && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" min="0" value={customMin} onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> นาที
                <input type="number" min="0" max="59" value={customSec} onChange={(e) => setCustomSec(parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> วินาที
              </div>
            )}
          </div>
        </div>

        <div className="card setting-card">
          <div className="setting-icon"><Hand size={20} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem' }}>{t.setTargetTitle}</h3>
            <p className="subtitle">{t.setTargetSub}</p>
            <div className="preset-pills">
              {[10, 20, 30, 50].map(c => (
                <button key={c} className={`pill ${!isCustomTarget && targetGrips === c ? 'active' : ''}`} onClick={() => { setTargetGrips(c); setIsCustomTarget(false); }}>
                  {c} ครั้ง
                </button>
              ))}
              <button className={`pill ${isCustomTarget ? 'active' : ''}`} onClick={() => setIsCustomTarget(true)}>{t.custom}</button>
            </div>
            {isCustomTarget && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" min="1" value={customTargetInput} onChange={(e) => setCustomTargetInput(parseInt(e.target.value) || 1)} style={{ width: '80px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> ครั้ง
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem', alignSelf: 'flex-start' }}>
          <RefreshCw size={16} /> {t.resetDefault}
        </div>
      </div>
    </div>
  );

  const getWeeklyData = () => {
    const daysTh = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = lang === 'th' ? daysTh : daysEn;
    const data = days.map(d => ({ name: d, grips: 0 }));
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    historyLogs.forEach(log => {
      const d = new Date(log.id);
      if (d >= oneWeekAgo) {
        let dayIdx = d.getDay() - 1;
        if (dayIdx < 0) dayIdx = 6;
        data[dayIdx].grips += log.grips;
      }
    });
    return data;
  };

  const getMonthlyData = () => {
    const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = lang === 'th' ? monthsTh : monthsEn;
    
    const data = months.map(m => ({ name: m, totalGrips: 0, count: 0, avg: 0 }));
    const currentYear = new Date().getFullYear();
    
    historyLogs.forEach(log => {
      const d = new Date(log.id);
      if (d.getFullYear() === currentYear) {
        const mIdx = d.getMonth();
        data[mIdx].totalGrips += log.grips;
        data[mIdx].count += 1;
      }
    });
    
    data.forEach(m => {
      if (m.count > 0) m.avg = Math.round(m.totalGrips / m.count);
    });
    return data;
  };

  const renderHistory = () => {
    const totalGripsAllTime = historyLogs.reduce((acc, curr) => acc + curr.grips, 0);
    const avgGrips = historyLogs.length > 0 ? Math.round(totalGripsAllTime / historyLogs.length) : 0;

    return (
      <div>
        <div className="page-title">
          <h2>{t.histMainTitle}</h2>
          <p>{t.histMainSub}</p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem' }}>{t.histStatTitle}</h3>
              <div className="subtitle">
                {lang === 'th' ? `เฉลี่ย ${avgGrips} ครั้ง/เซสชัน` : `Average ${avgGrips} grips/session`}
              </div>
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '20px', padding: '4px' }}>
              <button className={`pill ${histPeriod === 'week' ? 'active' : ''}`} onClick={() => setHistPeriod('week')} style={{ border: 'none', background: histPeriod === 'week' ? 'white' : 'transparent', color: histPeriod === 'week' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: histPeriod === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>{t.week}</button>
              <button className={`pill ${histPeriod === 'month' ? 'active' : ''}`} onClick={() => setHistPeriod('month')} style={{ border: 'none', background: histPeriod === 'month' ? 'white' : 'transparent', color: histPeriod === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: histPeriod === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>{t.month}</button>
            </div>
          </div>
          
          <div style={{ height: '250px', width: '100%' }}>
            {historyLogs.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {t.noData}
              </div>
            ) : histPeriod === 'week' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyData()} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,188,163,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="grips" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} name={lang === 'th' ? 'จำนวนกำมือ (ครั้ง)' : 'Grips'} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMonthlyData()} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="avg" stroke="var(--accent-orange)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-orange)' }} activeDot={{ r: 6 }} name={lang === 'th' ? 'เฉลี่ย (ครั้ง)' : 'Avg Grips'} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            {histPeriod === 'week' ? (lang === 'th' ? 'วันในสัปดาห์ (7 วันล่าสุด)' : 'Days of Week (Last 7 Days)') : (lang === 'th' ? 'เดือน (ปีปัจจุบัน)' : 'Months (Current Year)')}
          </div>
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
            {historyLogs.length > 0 ? (
              historyLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{log.setTime}</td>
                  <td>{log.realTime}</td>
                  <td>{log.grips}</td>
                  <td>{log.emg}</td>
                  <td>{log.avg}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  {t.noHistory}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-icon">
              <Activity size={24} />
            </div>
            <div className="logo-text">
              <h1>{t.appTitle}</h1>
            </div>
          </div>
        </div>

        <div className="sidebar-status">
          <p className="status-label">ผู้ทดสอบที่กำลังทดสอบ (Active)</p>
          <h4 className="status-value">{activeTester ? activeTester.name : "ยังไม่ได้เลือก (None)"}</h4>
          
          <p className="status-label">สถานะอุปกรณ์</p>
          <h4 className={`status-value ${isConnected ? 'text-teal' : 'text-red'}`}>
            {isConnected ? 'เชื่อมต่อแล้ว' : t.notConnected}
          </h4>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'testers' ? 'active' : ''}`} onClick={() => setActiveTab('testers')}>
            <User size={18} /> {t.tabTesters}
          </button>
          <button className={`nav-item ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => setActiveTab('connect')}>
            <Bluetooth size={18} /> {t.tabConnect}
          </button>
          <button className={`nav-item ${activeTab === 'monitor' ? 'active' : ''}`} onClick={() => setActiveTab('monitor')}>
            <Activity size={18} /> {t.tabMonitor}
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={18} /> {t.tabSettings}
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={18} /> {t.tabHistory}
          </button>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
           <button className="lang-toggle" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
              <Globe size={16} /> {lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            </button>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'connect' && renderConnection()}
        {activeTab === 'monitor' && renderDashboard()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'testers' && renderTesterRepository()}
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line 
} from 'recharts';
import { 
  Activity, Settings as SettingsIcon, Play, Square, Bluetooth, BluetoothConnected, 
  History, Globe, Zap, Hand, Clock, BarChart2, Target, SlidersHorizontal, RefreshCw,
  UserPlus, User, Lock, LogOut, Users, Check, Volume2, VolumeX
} from 'lucide-react';
import WaveformCanvas from './components/WaveformCanvas';
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
    deviceSub: "อุปกรณ์ EMG ผ่าน BLE (ESP32)",
    connectBtn: "เชื่อมต่อ Bluetooth",
    disconnectBtn: "ยกเลิกการเชื่อมต่อ",
    emgVal: "Vaverage",
    emgSub: "EMG · Raw ADC: 0",
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
    chartY: "แรงดันสัญญาณ EMG (V)",
    scaleLabel: "สเกล:",
    stopAt: "หยุดทำ",
    startAt: "เริ่มทำ",
    timeBottom: "Time",
    controlTitle: "ควบคุมการฝึก",
    controlSub: "ตั้งเวลาและเริ่ม/หยุดเซสชัน",
    soundBiofeedback: "เสียงตอบรับทางชีวภาพ",
    soundDing: "เสียงติ๊ง",
    soundMute: "ปิดเสียง",
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
    colEMG: "Vaverage (V)",
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
    authLogout: "ออกจากระบบ",
    
    // Missing additions
    activeTesterTitle: "ผู้ทดสอบที่กำลังทดสอบ (Active)",
    activeTesterNone: "ยังไม่ได้เลือก (None)",
    deviceStatusTitle: "สถานะอุปกรณ์",
    repoTitle: "คลังข้อมูลผู้ทดสอบ",
    repoSub: "จัดการและค้นหารายชื่อผู้เข้ารับการทดสอบทั้งหมด",
    repoAddBtn: "+ เพิ่มทดสอบใหม่ (Add Tester)",
    repoSearch: "ค้นหาด้วยชื่อหรือ ID...",
    btnEdit: "แก้ไข",
    btnDelete: "ลบ",
    unitYears: "ปี",
    unitMin: "นาที",
    unitSec: "วินาที",
    unitGrips: "ครั้ง",
    repoNoData: "ยังไม่มีข้อมูลผู้ทดสอบ คลิก 'เพิ่มทดสอบใหม่' เพื่อเริ่มต้น",
    repoSelected: "✓ เลือกแล้ว (Selected)",
    repoNotSelected: "เลือก (Select)",
    addTesterTitle: "เพิ่มผู้ทดสอบใหม่ (Add Tester)",
    editTesterTitle: "แก้ไขข้อมูลผู้ทดสอบ (Edit Tester)",
    addTesterName: "ชื่อ-นามสกุล (Name)",
    addTesterAge: "อายุ (Age)",
    addTesterGender: "เพศ (Gender)",
    addTesterWeight: "น้ำหนัก (Weight) - kg",
    addTesterHeight: "ส่วนสูง (Height) - cm",
    addTesterHand: "ข้างที่ทดสอบ (Testing Hand)",
    addTesterCancel: "ยกเลิก",
    addTesterSave: "บันทึก"
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
    deviceSub: "EMG device via BLE (ESP32)",
    connectBtn: "Connect Bluetooth",
    disconnectBtn: "Disconnect",
    emgVal: "Vaverage",
    emgSub: "EMG · Raw ADC: 0",
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
    chartY: "EMG Signal (V)",
    scaleLabel: "Scale:",
    stopAt: "Stop at",
    startAt: "Start at",
    timeBottom: "Time",
    controlTitle: "Session Control",
    controlSub: "Set time and start/stop session",
    soundBiofeedback: "Audio Biofeedback",
    soundDing: "Ding Sound",
    soundMute: "Muted",
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
    colEMG: "Vaverage (V)",
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
    authLogout: "Logout",
    
    // Missing additions
    activeTesterTitle: "Active Tester",
    activeTesterNone: "None",
    deviceStatusTitle: "Device Status",
    repoTitle: "Tester Repository",
    repoSub: "Manage and search all tester profiles",
    repoAddBtn: "+ Add Tester",
    repoSearch: "Search by name or ID...",
    btnEdit: "Edit",
    btnDelete: "Delete",
    unitYears: "years",
    unitMin: "min",
    unitSec: "sec",
    unitGrips: "grips",
    repoNoData: "No testers yet. Click 'Add Tester' to begin.",
    repoSelected: "✓ Selected",
    repoNotSelected: "Select",
    addTesterTitle: "Add Tester",
    editTesterTitle: "Edit Tester",
    addTesterName: "Name",
    addTesterAge: "Age",
    addTesterGender: "Gender",
    addTesterWeight: "Weight (kg)",
    addTesterHeight: "Height (cm)",
    addTesterHand: "Testing Hand",
    addTesterCancel: "Cancel",
    addTesterSave: "Save"
  }
};

function App() {
  const [lang, setLang] = useState('th');
  const t = i18n[lang];
  const [activeTab, setActiveTab] = useState('testers');

  // Testers State
  const initialTesters = [
    { id: '1', name: 'นน', age: '25', gender: 'ชาย / Male', weight: '65', height: '170', hand: 'ขวา / Right', createdAt: new Date().toISOString() },
    { id: '2', name: 'ชล', age: '22', gender: 'หญิง / Female', weight: '50', height: '160', hand: 'ขวา / Right', createdAt: new Date().toISOString() },
    { id: '3', name: 'คิม', age: '28', gender: 'ชาย / Male', weight: '70', height: '175', hand: 'ซ้าย / Left', createdAt: new Date().toISOString() },
    { id: '4', name: 'ขวัญ', age: '30', gender: 'หญิง / Female', weight: '55', height: '165', hand: 'ขวา / Right', createdAt: new Date().toISOString() }
  ];

  const [testers, setTesters] = useState(() => {
    const saved = localStorage.getItem('emg_testers');
    return saved ? JSON.parse(saved) : initialTesters;
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

  // Edit Tester Form
  const [editingTester, setEditingTester] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('ชาย / Male');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editHand, setEditHand] = useState('ขวา / Right');

  const handleOpenEditTester = (tester) => {
    setEditingTester(tester);
    setEditName(tester.name || '');
    setEditAge(tester.age || '');
    setEditGender(tester.gender || 'ชาย / Male');
    setEditWeight(tester.weight || '');
    setEditHeight(tester.height || '');
    setEditHand(tester.hand || 'ขวา / Right');
  };

  const handleSaveEditTester = (e) => {
    e.preventDefault();
    if (!editingTester || !editName.trim()) return;

    const updatedTesters = testers.map(item => {
      if (item.id === editingTester.id) {
        return {
          ...item,
          name: editName.trim(),
          age: editAge,
          gender: editGender,
          weight: editWeight,
          height: editHeight,
          hand: editHand
        };
      }
      return item;
    });

    setTesters(updatedTesters);
    localStorage.setItem('emg_testers', JSON.stringify(updatedTesters));
    setEditingTester(null);
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
  
  // Calibration State
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibTimeLeft, setCalibTimeLeft] = useState(0);

  // Data & Signal State
  const [emgData, setEmgData] = useState([]);
  const [currentVavg, setCurrentVavg] = useState(0);
  const [currentVpp, setCurrentVpp] = useState(0);
  const [currentVmax, setCurrentVmax] = useState(0);
  const [currentVmin, setCurrentVmin] = useState(0);
  const [currentFreq, setCurrentFreq] = useState(0);
  const [rawAdc, setRawAdc] = useState(0);
  const [dcOffsetState, setDcOffsetState] = useState(1650);

  // Settings State
  const [sessionTimePreset, setSessionTimePreset] = useState(5);
  const [targetGrips, setTargetGrips] = useState(20);
  const [startGripMv, setStartGripMv] = useState(978.0);
  const [stopGripMv, setStopGripMv] = useState(880.0);
  const [triggerMult, setTriggerMult] = useState(1.25);
  const [releaseMult, setReleaseMult] = useState(1.10);

  // Waveform Scale State (±1V, ±2V, ±4V)
  const [waveformScale, setWaveformScale] = useState(() => {
    try {
      const saved = localStorage.getItem('emg_waveform_scale');
      return saved ? Number(saved) : 4;
    } catch {
      return 4;
    }
  });

  const handleScaleChange = (scale) => {
    setWaveformScale(scale);
    try {
      localStorage.setItem('emg_waveform_scale', scale);
    } catch {}
  };

  // Audio Biofeedback ("Ding!" Chime) & Visual Flash State
  const audioCtxRef = useRef(null);
  const soundEnabledRef = useRef(true);
  const [isGripFlash, setIsGripFlash] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('emg_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const initOrResumeAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn("AudioContext init error:", e);
      return null;
    }
  };

  const playDingSound = () => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = initOrResumeAudio();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master output gain envelope for natural bell chime
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 0.003); // Quick crisp strike
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65); // Silky smooth decay
      masterGain.connect(ctx.destination);

      // 1. Primary chime tone (High C, C6 = 1046.5 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      osc1.connect(masterGain);

      // 2. High harmonic shimmer (C7 = 2093 Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2093, now);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.28, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      // 3. Crystal bell sparkle (G7 = 3136 Hz)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(3135.96, now);
      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.12, now);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc3.connect(gain3);
      gain3.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
      osc3.stop(now + 0.7);
    } catch (err) {
      console.warn("Could not play ding sound:", err);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('emg_sound_enabled', String(nextState));
    } catch {}
    soundEnabledRef.current = nextState;
    if (nextState) {
      setTimeout(() => playDingSound(), 50);
    }
  };

  // Refs for real-time processing
  const debugTextRef = useRef(null);
  const bufferRef = useRef("");
  const timeRef = useRef(0);
  const filterRef = useRef({ dcOffset: 1650, freq: 5.0 });
  const timestampRef = useRef({ lastTime: 0, sampleCount: 0, measuredInterval: 0.002 });
  const telemetryRef = useRef({ vpp: 0 }); // Store latest Vpp for software gain
  const waveformRef = useRef(null);
  
  const calibRef = useRef({
    isActive: false,
    rawBuffer: [],
  });

  const sessionRef = useRef({ 
    isActive: false, 
    startMv: 978.0, 
    stopMv: 880.0,
    isGripping: false,
    gripCount: 0,
    lastGripTime: 0,
    startTime: 0,
    finishReason: '',
    finishTime: 0,
    rawBuffer: [],
    peakHoldBuffer: [],
    envelopeBuffer: [],
    currentEnvelope: 0,
    releaseTime: 0,
    maBuffer: [],
    emaValue: 0,
    lastUiUpdate: 0,
    lastChartUpdate: 0,
    sampleCount: 0,
  });

  const [completionModal, setCompletionModal] = useState({ show: false, reason: '', grips: 0, time: 0 });
  const [forceFinish, setForceFinish] = useState(false);
  const settingsRef = useRef({ targetDuration: 0, targetGrips: 0 });

  useEffect(() => {
    settingsRef.current.targetDuration = isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60;
    settingsRef.current.targetGrips = isCustomTarget ? customTargetInput : targetGrips;
  }, [isCustomTime, customMin, customSec, sessionTimePreset, isCustomTarget, customTargetInput, targetGrips]);

  useEffect(() => {
    if (forceFinish) {
      setForceFinish(false);
      finishSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFinish]);

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
    const tg = isCustomTarget ? customTargetInput : targetGrips;
    if (isSessionActive && tg > 0 && gripCount >= tg) {
      finishSession();
    }
  }, [gripCount, isSessionActive, targetGrips, isCustomTarget, customTargetInput]);

  const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
  const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      if (settingsRef.current.targetDuration === 0) {
        interval = setInterval(() => {
          setTimeLeft(prev => prev + 1);
        }, 1000);
      } else {
        if (timeLeft > 0) {
          interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
          }, 1000);
        } else if (timeLeft === 0) {
          finishSession();
        }
      }
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  // Calibration Timer
  useEffect(() => {
    let interval;
    if (isCalibrating && calibTimeLeft > 0) {
      interval = setInterval(() => {
        setCalibTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isCalibrating && calibTimeLeft === 0) {
      finishCalibration();
    }
    return () => clearInterval(interval);
  }, [isCalibrating, calibTimeLeft]);

  const handleStartCalibration = () => {
    if (!isConnected) {
      alert(lang === 'th' ? 'กรุณาเชื่อมต่ออุปกรณ์ก่อน' : 'Please connect a device first');
      return;
    }
    setIsCalibrating(true);
    setCalibTimeLeft(4); // 4 seconds calibration
    calibRef.current = { isActive: true, rawBuffer: [] };
  };

  const finishCalibration = () => {
    setIsCalibrating(false);
    calibRef.current.isActive = false;
    
    if (calibRef.current.rawBuffer.length > 0) {
      const vals = calibRef.current.rawBuffer;
      // Filter out extreme spikes by sorting and getting the median
      vals.sort((a, b) => a - b);
      const baseline = vals[Math.floor(vals.length / 2)];
      
      // Calculate UPPER_THRESHOLD to be 350mV above baseline, and LOWER_THRESHOLD 150mV above baseline
      const newStart = baseline + 350;
      const newStop = baseline + 150;
      
      setStartGripMv(newStart);
      setStopGripMv(newStop);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    if (!isConnected) return;
    initOrResumeAudio();
    setGripCount(0);
    sessionRef.current.gripCount = 0;
    sessionRef.current.isGripping = false;
    sessionRef.current.lastGripTime = 0;
    sessionRef.current.envelopeMv = 0;
    sessionRef.current.releaseHoldStartTime = 0;
    sessionRef.current.rawBuffer = [];
    sessionRef.current.peakHoldBuffer = [];
    sessionRef.current.envelopeBuffer = [];
    sessionRef.current.currentEnvelope = 0;
    sessionRef.current.releaseTime = 0;
    sessionRef.current.maBuffer = [];
    sessionRef.current.emaValue = 0;
    sessionRef.current.startTime = Date.now();
    sessionRef.current.isActive = true;
    setForceFinish(false);
    setTimeLeft(isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60);
    setIsSessionActive(true);
    waveformRef.current?.reset();
    setCurrentVpp(0);
    setCurrentVavg(0);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    sessionRef.current.isActive = false;
    waveformRef.current?.reset();
    setCurrentVpp(0);
    setCurrentVavg(0);
    sessionRef.current.peakHoldBuffer = [];
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    sessionRef.current.isActive = false;
    setGripCount(0);
    setTimeLeft(isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60);
    waveformRef.current?.reset();
    setCurrentVpp(0);
    setCurrentVavg(0);
    sessionRef.current.peakHoldBuffer = [];
  };

  function finishSession() {
    setIsSessionActive(false);
    sessionRef.current.isActive = false;
    waveformRef.current?.reset();
    const targetSetTime = isCustomTime ? customMin * 60 + customSec : sessionTimePreset * 60;
    
    let actualTime;
    let reason = 'manual';
    if (sessionRef.current.finishTime > 0) {
      actualTime = Math.round(sessionRef.current.finishTime);
      reason = sessionRef.current.finishReason;
    } else {
      if (targetSetTime === 0) {
         actualTime = timeLeft;
      } else {
         actualTime = targetSetTime - timeLeft;
      }
    }
    
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-US'),
      setTime: targetSetTime === 0 ? (lang === 'th' ? 'ไม่จำกัด' : 'Unlimited') : formatTime(targetSetTime),
      realTime: formatTime(actualTime),
      grips: sessionRef.current.gripCount,
      emg: currentVavg.toFixed(2),
      avg: sessionRef.current.gripCount > 0 ? (actualTime / sessionRef.current.gripCount).toFixed(1) : 0
    };
    
    setHistoryLogs(prev => {
      const updated = [newLog, ...prev];
      if (activeTesterId) {
        localStorage.setItem(`emg_history_${activeTesterId}`, JSON.stringify(updated));
      }
      return updated;
    });

    if (reason === 'grip' || reason === 'time') {
      setCompletionModal({ show: true, reason, grips: sessionRef.current.gripCount, time: actualTime });
    }
    
    sessionRef.current.finishTime = 0;
    sessionRef.current.finishReason = '';
    setCurrentVavg(0);
    sessionRef.current.peakHoldBuffer = [];
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

    // Known BLE Service/Characteristic UUIDs to try
    const KNOWN_SERVICES = [
      { service: '0000ffe0-0000-1000-8000-00805f9b34fb', char: '0000ffe1-0000-1000-8000-00805f9b34fb' }, // HM-10 / many ESP32
      { service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e', char: '6e400003-b5a3-f393-e0a9-e50e24dcca9e' }, // Nordic UART (NUS) TX
      { service: '4fafc201-1fb5-459e-8fcc-c5c9c331914b', char: 'beb5483e-36e1-4688-b7f5-ea07361b26a8' }, // Common ESP32 example
    ];

    try {
      if (!navigator.bluetooth) throw new Error("Web Bluetooth API is not supported.");
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: KNOWN_SERVICES.map(s => s.service)
      });

      const server = await btDevice.gatt.connect();
      btDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setIsSessionActive(false);
        setDevice(null);
        setCharacteristic(null);
      });

      // Try each known service UUID
      let foundChar = null;
      for (const known of KNOWN_SERVICES) {
        try {
          const service = await server.getPrimaryService(known.service);
          foundChar = await service.getCharacteristic(known.char);
          console.log(`Connected via service: ${known.service}`);
          break;
        } catch (e) {
          console.log(`Service ${known.service} not found, trying next...`);
        }
      }

      // If none of the known UUIDs worked, auto-discover
      if (!foundChar) {
        console.log("Known services not found, auto-discovering...");
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            try {
              const chars = await service.getCharacteristics();
              for (const c of chars) {
                if (c.properties.notify || c.properties.read) {
                  foundChar = c;
                  console.log(`Auto-discovered service: ${service.uuid}, char: ${c.uuid}`);
                  break;
                }
              }
              if (foundChar) break;
            } catch (e) { /* skip this service */ }
          }
        } catch (e) {
          console.error("Auto-discovery failed:", e);
        }
      }

      if (foundChar) {
        setCharacteristic(foundChar);
        setDevice(btDevice);
        setIsConnected(true);
      } else {
        alert(lang === 'th' 
          ? 'ไม่พบ Service/Characteristic ที่รองรับบนอุปกรณ์นี้ กรุณาตรวจสอบโค้ดฝั่ง ESP32' 
          : 'No supported Service/Characteristic found on this device. Check ESP32 code.');
        if (btDevice.gatt.connected) btDevice.gatt.disconnect();
      }
    } catch (error) {
      console.error(error);
      if (error.name !== 'NotFoundError') {
        alert(lang === 'th' 
          ? `เชื่อมต่อไม่สำเร็จ: ${error.message}` 
          : `Connection failed: ${error.message}`);
      }
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

      if (bufferRef.current.length > 256) {
        bufferRef.current = "";
      }

      // ป้องกันคิวตกค้างสะสม: หากมีข้อมูลค้างเกิน 30 บรรทัด ให้ตัดทิ้งข้อมูลเก่าและหยิบเฉพาะ 15 ค่าสดล่าสุดทันที
      if (lines.length > 30) {
        lines = lines.slice(-15);
      }
      
      let newPoints = [];
      let lastRaw = 0;

      for (let line of lines) {
        line = line.trim();
        if (line !== "" && !isNaN(line)) {
          const rawVal = parseFloat(line); // Assuming ADC 12-bit
          lastRaw = rawVal;
          
          // 1. แปลงค่า ADC เป็นแรงดันไฟฟ้าจริง (0 - 3300 mV / 0 - 3.3V) ตรงจากขา ADC ของ ESP32
          const rawMv = (rawVal / 4095.0) * 3300.0;
          const rawV = rawMv / 1000.0;

          // 2. คำนวณ DC Baseline ศูนย์กลางของสัญญาณ (Low-Pass Filter) เพื่อดึงระดับ DC ออก (AC Coupling)
          if (sessionRef.current.dcBaseline === undefined) {
             sessionRef.current.dcBaseline = rawMv;
          }
          // อัปเดต Baseline แบบ Low-Pass Filter
          sessionRef.current.dcBaseline = (sessionRef.current.dcBaseline * 0.998) + (rawMv * 0.002);
          
          // 3. สัญญาณ AC แท้จริง 100% จากฮาร์ดแวร์ (ไม่มีการสร้างข้อมูลเท็จ ไม่มีการสะท้อนกระจก)
          const plotMv = rawMv - sessionRef.current.dcBaseline;
          const absMv = Math.abs(plotMv);

          // 4. ลอจิกคำนวณ Envelope สำหรับนับจำนวนการกำมือ (Envelope Follower: Fast Attack & Smooth Decay)
          // สัญญาณ AC ความถี่สูงแกว่งตัด 0V ตลอดเวลา Envelope Follower จะช่วยรักษาความต่อเนื่องของลูกคลื่น
          // ป้องกันไม่ให้การตัด 0V ภายในจังหวะกำมือเดียวกันถูกนับซ้ำซ้อน
          if (sessionRef.current.envelopeMv === undefined) {
            sessionRef.current.envelopeMv = 0;
          }
          if (absMv > sessionRef.current.envelopeMv) {
            // Fast Attack (~15ms): เกาะยอดคลื่นทันทีเมื่อกล้ามเนื้อเริ่มออกแรง
            sessionRef.current.envelopeMv = (0.4 * absMv) + (0.6 * sessionRef.current.envelopeMv);
          } else {
            // Smooth Decay (~120-150ms): ยึดระดับยอดคลื่นไว้ ไม่ให้ตกไปแตะ 0 ในระหว่างที่ยังกำมืออยู่
            sessionRef.current.envelopeMv = sessionRef.current.envelopeMv * 0.965;
          }
          const envelopeMv = sessionRef.current.envelopeMv;

          // Debug UI update
          if (debugTextRef.current) {
            let stateName = sessionRef.current.isActive 
               ? (sessionRef.current.isGripping ? "GRIPPING" : "TRAINING") 
               : "IDLE";
            
            debugTextRef.current.innerText = `State: ${stateName} | Env: ${envelopeMv.toFixed(0)}mV | Thr: ${sessionRef.current.startMv.toFixed(0)}mV`;
          }
          
          if (calibRef.current.isActive) {
            calibRef.current.rawBuffer.push(envelopeMv);
          }

          sessionRef.current.sampleCount = (sessionRef.current.sampleCount || 0) + 1;

          // เก็บข้อมูล buffer และคำนวณ Vaverage เฉพาะเมื่อกำลังฝึกอยู่เท่านั้น (หลังกดเริ่มฝึก)
          if (sessionRef.current.isActive) {
            const emgVolt = absMv / 1000.0;
            sessionRef.current.peakHoldBuffer.push(emgVolt);
            if (sessionRef.current.peakHoldBuffer.length > 500) {
              sessionRef.current.peakHoldBuffer.shift();
            }

            const now = Date.now();
            const elapsedSeconds = (now - sessionRef.current.startTime) / 1000;

            // ส่งข้อมูลจริงตรงจาก ADC เข้าสู่ WaveformCanvas
            waveformRef.current?.pushSample(plotMv, elapsedSeconds);

            // 2-State Machine with Refractory Debounce & Release Confirmation
            // รับประกันว่าการกำมือ 1 ครั้ง (ลูกคลื่น 1 ลูก) จะถูกนับเป็น 1 ครั้งอย่างแม่นยำ
            const triggerThr = Number(sessionRef.current.startMv);
            const releaseThr = Number(sessionRef.current.stopMv);
            const nowMs = Date.now();

            if (!sessionRef.current.isGripping) {
              const timeSinceLastGrip = nowMs - (sessionRef.current.lastGripTime || 0);
              // ต้องเกินเกณฑ์เริ่มกำ และพ้นช่วง Debounce อย่างน้อย 350ms หลังจากการกำครั้งก่อน
              if (envelopeMv >= triggerThr && timeSinceLastGrip >= 350) {
                sessionRef.current.isGripping = true;
                sessionRef.current.lastGripTime = nowMs;
                sessionRef.current.releaseHoldStartTime = 0;
                sessionRef.current.gripCount++;
                setGripCount(prev => prev + 1);
                playDingSound();
                setIsGripFlash(true);
                setTimeout(() => setIsGripFlash(false), 350);
              }
            } else {
              // อยู่ในสถานะกำลังกำมือ:
              // ต้องปล่อยมือจริง (Envelope ลดต่ำกว่า releaseThr ต่อเนื่องอย่างน้อย 100ms) ถึงจะปลดสถานะกลับเป็นปล่อยมือ
              if (envelopeMv < releaseThr) {
                if (!sessionRef.current.releaseHoldStartTime) {
                  sessionRef.current.releaseHoldStartTime = nowMs;
                } else if (nowMs - sessionRef.current.releaseHoldStartTime >= 100) {
                  sessionRef.current.isGripping = false;
                  sessionRef.current.releaseHoldStartTime = 0;
                }
              } else {
                sessionRef.current.releaseHoldStartTime = 0;
              }
            }
            
            // Auto-stop conditions
            const reachedGrips = settingsRef.current.targetGrips > 0 && sessionRef.current.gripCount >= settingsRef.current.targetGrips;
            const reachedTime = settingsRef.current.targetDuration > 0 && elapsedSeconds >= settingsRef.current.targetDuration;
            
            if (reachedGrips || reachedTime) {
               sessionRef.current.isActive = false;
               sessionRef.current.finishReason = reachedGrips ? 'grip' : 'time';
               sessionRef.current.finishTime = elapsedSeconds;
               setForceFinish(true);
            }
          }
        }
      }

      // 3. อัปเดตตัวเลขพารามิเตอร์ Vaverage เฉพาะเมื่อกำลังฝึกอยู่เท่านั้น (หลังกดเริ่มฝึก)
      if (sessionRef.current.isActive && sessionRef.current.peakHoldBuffer.length > 0) {
        const nowUI = Date.now();
        if (nowUI - sessionRef.current.lastUiUpdate >= 100) {
          sessionRef.current.lastUiUpdate = nowUI;
          
          const bufferV = sessionRef.current.peakHoldBuffer;
          const recentSamples = bufferV.slice(-150); // 150 จุดล่าสุด (~0.3 วินาที)
          const sumV = recentSamples.reduce((sum, val) => sum + val, 0);
          const Vavg = sumV / (recentSamples.length || 1);
          
          // แสดงค่าแรงดันสัญญาณกล้ามเนื้อจริง ตอบสนองต่อการออกแรงกำมือแบบ Real-time
          setCurrentVavg(Vavg);
          telemetryRef.current.vavg = Vavg;
          
          if (sessionRef.current.dcBaseline) setDcOffsetState(sessionRef.current.dcBaseline);
        }
      }

      // อัปเดต Raw ADC ทุก 100ms
      if (lastRaw > 0) {
        const nowADC = Date.now();
        if (!sessionRef.current.lastAdcUpdate || nowADC - sessionRef.current.lastAdcUpdate >= 100) {
          sessionRef.current.lastAdcUpdate = nowADC;
          setRawAdc(lastRaw);
        }
      }
    };

    characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    characteristic.startNotifications().catch(error => {
      console.error("Start Notifications Error:", error);
      alert(lang === 'th' 
        ? `ไม่สามารถรับส่งข้อมูลได้ (startNotifications error): ${error.message}\n\n* กรุณาเช็ค ESP32 ว่าใส่ BLECharacteristic::PROPERTY_NOTIFY และ addDescriptor(new BLE2902()) ถูกต้องหรือไม่` 
        : `Notification error: ${error.message}`);
    });

    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    };
  }, [characteristic, lang]);

  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTesters = testers.filter(testerItem => 
    testerItem.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    testerItem.id.includes(searchQuery)
  );

  const renderTesterRepository = () => (
    <div>
      <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>{t.repoTitle}</h2>
          <p>{t.repoSub}</p>
        </div>
        <button className="btn btn-teal" onClick={() => setIsAddingTester(true)}>
          {t.repoAddBtn}
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder={t.repoSearch} 
          className="form-control"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'white' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredTesters.length > 0 ? (
          filteredTesters.map(testerItem => (
            <div 
              key={testerItem.id} 
              className="tester-card" 
              style={{ 
                border: activeTesterId === testerItem.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
              onClick={() => handleSelectTester(testerItem.id)}
            >
              <div className="tester-card-header">
                <div className="tester-avatar">
                  {testerItem.name.charAt(0)}
                </div>
                <div className="tester-info">
                  <h3>{testerItem.name}</h3>
                  <p>{testerItem.age} {t.unitYears} | {lang === 'th' ? testerItem.gender.split(' / ')[0] : testerItem.gender.split(' / ')[1] || testerItem.gender.split(' / ')[0]} | {lang === 'th' ? 'มือ' + testerItem.hand.split(' / ')[0] : testerItem.hand.split(' / ')[1] || testerItem.hand.split(' / ')[0]}</p>
                </div>
              </div>
              <div className="tester-actions">
                <button 
                  className={`btn-select ${activeTesterId === testerItem.id ? 'active' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); handleSelectTester(testerItem.id); }}
                  style={{
                    backgroundColor: activeTesterId === testerItem.id ? 'var(--accent-teal)' : 'transparent',
                    color: activeTesterId === testerItem.id ? 'white' : 'var(--text-primary)',
                    border: activeTesterId === testerItem.id ? 'none' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {activeTesterId === testerItem.id ? t.repoSelected : t.repoNotSelected}
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    className="btn-edit" 
                    title={t.btnEdit}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleOpenEditTester(testerItem); 
                    }}
                  >
                    ✎ {t.btnEdit}
                  </button>
                  <button 
                    className="btn-delete" 
                    title={t.btnDelete}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDeleteTester(testerItem.id); 
                    }}
                  >
                    🗑 {t.btnDelete}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{t.repoNoData}</p>
          </div>
        )}
      </div>

      {isAddingTester && (
        <div className="modal-overlay" onClick={() => setIsAddingTester(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addTesterTitle}</h3>
              <button className="modal-close" onClick={() => setIsAddingTester(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTester}>
              <div className="form-group">
                <label>{t.addTesterName}</label>
                <input type="text" className="form-control" value={testName} onChange={e => setTestName(e.target.value)} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t.addTesterAge}</label>
                  <input type="number" min="1" className="form-control" value={testAge} onChange={e => setTestAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.addTesterGender}</label>
                  <select className="form-control" value={testGender} onChange={e => setTestGender(e.target.value)} required>
                    <option value="ชาย / Male">{lang === 'th' ? 'ชาย / Male' : 'Male / ชาย'}</option>
                    <option value="หญิง / Female">{lang === 'th' ? 'หญิง / Female' : 'Female / หญิง'}</option>
                    <option value="อื่นๆ / Other">{lang === 'th' ? 'อื่นๆ / Other' : 'Other / อื่นๆ'}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.addTesterWeight}</label>
                  <input type="number" min="1" className="form-control" value={testWeight} onChange={e => setTestWeight(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.addTesterHeight}</label>
                  <input type="number" min="1" className="form-control" value={testHeight} onChange={e => setTestHeight(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>{t.addTesterHand}</label>
                <select className="form-control" value={testHand} onChange={e => setTestHand(e.target.value)} required>
                  <option value="ขวา / Right">{lang === 'th' ? 'ขวา / Right' : 'Right / ขวา'}</option>
                  <option value="ซ้าย / Left">{lang === 'th' ? 'ซ้าย / Left' : 'Left / ซ้าย'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddingTester(false)}>{t.addTesterCancel}</button>
                <button type="submit" className="btn btn-teal">{t.addTesterSave}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTester && (
        <div className="modal-overlay" onClick={() => setEditingTester(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.editTesterTitle}</h3>
              <button className="modal-close" onClick={() => setEditingTester(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditTester}>
              <div className="form-group">
                <label>{t.addTesterName}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t.addTesterAge}</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-control" 
                    value={editAge} 
                    onChange={e => setEditAge(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.addTesterGender}</label>
                  <select 
                    className="form-control" 
                    value={editGender} 
                    onChange={e => setEditGender(e.target.value)} 
                    required
                  >
                    <option value="ชาย / Male">{lang === 'th' ? 'ชาย / Male' : 'Male / ชาย'}</option>
                    <option value="หญิง / Female">{lang === 'th' ? 'หญิง / Female' : 'Female / หญิง'}</option>
                    <option value="อื่นๆ / Other">{lang === 'th' ? 'อื่นๆ / Other' : 'Other / อื่นๆ'}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.addTesterWeight}</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-control" 
                    value={editWeight} 
                    onChange={e => setEditWeight(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.addTesterHeight}</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-control" 
                    value={editHeight} 
                    onChange={e => setEditHeight(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t.addTesterHand}</label>
                <select 
                  className="form-control" 
                  value={editHand} 
                  onChange={e => setEditHand(e.target.value)} 
                  required
                >
                  <option value="ขวา / Right">{lang === 'th' ? 'ขวา / Right' : 'Right / ขวา'}</option>
                  <option value="ซ้าย / Left">{lang === 'th' ? 'ซ้าย / Left' : 'Left / ซ้าย'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingTester(null)}>
                  {t.addTesterCancel}
                </button>
                <button type="submit" className="btn btn-teal">
                  {t.addTesterSave}
                </button>
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
      <div className="card metric-card col-span-4">
        <div className="metric-header"><Zap size={16} /> {t.emgVal}</div>
        <div className="metric-value teal">
          {isSessionActive && currentVavg > 0 ? `${currentVavg.toFixed(2)} V` : '0.00 V'}
        </div>
        <div className="metric-sub">
          {isConnected && rawAdc > 0 
            ? `EMG · DC: ${((rawAdc / 4095.0) * 3.3).toFixed(2)}V · Raw ADC: ${rawAdc.toFixed(0)}` 
            : t.emgSub.replace('0', '0')}
        </div>
      </div>
      <div className={`card metric-card col-span-4 ${isGripFlash ? 'grip-pulse' : ''}`} style={{ transition: 'all 0.2s ease' }}>
        <div className="metric-header"><Hand size={16} /> {t.gripVal}</div>
        <div className="metric-value teal">{gripCount}</div>
        <div className="metric-sub">{t.gripSub}</div>
      </div>
      <div className="card metric-card col-span-4">
        <div className="metric-header"><BarChart2 size={16} /> {t.statusVal}</div>
        <div className="metric-value" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', height: '100%' }}>
          {isSessionActive ? t.statusTraining : (isConnected ? t.statusReady : t.statusWait)}
        </div>
        <div className="metric-sub">{t.statusSub}</div>
      </div>

      {/* Chart */}
      <div className="card col-span-8" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? 'var(--accent-teal)' : '#CBD5E1' }} />
            {isSessionActive ? (lang === 'th' ? 'EMG · กำลังฝึก' : 'EMG · Training') : t.chartTitle}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Y-Axis Zoom / Scale Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingRight: '4px', fontWeight: 500 }}>
                {t.scaleLabel || (lang === 'th' ? 'สเกล:' : 'Scale:')}
              </span>
              {[1, 2, 4].map((scaleVal) => {
                const isActive = waveformScale === scaleVal;
                return (
                  <button
                    key={scaleVal}
                    type="button"
                    onClick={() => handleScaleChange(scaleVal)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: '6px',
                      border: isActive ? '1px solid var(--accent-teal)' : '1px solid transparent',
                      cursor: 'pointer',
                      background: isActive ? 'var(--accent-teal)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    title={lang === 'th' ? `สเกลแนวตั้ง ±${scaleVal}V (${(scaleVal / 4).toFixed(2)} V/div)` : `Vertical scale ±${scaleVal}V (${(scaleVal / 4).toFixed(2)} V/div)`}
                  >
                    ±{scaleVal}V
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t.chartY}
            </div>
          </div>
        </div>
        <div className="chart-container">
          <WaveformCanvas
            ref={waveformRef}
            isSessionActive={isSessionActive}
            startGripMv={startGripMv}
            stopGripMv={stopGripMv}
            vScale={waveformScale}
            t={t}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="card control-card col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            <div className="control-header" style={{ marginBottom: '0.25rem' }}>
              <Clock size={18} /> {t.controlTitle}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.controlSub}</div>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '4px 8px',
              borderRadius: '8px',
              border: soundEnabled ? '1px solid var(--accent-teal)' : '1px solid var(--border-light)',
              background: soundEnabled ? 'rgba(0,188,163,0.08)' : 'var(--bg-main)',
              color: soundEnabled ? 'var(--accent-teal)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            title={soundEnabled ? (lang === 'th' ? 'คลิกเพื่อปิดเสียงตอบรับ (ติ๊ง!)' : 'Click to mute audio biofeedback') : (lang === 'th' ? 'คลิกเพื่อเปิดเสียงตอบรับ (ติ๊ง!)' : 'Click to enable audio biofeedback')}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? t.soundDing : t.soundMute}</span>
          </button>
        </div>
        
        <div className="timer-select">
          <span>{isCustomTime ? `${customMin}:${customSec.toString().padStart(2, '0')} ${t.unitMin}` : (sessionTimePreset === 0 ? (lang === 'th' ? 'ไม่จำกัด' : 'Unlimited') : `${sessionTimePreset} ${t.unitMin}`)}</span>
          <SettingsIcon size={16} color="var(--accent-teal)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500, letterSpacing: '1px' }}>
            {t.timeSub}
          </div>
        </div>

        <div ref={debugTextRef} style={{ display: 'none' }}></div>

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
          <div className="connect-prompt" style={{ marginTop: 'auto' }}>
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
                  <input
                    type="number"
                    min="0"
                    max="6000"
                    step="10"
                    value={startGripMv}
                    onChange={e => setStartGripMv(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{
                      background: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      width: '85px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--accent-teal)',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <input 
                  type="range" 
                  className="range-slider" 
                  min="0" 
                  max="5000" 
                  step="10" 
                  value={Math.min(5000, startGripMv)} 
                  onChange={e => setStartGripMv(parseFloat(e.target.value))} 
                />
              </div>
              <div className="slider-col">
                <div className="slider-label orange">
                  <span>{t.setStopGrip}</span>
                  <input
                    type="number"
                    min="0"
                    max="6000"
                    step="10"
                    value={stopGripMv}
                    onChange={e => setStopGripMv(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{
                      background: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      width: '85px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--accent-orange)',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <input 
                  type="range" 
                  className="range-slider orange" 
                  min="0" 
                  max="5000" 
                  step="10" 
                  value={Math.min(5000, stopGripMv)} 
                  onChange={e => setStopGripMv(parseFloat(e.target.value))} 
                />
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
              <button className={`pill ${!isCustomTime && sessionTimePreset === 0 ? 'active' : ''}`} onClick={() => { setSessionTimePreset(0); setIsCustomTime(false); }}>
                {lang === 'th' ? 'ไม่จำกัด' : 'Unlimited'}
              </button>
              {[1, 3, 5, 10].map(m => (
                <button key={m} className={`pill ${!isCustomTime && sessionTimePreset === m ? 'active' : ''}`} onClick={() => { setSessionTimePreset(m); setIsCustomTime(false); }}>
                  {m} {t.unitMin}
                </button>
              ))}
              <button className={`pill ${isCustomTime ? 'active' : ''}`} onClick={() => setIsCustomTime(true)}>{t.custom}</button>
            </div>
            {isCustomTime && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" min="0" value={customMin} onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> {t.unitMin}
                <input type="number" min="0" max="59" value={customSec} onChange={(e) => setCustomSec(parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> {t.unitSec}
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
              <button className={`pill ${!isCustomTarget && targetGrips === 0 ? 'active' : ''}`} onClick={() => { setTargetGrips(0); setIsCustomTarget(false); }}>
                {lang === 'th' ? 'ไม่จำกัด' : 'Unlimited'}
              </button>
              {[10, 20, 30, 50].map(c => (
                <button key={c} className={`pill ${!isCustomTarget && targetGrips === c ? 'active' : ''}`} onClick={() => { setTargetGrips(c); setIsCustomTarget(false); }}>
                  {c} {t.unitGrips}
                </button>
              ))}
              <button className={`pill ${isCustomTarget ? 'active' : ''}`} onClick={() => setIsCustomTarget(true)}>{t.custom}</button>
            </div>
            {isCustomTarget && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" min="1" value={customTargetInput} onChange={(e) => setCustomTargetInput(parseInt(e.target.value) || 1)} style={{ width: '80px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} /> {t.unitGrips}
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
          <p className="status-label">{t.activeTesterTitle}</p>
          <h4 className="status-value">{activeTester ? activeTester.name : t.activeTesterNone}</h4>
          
          <p className="status-label">{t.deviceStatusTitle}</p>
          <h4 className={`status-value ${isConnected ? 'text-teal' : 'text-red'}`}>
            {isConnected ? (lang === 'th' ? 'เชื่อมต่อแล้ว' : 'Connected') : t.notConnected}
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
      
      {completionModal.show && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>การฝึกเสร็จสิ้น!</h2>
            
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
              {completionModal.reason === 'grip' 
                ? `ครบจำนวนการกำมือที่กำหนดแล้ว (${completionModal.grips} ครั้ง)`
                : `ครบกำหนดเวลาการฝึกแล้ว (${formatTime(completionModal.time)} นาที)`}
            </p>
            
            <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>สรุปผลการฝึก:</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>จำนวนที่ทำได้:</span>
                <strong>{completionModal.grips} ครั้ง</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>เวลาที่ใช้ไป:</span>
                <strong>{formatTime(completionModal.time)} นาที</strong>
              </div>
            </div>
            
            <button 
              className="btn btn-teal" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}
              onClick={() => setCompletionModal({ show: false, reason: '', grips: 0, time: 0 })}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

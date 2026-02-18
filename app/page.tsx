"use client";
import { useState, useEffect, useRef } from "react";
import { MdBluetoothConnected, MdBluetoothDisabled } from "react-icons/md";
import { FaStar} from "react-icons/fa";
import { IoIosCloudDownload } from "react-icons/io";

export default function Home(){
  const [heartRate,setHeartRate] = useState<number>(0);
  const [calories,setCalories] = useState<number>(0);
  const [intensity,setIntensity] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [connected, setConnected] = useState<number>(0);
 
  const saveWorkoutToFile = () => {
  const stars = Math.floor(calories / 70);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN'); 
  const timeStr = now.toLocaleTimeString('vi-VN'); 

  const fileContent = `
=================================
  NHẬT KÝ TẬP LUYỆN FIGHTTAG
=================================
Ngày tập     : ${dateStr}
Giờ kết thúc : ${timeStr}
---------------------------------
Tổng thời gian : ${minutes} phút ${seconds} giây
Tổng Calo đốt  : ${calories.toFixed(1)} kcal
Thành tích     : ${stars} Ngôi sao
=================================
  `;

  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `FightTag_${dateStr.replace(/\//g, '-')}.txt`; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  
  const connectedRef = useRef(connected);
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(()=>{
    if (typeof window !== "undefined") {
      const esp32_ip = "192.168.1.14"; 
      const socket = new WebSocket(`ws://${esp32_ip}/ws`);

      socket.onopen = () => console.log("Connected to ESP32");
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setHeartRate(data.hr);
          setCalories(data.cal);
          setIntensity(data.intensity);
          setTotalSeconds(data.time);
          setConnected(Number(data.connected));
        } catch (err) {
          console.error("Lỗi đọc dữ liệu JSON:", err);
        }
      };
    socket.onerror = (error) => {
        console.error("Lỗi WebSocket:", error);
      };

      return () => socket.close();
    }
}, []);
  useEffect(() => {
      const timer = setInterval(() => {
        if (connectedRef.current === 1) {
          setTotalSeconds((prev) => prev + 1);
        }
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    const getFontSize = (value: number) => {
    if (value >= 1000) return "text-6xl";      
    if (value >= 100)  return "text-[12rem]";
    return "text-[15rem]";
  };
  return(
    <div className={`flex flex-col justify-center items-center h-screen w-screen transition-colors duration-500 ${
        intensity >= 90 ? "bg-red-400" :
        intensity >= 80 ? "bg-orange-400" :
        intensity >= 70 ? "bg-blue-400" :
        intensity >= 60 ? "bg-green-400" :
        intensity >= 0 ? "bg-gray-400" : "bg-amber-50" }`}>
        
      <header className="w-full h-20 px-8 flex justify-between items-center shadow-xl relative bg-black/20 backdrop-blur-xl border-white/20">
        <div className="z-10 flex items-center gap-4">
          <p className="font-bold text-5xl text-white">
            LE KHOI
          </p>
          <div className="flex items-center gap-1 mt-2">
{[...Array(Math.max(0, Math.floor(calories / 70) || 0))].map((_, index) => (
  <FaStar 
    key={index} 
    className="text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" 
  />
))}
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <p className="font-bold text-5xl">
            {formatTime(totalSeconds)}
          </p>
        </div>

        <div className="z-10 flex items-center gap-1 ">
          <button 
          onClick={saveWorkoutToFile}
          disabled={totalSeconds === 0}
          className={`flex items-center gap-2 px-4 py-2  font-bold transition-all ${
            totalSeconds > 0 
              ? "" 
              : ""
          }`}
    >
      <IoIosCloudDownload size={33} />
    </button>
          {connected === 1 ? (
            <MdBluetoothConnected size={40} className="animate-pulse" />
          ) : (
            <MdBluetoothDisabled size={40} className="text-gray-400" />
          )}
        </div>

      </header>
      <div className ={`flex flex-row gap-15 max-w-8xl justify-center self-center h-screen w-screen`}>
        {/* Calories */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center p-4 transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            CALORIES
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(calories)}`}>
              {(Number(calories) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              KCAL
          </p>
        </div>
        {/* Intensity */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center p-4 transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            INTENSITY
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(intensity)}`}>
              {(Number(intensity) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              %
          </p>
        </div>
        {/* Heart rate */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col p-4 items-center transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            HEART RATE
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(heartRate)}`}>
              {(Number(heartRate) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              BPM
          </p>
        </div>
        </div>
    </div>
  );
}
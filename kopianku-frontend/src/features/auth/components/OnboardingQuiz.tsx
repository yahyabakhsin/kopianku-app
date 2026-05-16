"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Laptop, Users, Coffee, Zap, Wifi, Wind } from "lucide-react";

type QuizStep = {
  question: string;
  options: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
};

const steps: QuizStep[] = [
  {
    question: "Apa tujuan utama lo pas ke kafe?",
    options: [
      { id: "wfc", label: "Work From Cafe (Fokus Kerja)", icon: <Laptop className="w-6 h-6 mb-2 text-amber-500" /> },
      { id: "hangout", label: "Nongkrong Bareng Temen", icon: <Users className="w-6 h-6 mb-2 text-purple-500" /> },
      { id: "me-time", label: "Me-Time & Ngopi Santai", icon: <Coffee className="w-6 h-6 mb-2 text-orange-500" /> },
    ],
  },
  {
    question: "Fasilitas apa yang WAJIB ada?",
    options: [
      { id: "wifi_plug", label: "Wi-Fi Kenceng & Colokan", icon: <Wifi className="w-6 h-6 mb-2 text-blue-500" /> },
      { id: "smoking", label: "Smoking / Outdoor Area", icon: <Wind className="w-6 h-6 mb-2 text-zinc-500" /> },
      { id: "aesthetic", label: "Desain Estetik (Buat Foto)", icon: <Zap className="w-6 h-6 mb-2 text-pink-500" /> },
    ],
  },
];

export function OnboardingQuiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentStep]: optionId });
    
    // Move to next step or calculate
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        calculatePersona();
      }
    }, 400);
  };

  const calculatePersona = () => {
    setIsCalculating(true);
    // Simulate AI persona generation
    setTimeout(() => {
      // In a real app, we'd save this to Zustand or backend
      router.push("/?persona=wfc-warrior");
    }, 2000);
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
          <Coffee className="absolute inset-0 m-auto w-8 h-8 text-amber-600 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meracik Persona Lo...</h2>
          <p className="text-zinc-500">AI kami sedang mencocokkan vibe terbaik buat lo.</p>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-zinc-400 mb-2">
          <span>Pertanyaan {currentStep + 1} dari {steps.length}</span>
          <span>{Math.round(((currentStep) / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10">
        {step.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {step.options.map((opt) => {
          const isSelected = answers[currentStep] === opt.id;
          return (
            <Card 
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`cursor-pointer border-2 transition-all duration-200 p-6 flex flex-col items-center justify-center text-center h-48 rounded-[2rem]
                ${isSelected 
                  ? 'border-black bg-zinc-50 shadow-md transform scale-95' 
                  : 'border-zinc-100 hover:border-amber-200 hover:bg-amber-50 shadow-sm hover:-translate-y-1'
                }
              `}
            >
              {opt.icon}
              <span className={`font-semibold mt-2 ${isSelected ? 'text-black' : 'text-zinc-700'}`}>
                {opt.label}
              </span>
              {isSelected && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-black" />
              )}
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}

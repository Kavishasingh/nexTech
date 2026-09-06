import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, BookOpen, Award, TrendingUp, ChevronRight, BarChart3, Target, GraduationCap, Brain, Zap, Shield, Users, Flame, Trophy, ClipboardCheck, Rocket, ArrowRight, CircleDot, Star, Globe } from "lucide-react";

const quizQuestions = [
  {
    id: 1,
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Linked List", "Array"],
    correct: 1,
    explanation: "A Stack follows the Last In, First Out principle where the most recently added element is the first to be removed. This is analogous to a stack of plates where you can only add or remove the top plate.",
  },
  {
    id: 2,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
    correct: 0,
    explanation: "HTML stands for Hyper Text Markup Language. It is the standard markup language for creating web pages and describes the structure of web pages using markup tags.",
  },
  {
    id: 3,
    question: "Which protocol is used for secure communication over a computer network?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correct: 2,
    explanation: "HTTPS (Hypertext Transfer Protocol Secure) is used for secure communication over a computer network. It uses SSL/TLS encryption to protect data transmitted between the browser and server.",
  },
];

const competencyCourses = {
  low: [
    { title: "iGOT Karmayogi: Fundamentals of Digital Governance", provider: "iGOT Karmayogi", duration: "4 weeks", level: "Foundation", icon: Shield },
    { title: "iGOT Karmayogi: Digital Literacy Essentials", provider: "iGOT Karmayogi", duration: "3 weeks", level: "Foundation", icon: BookOpen },
  ],
  medium: [
    { title: "iGOT Karmayogi: Advanced Web Development for Gov", provider: "iGOT Karmayogi", duration: "6 weeks", level: "Intermediate", icon: Target },
    { title: "iGOT Karmayogi: Data Structures Deep Dive", provider: "iGOT Karmayogi", duration: "5 weeks", level: "Intermediate", icon: BarChart3 },
  ],
  high: [
    { title: "iGOT Karmayogi: System Design Mastery", provider: "iGOT Karmayogi", duration: "8 weeks", level: "Advanced", icon: Rocket },
    { title: "iGOT Karmayogi: AI & Machine Learning Ops", provider: "iGOT Karmayogi", duration: "10 weeks", level: "Advanced", icon: Brain },
  ],
};

const skillMatrixData = [
  { skill: "Technical Aptitude", current: 0, target: 85, color: "bg-[#D97706]" },
  { skill: "Communication", current: 0, target: 80, color: "bg-[#F59E0B]" },
  { skill: "Problem Solving", current: 0, target: 90, color: "bg-[#D97706]" },
  { skill: "Domain Knowledge", current: 0, target: 75, color: "bg-[#F59E0B]" },
  { skill: "Digital Literacy", current: 0, target: 88, color: "bg-[#D97706]" },
];

const roadmapMilestones = [
  { phase: "Foundation", status: "current", title: "Digital Literacy Basics", description: "Master fundamental computer skills and digital tools" },
  { phase: "Intermediate", status: "upcoming", title: "Technical Proficiency", description: "Develop core technical and problem-solving abilities" },
  { phase: "Advanced", status: "upcoming", title: "Specialized Expertise", description: "Gain domain-specific knowledge and leadership skills" },
  { phase: "Expert", status: "future", title: "Strategic Leadership", description: "Lead digital transformation initiatives" },
];

export default function SIHLearningPlatform() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "incorrect" | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const streakDays = 5;
  const masteryScore = 78;
  const quizzesCompleted = 12;
  const creditsEarned = 450;

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((type: "correct" | "incorrect" | "complete") => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (type === "correct") {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } else if (type === "incorrect") {
      oscillator.frequency.value = 300;
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } else if (type === "complete") {
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 900;
        setTimeout(() => oscillator.stop(), 200);
      }, 150);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  }, []);

  const handleRemovePdf = useCallback(() => {
    setPdfFile(null);
  }, []);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = optionIndex;
      return updated;
    });
    const isCorrect = optionIndex === quizQuestions[currentQuestion].correct;
    setAnswerFeedback(isCorrect ? "correct" : "incorrect");
    setShowExplanation(true);
    playSound(isCorrect ? "correct" : "incorrect");
  }, [currentQuestion, quizSubmitted, playSound]);

  const handleNext = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
      setAnswerFeedback(null);
    }
  }, [currentQuestion]);

  const handlePrev = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setShowExplanation(false);
      setAnswerFeedback(null);
    }
  }, [currentQuestion]);

  const handleSubmitQuiz = useCallback(() => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setQuizSubmitted(true);
    playSound("complete");
  }, [selectedAnswers, playSound]);

  const getGapLevel = useCallback(() => {
    if (score <= 1) return "low";
    if (score === 2) return "medium";
    return "high";
  }, [score]);

  const gapLevel = quizSubmitted ? getGapLevel() : null;
  const recommendedCourses = quizSubmitted ? competencyCourses[gapLevel || "low"] : [];

  const getSkillScores = () => {
    const baseScores: Record<string, number[]> = {
      low: [35, 40, 30, 25, 38],
      medium: [60, 65, 55, 58, 62],
      high: [90, 92, 88, 95, 91],
    };
    return baseScores[gapLevel || "low"] || baseScores.low;
  };

  const skillScores = getSkillScores();

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-6 rounded-full bg-[#FF9933]" />
                <span className="h-2.5 w-6 rounded-full bg-white" />
                <span className="h-2.5 w-6 rounded-full bg-[#138808]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0F2942]">
                Digital India / iGOT Karmayogi Compliant
              </span>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0F2942]/10 bg-[#0F2942]/5 px-3 py-1 text-xs font-semibold text-[#0F2942]">
              <Globe className="h-3.5 w-3.5" />
              nextech Learning Platform
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F2942] md:text-4xl">
            Smart Competency <span className="text-[#D97706]">Development</span> Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Upload learning materials, assess your skills, and get personalized iGOT Karmayogi course recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Study Streak</p>
                <p className="text-2xl font-bold text-[#0F2942]">{streakDays} Days</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-2">
                <Flame className="h-5 w-5 text-[#D97706]" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Skill Mastery</p>
                <p className="text-2xl font-bold text-[#0F2942]">{masteryScore}%</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <Trophy className="h-5 w-5 text-[#D97706]" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Quizzes Done</p>
                <p className="text-2xl font-bold text-[#0F2942]">{quizzesCompleted}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">iGOT Credits</p>
                <p className="text-2xl font-bold text-[#0F2942]">{creditsEarned}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F2942]">
                <Upload className="h-5 w-5 text-[#D97706]" />
                PDF Study Material Upload
              </h2>
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging ? "border-[#D97706] bg-amber-50" : "border-slate-300 hover:border-[#D97706]"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type === "application/pdf") {
                    setPdfFile(file);
                  }
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {pdfFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-2">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div className="text-left">
                        <p className="font-medium text-slate-800">{pdfFile.name}</p>
                        <p className="text-sm text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemovePdf(); }}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500">Click or drag to replace file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-slate-100 p-3">
                      <Upload className="h-6 w-6 text-[#D97706]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Drag & drop PDF here</p>
                      <p className="text-sm text-slate-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F2942]">
                  <Award className="h-5 w-5 text-[#D97706]" />
                  Competency Quiz Engine
                </h2>
                {quizStarted && !quizSubmitted && (
                  <span className="text-sm text-slate-500">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                )}
              </div>

              {!quizStarted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="mb-4 h-12 w-12 text-[#D97706]/60" />
                  <p className="mb-4 text-slate-600">Test your knowledge with 3 quick questions.</p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="rounded-lg bg-[#D97706] px-6 py-2 font-semibold text-white hover:bg-[#B45309]"
                  >
                    Start Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-[#D97706] transition-all"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  <div className="rounded-lg bg-slate-50 p-6">
                    <p className="mb-4 text-lg font-medium text-slate-800">
                      {quizQuestions[currentQuestion].question}
                    </p>
                    <div className="space-y-3">
                      {quizQuestions[currentQuestion].options.map((option, idx) => {
                        const isSelected = selectedAnswers[currentQuestion] === idx;
                        const isCorrect = quizSubmitted && idx === quizQuestions[currentQuestion].correct;
                        const isWrong = quizSubmitted && isSelected && !isCorrect;
                        const showCorrect = quizSubmitted && idx === quizQuestions[currentQuestion].correct && !isWrong;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(idx)}
                            disabled={quizSubmitted}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
                              isCorrect || showCorrect
                                ? "border-emerald-500 bg-emerald-50"
                                : isWrong
                                ? "border-red-500 bg-red-50"
                                : isSelected
                                ? "border-[#D97706] bg-amber-50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            } ${quizSubmitted ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  isSelected || isCorrect || showCorrect ? "border-[#D97706]" : "border-slate-300"
                                }`}
                              >
                                {isSelected && !quizSubmitted && (
                                  <div className="h-3 w-3 rounded-full bg-[#D97706]" />
                                )}
                                {(isCorrect || showCorrect) && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                {isWrong && <AlertCircle className="h-5 w-5 text-red-600" />}
                              </div>
                              <span className="font-medium text-slate-700">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && !quizSubmitted && (
                      <div className={`mt-4 rounded-lg border p-4 ${answerFeedback === "correct" ? "border-emerald-500/30 bg-emerald-50" : "border-red-500/30 bg-red-50"}`}>
                        <div className="flex items-start gap-2">
                          {answerFeedback === "correct" ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className={`text-sm font-semibold ${answerFeedback === "correct" ? "text-emerald-700" : "text-red-700"}`}>
                              {answerFeedback === "correct" ? "Correct!" : "Incorrect"}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {quizQuestions[currentQuestion].explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!quizSubmitted && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrev}
                        disabled={currentQuestion === 0}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {currentQuestion === quizQuestions.length - 1 ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={selectedAnswers.filter(Boolean).length < quizQuestions.length}
                          className="rounded-lg bg-[#D97706] px-6 py-2 font-semibold text-white hover:bg-[#B45309] disabled:opacity-50"
                        >
                          Submit Quiz
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="rounded-lg bg-[#0F2942] px-6 py-2 font-semibold text-white hover:bg-[#0F2942]/90"
                        >
                          Next <ChevronRight className="inline h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {quizSubmitted && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                        <Trophy className="h-8 w-8 text-[#D97706]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0F2942]">
                        {score} / {quizQuestions.length}
                      </h3>
                      <p className="text-slate-600">
                        {score === quizQuestions.length
                          ? "Excellent! No competency gaps detected."
                          : score >= 2
                          ? "Moderate competency gaps detected."
                          : "Significant competency gaps detected. Review recommended."}
                      </p>
                      <button
                        onClick={() => {
                          setQuizStarted(false);
                          setCurrentQuestion(0);
                          setSelectedAnswers([]);
                          setQuizSubmitted(false);
                          setScore(0);
                          setShowExplanation(false);
                          setAnswerFeedback(null);
                        }}
                        className="mt-4 rounded-lg bg-[#D97706] px-6 py-2 font-semibold text-white hover:bg-[#B45309]"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#0F2942]">
                <Target className="h-5 w-5 text-[#D97706]" />
                Skill Gap Analysis Matrix
              </h2>
              <div className="space-y-4">
                {skillMatrixData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{item.skill}</span>
                      <span className="text-sm font-bold text-[#D97706]">{skillScores[idx]}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${skillScores[idx]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {quizSubmitted && (
                <div className="mt-6 rounded-lg border border-[#D97706]/20 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="mt-0.5 h-5 w-5 text-[#D97706]" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F2942]">Competency Level</p>
                      <p className="text-sm text-slate-600">
                        {gapLevel === "low"
                          ? "Significant gaps detected. Foundation courses recommended."
                          : gapLevel === "medium"
                          ? "Moderate gaps detected. Intermediate courses recommended."
                          : "High competency. Advanced courses available."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#0F2942]">
                <Rocket className="h-5 w-5 text-[#D97706]" />
                Visual Skill Gap Roadmap
              </h2>
              <div className="relative space-y-4">
                <div className="absolute left-4 top-4 h-full w-0.5 bg-slate-200" />
                {roadmapMilestones.map((milestone, idx) => {
                  const isActive = milestone.status === "current";
                  const isLocked = milestone.status === "upcoming" && !quizSubmitted;
                  const statusColors: Record<string, string> = {
                    current: "bg-[#D97706] border-[#D97706]",
                    upcoming: "bg-slate-200 border-slate-300",
                    future: "bg-slate-100 border-slate-200",
                  };

                  return (
                    <div key={idx} className="relative flex gap-4">
                      <div className="relative z-10">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${statusColors[milestone.status]} ${isActive ? "ring-2 ring-[#D97706]/30" : ""}`}>
                          {isActive ? <CircleDot className="h-4 w-4 text-white" /> : <ArrowRight className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>
                      <div className={`flex-1 rounded-lg border p-4 transition-all ${isActive ? "border-[#D97706]/20 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#0F2942]">{milestone.phase}</span>
                          {isActive && <span className="rounded-full bg-[#D97706]/10 px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">Current</span>}
                          {isLocked && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Locked</span>}
                        </div>
                        <h3 className="mt-1 font-semibold text-[#0F2942]">{milestone.title}</h3>
                        <p className="text-sm text-slate-600">{milestone.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {quizSubmitted && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#0F2942]">
                  <GraduationCap className="h-5 w-5 text-[#D97706]" />
                  iGOT Karmayogi Course Recommendations
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {recommendedCourses.map((course, idx) => {
                    const IconComponent = course.icon;
                    return (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-all hover:border-[#D97706]/30 hover:bg-white hover:shadow-sm">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#D97706]/10 p-2">
                              <IconComponent className="h-5 w-5 text-[#D97706]" />
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wider text-[#D97706]">
                              {course.level}
                            </span>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {course.duration}
                          </span>
                        </div>
                        <h3 className="mb-1 font-semibold text-[#0F2942]">{course.title}</h3>
                        <p className="mb-3 text-sm text-slate-600">{course.provider}</p>
                        <button className="flex items-center gap-1 text-sm font-semibold text-[#D97706] hover:text-[#B45309]">
                          Enroll Now <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!quizSubmitted && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="mb-3 h-10 w-10 text-[#D97706]/40" />
                  <p className="text-sm text-slate-600">Complete the quiz to unlock skill gap analysis and personalized iGOT Karmayogi course recommendations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Copy, Check, Info, Star, Zap, Layout, Image as ImageIcon, Globe, Target, MessageSquare, History, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePrompt, GenerationParams } from './services/gemini';

interface HistoryItem {
  id: string;
  timestamp: number;
  params: GenerationParams;
  prompt: string;
  image: string | null;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('prompt_ad_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('prompt_ad_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (prompt: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      params: { ...params },
      prompt,
      image
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20 items
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm("هل أنت متأكد من مسح السجل بالكامل؟")) {
      setHistory([]);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setParams(item.params);
    setImage(item.image);
    setGeneratedPrompt(item.prompt);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDynamicTips = () => {
    const tips = [
      { id: 1, text: "ارفع صور واضحة للمنتج تحت إضاءة جيدة لتحسين تحليل الذكاء الاصطناعي." }
    ];

    // Angle specific tips
    if (params.marketingAngle === "Problem & Solution") {
      tips.push({ id: 2, text: "ركز على إظهار الألم أو المشكلة بوضوح قبل تقديم منتجك كحل سحري." });
    } else if (params.marketingAngle === "Curiosity & Secret Reveal") {
      tips.push({ id: 2, text: "لا تكشف كل شيء في البداية؛ اجعل العميل يتساءل 'كيف؟' لزيادة نسبة النقر." });
    } else if (params.marketingAngle === "Social Proof & Testimonial") {
      tips.push({ id: 2, text: "استخدم لغة حقيقية وعفوية تشبه كلام العملاء لزيادة المصداقية." });
    } else if (params.marketingAngle === "Benefit-Driven") {
      tips.push({ id: 2, text: "تحدث عن 'النتيجة النهائية' وكيف ستتغير حياة العميل للأفضل." });
    } else if (params.marketingAngle === "Us vs. Them") {
      tips.push({ id: 2, text: "كن موضوعياً ولكن ركز على الميزة التنافسية الوحيدة التي تجعلك متفوقاً." });
    } else if (params.marketingAngle === "Luxury & Status") {
      tips.push({ id: 2, text: "استخدم لغة راقية وتجنب ذكر الخصومات الكبيرة؛ ركز على القيمة والحصرية." });
    } else if (params.marketingAngle === "Scarcity & Urgency") {
      tips.push({ id: 2, text: "اجعل العرض حقيقياً ومحدوداً زمنياً لتحفيز العميل على اتخاذ قرار فوري." });
    } else {
      tips.push({ id: 2, text: "اختر الزاوية التسويقية التي تناسب طبيعة منتجك وجمهورك المستهدف." });
    }

    // Style specific tips
    if (params.outputStyle === "Short & Punchy (TikTok/Reels)") {
      tips.push({ id: 3, text: "في الفيديوهات القصيرة، لديك 3 ثوانٍ فقط لجذب الانتباه؛ ابدأ بأقوى جملة." });
    } else if (params.outputStyle === "Long-form Storytelling (Facebook)") {
      tips.push({ id: 3, text: "القصص الطويلة تبني علاقة عاطفية؛ ابدأ بصراع شخصي ينتهي بالنجاح." });
    } else if (params.outputStyle === "Landing Page Hero") {
      tips.push({ id: 3, text: "في صفحات الهبوط، اترك مساحة كافية للنصوص (Negative Space) لضمان وضوح الرسالة." });
    } else if (params.outputStyle === "A/B Testing Pack") {
      tips.push({ id: 3, text: "اختبار A/B هو سر النجاح؛ جرب الزوايا الثلاث (السعر، الجودة، الضمان) لتعرف أيهما يحقق أفضل النتائج." });
    } else {
      tips.push({ id: 3, text: "تأكد من أن النص يتناسب مع المنصة التي ستنشر عليها الإعلان." });
    }

    return tips;
  };

  const [params, setParams] = useState<GenerationParams>({
    language: 'Arabic',
    contentType: 'Ad Post (بوست إعلاني)',
    platform: 'Facebook',
    marketingAngle: 'Problem & Solution',
    outputStyle: 'Single Hero Ad'
  });

  const resetForm = () => {
    setImage(null);
    setGeneratedPrompt(null);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "تحليل صورة المنتج باستخدام رؤية الحاسوب...",
    "تحديد الألوان والجماليات البصرية...",
    "تطبيق استراتيجية الزاوية التسويقية...",
    "هندسة البرومبت (Meta-Prompting)...",
    "تحسين نصوص الإقناع باللغة المستهدفة..."
  ];

  const particles = Array.from({ length: 12 });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!image) return;
    setIsGenerating(true);
    setGeneratedPrompt(null);
    setError(null);
    try {
      const result = await generatePrompt(image, params);
      setGeneratedPrompt(result);
      addToHistory(result);
      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10 bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(140,37,244,0.5)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Prompt Ad</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-white/70">
            <button onClick={() => setShowHistory(false)} className={`hover:text-brand-purple transition-colors ${!showHistory ? 'text-brand-purple' : ''}`}>الرئيسية</button>
            <button className="hover:text-brand-purple transition-colors">المكتبة</button>
            <button onClick={() => setShowHistory(!showHistory)} className={`hover:text-brand-purple transition-colors flex items-center gap-2 ${showHistory ? 'text-brand-purple' : ''}`}>
              <History className="w-4 h-4" />
              السجل
            </button>
          </nav>

          <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10">
            ترقية
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="badge-premium"
            >
              الجيل القادم من التسويق
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="badge-success"
            >
              <Zap className="w-3 h-3 fill-current" />
              متوافق مع BANANA pro
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
            أنشئ نصوص إعلانية <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-fuchsia-400">عالية التحويل</span> في ثوانٍ
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            استخدم أقوى نماذج الذكاء الاصطناعي لتوليد أفكار إعلانية مبنية على علم النفس التسويقي لزيادة مبيعاتك.
          </p>
        </section>

        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <History className="w-8 h-8 text-brand-purple" />
                  سجل البرومبتات السابقة
                </h2>
                <button 
                  onClick={clearHistory}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح السجل
                </button>
              </div>

              {history.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <History className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/40 font-bold">لا يوجد سجل متاح حالياً.</p>
                  <button onClick={() => setShowHistory(false)} className="btn-primary py-3 px-6 text-sm">ابدأ بإنشاء أول برومبت</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="glass-card p-6 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">
                            {new Date(item.timestamp).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}
                          </p>
                          <h4 className="font-bold text-sm line-clamp-1">{item.params.marketingAngle}</h4>
                        </div>
                        <button 
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="aspect-video bg-black/40 rounded-xl mb-4 overflow-hidden border border-white/5">
                        {item.image ? (
                          <img src={item.image} alt="Product" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-white/40 line-clamp-3 mb-4 font-mono">
                        {item.prompt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] font-bold text-white/20">{item.params.platform}</span>
                        <ExternalLink className="w-4 h-4 text-brand-purple opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-12 gap-8"
            >
          {/* Left: Generation Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card p-8 space-y-8">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                  <ImageIcon className="w-4 h-4 text-brand-purple" />
                  صورة المنتج أو الوصف
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[250px] ${
                    image ? 'border-brand-purple/50 bg-brand-purple/5' : 'border-white/10 hover:border-brand-purple/30 bg-white/5'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  {image ? (
                    <div className="relative w-full max-w-md">
                      <img src={image} alt="Product" className="rounded-2xl shadow-2xl mx-auto max-h-[300px] object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <p className="text-white font-bold">تغيير الصورة</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-brand-purple" />
                      </div>
                      <p className="text-xl font-bold mb-1">ارفع صورة المنتج هنا</p>
                      <p className="text-white/40 text-sm">اسحب وأفلت الملف أو انقر للتصفح</p>
                    </>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Target Language */}
                <div className="space-y-2">
                  <div className="section-header">
                    <div className="icon-glow">
                      <Globe className="w-4 h-4" />
                    </div>
                    لغة المحتوى
                  </div>
                  <div className="relative group">
                    <select 
                      value={params.language}
                      onChange={(e) => setParams({...params, language: e.target.value})}
                      className="input-field appearance-none cursor-pointer pr-12"
                    >
                      <option value="Arabic">العربية (للأسواق المحلية والخليج)</option>
                      <option value="English">الإنجليزية (للأسواق العالمية والدروبشيبينغ)</option>
                      <option value="French">الفرنسية (لأسواق إفريقيا وأوروبا الناطقة بالفرنسية)</option>
                      <option value="Spanish">الإسبانية (لأسواق أمريكا اللاتينية وإسبانيا)</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-brand-purple/50 transition-colors">
                      <Layout className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <div className="section-header">
                    <div className="icon-glow">
                      <Layout className="w-4 h-4" />
                    </div>
                    نوع المحتوى
                  </div>
                  <div className="flex bg-[#150d21] border border-white/10 rounded-2xl p-1.5">
                    {['Ad Post (بوست إعلاني)', 'Landing Page (صفحة هبوط)'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setParams({...params, contentType: type})}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                          params.contentType === type 
                            ? 'bg-brand-purple text-white shadow-[0_0_20px_rgba(140,37,244,0.3)]' 
                            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {type.split(' (')[1].replace(')', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-2 relative">
                  <div className={`section-header flex items-center justify-between ${params.contentType !== 'Ad Post (بوست إعلاني)' ? 'text-white/20' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`icon-glow ${params.contentType !== 'Ad Post (بوست إعلاني)' ? 'opacity-20' : ''}`}>
                        <Target className="w-4 h-4" />
                      </div>
                      المنصة الإعلانية
                    </div>
                    {params.contentType !== 'Ad Post (بوست إعلاني)' && (
                      <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-white/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        متاح للبوستات فقط
                      </span>
                    )}
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-3 transition-all duration-500 ${params.contentType !== 'Ad Post (بوست إعلاني)' ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                    {['Facebook', 'Instagram', 'TikTok', 'Multi-platform'].map((p) => (
                      <button
                        key={p}
                        disabled={params.contentType !== 'Ad Post (بوست إعلاني)'}
                        onClick={() => setParams({...params, platform: p})}
                        className={`py-4 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                          params.platform === p 
                            ? 'bg-brand-purple/10 border-brand-purple text-white shadow-[0_0_15px_rgba(140,37,244,0.15)]' 
                            : 'bg-[#150d21] border-white/5 text-white/40 hover:border-white/20 hover:bg-[#1a1225]'
                        }`}
                      >
                        {p === 'Facebook' ? 'فيسبوك' : p === 'Instagram' ? 'انستقرام' : p === 'TikTok' ? 'تيك توك' : 'منصات متعددة'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marketing Angle */}
                <div className="space-y-2">
                  <div className="section-header">
                    <div className="icon-glow">
                      <Zap className="w-4 h-4" />
                    </div>
                    الزاوية التسويقية
                  </div>
                  <div className="relative group">
                    <select 
                      value={params.marketingAngle}
                      onChange={(e) => setParams({...params, marketingAngle: e.target.value})}
                      className="input-field appearance-none cursor-pointer pr-12"
                    >
                      <option value="Problem & Solution">مشكلة وحل (Problem & Solution)</option>
                      <option value="Curiosity & Secret Reveal">فضول وكشف سر (Curiosity & Secret Reveal)</option>
                      <option value="Social Proof & Testimonial">دليل اجتماعي (Social Proof & Testimonial)</option>
                      <option value="Benefit-Driven">التركيز على الفوائد (Benefit-Driven)</option>
                      <option value="Us vs. Them">نحن ضد المنافسين (Us vs. Them)</option>
                      <option value="Luxury & Status">فخامة ومكانة (Luxury & Status)</option>
                      <option value="Scarcity & Urgency">ندرة واستعجال (Scarcity & Urgency)</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-brand-purple/50 transition-colors">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Output Style */}
                <div className="md:col-span-2 space-y-2">
                  <div className="section-header">
                    <div className="icon-glow">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    نمط الإخراج
                  </div>
                  <div className="relative group">
                    <select 
                      value={params.outputStyle}
                      onChange={(e) => setParams({...params, outputStyle: e.target.value})}
                      className="input-field appearance-none cursor-pointer pr-12 text-center font-bold"
                    >
                      <option value="Single Hero Ad">إعلان بطل واحد (Single Hero Ad)</option>
                      <option value="Landing Page Hero">صفحة هبوط (Landing Page Hero)</option>
                      <option value="A/B Testing Pack">حزمة اختبار A/B (A/B Testing Pack)</option>
                      <option value="Short & Punchy (TikTok/Reels)">قصير وقوي (Short & Punchy)</option>
                      <option value="Long-form Storytelling (Facebook)">قصة طويلة (Long-form Storytelling)</option>
                    </select>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-brand-purple/50 transition-colors">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm"
                  >
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!image || isGenerating}
                whileHover={!image || isGenerating ? {} : { 
                  scale: 1.02, 
                  y: -4,
                  boxShadow: "0 20px 40px rgba(140, 37, 244, 0.4), 0 0 20px rgba(140, 37, 244, 0.2)"
                }}
                whileTap={!image || isGenerating ? {} : { scale: 0.98, y: 0 }}
                className={`btn-primary w-full flex items-center justify-center gap-3 text-lg relative overflow-hidden ${(!image || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Subtle pulsing glow layer */}
                {!isGenerating && image && (
                  <motion.div
                    animate={{
                      opacity: [0, 0.2, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-white pointer-events-none"
                  />
                )}
                
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    {loadingMessages[loadingStep]}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    إنشاء المحتوى الآن
                  </>
                )}
              </motion.button>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden relative min-h-[400px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-fuchsia-500/10 to-brand-purple/10 animate-pulse" />
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-brand-purple rounded-full"
                        initial={{ 
                          x: Math.random() * 600 - 300, 
                          y: Math.random() * 400 - 200,
                          opacity: 0 
                        }}
                        animate={{ 
                          y: [null, Math.random() * -200 - 100],
                          opacity: [0, 0.5, 0],
                          scale: [1, 1.5, 1]
                        }}
                        transition={{ 
                          duration: 2 + Math.random() * 3, 
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-32 h-32 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <Sparkles className="w-12 h-12 text-brand-purple animate-pulse" />
                        <motion.div
                          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-black text-white tracking-tight"
                      >
                        {loadingMessages[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">
                      محرك الذكاء الاصطناعي يقوم الآن بهندسة برومبت إعلاني احترافي بناءً على بيانات منتجك...
                    </p>
                  </div>

                  <div className="w-full max-w-sm h-2 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/10">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-purple via-fuchsia-500 to-brand-purple bg-[length:200%_100%]"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: "100%",
                        backgroundPosition: ["0% 0%", "200% 0%"]
                      }}
                      transition={{ 
                        width: { duration: 10, ease: "linear" },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Output Area */}
            <AnimatePresence>
              {generatedPrompt && (
                <motion.div 
                  id="result-area"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Check className="w-6 h-6 text-green-400" />
                      البرومبت الجاهز للنسخ
                    </h3>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'تم النسخ' : 'نسخ النص'}
                    </button>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-white/80 leading-relaxed border border-white/5 whitespace-pre-wrap selection:bg-brand-purple/50">
                    {generatedPrompt}
                  </div>
                  
                  <button
                    onClick={resetForm}
                    className="w-full flex items-center justify-center gap-2 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple py-4 rounded-xl font-bold transition-all border border-brand-purple/20"
                  >
                    <Sparkles className="w-5 h-5" />
                    إنشاء برومبت جديد
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Tips Card */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 text-brand-purple">
                <Info className="w-6 h-6" />
                <h3 className="text-lg font-bold">نصائح للنتائج الاحترافية</h3>
              </div>
              <ul className="space-y-4">
                <AnimatePresence mode="wait">
                  {getDynamicTips().map((tip) => (
                    <motion.li 
                      key={`${tip.id}-${params.marketingAngle}-${params.outputStyle}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex gap-3 text-sm text-white/60 leading-relaxed"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-brand-purple/20 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-purple">
                        {tip.id}
                      </span>
                      {tip.text}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            {/* Premium Plan Card */}
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-purple/30 transition-all" />
              <div className="relative space-y-6">
                <div className="w-12 h-12 bg-brand-purple/20 rounded-2xl flex items-center justify-center text-brand-purple">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">خطة البريميوم</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    احصل على عدد غير محدود من المحتوى وبدون علامة مائية.
                  </p>
                </div>
                <button className="w-full py-4 rounded-xl border border-brand-purple text-brand-purple font-bold hover:bg-brand-purple hover:text-white transition-all">
                  عرض الأسعار
                </button>
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-white/10 text-center text-white/30 text-xs">
        <p>© Prompt Ad Generator 2024 - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

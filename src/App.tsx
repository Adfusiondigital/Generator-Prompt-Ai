import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Copy, Check, Info, Star, Zap, Layout, Image as ImageIcon, Globe, Target, Maximize, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePrompt, GenerationParams } from './services/gemini';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [params, setParams] = useState<GenerationParams>({
    language: 'Arabic',
    contentType: 'Ad Post (بوست إعلاني)',
    platform: 'Facebook',
    adSize: '1:1 (مربع)',
    marketingAngle: 'مشكلة وحل',
    outputFormat: '3 تنويعات'
  });

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

  const handleGenerate = async () => {
    if (!image) return;
    setIsGenerating(true);
    try {
      const result = await generatePrompt(image, params);
      setGeneratedPrompt(result);
      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert(error.message || "حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.");
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
            <span className="text-2xl font-black tracking-tighter">Generator Prompt Ai</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#" className="hover:text-brand-purple transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-brand-purple transition-colors">المكتبة</a>
            <a href="#" className="hover:text-brand-purple transition-colors">السجل</a>
          </nav>

          <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10">
            ترقية
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple text-xs font-bold mb-6">
            الجيل القادم من التسويق
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
            أنشئ نصوص إعلانية <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-fuchsia-400">عالية التحويل</span> في ثوانٍ
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            استخدم أقوى نماذج الذكاء الاصطناعي لتوليد أفكار إعلانية مبنية على علم النفس التسويقي لزيادة مبيعاتك.
          </p>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Target Language */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <Globe className="w-4 h-4 text-brand-purple" />
                    لغة المحتوى
                  </label>
                  <select 
                    value={params.language}
                    onChange={(e) => setParams({...params, language: e.target.value})}
                    className="w-full bg-brand-bg border border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple transition-all appearance-none"
                  >
                    <option value="Arabic">العربية (للأسواق المحلية والخليج)</option>
                    <option value="English">الإنجليزية (للأسواق العالمية والدروبشيبينغ)</option>
                    <option value="French">الفرنسية (لأسواق إفريقيا وأوروبا الناطقة بالفرنسية)</option>
                    <option value="Spanish">الإسبانية (لأسواق أمريكا اللاتينية وإسبانيا)</option>
                  </select>
                </div>

                {/* Content Type */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <Layout className="w-4 h-4 text-brand-purple" />
                    نوع المحتوى
                  </label>
                  <div className="flex bg-brand-bg border border-white/10 rounded-xl p-1">
                    {['Ad Post (بوست إعلاني)', 'Landing Page (صفحة هبوط)'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setParams({...params, contentType: type})}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                          params.contentType === type ? 'bg-brand-purple text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {type.split(' (')[1].replace(')', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div className={`space-y-3 transition-all duration-300 ${params.contentType === 'Landing Page (صفحة هبوط)' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <Target className="w-4 h-4 text-brand-purple" />
                    المنصة الإعلانية
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Facebook', 'Instagram', 'TikTok', 'Multi-platform'].map((p) => (
                      <button
                        key={p}
                        disabled={params.contentType === 'Landing Page (صفحة هبوط)'}
                        onClick={() => setParams({...params, platform: p})}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          params.platform === p ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {p === 'Facebook' ? 'فيسبوك' : p === 'Instagram' ? 'انستقرام' : p === 'TikTok' ? 'تيك توك' : 'منصات متعددة'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ad Size */}
                <div className={`space-y-3 transition-all duration-300 ${params.contentType === 'Landing Page (صفحة هبوط)' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <Maximize className="w-4 h-4 text-brand-purple" />
                    قياس الإعلان
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1 (مربع)', '4:5 (عمودي)', '16:9 (عرضي)'].map((s) => (
                      <button
                        key={s}
                        disabled={params.contentType === 'Landing Page (صفحة هبوط)'}
                        onClick={() => setParams({...params, adSize: s})}
                        className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                          params.adSize === s ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marketing Angle */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <Zap className="w-4 h-4 text-brand-purple" />
                    الزاوية التسويقية
                  </label>
                  <select 
                    value={params.marketingAngle}
                    onChange={(e) => setParams({...params, marketingAngle: e.target.value})}
                    className="w-full bg-brand-bg border border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple transition-all appearance-none"
                  >
                    <option value="مشكلة وحل">مشكلة وحل</option>
                    <option value="استجابة مباشرة">استجابة مباشرة</option>
                    <option value="دليل اجتماعي">دليل اجتماعي</option>
                    <option value="عرض محدود">عرض محدود</option>
                  </select>
                </div>

                {/* Output Format */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <MessageSquare className="w-4 h-4 text-brand-purple" />
                    نمط الإخراج
                  </label>
                  <select 
                    value={params.outputFormat}
                    onChange={(e) => setParams({...params, outputFormat: e.target.value})}
                    className="w-full bg-brand-bg border border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple transition-all appearance-none"
                  >
                    <option value="3 تنويعات">3 تنويعات</option>
                    <option value="تنويع واحد مفصل">تنويع واحد مفصل</option>
                    <option value="مجموعة إعلانية كاملة">مجموعة إعلانية كاملة</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!image || isGenerating}
                className={`btn-primary w-full flex items-center justify-center gap-3 text-lg ${(!image || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    إنشاء المحتوى الآن
                  </>
                )}
              </button>
            </div>

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
                  <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-white/80 leading-relaxed border border-white/5 whitespace-pre-wrap">
                    {generatedPrompt}
                  </div>
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
                {[
                  { id: 1, text: "ارفع صور واضحة للمنتج تحت إضاءة جيدة لتحسين تحليل الذكاء الاصطناعي." },
                  { id: 2, text: "اختر 'مشكلة وحل' إذا كان منتجك يقدم فائدة وظيفية واضحة للعميل." },
                  { id: 3, text: "وضع 'استجابة مباشرة' هو الأفضل لزيادة المبيعات الفورية." }
                ].map((tip) => (
                  <li key={tip.id} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-purple/20 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-purple">
                      {tip.id}
                    </span>
                    {tip.text}
                  </li>
                ))}
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
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-white/10 text-center text-white/30 text-xs">
        <p>© Generator Prompt Ai 2024 - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

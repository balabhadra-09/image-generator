/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  History, 
  Zap, 
  Layout, 
  Maximize2, 
  Trash2, 
  Loader2,
  ChevronRight,
  Github,
  Twitter,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
}

// --- Constants ---
const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', icon: 'Square' },
  { label: '16:9', value: '16:9', icon: 'Monitor' },
  { label: '9:16', value: '9:16', icon: 'Smartphone' },
  { label: '4:3', value: '4:3', icon: 'RectangleHorizontal' },
  { label: '3:4', value: '3:4', icon: 'RectangleVertical' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    if (process.env.GEMINI_API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!aiRef.current) {
      setError("API Key not found. Please check your environment variables.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substring(7),
          url: imageUrl,
          prompt,
          timestamp: Date.now(),
          aspectRatio,
        };
        setHistory(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
        setPrompt('');
      } else {
        throw new Error("No image data returned from the model.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string) => {
    setHistory(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Lumina AI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <a href="#" className="hover:text-white transition-colors">Models</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all active:scale-95">
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold tracking-tighter leading-tight"
            >
              Imagine anything. <br />
              <span className="text-indigo-400">Generate instantly.</span>
            </motion.h1>
            <p className="text-white/40 text-lg max-w-md">
              The next generation of AI image generation. Powered by Gemini 2.5 Flash.
            </p>
          </div>

          <div className="space-y-6 p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                Prompt
              </label>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic cyberpunk city with neon lights and flying cars, cinematic lighting, 8k..."
                  className="w-full h-32 px-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all resize-none placeholder:text-white/20 text-sm"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                    onClick={() => setPrompt("A surreal landscape where mountains are made of crystal and the sky is a deep violet with two moons")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    title="Surprise me"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${
                      aspectRatio === ratio.value
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 border-2 rounded-sm ${aspectRatio === ratio.value ? 'border-indigo-400' : 'border-current opacity-40'}`} 
                      style={{ 
                        aspectRatio: ratio.value.replace(':', '/'),
                        width: ratio.value === '16:9' ? '1.2rem' : ratio.value === '9:16' ? '0.8rem' : '1rem'
                      }} 
                    />
                    <span className="text-[10px] font-bold">{ratio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                isGenerating || !prompt.trim()
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Image
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Features / Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Speed', value: '2.4s', icon: Zap },
              { label: 'Quality', value: '4K', icon: Maximize2 },
              { label: 'Models', value: 'v2.5', icon: Layout },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center gap-1">
                <stat.icon className="w-4 h-4 text-white/20 mb-1" />
                <span className="text-white font-bold">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Preview & History */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Preview */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center group">
            <AnimatePresence mode="wait">
              {selectedImage ? (
                <motion.div
                  key={selectedImage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.prompt}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => downloadImage(selectedImage.url, `lumina-${selectedImage.id}`)}
                      className="p-4 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-xl"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => deleteImage(selectedImage.id)}
                      className="p-4 rounded-full bg-red-500 text-white hover:scale-110 transition-transform shadow-xl"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Prompt Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-sm text-white/80 line-clamp-2">
                    {selectedImage.prompt}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20">
                  {isGenerating ? (
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-20 h-20 opacity-10" />
                      <p className="text-lg font-medium">Your masterpiece will appear here</p>
                    </>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* History / Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold tracking-tight">Recent Generations</h3>
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                {history.length} Images
              </span>
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {history.map((img) => (
                  <motion.button
                    layoutId={img.id}
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage?.id === img.id ? 'border-indigo-500 scale-95' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20">
                <p className="text-sm">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold tracking-tight">Lumina AI</span>
          </div>
          
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex gap-4">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Github className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-center mt-12 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
          &copy; 2026 Lumina AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

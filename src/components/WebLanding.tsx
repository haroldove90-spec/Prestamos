import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, CheckCircle, Calendar, ShieldCheck, 
  Smartphone, Mail, MapPin, Image as ImageIcon, Settings, 
  Edit, Save, Plus, Trash, Menu, X, Percent, Star, 
  MessageCircle, Phone, Sparkles, Send, CheckCircle2
} from 'lucide-react';
import { LandingPageConfig, DEFAULT_LANDING_CONFIG, CreditRequest } from '../types';

interface WebLandingProps {
  config: LandingPageConfig;
  onUpdateConfig: (newConfig: LandingPageConfig) => void;
  isAdminMode: boolean;
  onAddRequest?: (request: CreditRequest) => void;
  onSwitchTab?: (tab: any) => void;
  onGoHome?: () => void;
  onClearDatabase?: () => Promise<boolean>;
}

export function WebLanding({ 
  config = DEFAULT_LANDING_CONFIG, 
  onUpdateConfig, 
  isAdminMode,
  onAddRequest,
  onSwitchTab,
  onGoHome,
  onClearDatabase
}: WebLandingProps) {
  // Navigation & interaction states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMonto, setSelectedMonto] = useState<number | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'general' | 'hero' | 'benefits' | 'how' | 'slides'>('general');

  // Quick loan application form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPurpose, setApplicantPurpose] = useState('Personal');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showAppGate, setShowAppGate] = useState(true);
  const [isClearingDb, setIsClearingDb] = useState(false);
  const [dbClearSuccess, setDbClearSuccess] = useState<boolean | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<'idle' | 'installing' | 'installed' | 'failed'>('idle');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      setInstallationStatus('installing');
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallationStatus('installed');
          setIsInstalled(true);
          setDeferredPrompt(null);
          setTimeout(() => {
            setShowAppGate(false);
          }, 1000);
        } else {
          setInstallationStatus('failed');
        }
      } catch (err) {
        console.error('Error triggered PWA prompt:', err);
        setInstallationStatus('failed');
      }
    } else {
      // Fallback for browsers or iframes where the prompt is not supported/caught
      setInstallationStatus('installing');
      setTimeout(() => {
        setInstallationStatus('installed');
        setIsInstalled(true);
        setTimeout(() => {
          setShowAppGate(false);
        }, 1200);
      }, 1800);
    }
  };

  const handleExecuteClearDb = async () => {
    if (!onClearDatabase) return;
    setIsClearingDb(true);
    setDbClearSuccess(null);
    try {
      const ok = await onClearDatabase();
      if (ok) {
        setDbClearSuccess(true);
        setTimeout(() => {
          setShowClearConfirm(false);
          setDbClearSuccess(null);
        }, 2500);
      } else {
        setDbClearSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setDbClearSuccess(false);
    } finally {
      setIsClearingDb(false);
    }
  };

  // Admin editable fields copy state (to edit and save)
  const [editedConfig, setEditedConfig] = useState<LandingPageConfig>({ ...config });

  useEffect(() => {
    setEditedConfig({ ...config });
  }, [config]);

  // Auto scroll slider images
  useEffect(() => {
    if (config.sliderImages && config.sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % config.sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [config.sliderImages]);

  const presetPlans = [
    { capital: 3000, total: 4200, interest: 1200 },
    { capital: 4000, total: 5600, interest: 1600 },
    { capital: 5000, total: 7000, interest: 2000 },
    { capital: 6000, total: 8400, interest: 2400 },
    { capital: 7000, total: 9800, interest: 2800 },
    { capital: 8000, total: 11200, interest: 3200 },
    { capital: 9000, total: 12600, interest: 3600 },
    { capital: 10000, total: 14000, interest: 4000 }
  ];

  const handleOpenApplication = (monto: number) => {
    setSelectedMonto(monto);
    setShowRequestModal(true);
    setShowAppGate(true);
    setRequestSubmitted(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;

    if (onAddRequest) {
      const selectedPlan = presetPlans.find(p => p.capital === selectedMonto);
      const interest = selectedPlan ? selectedPlan.interest : Math.round((selectedMonto || 5000) * 0.4);
      
      const newRequest: CreditRequest = {
        id: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName: applicantName,
        requestedAmount: selectedMonto || 5000,
        purpose: applicantPurpose,
        score: Math.floor(450 + Math.random() * 350), // Random simulated score for pipeline
        category: 'Personal',
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'PENDIENTE',
        loanType: 'Préstamo Fijo (Mensual)',
        monthlyPlan: `${selectedMonto || 5000} para pagar ${selectedMonto ? selectedMonto + interest : 7000}`
      };
      onAddRequest(newRequest);
    }

    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantEmail('');
      if (onSwitchTab) {
        onSwitchTab('requests'); // Switch to requests tab to let user see or admin see!
      }
    }, 3000);
  };

  const handleAdminSave = () => {
    onUpdateConfig(editedConfig);
    alert('¡Configuración de la Landing Page actualizada exitosamente!');
  };

  const updateBenefit = (index: number, field: 'title' | 'description', value: string) => {
    const updatedBenefits = [...editedConfig.benefits];
    updatedBenefits[index] = { ...updatedBenefits[index], [field]: value };
    setEditedConfig({ ...editedConfig, benefits: updatedBenefits });
  };

  const updateHowItWorks = (index: number, field: 'title' | 'description', value: string) => {
    const updatedHow = [...editedConfig.howItWorks];
    updatedHow[index] = { ...updatedHow[index], [field]: value };
    setEditedConfig({ ...editedConfig, howItWorks: updatedHow });
  };

  const handleAddSliderImage = (url: string) => {
    if (!url) return;
    setEditedConfig({
      ...editedConfig,
      sliderImages: [...editedConfig.sliderImages, url]
    });
  };

  const handleRemoveSliderImage = (index: number) => {
    const images = editedConfig.sliderImages.filter((_, idx) => idx !== index);
    setEditedConfig({
      ...editedConfig,
      sliderImages: images
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none" id="landing-page-root">
      
      {/* ------------------ ADMIN PANEL PANEL (FLOATING / ACCORDION OR HEADER IF ADMIN MODE ACTIVE) ------------------ */}
      {isAdminMode && (
        <div className="bg-slate-950 border-b-2 border-[#a3c90e]/80 p-5 animate-fadeIn relative z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#a3c90e]/10 text-[#a3c90e] rounded-xl border border-[#a3c90e]/20">
                  <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Panel de Administración Web (Landing Page)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Personaliza toda la información, imágenes y canales de contacto del portal público.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAdminSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#a3c90e] to-emerald-500 hover:from-[#b8e014] hover:to-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl transition shadow-md shadow-[#a3c90e]/10 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios en la Nube
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'general', label: 'Contacto y Redes' },
                { id: 'hero', label: 'Hero Principal' },
                { id: 'benefits', label: 'Beneficios' },
                { id: 'how', label: 'Cómo Funciona' },
                { id: 'slides', label: 'Imágenes del Slider' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                    activeAdminTab === tab.id
                      ? 'bg-slate-800 border-[#a3c90e] text-white font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Admin Form Fields */}
            <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
              {activeAdminTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Logo URL:</label>
                    <input
                      type="text"
                      value={editedConfig.logoUrl}
                      onChange={(e) => setEditedConfig({ ...editedConfig, logoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={editedConfig.phone}
                      onChange={(e) => setEditedConfig({ ...editedConfig, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">WhatsApp (Número sin espacios):</label>
                    <input
                      type="text"
                      value={editedConfig.whatsapp}
                      onChange={(e) => setEditedConfig({ ...editedConfig, whatsapp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Email de Contacto:</label>
                    <input
                      type="email"
                      value={editedConfig.email}
                      onChange={(e) => setEditedConfig({ ...editedConfig, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Dirección Física:</label>
                    <input
                      type="text"
                      value={editedConfig.address}
                      onChange={(e) => setEditedConfig({ ...editedConfig, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                </div>
              )}

              {activeAdminTab === 'hero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Título Hero Principal:</label>
                      <input
                        type="text"
                        value={editedConfig.heroTitle}
                        onChange={(e) => setEditedConfig({ ...editedConfig, heroTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Texto de Botón (CTA):</label>
                      <input
                        type="text"
                        value={editedConfig.heroCtaText}
                        onChange={(e) => setEditedConfig({ ...editedConfig, heroCtaText: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Subtítulo Hero:</label>
                    <textarea
                      value={editedConfig.heroSubtitle}
                      onChange={(e) => setEditedConfig({ ...editedConfig, heroSubtitle: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fondo de Respaldo Hero (URL de Imagen):</label>
                    <input
                      type="text"
                      value={editedConfig.heroBackgroundUrl}
                      onChange={(e) => setEditedConfig({ ...editedConfig, heroBackgroundUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                </div>
              )}

              {activeAdminTab === 'benefits' && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#a3c90e] font-mono mb-2">Edita los 3 Beneficios Principales que se muestran en el sitio:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {editedConfig.benefits.map((b, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block mb-2">
                          Beneficio #{idx + 1}
                        </span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Título:</label>
                            <input
                              type="text"
                              value={b.title}
                              onChange={(e) => updateBenefit(idx, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-[#a3c90e]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Descripción:</label>
                            <textarea
                              value={b.description}
                              onChange={(e) => updateBenefit(idx, 'description', e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-[#a3c90e] text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminTab === 'how' && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#38bdf8] font-mono mb-2">Modifica los Pasos de la Guía "¿Cómo funciona?":</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {editedConfig.howItWorks.map((h, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-mono font-black text-[#38bdf8] uppercase tracking-widest block mb-2">
                          Paso #{idx + 1}
                        </span>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Título:</label>
                            <input
                              type="text"
                              value={h.title}
                              onChange={(e) => updateHowItWorks(idx, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-[#a3c90e]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Descripción:</label>
                            <textarea
                              value={h.description}
                              onChange={(e) => updateHowItWorks(idx, 'description', e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-[#a3c90e] text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminTab === 'slides' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Pega la URL de una nueva imagen de Unsplash u otra fuente..."
                      id="new-slide-url-input"
                      className="flex-1 bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#a3c90e]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSliderImage((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('new-slide-url-input') as HTMLInputElement;
                        if (el && el.value) {
                          handleAddSliderImage(el.value);
                          el.value = '';
                        }
                      }}
                      className="px-4 py-1.5 bg-[#a3c90e] text-slate-950 font-black rounded-lg hover:bg-[#b8e014] uppercase tracking-wider text-[11px] cursor-pointer"
                    >
                      Añadir Imagen
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {editedConfig.sliderImages.map((img, idx) => (
                      <div key={idx} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group relative">
                        <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center p-1.5 text-center">
                          <button
                            onClick={() => handleRemoveSliderImage(idx)}
                            className="p-1 bg-red-600 hover:bg-red-500 rounded text-white cursor-pointer"
                            title="Eliminar de las diapositivas"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 bg-slate-950/80 text-[8.5px] font-mono text-white px-1.5 rounded">
                          Slide #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ VISITOR HEADER / NAV ------------------ */}
      <header className="bg-slate-950/95 border-b border-slate-850 sticky top-0 z-30 backdrop-blur" id="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={config.logoUrl} 
              alt="Saldo app" 
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fail-safe default logo if user sets invalid logoUrl
                (e.target as HTMLImageElement).src = "https://cossma.com.mx/saldaapplogo.png";
              }}
            />
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#beneficios" className="hover:text-white transition">¿Por qué nosotros?</a>
            <a href="#planes" className="hover:text-white transition">Nuestros Préstamos</a>
            <a href="#como-funciona" className="hover:text-white transition">¿Cómo funciona?</a>
          </div>

          <div className="flex items-center gap-3">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-wide rounded-xl border border-slate-850 transition cursor-pointer flex items-center gap-1 active:scale-95"
                title="Volver a Consola Principal"
              >
                ← Consola
              </button>
            )}

            {/* Quick whatsapp CTA */}
            <a 
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/20 rounded-xl transition cursor-pointer"
              title="Atención por WhatsApp"
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </a>
            
            <button
              onClick={() => handleOpenApplication(5000)}
              className="px-4 py-2 bg-gradient-to-r from-[#a3c90e] to-emerald-500 text-slate-950 hover:from-[#b8e014] hover:to-emerald-400 font-extrabold text-[11px] uppercase tracking-wide rounded-xl transition cursor-pointer shadow-lg shadow-[#a3c90e]/10 active:scale-95"
            >
              ¡Solicita Ya!
            </button>
          </div>
        </div>
      </header>

      {/* ------------------ HERO SECTION WITH REVOLVING CAROUSEL ------------------ */}
      <section className="relative min-h-[500px] lg:min-h-[580px] flex items-center bg-slate-950 py-16 overflow-hidden" id="landing-hero">
        {/* Revolving Background Images Carousel */}
        {config.sliderImages && config.sliderImages.length > 0 ? (
          <div className="absolute inset-0">
            {config.sliderImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-25' : 'opacity-0'}`}
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover scale-105" 
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-950/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-950/60" />
        )}

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a3c90e]/10 border border-[#a3c90e]/20 text-[#a3c90e] rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 100% Digital y Seguro
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {config.heroTitle}
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
              {config.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => handleOpenApplication(5000)}
                className="px-6 py-3.5 bg-gradient-to-r from-[#a3c90e] to-emerald-500 hover:from-[#b8e014] hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide rounded-xl transition shadow-lg shadow-[#a3c90e]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {config.heroCtaText} <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              
              <a
                href="#planes"
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs uppercase font-bold tracking-wide transition text-center flex items-center justify-center"
              >
                Ver tabla de pagos
              </a>
            </div>
          </div>

          {/* Quick interactive loan calculator banner card on Hero */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 relative shadow-2xl backdrop-blur animate-slideUp">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3c90e]/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-black font-mono text-[#a3c90e] uppercase tracking-wider border-b border-slate-850 pb-2 mb-4 flex items-center gap-1.5">
              <span>🧮</span> Simulador de Finanzas Rápidas
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-sans font-medium">
                  <span>¿Cuánto dinero necesitas?</span>
                  <span className="text-white font-extrabold font-mono text-sm">$5,000 MXN</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3000, 5000, 7000, 10000].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleOpenApplication(m)}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-center text-[11.5px] font-mono font-bold hover:border-[#a3c90e] transition text-slate-200"
                    >
                      ${m.toLocaleString('es-MX')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0284c7]/5 border border-[#0284c7]/15 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-[11px] font-sans font-medium">
                  <span className="text-slate-400">Plazo preferido:</span>
                  <span className="text-white font-bold">Mensual (4 Semanas)</span>
                </div>
                <div className="flex justify-between text-[11px] font-sans font-medium">
                  <span className="text-slate-400">Esquema de pago:</span>
                  <span className="text-emerald-400 font-bold">Amortización Fija</span>
                </div>
                <div className="flex justify-between text-[11.5px] font-sans font-medium border-t border-slate-800/60 pt-2">
                  <span className="text-slate-300 font-bold">Total estimado a liquidar:</span>
                  <span className="text-[#a3c90e] font-mono font-black text-sm">$7,000 MXN</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenApplication(5000)}
                className="w-full py-3 bg-[#a3c90e] hover:bg-[#b8e014] text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center"
              >
                Solicitar Simulación
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ BENEFITS SECTION ------------------ */}
      <section className="py-16 bg-slate-900 border-t border-slate-850" id="beneficios">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#a3c90e] uppercase tracking-widest bg-[#a3c90e]/5 border border-[#a3c90e]/10 px-2.5 py-1 rounded-full">
              BENEFICIOS CLAVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¿Por qué elegir Saldo app?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Diseñamos nuestras opciones financieras con el firme objetivo de apoyarte cuando más lo necesitas, sin enredos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.benefits.map((benefit, idx) => {
              // Custom icons for the three benefits
              const Icons = [ShieldCheck, Calendar, Smartphone];
              const IconComp = Icons[idx % Icons.length];

              return (
                <div 
                  key={idx} 
                  className="bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col items-center text-center space-y-4 hover:border-slate-700 transition"
                >
                  <span className="p-3 bg-[#a3c90e]/10 border border-[#a3c90e]/20 rounded-xl text-[#a3c90e]">
                    <IconComp className="w-6 h-6" />
                  </span>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------ LOAN OFFERS & PLANS SECTION ------------------ */}
      <section className="py-16 bg-slate-950 border-t border-slate-850" id="planes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase tracking-widest bg-[#38bdf8]/5 border border-[#38bdf8]/10 px-2.5 py-1 rounded-full">
              SQUEMA DE PAGOS CLAROS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nuestros Préstamos Mensuales
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Encuentra el monto ideal para tus metas o emergencias. Así de claro es nuestro esquema:
            </p>
          </div>

          {/* Table / Cards view */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto text-left">
            {presetPlans.map((plan, idx) => (
              <div 
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-[#a3c90e]/50 transition flex flex-col justify-between group relative shadow-md hover:shadow-lg hover:shadow-[#a3c90e]/5 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#a3c90e]/2 rounded-full blur-2xl group-hover:bg-[#a3c90e]/5 transition pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                      OPCIÓN DE PRESTAMO #{idx + 1}
                    </span>
                    <span className="text-[9px] bg-emerald-600/10 text-emerald-400 border border-emerald-600/25 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                      Fijo
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-sans font-medium">Recibes:</div>
                    <div className="text-2xl font-black text-white font-mono">
                      ${plan.capital.toLocaleString('es-MX')} <span className="text-[11px] text-slate-400 font-normal">MXN</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-sans font-medium">Pagas Total (con Interés):</div>
                    <div className="text-lg font-black text-[#a3c90e] font-mono">
                      ${plan.total.toLocaleString('es-MX')} <span className="text-[10px] text-[#a3c90e]/70 font-normal">MXN</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => handleOpenApplication(plan.capital)}
                    className="w-full py-2 bg-slate-950 hover:bg-[#a3c90e] group-hover:text-slate-950 text-slate-300 font-bold text-[11px] uppercase tracking-wide rounded-xl border border-slate-800 group-hover:border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Solicitar este monto <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ HOW IT WORKS SECTION ------------------ */}
      <section className="py-16 bg-slate-900 border-t border-slate-850" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#a3c90e] uppercase tracking-widest bg-[#a3c90e]/5 border border-[#a3c90e]/10 px-2.5 py-1 rounded-full">
              PASO A PASO
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¿Cómo funciona? (Tres pasos sencillos)
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Hemos simplificado todo el proceso para que no pierdas tiempo en sucursales o trámites tediosos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-3 text-center relative z-10">
              <span className="w-12 h-12 rounded-full bg-gradient-to-r from-[#a3c90e] to-emerald-500 text-slate-950 flex items-center justify-center text-lg font-black font-mono shadow-md shadow-[#a3c90e]/10">
                1
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-tight pt-1">
                {config.howItWorks[0]?.title || "Elige tu monto"}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans max-w-xs">
                {config.howItWorks[0]?.description || "Revisa nuestras opciones mensuales de $3,000 hasta $10,000 pesos."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-3 text-center relative z-10">
              <span className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 text-slate-950 flex items-center justify-center text-lg font-black font-mono shadow-md shadow-emerald-500/10">
                2
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-tight pt-1">
                {config.howItWorks[1]?.title || "Completa tu solicitud"}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans max-w-xs">
                {config.howItWorks[1]?.description || "Llena tus datos básicos de forma rápida y segura desde nuestra plataforma."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-3 text-center relative z-10">
              <span className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-950 flex items-center justify-center text-lg font-black font-mono shadow-md shadow-indigo-500/10">
                3
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-tight pt-1">
                {config.howItWorks[2]?.title || "Recibe tu dinero"}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans max-w-xs">
                {config.howItWorks[2]?.description || "Una vez autorizado, tendrás el saldo disponible para usarlo en lo que necesites."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ CALL TO ACTION (CLOSURE) & CONTACT INFO ------------------ */}
      <section className="py-16 bg-slate-950 border-t border-slate-850 relative overflow-hidden" id="contacto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-xl mx-auto leading-normal">
            Toma el control de tus finanzas con Saldo app.
          </h2>
          
          <div>
            <button
              onClick={() => handleOpenApplication(5000)}
              className="px-8 py-4 bg-gradient-to-r from-[#a3c90e] to-emerald-500 text-slate-950 hover:from-[#b8e014] hover:to-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-xl shadow-[#a3c90e]/15 cursor-pointer active:scale-95 inline-flex items-center gap-2"
            >
              Iniciar mi solicitud <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          <div className="pt-6 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
            <div className="flex flex-col items-center space-y-1.5">
              <Phone className="w-4 h-4 text-[#a3c90e]" />
              <span className="font-semibold text-white">Llámanos</span>
              <span>{config.phone}</span>
            </div>
            <div className="flex flex-col items-center space-y-1.5">
              <Mail className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-semibold text-white">Escríbenos</span>
              <span>{config.email}</span>
            </div>
            <div className="flex flex-col items-center space-y-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Sucursal</span>
              <span>{config.address}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ FOOTER ------------------ */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-[10px] text-slate-500 leading-relaxed font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="max-w-3xl mx-auto px-4">
            Saldo app es una plataforma segura. Todos nuestros préstamos están sujetos a aprobación de crédito y viabilidad de pago. Consulta términos, condiciones y CAT promedio anual en nuestra oficina matriz.
          </p>
          <div className="flex justify-center items-center gap-2">
            <img src={config.logoUrl} alt="Saldo app" className="h-4 w-auto opacity-30 object-contain" referrerPolicy="no-referrer" />
            <span>• © {new Date().getFullYear()} Saldo app. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* ------------------ QUICK APPLICATION MODAL (REAL REQUEST GENERATOR) ------------------ */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="p-2 bg-[#a3c90e]/10 text-[#a3c90e] rounded-xl">
                <Star className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Formulario de Solicitud Express
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Saldo app • Préstamo Fijo de ${selectedMonto?.toLocaleString('es-MX')} MXN
                </p>
              </div>
            </div>

            {showAppGate ? (
              <div className="space-y-5 animate-fadeIn text-slate-300 text-xs">
                <div className="bg-[#a3c90e]/10 border border-[#a3c90e]/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-10 h-10 text-[#a3c90e] shrink-0 animate-bounce mt-1" />
                    <div>
                      <h5 className="text-white font-black uppercase text-xs">Paso Requerido Obligatorio</h5>
                      <p className="text-[11px] leading-relaxed mt-1">
                        Para registrarte y solicitar tu préstamo de <strong className="text-white">${selectedMonto?.toLocaleString('es-MX')} MXN</strong>, tiene que instalar su app móvil en su celular antes de continuar con la solicitud.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-200">¿Por qué es necesario instalar la App antes?</p>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-400">
                    <li>Validación biométrica e identidad 100% segura.</li>
                    <li>Firma digital de su contrato fiduciario de amortización.</li>
                    <li>Desembolso de fondos inmediato a su cuenta bancaria.</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleInstallApp}
                    disabled={installationStatus === 'installing' || installationStatus === 'installed'}
                    className={`w-full py-3.5 rounded-xl font-black uppercase text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      installationStatus === 'installed'
                        ? 'bg-emerald-600 text-white border border-emerald-500'
                        : 'bg-[#a3c90e] hover:bg-[#b8e014] text-slate-950'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 shrink-0" />
                    {installationStatus === 'idle' && 'Instalar Salda App en mi Celular'}
                    {installationStatus === 'installing' && 'Iniciando instalación segura...'}
                    {installationStatus === 'installed' && '✓ ¡App Instalada Correctamente!'}
                    {installationStatus === 'failed' && 'Reintentar Instalación Directa'}
                  </button>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-2">
                    <p className="text-[10px] text-[#a3c90e] font-bold uppercase tracking-wider">💡 Guía de instalación rápida:</p>
                    <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
                      <p>• <strong>En Android / Chrome:</strong> Presiona el botón de arriba. Si no abre, haz clic en los 3 puntos superiores <code className="text-white">⋮</code> y selecciona <strong className="text-white">"Instalar aplicación"</strong>.</p>
                      <p>• <strong>En iPhone / Safari:</strong> Presiona el botón de compartir <span className="text-white">⎋</span> (abajo) y elige <strong className="text-white">"Agregar a inicio"</strong> (Add to Home Screen).</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-3 flex flex-col gap-2">
                  <button
                    onClick={() => setShowAppGate(false)}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold uppercase rounded-xl border border-slate-800 transition cursor-pointer text-center active:scale-95 text-[10px] flex items-center justify-center gap-2"
                  >
                    Ya tengo instalada la App, continuar <ArrowRight className="w-4 h-4 text-[#a3c90e]" />
                  </button>
                </div>
              </div>
            ) : requestSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
                <span className="p-3 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/25">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </span>
                <h5 className="text-white font-extrabold text-sm uppercase tracking-wide">
                  ¡Solicitud Enviada con Éxito!
                </h5>
                <p className="text-xs text-slate-300 px-4 leading-relaxed">
                  Tu expediente ha sido creado y enviado al departamento de aprobación. Nos pondremos en contacto contigo en breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nombre Completo del Solicitante:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Esperanza Escobedo Guzman"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a3c90e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Número de Teléfono:</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 8112345678"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Finalidad del Préstamo:</label>
                    <select
                      value={applicantPurpose}
                      onChange={(e) => setApplicantPurpose(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-[#a3c90e]"
                    >
                      <option value="Personal">Personal / Gastos</option>
                      <option value="Negocio">Impulso Negocio</option>
                      <option value="Salud">Médico / Emergencia</option>
                      <option value="Estudios">Educación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email de Contacto (Opcional):</label>
                  <input
                    type="email"
                    placeholder="Ej. ejemplo@correo.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a3c90e]"
                  />
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1 text-[11px] leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Préstamo Solicitado:</span>
                    <span className="text-white font-bold">${selectedMonto?.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-[#a3c90e]">
                    <span className="font-medium">Total Estimado a Pagar:</span>
                    <span className="font-extrabold">
                      ${presetPlans.find(p => p.capital === selectedMonto)?.total.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-850 mt-1">
                    4 pagos semanales amortizables
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#a3c90e] to-emerald-500 text-slate-950 hover:from-[#b8e014] hover:to-emerald-400 font-extrabold uppercase tracking-wide rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#a3c90e]/10 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Solicitud de Crédito
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

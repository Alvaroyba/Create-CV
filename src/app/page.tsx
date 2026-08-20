'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { hasExistingData, clearCV } from '@/lib/storage';
import { useCVContext } from '@/providers/cv-provider';
import { createEmptyCVData } from '@/lib/schemas/cv';

export default function HomePage() {
  const router = useRouter();
  const cvContext = useCVContext();
  const [hasData, setHasData] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHasData(hasExistingData());
  }, []);

  const handleNew = () => {
    if (hasData) {
      setShowConfirm(true);
    } else {
      cvContext.replaceAll(createEmptyCVData());
      router.push('/editor');
    }
  };

  const confirmNew = () => {
    clearCV();
    cvContext.replaceAll(createEmptyCVData());
    setShowConfirm(false);
    router.push('/editor');
  };

  return (
    <div className="min-h-screen mesh-gradient-bg flex flex-col justify-between text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                Creador de CV
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                ATS Friendly
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#adaptar-oferta" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-semibold text-indigo-600">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              Adaptar a Oferta
            </a>
            <a href="#ventajas" className="hover:text-indigo-600 transition-colors">Ventajas</a>
            <a href="#plantillas" className="hover:text-indigo-600 transition-colors">3 Plantillas</a>
            <a href="#como-funciona" className="hover:text-indigo-600 transition-colors">Cómo funciona</a>
          </div>

          <div className="flex items-center gap-3">
            {hasData && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/editor')}
                className="hidden sm:inline-flex bg-white/80 hover:bg-white text-indigo-700 border border-indigo-200 shadow-xs"
              >
                Continuar CV
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNew}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30"
            >
              Empezar Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-300/25 to-blue-300/25 blur-3xl rounded-full pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-200/25 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-indigo-200 text-xs font-semibold text-indigo-900 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span>✨ <strong>Nuevo:</strong> Pega la oferta de empleo y adapta tu CV automáticamente con IA</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Crea y adapta tu CV para{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  conseguir cualquier empleo
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                Diseña un currículum vitae profesional en minutos. Pega la descripción de cualquier oferta laboral para sincronizar palabras clave, supera los filtros ATS y descarga un PDF perfecto.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 w-full pt-4 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={handleNew}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Crear CV nuevo
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/editor?openTailor=1')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-indigo-900 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Pegar oferta & Adaptar CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/editor?openPdfImport=1')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-slate-700 bg-white/90 hover:bg-white hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Importar PDF
                </button>
              </div>

              {/* Continue Editing Banner if existing data */}
              {hasData && (
                <div className="pt-2 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => router.push('/editor')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium hover:bg-emerald-100/80 transition-colors shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Tienes un CV guardado en progreso — <strong>Continuar editando →</strong></span>
                  </button>
                </div>
              )}

              {/* Micro Trust badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  100% Gratuito y sin registro
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Adaptación con IA a ofertas laborales
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Exportación PDF Pixel-Perfect
                </span>
              </div>
            </div>

            {/* Showcase Visual - Clean non-overlapping layout */}
            <div className="mt-12 relative max-w-5xl mx-auto">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur-xl opacity-15 pointer-events-none -z-10"></div>
              
              {/* Feature Tags Bar (Placed neatly above the card to avoid any text overlap) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="glass-card bg-white/90 p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                    98%
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">Compatibilidad ATS</p>
                    <p className="text-[11px] text-slate-500 truncate">Pasa filtros Greenhouse & Workday</p>
                  </div>
                </div>

                <div className="glass-card bg-white/90 p-3 rounded-xl border border-indigo-200/80 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-indigo-950 truncate">Adaptación a Ofertas</p>
                    <p className="text-[11px] text-indigo-700 truncate">Pega la vacante y sincroniza con IA</p>
                  </div>
                </div>

                <div className="glass-card bg-white/90 p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">Exportación Rápida</p>
                    <p className="text-[11px] text-slate-500 truncate">PDF HD listo para enviar en 1 clic</p>
                  </div>
                </div>
              </div>

              {/* Main Resume Preview Card (No badges inside to avoid obscuring content) */}
              <div className="glass-panel rounded-2xl shadow-xl p-5 sm:p-7 border border-slate-200/90 relative">
                <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 sm:p-8 md:p-10 font-sans text-left">
                  <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Alvaro Ybañez</h2>
                      <p className="text-indigo-600 font-semibold text-sm mt-0.5">Ingeniero de Software Senior & Arquitecto Frontend</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md">Madrid / Remoto</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md">alvaro@example.com</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md">+34 600 000 000</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Perfil Profesional</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Especialista en desarrollo web moderno, arquitectura escalable y rendimiento. Apasionado por crear interfaces intuitivas, accesibles y productos digitales de alta conversión optimizados para los objetivos de la empresa.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Experiencia Laboral</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-800">
                              <span>Lead Frontend Developer • Tech Corp</span>
                              <span className="text-slate-400 font-normal">2022 - Presente</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              • Liderazgo de equipo de 8 desarrolladores y optimización del Core Web Vitals en un 40%.
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-800">
                              <span>Senior Full Stack Developer • Digital Studio</span>
                              <span className="text-slate-400 font-normal">2020 - 2022</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              • Desarrollo e integración de microfrontends e implementación de flujos de pago seguros.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Habilidades Clave</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {['React / Next.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'Arquitectura Web', 'Testing', 'CI/CD'].map((skill) => (
                            <span key={skill} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100/60">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Educación</h3>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800">Grado en Ingeniería Informática</p>
                          <p className="text-[11px] text-slate-500">Universidad Politécnica • 2016 - 2020</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Idiomas</h3>
                        <p className="text-[11px] text-slate-600">Español (Nativo), Inglés (C1 Profesional)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Vista previa en vivo interactiva
                  </span>
                  <span className="font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    Plantilla Moderna Seleccionada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Focus: Tailor CV to Job Offer */}
        <section id="adaptar-oferta" className="py-16 bg-gradient-to-b from-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Función Estrella con Inteligencia Artificial
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Pega cualquier oferta laboral y adapta tu CV en segundos
                </h2>

                <p className="text-slate-300 text-base leading-relaxed">
                  ¿Encontraste una vacante en LinkedIn o InfoJobs? Simplemente copia el texto de la oferta y pégalo en nuestro editor. La IA analizará los requisitos, extraerá las palabras clave exactas y reescribirá tu perfil para que coincida al 100% con lo que busca la empresa.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <p className="text-sm text-slate-300">
                      <strong>Sincronización de Palabras Clave:</strong> Asegura que los filtros automáticos detecten las habilidades requeridas.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <p className="text-sm text-slate-300">
                      <strong>Reenfoque de Logros:</strong> Destaca las experiencias laborales más relevantes para ese puesto concreto.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <p className="text-sm text-slate-300">
                      <strong>Generación desde Cero:</strong> Si no tienes un CV previo, la IA puede redactar una base adaptada a la vacante.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/editor?openTailor=1')}
                    className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2 text-sm"
                  >
                    <span>Probar Adaptador de Ofertas Ahora</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Visual Mockup of Job Offer Tailor Tool */}
              <div className="lg:col-span-6">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                      <span className="text-xs font-medium text-slate-400 ml-2">Adaptar CV a Oferta de Empleo</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                      IA Asistente
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3.5">
                      <p className="text-xs font-semibold text-slate-300 mb-1.5">📋 Oferta de empleo pegada:</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                        "Buscamos Senior Frontend Developer con experiencia en Next.js, TypeScript y optimización de rendimiento web. Se valorará liderazgo técnico..."
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Optimizando perfil y destacando habilidades clave...
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-emerald-300">✓ CV Adaptado con éxito</span>
                        <span className="text-[10px] font-bold text-emerald-400">Match 99%</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/90">
                        • Resumen reorientado a Liderazgo Frontend y Next.js.<br />
                        • Palabras clave insertadas en experiencias y habilidades.<br />
                        • Formato 100% compatible con ATS listo para exportar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="ventajas" className="py-20 bg-white/70 border-b border-slate-200/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Ventajas Principales
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
                Herramientas pensadas para conseguir trabajo
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Todo lo que necesitas para diseñar, adaptar y exportar tu currículum sin perder horas formateando.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-7 rounded-2xl border border-slate-200/70 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptación a Ofertas Laborales</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pega cualquier oferta de trabajo y adapta tu currículum al instante. La IA resalta las competencias exactas que el reclutador está buscando.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-7 rounded-2xl border border-slate-200/70 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Optimizado para ATS</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Jerarquía semántica limpia que los sistemas de recursos humanos (ATS) leen sin errores tipográficos ni pérdidas de información.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-7 rounded-2xl border border-slate-200/70 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Importación desde PDF</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  ¿Ya tienes un currículum existente? Súbelo y extrae tus secciones y experiencia de manera automática para editarlas al momento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section - Exactly 3 Templates */}
        <section id="plantillas" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                3 Plantillas Profesionales
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
                Elige el estilo perfecto para tu perfil
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Puedes alternar entre cualquiera de las 3 plantillas en tiempo real dentro del editor con un solo clic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              {/* Template 1: Clásica */}
              <div className="glass-card bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900">Clásica</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Corporativa
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Estructura tradicional, sobria y de máxima legibilidad. Ideal para sectores como finanzas, administración, legal y grandes empresas.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
                    <p>• Formato en una columna estándar</p>
                    <p>• Encabezados formales y orden cronológico</p>
                    <p>• 100% amigable con sistemas de selección</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Plantilla incluida</span>
                  <span>Usar en el editor →</span>
                </div>
              </div>

              {/* Template 2: Moderna */}
              <div className="glass-card bg-white p-6 rounded-2xl border-2 border-indigo-400/60 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative">
                <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Recomendada
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900">Moderna</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Tech & Digital
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Diseño contemporáneo con sutiles toques de color y excelente jerarquía visual. La preferida para perfiles de tecnología, startups y consultoría.
                  </p>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 text-xs text-slate-600 space-y-1">
                    <p>• Distribución equilibrada de espacio</p>
                    <p>• Etiquetas visuales para habilidades</p>
                    <p>• Tipografía moderna optimizada para pantalla</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Plantilla predeterminada</span>
                  <span>Usar en el editor →</span>
                </div>
              </div>

              {/* Template 3: Creativa */}
              <div className="glass-card bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900">Creativa</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      Diseño & Medios
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Un estilo dinámico que destaca tu personalidad profesional manteniendo el rigor técnico para superar cualquier filtro ATS.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
                    <p>• Acentos visuales diferenciadores</p>
                    <p>• Ideal para diseño, marketing y producto</p>
                    <p>• Exportación PDF de alta definición</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Plantilla incluida</span>
                  <span>Usar en el editor →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
                Paso a Paso
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 tracking-tight">
                Consigue tu nuevo CV en 3 sencillos pasos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2">Ingresa o Importa tus Datos</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Completa tu experiencia o importa tu CV existente desde PDF sin perder tiempo en diseño.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-indigo-500/50 p-6 rounded-2xl relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <span>Pega la Oferta & Adapta</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-400 text-slate-950 font-bold">IA</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pega la descripción de la vacante para sincronizar palabras clave y maximizar tu compatibilidad.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2">Elige Plantilla y Descarga</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Selecciona entre las 3 plantillas profesionales y descarga tu PDF listo para postularte.
                </p>
              </div>
            </div>

            {/* Bottom CTA in Dark Section */}
            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={handleNew}
                className="px-8 py-4 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 text-base cursor-pointer inline-flex items-center gap-2"
              >
                <span>Comenzar a Crear mi CV Gratis</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
              CV
            </div>
            <span>Creador de CV</span>
          </div>
          <p>© {new Date().getFullYear()} Creador de CV. Herramienta gratuita y optimizada para ATS.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => router.push('/editor')} className="hover:text-white transition-colors cursor-pointer">
              Editor
            </button>
            <button type="button" onClick={() => router.push('/editor?openTailor=1')} className="hover:text-white transition-colors cursor-pointer text-indigo-400">
              Adaptar a Oferta
            </button>
            <button type="button" onClick={() => router.push('/editor?openPdfImport=1')} className="hover:text-white transition-colors cursor-pointer">
              Importar PDF
            </button>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal for Overwriting */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-100 space-y-4 animate-scale-in text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">¿Crear un CV nuevo?</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ya tienes un currículum guardado en tu navegador. Si creas uno nuevo desde cero, se reemplazarán los datos guardados actualmente.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConfirm(false);
                  router.push('/editor');
                }}
              >
                Continuar con el actual
              </Button>
              <Button variant="danger" onClick={confirmNew}>
                Crear nuevo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

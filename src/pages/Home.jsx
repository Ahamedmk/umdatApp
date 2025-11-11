import React from 'react';
import { BookOpen, RotateCcw, Brain, Scale } from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Apprendre',
      description: 'Texte arabe, audio, et opinions détaillées des savants',
      href: '/learn',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: RotateCcw,
      title: 'Réviser',
      description: 'Système de révision espacée intelligent (SM-2)',
      href: '/review',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Brain,
      title: 'Quiz',
      description: 'Teste et renforce ta compréhension',
      href: '/quiz',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Scale,
      title: 'Comparer',
      description: 'Analyse comparative des 4 écoles juridiques',
      href: '/compare',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12 mt-8">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
            <span className="text-white text-sm font-semibold">عمدة الأحكام</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            Umdat al-Ahkam
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Apprends et mémorise les hadiths en arabe et français, compare les avis des 4 écoles, 
            et progresse avec un système de répétition espacée.
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <a
                key={index}
                href={feature.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-sm font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                    <span>Commencer</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-sm text-slate-600">Hadiths</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                4
              </div>
              <div className="text-sm text-slate-600">Écoles</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-sm text-slate-600">Gratuit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
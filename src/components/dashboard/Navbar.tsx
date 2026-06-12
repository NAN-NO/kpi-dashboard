import React from 'react';

export function Navbar() {
  return (
    <header 
      style={{
        background: 'linear-gradient(135deg, #0a0f2e 0%, #1e3a8a 40%, #4338ca 75%, #7c3aed 100%)',
        borderBottom: '2px solid rgba(139,92,246,0.35)'
      }}
      className="text-white shadow-xl"
    >
      <div style={{ maxWidth: '80%', margin: '0 auto' }} className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight md:text-base">Clinical Governance KPI Dashboard</h1>
            <p className="text-blue-300 text-xs">
              ระบบติดตามตัวชี้วัดคุณภาพทางคลินิก | ปีงบประมาณ <span>2569</span>
            </p>
          </div>
        </div>
        <div className="no-print flex gap-1.5 items-center flex-wrap">
          <button onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-xs transition px-3 py-1.5 rounded flex items-center gap-1 text-white font-semibold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            พิมพ์ PDF
          </button>
        </div>
      </div>
    </header>
  );
}

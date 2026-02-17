'use client';

import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('@/components/ClientApp'), {
  ssr: false,
  loading: () => (
    <div className="loading-splash">
      <div className="loading-splash-content">
        <div className="loading-splash-logo">
          <div className="loading-splash-icon">
            <span className="loading-splash-on">ON</span>
            <span className="loading-splash-dot" />
          </div>
          <h1 className="loading-splash-title">온에어</h1>
        </div>
        <p className="loading-splash-subtitle">모든 채널, 한 화면에</p>
        <div className="loading-splash-spinner" />
      </div>
    </div>
  ),
});

export default function ClientPage() {
  return <ClientApp />;
}

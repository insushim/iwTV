export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        color: '#e8e8f0',
        fontFamily: 'Pretendard Variable, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        404
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#8888a8', marginBottom: '2rem' }}>
        페이지를 찾을 수 없습니다.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          borderRadius: '0.75rem',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'background-color 0.2s',
        }}
      >
        온에어 홈으로 돌아가기
      </a>
    </div>
  );
}

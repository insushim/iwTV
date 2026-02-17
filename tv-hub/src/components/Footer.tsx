'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-disclaimer">
          본 서비스는 각 방송사의 공식 스트리밍을 모아 보여주는 안내 페이지입니다.
          모든 콘텐츠의 저작권은 해당 방송사에 있으며, 무단 복제 및 재배포를 금합니다.
          실시간 방송 상태는 각 방송사 사정에 따라 변동될 수 있습니다.
        </p>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} 온에어. 모든 채널, 한 화면에.
        </p>
      </div>
    </footer>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error('Byte Odyssey:', error);
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>Byte đang cần nghỉ một chút</h1>
        <p>Hãy tải lại ứng dụng. Hồ sơ đã lưu trên máy vẫn được giữ.</p>
        <button onClick={() => window.location.reload()}>Tải lại</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
if (import.meta.env.PROD && 'serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('./sw.js')
      .catch((error) => console.warn('Chưa sẵn sàng chơi ngoại tuyến:', error));
  });
}

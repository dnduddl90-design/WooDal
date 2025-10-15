import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker 등록
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('✅ [PWA] 앱이 오프라인에서 사용 가능합니다!');
  },
  onUpdate: (registration) => {
    console.log('🔄 [PWA] 새 버전이 있습니다. 업데이트하시겠습니까?');
    // 업데이트 알림을 사용자에게 표시할 수 있음
    if (window.confirm('새로운 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

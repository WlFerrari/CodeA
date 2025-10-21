import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import logo from './assets/logo.png'

// Define favicon e apple-touch-icon dinamicamente para funcionar em dev e build
function setFavicon(href: string) {
  const rels = ['icon', 'apple-touch-icon'] as const;
  rels.forEach((rel) => {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = href;
  });
}

setFavicon(logo);

createRoot(document.getElementById("root")!).render(<App />);

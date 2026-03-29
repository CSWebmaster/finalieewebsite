import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a wrapper component to ensure we have control over the full viewport
const AppWrapper = () => {
  return (
    <div id="app-wrapper" className="w-full max-w-full overflow-x-hidden">
      <App />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<AppWrapper />);

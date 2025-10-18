import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OutfitGallery from './pages/OutfitGallery';
import OutfitBuilder from './pages/OutfitBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<OutfitGallery />} />
          <Route path="/create" element={<OutfitBuilder />} />
          <Route path="/edit/:id" element={<OutfitBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

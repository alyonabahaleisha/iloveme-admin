import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OutfitGallery from './pages/OutfitGallery';
import OutfitBuilder from './pages/OutfitBuilder';
import FeedbackViewer from './pages/FeedbackViewer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<OutfitGallery />} />
          <Route path="/create" element={<OutfitBuilder />} />
          <Route path="/edit/:id" element={<OutfitBuilder />} />
          <Route path="/feedback" element={<FeedbackViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

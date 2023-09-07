import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Gallery from './components/Gallery';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/:serverId" element={<Gallery />} />
          <Route path="/" element={<Navigate to={`/${process.env.REACT_APP_DEFAULT_SERVER}`} replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

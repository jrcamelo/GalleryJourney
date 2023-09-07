import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Gallery from './components/Gallery';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/gallery/:serverId" element={<Gallery />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

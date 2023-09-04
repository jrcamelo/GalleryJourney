import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Gallery from './components/Gallery';
import './styles.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <h1>MeguJourney Gallery</h1>
        <Routes>
          <Route path="/gallery/:serverId" element={<Gallery />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

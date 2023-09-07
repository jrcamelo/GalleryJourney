import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Gallery from '../../components/Gallery';
import { FC } from 'react';

export const AppRoutes: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/:serverId" element={<Gallery />} />
        <Route path="/" element={<Navigate to={`/${process.env.REACT_APP_DEFAULT_SERVER}`} replace />} />
      </Routes>
    </Router>
  );
};

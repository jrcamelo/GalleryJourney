import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';
import Gallery from '../../pages/Gallery';
import { FC } from 'react';

export const AppRoutes: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/server/:serverId" element={<Gallery />} />
        <Route path="/" element={<Navigate to={`/server/${import.meta.env.VITE_DEFAULT_SERVER}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

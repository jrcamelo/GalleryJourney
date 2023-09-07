import {
  Navigate,
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Gallery from '../../components/Gallery';
import { FC } from 'react';

export const AppRoutes: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/server/:serverId" element={<Gallery />} />
        <Route path="/server/" element={<Navigate to={`/${import.meta.env.VITE_DEFAULT_SERVER}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

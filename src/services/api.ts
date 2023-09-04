import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchGallery = async (serverId: string, params: any) => {
  const { data } = await axios.get(`/gallery/${serverId}`, { params });
  return data;
};

export const fetchFavorites = async (serverId: string, userId: string, page: number) => {
  const { data } = await axios.get(`/gallery/${serverId}/favorites/${userId}?page=${page}`);
  return data;
};

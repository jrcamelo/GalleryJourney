import { axiosClient } from './axiosClient';

export const fetchFavorites = async (serverId: string, userId: string, params: any) => {
  const { data } = await axiosClient.get(`/gallery/${serverId}/favorites/${userId}`, { params });
  return data;
};
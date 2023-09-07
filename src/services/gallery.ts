import { axiosClient } from './axiosClient';

export const fetchGallery = async (serverId: string, params: any) => {
  const { data } = await axiosClient.get(`/gallery/${serverId}`, { params });
  return data;
};
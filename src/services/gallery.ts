import { client } from "./client";

export const fetchGallery = async (serverId: string, params: any) => {
    const { data } = await client.get(`/gallery/${serverId}`, { params });
    return data;
  };
import { client } from "./client";

export const fetchFavorites = async (
  serverId: string,
  userId: string,
  page: number
) => {
  const { data } = await client.get(
    `/gallery/${serverId}/favorites/${userId}?page=${page}`
  );
  return data;
};

export interface ImageData {
  message_id: string;
  server_id: string;
  channel_id: string;
  user_id: string;
  prompt: string;
  response_id: string | null;
  url: string;
  url1: string;
  url2: string;
  url3: string;
  url4: string;
  timestamp: string;
  favorites_count: number;
  user: UserData | null;
}

export interface UserData {
  username: string | null;
  avatar: string | null;
}
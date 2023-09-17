import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_LOCAL = process.env.FRONTEND_URL_LOCAL;

const SORT_RECENT = 'recent';
const SORT_FAVORITES = 'favorites';
const ITEMS_PER_PAGE = 12;

const GALLERY_KEY = 'GALLERY';
const GALLERY_COUNT_KEY = 'GALLERY_COUNT';
const GALLERY_USER_COUNTS_KEY = 'GALLERY_USER_COUNTS';
const FAVORITES_KEY = 'FAVORITES';
const FAVORITES_COUNT_KEY = 'FAVORITES_COUNT';
const FAVORITES_USER_COUNTS_KEY = 'FAVORITES_USER_COUNTS';

export {
  PORT,
  FRONTEND_URL,
  FRONTEND_URL_LOCAL,
  SORT_RECENT,
  SORT_FAVORITES,
  ITEMS_PER_PAGE,
  GALLERY_KEY,
  GALLERY_COUNT_KEY,
  GALLERY_USER_COUNTS_KEY,
  FAVORITES_KEY,
  FAVORITES_COUNT_KEY,
  FAVORITES_USER_COUNTS_KEY
}
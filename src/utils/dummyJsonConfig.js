export const DUMMY_JSON_CONFIG = {
  API_URL: 'https://dummyjson.com',
  PRODUCTS_LIMIT: 20,
  THUMBNAIL_QUALITY: 'thumbnail',  // thumbnail, regular
};

export const getProductImageUrl = (url) => {
  if (!url) return null;
  return url;
}; 
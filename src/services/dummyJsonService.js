import axios from 'axios';
import { DUMMY_JSON_CONFIG } from '../utils/dummyJsonConfig';

const dummyJsonApi = axios.create({
  baseURL: DUMMY_JSON_CONFIG.API_URL,
});

export const searchProducts = async (query) => {
  try {
    const response = await dummyJsonApi.get('/products/search', {
      params: {
        q: query,
        limit: DUMMY_JSON_CONFIG.PRODUCTS_LIMIT,
      },
    });
    return response.data.products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await dummyJsonApi.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

export const getProductCategories = async () => {
  try {
    const response = await dummyJsonApi.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const response = await dummyJsonApi.get(`/products/category/${category}`);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getAllProducts = async (skip = 0) => {
  try {
    const response = await dummyJsonApi.get('/products', {
      params: {
        limit: DUMMY_JSON_CONFIG.PRODUCTS_LIMIT,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
}; 
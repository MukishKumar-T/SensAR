const axios = require('axios');

// Sample product categories and data
const SAMPLE_PRODUCTS = {
    electronics: [
        {
            id: 'e1',
            title: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: '99.99',
            rating: 4.5,
            reviewCount: 1250,
            imageUrl: 'https://picsum.photos/200?random=1',
            category: 'electronics'
        },
        {
            id: 'e2',
            title: 'Smart Watch',
            description: 'Fitness tracking smartwatch with heart rate monitor',
            price: '199.99',
            rating: 4.3,
            reviewCount: 850,
            imageUrl: 'https://picsum.photos/200?random=2',
            category: 'electronics'
        }
    ],
    books: [
        {
            id: 'b1',
            title: 'The Art of Programming',
            description: 'A comprehensive guide to modern programming practices',
            price: '49.99',
            rating: 4.8,
            reviewCount: 320,
            imageUrl: 'https://picsum.photos/200?random=3',
            category: 'books'
        },
        {
            id: 'b2',
            title: 'Digital Marketing Essentials',
            description: 'Learn the fundamentals of digital marketing',
            price: '39.99',
            rating: 4.2,
            reviewCount: 180,
            imageUrl: 'https://picsum.photos/200?random=4',
            category: 'books'
        }
    ],
    fashion: [
        {
            id: 'f1',
            title: 'Classic Denim Jacket',
            description: 'Timeless denim jacket for any occasion',
            price: '79.99',
            rating: 4.6,
            reviewCount: 750,
            imageUrl: 'https://picsum.photos/200?random=5',
            category: 'fashion'
        },
        {
            id: 'f2',
            title: 'Running Shoes',
            description: 'Comfortable athletic shoes for running and training',
            price: '129.99',
            rating: 4.4,
            reviewCount: 920,
            imageUrl: 'https://picsum.photos/200?random=6',
            category: 'fashion'
        }
    ]
};

class ProductService {
    constructor() {
        this.products = SAMPLE_PRODUCTS;
    }

    async searchProducts(query, page = 1) {
        try {
            const allProducts = Object.values(this.products).flat();
            const searchResults = allProducts.filter(product => 
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );

            // Implement pagination
            const itemsPerPage = 10;
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            
            return {
                results: searchResults.slice(start, end),
                total: searchResults.length,
                page: page,
                totalPages: Math.ceil(searchResults.length / itemsPerPage)
            };
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getProductDetails(productId) {
        try {
            const allProducts = Object.values(this.products).flat();
            const product = allProducts.find(p => p.id === productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            // Add some sample reviews
            const sampleReviews = [
                {
                    id: 'r1',
                    author: 'John D.',
                    title: 'Great product!',
                    content: 'Really happy with this purchase. Exactly what I needed.',
                    rating: 5,
                    date: '2024-01-15'
                },
                {
                    id: 'r2',
                    author: 'Sarah M.',
                    title: 'Good value',
                    content: 'Good quality for the price. Would recommend.',
                    rating: 4,
                    date: '2024-01-10'
                }
            ];

            return {
                ...product,
                features: [
                    'High quality materials',
                    'Durable construction',
                    'Easy to use',
                    '1 year warranty'
                ],
                reviews: sampleReviews
            };
        } catch (error) {
            console.error('Error getting product details:', error);
            throw error;
        }
    }

    async getTopProducts(category = 'all', page = 1) {
        try {
            let products;
            if (category === 'all') {
                products = Object.values(this.products).flat();
            } else {
                products = this.products[category] || [];
            }

            // Sort by rating and review count
            products = products.sort((a, b) => 
                (b.rating * b.reviewCount) - (a.rating * a.reviewCount)
            );

            // Implement pagination
            const itemsPerPage = 10;
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            return {
                results: products.slice(start, end),
                total: products.length,
                page: page,
                totalPages: Math.ceil(products.length / itemsPerPage)
            };
        } catch (error) {
            console.error('Error getting top products:', error);
            throw error;
        }
    }

    async getProductRecommendations(productId) {
        try {
            const product = await this.getProductDetails(productId);
            const categoryProducts = this.products[product.category] || [];
            
            // Filter out the current product and get similar items
            const recommendations = categoryProducts
                .filter(p => p.id !== productId)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);

            return recommendations;
        } catch (error) {
            console.error('Error getting product recommendations:', error);
            throw error;
        }
    }

    // Helper method to get available categories
    getCategories() {
        return Object.keys(this.products);
    }
}

module.exports = new ProductService(); 
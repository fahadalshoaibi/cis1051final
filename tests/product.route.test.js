const request = require('supertest');
const app = require('../index.js'); // Adjust the path to your app entry point
const mongoose = require('mongoose');

// Mock database setup
beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// Clean up the database after tests
afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe('GET /api/products', () => {
    it('should fetch all products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

describe('POST /api/products', () => {
    it('should create a new product', async () => {
        const productData = {
            name: 'Test Product',
            price: 10.99,
            quantity: 5,
            description: 'This is a test product',
        };
        const response = await request(app).post('/api/products').send(productData);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe('Test Product');
    });

    it('should fail when required fields are missing', async () => {
        const response = await request(app).post('/api/products').send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });
});

describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
        // Create a product first
        const product = await request(app).post('/api/products').send({
            name: 'Product to Update',
            price: 5.99,
            quantity: 3,
            description: 'To be updated',
        });

        const response = await request(app)
            .put(`/api/products/${product.body._id}`)
            .send({ price: 7.99 });
        expect(response.status).toBe(200);
        expect(response.body.price).toBe(7.99);
    });
});

describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
        const product = await request(app).post('/api/products').send({
            name: 'Product to Delete',
            price: 3.99,
            quantity: 2,
            description: 'To be deleted',
        });

        const response = await request(app).delete(`/api/products/${product.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(product.body._id);
    });
});

const path = require('path');

describe('POST /api/products/recognize', () => {
    it('should recognize a product from an image', async () => {
        const response = await request(app)
            .post('/api/products/recognize')
            .attach('image', path.resolve(__dirname, 'test_image.jpg')); // Use a valid test image
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('prediction');
    });

    it('should fail if no image is uploaded', async () => {
        const response = await request(app).post('/api/products/recognize');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Image file is required');
    });
});
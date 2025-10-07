const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Manga Web API',
            description: 'A comprehensive manga reading platform API with user management, manga/chapter uploads, comments, ratings, and AI features',
            contact: {
                name: 'Manga Web Team',
                email: 'support@mangaweb.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3001',
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { 
                            type: 'string', 
                            enum: ['reader', 'uploader', 'admin'] 
                        },
                        avatarUrl: { type: 'string' },
                        followedMangas: { 
                            type: 'array', 
                            items: { type: 'string' } 
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Manga: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        author: { type: 'string' },
                        coverImageUrl: { type: 'string' },
                        genres: { 
                            type: 'array', 
                            items: { type: 'string' } 
                        },
                        status: { 
                            type: 'string', 
                            enum: ['ongoing', 'completed', 'hiatus'] 
                        },
                        uploaderId: { type: 'string' },
                        averageRating: { type: 'number' },
                        totalRatings: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Chapter: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        manga: { type: 'string' },
                        chapterNumber: { type: 'number' },
                        title: { type: 'string' },
                        pages: { 
                            type: 'array', 
                            items: { type: 'string' } 
                        },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Comment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        manga: { type: 'string' },
                        chapter: { type: 'string' },
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Rating: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        manga: { type: 'string' },
                        star: { 
                            type: 'integer', 
                            minimum: 1, 
                            maximum: 5 
                        },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Genre: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { 
                            type: 'string', 
                            example: 'error' 
                        },
                        message: { 
                            type: 'string', 
                            example: 'Error description' 
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: { 
                            type: 'string', 
                            example: 'success' 
                        },
                        data: { 
                            type: 'object' 
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization'
            },
            {
                name: 'Users',
                description: 'User management operations'
            },
            {
                name: 'Manga',
                description: 'Manga management and browsing'
            },
            {
                name: 'Chapters',
                description: 'Chapter management and reading'
            },
            {
                name: 'Comments',
                description: 'Comment system for manga and chapters'
            },
            {
                name: 'Ratings',
                description: 'Rating system for manga'
            },
            {
                name: 'Genres',
                description: 'Genre management and categorization'
            },
            {
                name: 'AI',
                description: 'AI-powered features and recommendations'
            }
        ]
    },
    apis: [
        './src/routes/*.js', 
        './src/controllers/*.js',
        './src/models/*.js'
    ],
};

const specs = swaggerJSDoc(options);

const swaggerOptions = {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 30px 0 }
    `,
    customSiteTitle: "Manga Web API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'none'
    }
};

module.exports = {
    specs,
    swaggerUi,
    swaggerOptions
};
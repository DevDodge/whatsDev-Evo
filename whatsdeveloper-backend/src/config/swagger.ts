export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'WhatsDeveloper API',
    version: '1.0.0',
    description: 'Backend Bridge API for WhatsDeveloper Manager → Evolution API',
    contact: {
      name: 'DevDodge / DK-Octobot',
      email: 'support@whatsdeveloper.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Messages',
      description: 'Send messages (text, media, location, contact, buttons)',
    },
    {
      name: 'Instance',
      description: 'Instance management and status',
    },
    {
      name: 'Chats',
      description: 'Chat and message retrieval',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/api/send-message': {
      post: {
        tags: ['Messages'],
        summary: 'Send text message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'message'],
                properties: {
                  phone: {
                    type: 'string',
                    example: '201234567890',
                    description: 'Phone number without + or @s.whatsapp.net',
                  },
                  message: {
                    type: 'string',
                    example: 'Hello from WhatsDeveloper!',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/send-image': {
      post: {
        tags: ['Messages'],
        summary: 'Send image with caption',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'image'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  image: { type: 'string', example: 'https://example.com/image.jpg' },
                  caption: { type: 'string', example: 'Check this out!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Image sent successfully' },
        },
      },
    },
    '/api/send-video': {
      post: {
        tags: ['Messages'],
        summary: 'Send video with caption',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'video'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  video: { type: 'string', example: 'https://example.com/video.mp4' },
                  caption: { type: 'string', example: 'Watch this!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Video sent successfully' },
        },
      },
    },
    '/api/send-audio': {
      post: {
        tags: ['Messages'],
        summary: 'Send audio',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'audio'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  audio: { type: 'string', example: 'https://example.com/audio.mp3' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Audio sent successfully' },
        },
      },
    },
    '/api/send-document': {
      post: {
        tags: ['Messages'],
        summary: 'Send document',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'document'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  document: { type: 'string', example: 'https://example.com/document.pdf' },
                  fileName: { type: 'string', example: 'document.pdf' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Document sent successfully' },
        },
      },
    },
    '/api/send-location': {
      post: {
        tags: ['Messages'],
        summary: 'Send location',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'latitude', 'longitude'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  latitude: { type: 'number', example: 30.0444 },
                  longitude: { type: 'number', example: 31.2357 },
                  name: { type: 'string', example: 'Cairo Tower' },
                  address: { type: 'string', example: 'Cairo, Egypt' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Location sent successfully' },
        },
      },
    },
    '/api/send-contact': {
      post: {
        tags: ['Messages'],
        summary: 'Send contact card',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'contactPhone', 'contactName'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  contactPhone: { type: 'string', example: '201111111111' },
                  contactName: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Contact sent successfully' },
        },
      },
    },
    '/api/send-buttons': {
      post: {
        tags: ['Messages'],
        summary: 'Send buttons/list message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'title', 'description', 'buttons'],
                properties: {
                  phone: { type: 'string', example: '201234567890' },
                  title: { type: 'string', example: 'Choose an option' },
                  description: { type: 'string', example: 'Select one of the following' },
                  buttons: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Option 1', 'Option 2', 'Option 3'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Buttons sent successfully' },
        },
      },
    },
    '/api/instance/status': {
      get: {
        tags: ['Instance'],
        summary: 'Get instance connection status',
        responses: {
          '200': {
            description: 'Status retrieved successfully',
          },
        },
      },
    },
    '/api/chats': {
      get: {
        tags: ['Chats'],
        summary: 'Get all chats',
        responses: {
          '200': {
            description: 'Chats retrieved successfully',
          },
        },
      },
    },
    '/api/messages/{phone}': {
      get: {
        tags: ['Chats'],
        summary: 'Get messages for a specific chat',
        parameters: [
          {
            in: 'path',
            name: 'phone',
            required: true,
            schema: { type: 'string' },
            example: '201234567890',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 50 },
          },
        ],
        responses: {
          '200': {
            description: 'Messages retrieved successfully',
          },
        },
      },
    },
  },
};

const corsOptions = {
    origin: ['https://jozefpv.github.io', 'http://localhost:4200', 'https://www.pintaloo.com', 'http://www.pintaloo.com'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Set-Cookie',
    credentials: true
};

const ioCorsOptions = {
    cors: {
        origin: ['https://jozefpv.github.io', 'http://localhost:4200', 'https://www.pintaloo.com', 'http://www.pintaloo.com'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
};

export { corsOptions, ioCorsOptions };
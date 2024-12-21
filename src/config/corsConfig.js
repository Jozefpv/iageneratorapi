const corsOptions = {
    origin: ['https://jozefpv.github.io', 'http://localhost:4200'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Set-Cookie',
    credentials: true
};

const ioCorsOptions = {
    cors: {
        origin: ['https://jozefpv.github.io', 'http://localhost:4200'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
};

export { corsOptions, ioCorsOptions };
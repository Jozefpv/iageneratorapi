const corsOptions = {
    origin: ['https://jozefpv.github.io', 'http://localhost:4200'],
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Authorization',
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
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.post('/getImages', async (req, res) => {
  const prompt = req.body;
  console.log('Recibiendo solicitud para generar imagen con:', req.body);

  try {
    const response = await axios.post(
      'https://cl.imagineapi.dev/items/images/',
      prompt,
      {
        headers: {
          'Authorization': 'f64psixY348VEyeVVf6RoZNK40H-9kK9',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Respuesta de la API externa:', response.data);

    const imageId = response.data.id;

    return res.status(200).json({ imageId });
  } catch (error) {
    console.error('Error al solicitar la imagen:', error);
    res.status(500).send('Hubo un error al generar la imagen');
  }
});

app.post('/webhook', (req, res) => {
  const { event, payload } = req.body;

  console.log('Webhook recibido:', event, payload);

  const { status, id, upscaled_urls, error, progress, url } = payload;

  // Emitir evento de acuerdo al estado de la imagen
  if (status === 'completed' && upscaled_urls) {
    // Si la imagen está lista, emitimos el evento
    io.emit('imageReady', { id, upscaledUrls: upscaled_urls });
    console.log('Imagen generada y lista:', upscaled_urls);
  } else if (status === 'failed') {
    // Si falló la generación de la imagen
    io.emit('imageError', { id, error });
    console.log('Error en la generación de la imagen:', error);
  } else if (status === 'in-progress') {
    // Si la imagen está en proceso de generación, emitimos el progreso
    io.emit('imageProgress', { id, progress });
    console.log(`Imagen en progreso: ${progress}%`);
  } else if (status === 'pending') {
    // Si la imagen está pendiente
    io.emit('imagePending', { id, url });
    console.log('Generación de imagen pendiente...');
  }

  // Respondemos al Webhook con un 200 OK
  res.status(200).send('Webhook recibido');
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  
  socket.on('event', (message) => {
    console.log('Mensaje recibido:', message);
    io.emit('event', message);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

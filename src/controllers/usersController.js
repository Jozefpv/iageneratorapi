import { getUserByEmailQuery, createUserQuery } from "../queries/query.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body

        const existingUser = await getUserByEmailQuery(email);
        if (existingUser != null) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createUserQuery(name, email, hashedPassword);

        return res.status(201).json({ user: newUser });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al registrar el usuario', error });
        }
    }
};

export const loginUser = async (req, res) => {
    try {

        const {email, password} = req.body;

        const user = await getUserByEmailQuery(email)

        if(!user){
            return res.status(400).json({ message: 'Usuario no encontrado'})
        } 

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            return res.status(401).json({success: false, message: 'Login incorrecto' });
        }

        if (!process.env.SECRET_JWT_KEY) {
            throw new Error('La clave secreta SECRET_JWT_KEY no está definida en las variables de entorno.');
          }
          
        const token = jwt.sign({email: user.email}, process.env.SECRET_JWT_KEY , { expiresIn: '1h' });

        console.log("TOKEN", token)
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        })
        .status(200)
        .json({success: true, userGuid: user.userGuid });


       
    } catch (error) {
        
    }
};

export const logoutUser = (req, res) => {
    try {
        return res
            .clearCookie('access_token', {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
            })
            .status(200)
            .json({ success: true, message: 'Usuario deslogueado' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al desloguear al usuario' });
    }
};

export const validateToken = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token no encontrado' });
        }

        const secret = process.env.SECRET_JWT_KEY;
        if (!secret) {
            throw new Error('SECRET_JWT_KEY no está configurado');
        }

        // Verificar el token y obtener el payload
        const decoded = jwt.verify(token, secret);
        console.log('Payload del token:', decoded);

        // Verificar estado de la sesión (opcional)
        const session = await db.sessions.findOne({ where: { jti: decoded.jti } });
        if (!session) {
            return res.status(401).json({ success: false, message: 'Sesión inválida o cerrada' });
        }

        return res.status(200).json({ success: true, message: 'Token válido', data: decoded });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'El token ha expirado' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        } else {
            console.error('Error interno:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
};


import { getUserByEmail, createUser } from "../queries/query.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body

        const existingUser = await getUserByEmail(email);
        if (existingUser != null) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createUser(name, email, hashedPassword);

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

        const user = await getUserByEmail(email)

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
        return res
        .cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
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

export const validateToken = (req, res) => {
    try {
        const token = req.cookies.access_token
        console.log("llega el token?", token)
        if(!token){
            return res.status(401).json({success: false, message: 'Token no encontrado'})
        }

        const secret = process.env.SECRET_JWT_KEY;

        if(!secret){
            throw new Error('SECRET_JWT_KEY no está configurado');
        }

        jwt.verify(token, secret);
        return res.status(200).json({ success: true, message: 'Token valido'});
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}


export const createImageData = async (imageGuid, userGuid, status) => {
    try {
        const newImage = await createImageData(imageGuid, userGuid, status);

        return res.status(201).json({ iamge: newImage });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al insertar los datos de la imagen', error });
        }
    }
};

export const test = (req, res) => {
    try {
        const token = req.cookies.access_token;
        console.log("llega el token", token)
        res.status(200).json({success: true, message:"test valido"})
    } catch (error) {
        
    }
};

export const getUserGuidByImageGuid = async (imageGuid) => {
    try {
        const userGuid = await getUserGuidByImageGuid(imageGuid);
        if (userGuid == null) {
            return null
        }

        return userGuid
    } catch (error) {
        return null
    }
};
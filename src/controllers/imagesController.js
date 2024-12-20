import { getUserDataByImageGuidQuery, createImageDataQuery, updateUserImageCountQuery } from "../queries/query.js";

export const createImageData = async (imageGuid, userGuid, status) => {
    try {
        const newImage = await createImageDataQuery(imageGuid, userGuid, status);

        return res.status(201).json({ iamge: newImage });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al insertar los datos de la imagen', error });
        }
    }
};

export const getUserDataByImageGuid = async (imageGuid) => {
    try {
        const userData = await getUserDataByImageGuidQuery(imageGuid);
        if (userData == null) {
            return null
        }

        return userData
    } catch (error) {
        return null
    }
};



export const updateUserImageCount = async (req, res) => {
    const { userGuid, newImageCount } = req.body;

    try {
        const updatedUser = await updateUserImageCountQuery(userGuid, newImageCount);

        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
        }
    }
};

import { getUserGuidByImageGuidQuery, createImageDataQuery } from "../queries/query.js";

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

export const getUserGuidByImageGuid = async (imageGuid) => {
    try {
        const userGuid = await getUserGuidByImageGuidQuery(imageGuid);
        if (userGuid == null) {
            return null
        }

        return userGuid
    } catch (error) {
        return null
    }
};
import { getUserDataByImageGuidQuery, createImageDataQuery, updateUserImageCountQuery, getImageCountByUserGuidQuery } from "../queries/query.js";

export const createImageData = async (imageGuid, userGuid, status) => {
    try {
      const newImage = await createImageDataQuery(imageGuid, userGuid, status);
      return newImage;
    } catch (error) {
      throw new Error('Error al insertar los datos de la imagen: ' + error.message);
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


export const getImageCountByUserGuid = async (userGuid) => {
    try {
        console.log("llega=")
        const userData = await getImageCountByUserGuidQuery(userGuid);
        console.log("user data", userData)
        if (userData == null) {
            return null
        }

        return userData
    } catch (error) {
        return null
    }
};


export const updateUserImageCount = async (userGuid, newImageCount) => {
    try {
        await updateUserImageCountQuery(userGuid, newImageCount);

        return { status: 200, message: 'Usuario actualizado exitosamente', user: updatedUser };
    } catch (error) {
        return { status: 500, message: 'Error al actualizar el usuario', error: error.message };
    }
};

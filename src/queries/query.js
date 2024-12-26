import supabase from "../config/db.js"

export const getUserQuery = async () => {
    const {data, error} = await supabase    
        .from('users')
        .select('*')
    
    if(error) throw new Error('Error al botener el usuario')
    return data
}

export const getUserByEmailQuery = async (email) => {
    const {data, error} = await supabase    
        .from('users')
        .select('email, password, userGuid')
        .eq('email', email)
        .limit(1)
        .single();
        
        if (error != null) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error('Error al obtener el usuario');
        }

        return data;
}

export const createUserQuery = async (name, email, password) => {

    const {data, error} = await supabase.from('users').insert([
        { name, email, password}
    ]);

    if(error && error.message){
        throw new Error('Error en el insertado')
    }

    return data
}

export const createImageDataQuery = async (imageGuid, userGuid, status) => {

    const {data, error} = await supabase.from('images').insert([
        { imageGuid, userGuid, status}
    ]);

    if(error && error.message){
        throw new Error('Error en el insertado')
    }

    return data
}

export const getUserDataByImageGuidQuery = async (imageGuid) => {

    const {data, error} = await supabase    
        .from('images')
        .select('userGuid')
        .eq('imageGuid', imageGuid)
        .limit(1)
        .single();
        
        if (error != null) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error('Error al obtener el usuario');
        }

        return data;
}

export const updateUserImageCountQuery = async (userGuid, newImageCount) => {
    console.log("llega aqui=???")
    const { data, error } = await supabase
        .from('users')
        .update({ imageCount: newImageCount})
        .eq('userGuid', userGuid)

        console.log(data)
    if (error) {
        throw new Error(`Error al actualizar el contador de imágenes: ${error.message}`);
    }
};

export const getImageCountByUserGuidQuery = async (userGuid) => {
    const {data, error} = await supabase    
        .from('users')
        .select('imageCount')
        .eq('userGuid', userGuid)
        .limit(1)
        .single();
        
        console.log(data, error)
        if (error != null) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error('Error al obtener el usuario');
        }

        return data;
}

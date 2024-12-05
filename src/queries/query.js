import supabase from "../config/db.js"
import { hashPassword } from "../utils/hash.js"
hashPassword
export const getUser = async () => {
    const {data, error} = await supabase    
        .from('users')
        .select('*')
    
    if(error) throw new Error('Error al botener el usuario')
    return data
}

export const getUserByEmail = async (email) => {
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

export const createUser = async (name, email, password) => {

    const {data, error} = await supabase.from('users').insert([
        { name, email, password}
    ]);

    if(error && error.message){
        throw new Error('Error en el insertado')
    }

    return data
}

export const createImageData = async (imageGuid, userGuid, status) => {

    const {data, error} = await supabase.from('images').insert([
        { imageGuid, userGuid, status}
    ]);

    if(error && error.message){
        throw new Error('Error en el insertado')
    }

    return data
}

export const getUserGuidByImageGuidQuery = async (imageGuid) => {

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
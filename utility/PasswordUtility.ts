import bcrypt from 'bcrypt'

export const GenSalt = async ()=>{
    return await bcrypt.genSalt();
}

export const GenPassword = async (salt: string, password: string)=>{
    return await bcrypt.hash(password, salt)
}
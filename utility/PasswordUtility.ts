import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { VandorPayload } from "../dto";
import { jwt_secret } from "../config";
import { AuthPayload } from "../dto/Auth.dto";
import { Request } from "express";

declare global {
  namespace Express {
      interface Request {
          user?: AuthPayload
      }
  }
}


export const GenSalt = async () => {
  return await bcrypt.genSalt();
};

export const GenPassword = async (salt: string, password: string) => {
  return await bcrypt.hash(password, salt);
};

export const VerifyPassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GenPassword(salt, enteredPassword)) === savedPassword;
};

export const GenerateToken = (payload: VandorPayload) => {
  return jwt.sign(payload, jwt_secret, { expiresIn: "1d" });
};

export const ValidateToken = async (req: Request) =>{
  const signature =  req.get('Authorization')

  if(signature){

    const payload = jwt.verify(signature.split(' ')[1], jwt_secret) as  AuthPayload;
    
    req.user = payload;

    return true


  }
  return false
}
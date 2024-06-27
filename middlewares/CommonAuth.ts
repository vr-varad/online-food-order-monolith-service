import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { ValidateToken } from "../utility";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
    console.log(1)
    const signature = await ValidateToken(req);
    if(signature){
        return next()
    }
    return res.json({
        message : "User Not Authorized"
    })
}
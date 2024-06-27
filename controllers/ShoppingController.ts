import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { Vandor } from "../models/Vandor";
import { FoodDoc } from "../models/Food";

export const GetFoodAvailability = async(req:Request, res:Response, next:NextFunction)=>{
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode, serviceAvailable: false}).sort([['rating','descending']]).populate('food')

    if(result.length > 0){
        return res.status(200).json(result) 
    }

    return res.status(400).json({
        message: "Data Not Found"
    })
}

export const GetTopRestraunts = async(req:Request, res:Response, next:NextFunction)=>{
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode, serviceAvailable: false}).sort([['rating','descending']]).limit(1)

    if(result.length > 0){
        return res.status(200).json(result) 
    }

    return res.status(400).json({
        message: "Data Not Found"
    })
}

export const GetFoodIn30Min = async(req:Request, res:Response, next:NextFunction)=>{
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode}).sort([['rating','descending']]).populate('food')

    if(result.length > 0){
        const foodResults: any = [];
        result.map(vandor => {
            const foods = vandor.food as [FoodDoc]
            foodResults.push(...foods.filter(food=>food.readyTime < 30))
        })
        return res.status(200).json(foodResults) 
    }

    return res.status(400).json({
        message: "Data Not Found"
    })
}

export const SearchFood = async (req:Request, res:Response, next:NextFunction)=>{
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode, serviceAvailable: false}).sort([['rating','descending']]).limit(1)

    if(result.length > 0){
        const foodresults : any = [];
        result.map(item => foodresults.push(...item.food))
        return res.status(200).json(foodresults) 
    }

    return res.status(400).json({
        message: "Data Not Found"
    })
}

export const RestrauntFood = async  (req:Request, res:Response, next:NextFunction)=>{
    const id = req.params.id;
    const result = await Vandor.find({_id: id}).populate('food')

    if(result){
        return res.status(200).json(result) 
    }

    return res.status(400).json({
        message: "Data Not Found"
    })
}
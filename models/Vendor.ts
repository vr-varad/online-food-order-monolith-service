import mongoose, {Schema, Document,model} from "mongoose";

interface VendorDoc extends Document {
    name: string,
    ownerName: string,
    foodType: [string],
    pincode: string,
    address: string,
    phone: string,
    email: string,
    password: string,
    salt: string,
    serviceAvailable: boolean,
    coverImages: [string],
    rating: number,
    food: any,
    lat: number,
    lan: number
}

const VendorSchema = new Schema({
    name: {type : String, required: true},
    ownerName:  {type : String, required: true},
    foodType:  {type : [String], required: true},
    pincode:  {type : String, required: true},
    address:  {type : String},
    phone:  {type : String, required: true},
    email:  {type : String, required: true},
    password:  {type : String, required: true},
    salt:  {type : String, required: true},
    serviceAvailable:  {type : Boolean, required: true},
    coverImage:  {type : String},
    rating:  {type : String, required: true},
    food: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'food'
    }],
    lat: {type: Number},
    lan: {type: Number}
},{
    timestamps: true,
    toJSON : {
        transform(doc, rel){
            delete rel.password;
            delete rel.salt;
            delete rel.__v;
            delete rel.createdAt;
            delete rel.updatedAt;
        }
    }
})

const Vendor = mongoose.model<VendorDoc>('vendor',VendorSchema)

export {Vendor}
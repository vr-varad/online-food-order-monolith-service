import { IsEmail, Length } from "class-validator";


export class CreateCustomerInputs {
  @IsEmail()
    email!: string;

  @Length(7, 12)
    phone!: string;

  @Length(7, 12)
    password!: string;
}


export interface CustomerPayload {
    _id: string,
    email: string,
    verified: boolean
}

export class LoginCustomerInputs {
    @IsEmail()
    email!: string;

  @Length(7, 12)
    password!: string;
}

export class UpdateCustomerInputs {
    @Length(3, 16)
    firstName!: string

    @Length(3,16)
    lastName!:string

    @Length(6,100)
    address!:string
}
  
export class OrderInputs {
  _id!: string
  units!: number
}
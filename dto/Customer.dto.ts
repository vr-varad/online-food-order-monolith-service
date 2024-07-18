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
  _id: string;
  email: string;
  verified: boolean;
}

export class LoginCustomerInputs {
  @IsEmail()
  email!: string;

  @Length(7, 12)
  password!: string;
}

export class UpdateCustomerInputs {
  @Length(3, 16)
  firstName!: string;

  @Length(3, 16)
  lastName!: string;

  @Length(6, 100)
  address!: string;
}

export class CartItem {
  _id!: string;
  units!: number;
}
export class OrderInputs {
  txnId!: string;
  amount!: string;
  items!: [CartItem];
}
export class CreateDeliveryUserInputs {
  @IsEmail()
  email!: string;

  @Length(7, 12)
  phone!: string;

  @Length(7, 12)
  password!: string;

  firstName!: string;
  lastName!: string;
  address!: string;
  pincode!: string;
}

export interface CreateVendorInputs {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface VendorLoginInputs {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  email: string;
  name: string;
}

export interface EditVendorInput {
  name: string;
  address: string;
  phone: string;
  foodType: [string];
}

export interface CreateOfferInput {
  offerType: string;
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive?: boolean
}

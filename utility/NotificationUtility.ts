import dotenv from 'dotenv';
dotenv.config()

export const GenOtp = () => {
  const otp = Math.trunc(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { otp, expiry };
};

export const SendOtp = (otp: number, toPhoneNumber: string) => {
  const accountSid = process.env.account_sid;
  const authToken = process.env.auth_token;
  const client = require("twilio")(accountSid, authToken);
  const response = client.messages.create({
    body: `The Otp is ${otp}`,
    from: "",
    to: '+91'+toPhoneNumber,
  });
  return response;
};

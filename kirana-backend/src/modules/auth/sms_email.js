// Replace these with MSG91 / Exotel / Twilio / SES etc.

export async function sendOtpSms(phone, code) {
  console.log(`[SMS] Sending OTP ${code} to ${phone}`);
  // await msg91.send(...);
}

export async function sendOtpEmail(email, code) {
  console.log(`[Email] Sending OTP ${code} to ${email}`);
  // await ses.send(...);
}

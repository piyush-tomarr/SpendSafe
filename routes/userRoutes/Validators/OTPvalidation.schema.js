const {z} = require ('zod')

module.exports = {
    OTPValSchema: z.object({
        otp: z.string().trim().regex(/^\d{4}$/,'Incorrect otp! enter 4 digit otp sent to your email'),
        email: z.string().trim().email('Invalid email')

    })
}
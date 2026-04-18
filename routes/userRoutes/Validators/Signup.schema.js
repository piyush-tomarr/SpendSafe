const {z} = require('zod')

module.exports = {
    validationSchema : z.object({
      username: z.string().trim().min(3,"username too short"),
      email: z.string().trim().email('Invalid email'),
      password: z.string().trim().min(8,"password should be of atleast 8 characters").regex(/[a-z]/,'password should contain a lower case letter').regex(/[A-Z]/ , 'password should contain an uppercase letter').regex(/[!@#$%&^*]/,'password should contain a special character').regex(/[0-9]/, 'password must contain a number 0-9')
    })
}
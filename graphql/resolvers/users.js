const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../../config')
const { UserInputError } = require('apollo-server')
const { validateRegisterInput, validateLoginInput } = require('../../util/validation')

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username 
    }, SECRET_KEY, { expiresIn: '1h' })
} 

module.exports = {
    Query: {
        async getUsers() {
            try {
                const users = await User.find()
                return users
            } catch(err){
                throw new Error(err)
            }
        }
    },
    Mutation: {
        // login
        async login(_, {
            username,
            password
        }) {
            const { valid, errors } = validateLoginInput(username, password)
            if (!valid) {
                throw new UserInputError('Errors', {errors})
            }
            const user = await User.findOne({ username })
            if (!user){
                errors.general = 'User not found'
                throw new UserInputError('User not found', {errors})
            }
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                errors.general = 'Wrong credentials'
                throw new UserInputError('Wrong credentials', {errors})
            }
            const token = generateToken(user)
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },

        //register
        async register(_, { registerInput : {
            username,
            email,
            password,
            confirmPassword
        }
        }){
            // validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

            if (!valid){
                throw new UserInputError('Error', { errors })
            }

            // make sure user doestn already exist
            // has pass and create token

            const user = await User.findOne({ username })
            if(user){
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                password,
                username,
                createdAt: new Date().toISOString()
            });
            const res = await newUser.save()
            const token = generateToken(res)
            // console.log('res', res)
            // console.log('res_1', res._doc)
            // console.log('res_2', res._id)
            // console.log('res_3', token)
            return {
                ...res._doc,
                id: res._id,
                token
            }
        } 
    }
}
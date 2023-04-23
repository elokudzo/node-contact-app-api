const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { constants } = require('../constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//@desc Register a user
//@route POST /api/users/register
//@access public

const registerUser = asyncHandler( async (req,resp) =>{

    const {username, email, password } = req.body;

    if(!username || !email || !password ){
        resp.status(constants.VALIDATION_ERROR);
        throw new Error('All fields are mandatory!')
    }
    const userAvailable = await User.findOne({email});

    if(userAvailable){
        resp.status(constants.VALIDATION_ERROR);
        throw new Error('User already registered');
    }

    //Hash password
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,email,password: hashedPass
    });
    console.log(`user created ${user}`);

    if(user){
        resp.status(201).json({ _id: user.id , email : user.email });
    }else{
        resp.status(400);
        throw new Error("user data is not valid");
    }


    resp.json({message: "Register the user"});
});



//@desc Login a user
//@route POST /api/users/login
//@access public

const loginUser = asyncHandler( async (req,resp) =>{
    const {email, password } = req.body;

    if(!email || !password){
        resp.status(400);
        throw new ("All fields are mandatory");
    }

    const user  = await User.findOne({email});
    // compare password 
    if(user && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign(
            {
                user: {
                    username : user.username,
                    email: user.email,
                    id: user.id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : "10m"}
        )
        resp.status(200).json({accessToken})    
    }else{
        resp.status(401);
        throw new Error("Email or password not valid");
    }
});


//@desc current user info
//@route GET /api/users/current
//@access private

const currentUser = asyncHandler( async (req,resp) =>{
    resp.json(req.user);

});



module.exports = {registerUser, loginUser, currentUser};
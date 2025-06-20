import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken"

export const login = async(req,res)=>{
    const {username,password} = req.body
    try{
        //if user exists or not
        //check in mongodb if user exist or not using prisma
        const user = await prisma.user.findUnique({
            where:{username}
        })

        if(!user) return res.status(404).json({message : "Invalid Credentials"})

        //if password is correct

        const isPassportValid = await bcrypt.compare(password, user.password);

        if(!isPassportValid) return res.status(401).json({message : "Invalid credentials"})

        //generate cookie token and send to user
        //if username and password are correct we have to generate the cookie

        //res.setHeader("Set-Cookie","test=" + "myValue").json("success") used for generating cookie

        //JWT TOKEN

        const age = 1000 * 60 * 60 * 24 * 7; // it is used to make the cookie session last for 1 week

        const token = jwt.sign({
            id:user.id,
            isAdmin : true
        },process.env.JWT_SECRET_KEY,{
            expiresIn : age
        })

        //to get the userInformation without the password included
        const {password:userPassword, ...userInfo} = user
        
        //COOKIE GENERATOR
        res.cookie("token" , token , {
            httpOnly : true,
            //secure:true (inProduction make it true)
            maxAge: age, //MaxAge -> used to provide how long the cookie session lasts
        }).status(200).json(userInfo);

    }
    catch(err){
        console.log(err.message)
        res.status(500).json({message:"Failed to Login"})
    }
}

export const register = async(req,res)=>{
    const {username,email,password} = req.body;

    try{
        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password : hashPassword
            },
        });
        console.log(newUser);

        res.status(201).json({message:"User created successfully"})

    }catch(err){
        console.log(err.message)
        res.status(500).json({message:"Failed to create user"})
    }
}

export const logout = async(req,res)=>{
    res.clearCookie("token").status(200).json({message : "Logout successfull"})
}
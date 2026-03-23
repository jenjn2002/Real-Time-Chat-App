import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14*24*60*60*1000; //14 ngay theo milisecond

export const signUp = async (req, res) => {
    try {
        const {username, password, email, firstName, lastName} = req.body;
        if (!username || !password || !email || !firstName || !lastName){
            return res.status(400).json({
                message: "Khong the thieu username, password, email, firstName, lastName",
            });
        }

        // kiem tra username ton tai chua
        const duplicate = await User.findOne({username});

        if (duplicate){
            return res.status(409).json({message: "username da ton tai"});
        }
        
        // ma hoa password
        const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

        // tao user moi
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: '${firstName} ${lastName}'
        });
        
        // return
        return res.sendStatus(204);

    } catch (error) {
        console.error('loi khi goi signUp', error);
        return res.status(500).json({message: 'loi he thong'});
    }
};

export const signIn = async (req, res) => {
    try {
        // Lay inputs
        const {username, password} = req.body;

        if (!username || !password){
            return res.status(400).json({message:"Thieu username hoac password"});
        }

        // lay hashedPassword trong db de so voi password input
        const user = await User.findOne({username});

        if (!user){
            return res.status(401).json({message:" username hoac password khong chinh xac"});
        }
        
        // kiem tra password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordCorrect){
            return res
            .status(401)
            .json({message: "Username hoac password khong chinh xac"});
        }

        // tao access token
        const accessToken = jwt.sign(
            {userId: user._id}, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TTL}
        );

        //tao refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        // tao session moi de luu refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // tra refresh token ve trong coookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL,
        })
        // tra access token ve trong res
        return res.status(200).json({message: 'User ${user.displayName} da login', accessToken});


    } catch (error) {
        console.error('loi khi goi signIn', error);
        return res.status(500).json({message: 'loi he thong'});
    }
};

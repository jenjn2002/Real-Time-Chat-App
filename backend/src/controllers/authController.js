import bcrypt from 'bcrypt';



export const signUp = async () => {
    try {
        const {username, password, email, firstName, lastName} = req.body;
        if (!username || !password || !email || !firstName || !lastName){
            return res.status(400).json({
                message: "Khong the thieu username, password, email, firstName, lastName",
            });
        }

        // kiem tra username ton tai chua
        const duplicate = await User.findOne({userName});

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

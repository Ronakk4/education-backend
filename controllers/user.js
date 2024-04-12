const { Pool } = require('pg');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'fallbacksecret';

const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const saltRounds = 10



const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:nFoWJl4Iy6Bz@ep-dawn-sky-a5bowg63.us-east-2.aws.neon.tech/education?sslmode=require',
    ssl: {
        rejectUnauthorized: false 
    }
});


    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    async function uploadProfileImage(req, res) {
        try {
            const { file } = req;

            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'profile_images'
            });

            res.status(200).json({ message: 'Image uploaded successfully', imageUrl: result.secure_url });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
}
async function getUserbyID(req,res){
  try{
    const id=req.body.value;
    const client=await pool.connect();
    const query="select *  from users where user_id=$id"
    
    const result = await client.query(query);

   console.log(result)
    client.release();

   
    res.json(result.rows);
  }
  catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
}
}

async function updateUserProfile(req, res) {
    try {
        const userId = req.user.id; 
        const { name, email, profilePicture, ...otherDetails } = req.body;

        await pool.query('UPDATE users SET name = $1, email = $2, profile_picture = $3, other_details = $4 WHERE user_id = $5', [name, email, profilePicture, otherDetails, userId]);

        res.json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

   
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

      
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

      
        const accessToken = jwt.sign({ id: user.rows[0].user_id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ accessToken: accessToken });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = uuidv4();

        await pool.query('INSERT INTO users ( name, email, password) VALUES ($1, $2, $3)', [ name, email, hashedPassword]);

        const resend = new Resend('re_2SXoFdUM_DEwF2weQnfBv8HrkWqoDk7Gp');
        resend.emails.send({
            from: ' Acme <onboarding@resend.dev>',
            to: email,
            subject: "Successful registration",
            html: '<p>Congratulations on successful registration!</p>'
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}







async function getUsers(req, res) {
    try {
       
        const client = await pool.connect();
        
        const result = await client.query('SELECT * FROM users');
        console.log(result)
       
        client.release();

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { getUsers,getUserbyID ,uploadProfileImage,registerUser,updateUserProfile,loginUser};

require('dotenv').config();
const Token = require("../../models/token");
const paseto = require('paseto');
const { V4: { sign } } = paseto;
const fs = require('fs');
const path = require('path');

const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;
const expiresIn = process.env.EXPIRES_IN;  
const mailexpiresIn = process.env.MAIL_EXPIRES_IN;  
const private_key_path = path.resolve(__dirname, '../rsa/private_key.pem');
const private_key = fs.readFileSync(private_key_path);


async function createToken(data) {
    if (!secret_key) {
        throw new Error('SECRET_KEY is not defined in the environment variables.');
    }

    data.secret_key = secret_key;


    let token = await sign(data, private_key, { expiresIn: expiresIn });  

    return token;
}


async function registermailtoken(data) {
    if (!mail_secret_key) {
        throw new Error('MAIL_SECRET_KEY is not defined in the environment variables.');
    }

    console.log("registermailtoken")

    data.secret_key = mail_secret_key;

    const newToken = new Token({
        token: "123", 
        username: data.username,
    });

    const savedToken = await newToken.save();

    console.log('Token ID:', savedToken._id);

    data.tokenId = savedToken._id;

    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });


    savedToken.token = token; 
    await savedToken.save();  


    console.log('Updated Token:', savedToken);

    return token;
}

async function forgotmailtoken(data) {
    if (!forgot_secret_key) {
        throw new Error('FORGOT_SECRET_KEY is not defined in the environment variables.');
    }
    console.log("forgotmailtoken")

    data.secret_key = forgot_secret_key;

    console.log("forgotmailtoken data",data)
    const newToken = new Token({
        token: "123", 
        username: data.username,
    });

    const savedToken = await newToken.save();


    console.log('Token ID:', savedToken._id);

    data.tokenId = savedToken._id;

    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });


    savedToken.token = token; 
    await savedToken.save();  


    console.log('Updated Token:', savedToken);

    return token;
}


module.exports = { createToken, registermailtoken , forgotmailtoken};
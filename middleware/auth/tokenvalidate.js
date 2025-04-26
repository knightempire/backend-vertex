
require('dotenv').config();
const Token = require("../../models/token");
const paseto = require('paseto');
const { V4: { verify } } = paseto;
const fs = require('fs');
const path = require('path');

// Load the public key from the file
const public_key_path = path.resolve(__dirname, '../rsa/public_key.pem');
const public_key = fs.readFileSync(public_key_path);

// Environment variables for secret keys
const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;

// Token verification for "create" token
async function tokenValidator(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        const payload = await verify(token, public_key);

        if (payload && payload.secret_key === secret_key) {
            req.body.username = payload.username;
            req.body.userId = payload.id;
            req.body.name = payload.name;
   

            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}


// Token verification for "register" token
async function readverifyRegisterTokens(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        // Check if the token exists in the database
        const existingToken = await Token.findOne({ token });
        if (!existingToken) {
            return res.status(401).send({ MESSAGE: 'Token not found in database or has already been used.' });
        }

        // Proceed with verifying the token if it exists in the database
        const payload = await verify(token, public_key);

        if (payload && payload.secret_key === mail_secret_key) {
            req.body.username = payload.username;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}


// Token verification for "forgot" token
async function readverifyForgotToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        // Check if the token exists in the database
        const existingToken = await Token.findOne({ token });
        if (!existingToken) {
            return res.status(401).send({ MESSAGE: 'Token not found in database or has already been used.' });
        }

        // Proceed with verifying the token if it exists in the database
        const payload = await verify(token, public_key);

        if (payload && payload.secret_key === forgot_secret_key) {
            req.body.username = payload.username;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}




// Token verification for "register" token
async function verifyRegisterToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        const payload = await verify(token, public_key);

        if (payload && payload.secret_key === mail_secret_key) {
           
            const existingToken = await Token.findOne({ token });

            if (!existingToken) {
                return res.status(401).send({ MESSAGE: 'Token has already been used or expired.' });
            }

        
            req.body.username = payload.username;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            await Token.deleteOne({ token });

            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid register token payload.' });
        }
    } catch (err) {
        return res.status(401).send({ MESSAGE: 'Invalid or expired register token: ' + err.message });
    }
}

// Token verification for "forgot" token
async function verifyForgotToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        // Verify the token with the public key
        const payload = await verify(token, public_key);
        
        // Check if the payload contains the correct secret_key
        if (payload && payload.secret_key === forgot_secret_key) {
            // Check if the token exists in the database
            const existingToken = await Token.findOne({ token });
            console.log(existingToken);
            if (!existingToken) {
                return res.status(401).send({ MESSAGE: 'Token has already been used or expired.' });
            }

            // Attach user information from the token payload to the request body
            req.body.username = payload.username;
            req.body.userId = payload.id;
            req.body.name = payload.name;

            // Delete the token from the database after use
            await Token.deleteOne({ token });

            // Proceed to the next middleware or route handler
            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid forgot token payload.' });
        }
    } catch (err) {
        // Handle the error when token is expired
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ MESSAGE: 'Forgot token has expired.' });
        }

        // Handle other errors (e.g., invalid signature)
        return res.status(401).send({ MESSAGE: 'Invalid or expired forgot token: ' + err.message });
    }
}

module.exports = {
    tokenValidator,
    verifyRegisterToken,
    verifyForgotToken,
    readverifyForgotToken,
    readverifyRegisterTokens,
};
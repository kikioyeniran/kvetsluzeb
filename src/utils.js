import jwt from 'jsonwebtoken';
// import config from './config';

module.exports = {
    validateToken: (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let result;
        if(authorizationHeader) {
            const token = req.headers.authorization.split(' ')[1];
            const options = {
                expiresIn: '1d',
                issuer: 'http://relicinnova.com.ng'
            };

            try {
                // verifying to make sure that the token hasnt expired and has been issued by us
                result = jwt.verify(token, process.env.PASSWORD_HASH_SECRET , options); 

                // passing the decoded token to the request object
                req.decoded = result;
                
                // calling next to pass execution to subsequent middleware 
                next();

            } catch (err){
                // throwing an error object just in case anything goes wrong 
                throw new Error(err)
            }
        } else {
            result = {
                error: `Authentication error. Token required.`,
                status: 401
            };
            res.status(401).send(result);
        }
    }
}
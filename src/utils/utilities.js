const jwt = require('jsonwebtoken');

// verify jwt expiration date
const verifyToken = (token) => {
    const decoded = jwt.decode(token);
    const expirationDate = new Date(decoded.exp * 1000);
    if (expirationDate < new Date()) {
        return false;
    }
    return true;
};

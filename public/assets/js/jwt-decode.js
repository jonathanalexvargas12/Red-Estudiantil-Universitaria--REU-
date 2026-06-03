function jwt_decode(token) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(payload));
    } catch (e) {
        throw new Error('Invalid token: ' + e.message);
    }
}

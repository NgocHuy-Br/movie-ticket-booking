// Authentication utility functions

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    return !!(token && userInfo);
};

export const getUserInfo = () => {
    try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            return JSON.parse(userInfoStr);
        }
    } catch (error) {
        console.error('Error parsing user info:', error);
    }
    return null;
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    window.dispatchEvent(new Event('userLogin'));
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('redirectAfterLogin');
    window.dispatchEvent(new Event('userLogout'));
};

export const updateUserInfo = (userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    window.dispatchEvent(new Event('userProfileUpdate'));
};

export const isAdmin = () => {
    const userInfo = getUserInfo();
    return userInfo && userInfo.role === 'ADMIN';
};

export const getMembershipLevel = () => {
    const userInfo = getUserInfo();
    return userInfo ? userInfo.membershipLevel : 'NORMAL';
};

export const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

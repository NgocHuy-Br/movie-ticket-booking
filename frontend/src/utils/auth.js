// Authentication utility functions

const parseJwt = (token) => {
    try {
        const [, payload] = token.split('.');
        return JSON.parse(atob(payload));
    } catch (err) {
        return null;
    }
};

const isTokenExpired = (token) => {
    const data = parseJwt(token);
    if (!data || !data.exp) return true; // nếu không đọc được exp, coi như hết hạn
    const now = Date.now();
    return data.exp * 1000 <= now;
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (!(token && userInfo)) return false;

    if (isTokenExpired(token)) {
        logout();
        return false;
    }

    return true;
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
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
        logout();
        return null;
    }
    return token;
};

export const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    window.dispatchEvent(new Event('userLogin'));
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('userLogout'));
};

// Gọi ở app khởi động để dọn phiên hết hạn (tránh lưu phiên sau khi tắt máy / rebuild)
export const ensureAuthFreshness = () => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
        logout();
    }
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

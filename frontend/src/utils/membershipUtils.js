/**
 * Utility functions for membership level operations
 */

/**
 * Get Vietnamese label for membership level
 * @param {string} level - Membership level (NORMAL, GOLD, PLATINUM)
 * @returns {string} Vietnamese label
 */
export const getMembershipLabel = (level) => {
    const labels = {
        'NORMAL': 'ĐỒNG',
        'GOLD': 'VÀNG',
        'PLATINUM': 'BẠCH KIM'
    };
    return labels[level] || level;
};

/**
 * Get CSS class name for membership level badge
 * @param {string} level - Membership level (NORMAL, GOLD, PLATINUM)
 * @returns {string} CSS class name
 */
export const getMembershipClass = (level) => {
    return level ? level.toLowerCase() : 'normal';
};

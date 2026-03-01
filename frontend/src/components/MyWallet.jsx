import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserInfo } from '../utils/auth';
import './MyWallet.css';

const MyWallet = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [filterType, setFilterType] = useState('all'); // all, DEPOSIT, BOOKING_PAYMENT, REFUND

    useEffect(() => {
        const info = getUserInfo();
        setUserInfo(info);
        fetchTransactions();
    }, [filterType]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = filterType !== 'all' ? { type: filterType } : {};

            const response = await axios.get('http://localhost:8080/api/wallet/transactions', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);

        if (!amount || amount <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (amount < 10000) {
            alert('Số tiền nạp tối thiểu là 10,000 VNĐ');
            return;
        }

        try {
            setIsDepositing(true);
            const token = localStorage.getItem('token');

            await axios.post(
                'http://localhost:8080/api/wallet/deposit',
                { amount, description: 'Nạp tiền vào ví' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Nạp tiền thành công!');
            setShowDepositModal(false);
            setDepositAmount('');

            // Refresh transactions and user info
            fetchTransactions();

            // Update user info in localStorage
            const updatedInfo = { ...userInfo, accountBalance: userInfo.accountBalance + amount };
            localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
            setUserInfo(updatedInfo);

            // Dispatch event to update header
            window.dispatchEvent(new Event('userProfileUpdate'));
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi nạp tiền');
        } finally {
            setIsDepositing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'DEPOSIT':
                return '💰';
            case 'BOOKING_PAYMENT':
                return '🎬';
            case 'REFUND':
                return '↩️';
            case 'CANCELLATION':
                return '❌';
            default:
                return '💵';
        }
    };

    const getTransactionLabel = (type) => {
        switch (type) {
            case 'DEPOSIT':
                return 'Nạp tiền';
            case 'BOOKING_PAYMENT':
                return 'Thanh toán vé';
            case 'REFUND':
                return 'Hoàn tiền';
            case 'CANCELLATION':
                return 'Hủy vé';
            default:
                return type;
        }
    };

    const presetAmounts = [100000, 200000, 500000, 1000000];

    if (loading && transactions.length === 0) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="my-wallet-container">
            <div className="wallet-balance-card">
                <div className="balance-header">
                    <h3>Số dư ví</h3>
                </div>
                <div className="balance-amount">
                    {formatCurrency(userInfo?.accountBalance || 0)}
                </div>
                <button className="deposit-btn" onClick={() => setShowDepositModal(true)}>
                    + Nạp tiền
                </button>
            </div>

            <div className="transactions-section">
                <div className="transactions-header">
                    <h3>Lịch sử giao dịch</h3>
                    <div className="filter-group">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="DEPOSIT">Nạp tiền</option>
                            <option value="BOOKING_PAYMENT">Thanh toán</option>
                            <option value="REFUND">Hoàn tiền</option>
                        </select>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có giao dịch nào</p>
                    </div>
                ) : (
                    <div className="transactions-list">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="transaction-item">
                                <div className="transaction-icon">
                                    {getTransactionIcon(transaction.type)}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-title">
                                        {getTransactionLabel(transaction.type)}
                                    </div>
                                    <div className="transaction-desc">
                                        {transaction.description || 'Không có mô tả'}
                                    </div>
                                    {transaction.ticketCode && (
                                        <div className="transaction-ticket">
                                            Mã vé: {transaction.ticketCode}
                                        </div>
                                    )}
                                    <div className="transaction-time">
                                        {formatDateTime(transaction.createdAt)}
                                    </div>
                                </div>
                                <div className="transaction-amount-section">
                                    <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </div>
                                    <div className="transaction-balance">
                                        Số dư: {formatCurrency(transaction.balanceAfter)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal-overlay" onClick={() => !isDepositing && setShowDepositModal(false)}>
                    <div className="modal-content deposit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nạp tiền vào ví</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDepositModal(false)}
                                disabled={isDepositing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="deposit-form">
                            <div className="preset-amounts">
                                {presetAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        className={`preset-btn ${depositAmount === amount.toString() ? 'active' : ''}`}
                                        onClick={() => setDepositAmount(amount.toString())}
                                        disabled={isDepositing}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            <div className="form-group">
                                <label>Số tiền nạp</label>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    min="10000"
                                    disabled={isDepositing}
                                />
                                <small>Số tiền tối thiểu: 10,000 VNĐ</small>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowDepositModal(false)}
                                    disabled={isDepositing}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="confirm-btn"
                                    onClick={handleDeposit}
                                    disabled={isDepositing}
                                >
                                    {isDepositing ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWallet;

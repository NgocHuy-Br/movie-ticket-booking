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
    const [paymentMethod, setPaymentMethod] = useState('visa'); // 'visa' only
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [visaInfo, setVisaInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

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

    const formatMoney = (value) => {
        if (!value) return '';
        const number = value.toString().replace(/[^0-9]/g, '');
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const parseMoney = (value) => {
        return parseFloat(value.toString().replace(/,/g, '')) || 0;
    };

    const handleDepositAmountChange = (value) => {
        const formatted = formatMoney(value);
        setDepositAmount(formatted);
    };

    const handleDeposit = async () => {
        const amount = parseMoney(depositAmount);

        if (!amount || amount <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (amount < 10000) {
            alert('Số tiền nạp tối thiểu là 10,000 VNĐ');
            return;
        }

        // Validate Visa card
        if (!validateVisaCard()) {
            alert('Thông tin thẻ không hợp lệ. Vui lòng kiểm tra lại!');
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const validateVisaCard = () => {
        // Card number validation (16 digits)
        const cardNumber = visaInfo.cardNumber.replace(/\s/g, '');
        if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
            return false;
        }

        // Card holder validation (letters and spaces only)
        if (!visaInfo.cardHolder.trim() || !/^[a-zA-Z\s]+$/.test(visaInfo.cardHolder)) {
            return false;
        }

        // Expiry date validation (MM/YY format)
        if (!visaInfo.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(visaInfo.expiryDate)) {
            return false;
        }

        // Check if card is expired
        const [month, year] = visaInfo.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        if (expiry < now) {
            return false;
        }

        // CVV validation (3-4 digits)
        if (!visaInfo.cvv || !/^\d{3,4}$/.test(visaInfo.cvv)) {
            return false;
        }

        return true;
    };

    const handleConfirmDeposit = async () => {
        const amount = parseMoney(depositAmount);

        try {
            setIsDepositing(true);
            setShowConfirmModal(false);
            const token = localStorage.getItem('token');

            await axios.post(
                'http://localhost:8080/api/wallet/deposit',
                { amount, description: 'Nạp tiền vào ví' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Nạp tiền thành công!');
            setShowDepositModal(false);
            setDepositAmount('');
            setVisaInfo({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });

            // Refresh transactions and user info
            fetchTransactions();

            // Fetch updated user info from backend
            const userResponse = await axios.get('http://localhost:8080/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedInfo = userResponse.data.data;
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

    const handleVisaInputChange = (field, value) => {
        let formattedValue = value;

        // Format card number (add spaces every 4 digits)
        if (field === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19); // 16 digits + 3 spaces
        }

        // Format expiry date (add / after 2 digits)
        if (field === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
        }

        // Format CVV (only digits, max 4)
        if (field === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        // Format card holder (only letters and spaces)
        if (field === 'cardHolder') {
            formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        }

        setVisaInfo(prev => ({ ...prev, [field]: formattedValue }));
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
                                onClick={() => {
                                    setShowDepositModal(false);
                                    setVisaInfo({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
                                    setDepositAmount('');
                                }}
                                disabled={isDepositing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="deposit-form">
                            <div className="form-group">
                                <label>Số tiền nạp *</label>
                                <input
                                    type="text"
                                    value={depositAmount}
                                    onChange={(e) => handleDepositAmountChange(e.target.value)}
                                    disabled={isDepositing}
                                />
                                <small>Số tiền tối thiểu: 10,000 VNĐ</small>
                            </div>

                            <div className="form-group">
                                <label>Thông tin thẻ Visa/Mastercard *</label>
                            </div>

                            <div className="visa-form">
                                <div className="form-group">
                                    <label>Số thẻ *</label>
                                    <input
                                        type="text"
                                        value={visaInfo.cardNumber}
                                        onChange={(e) => handleVisaInputChange('cardNumber', e.target.value)}
                                        placeholder="1234 5678 9012 3456"
                                        disabled={isDepositing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tên chủ thẻ *</label>
                                    <input
                                        type="text"
                                        value={visaInfo.cardHolder}
                                        onChange={(e) => handleVisaInputChange('cardHolder', e.target.value)}
                                        placeholder="NGUYEN VAN A"
                                        disabled={isDepositing}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ngày hết hạn *</label>
                                        <input
                                            type="text"
                                            value={visaInfo.expiryDate}
                                            onChange={(e) => handleVisaInputChange('expiryDate', e.target.value)}
                                            placeholder="MM/YY"
                                            disabled={isDepositing}
                                            maxLength="5"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>CVV *</label>
                                        <input
                                            type="text"
                                            value={visaInfo.cvv}
                                            onChange={(e) => handleVisaInputChange('cvv', e.target.value)}
                                            placeholder="123"
                                            disabled={isDepositing}
                                            maxLength="4"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowDepositModal(false);
                                        setVisaInfo({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
                                        setDepositAmount('');
                                    }}
                                    disabled={isDepositing}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="confirm-btn"
                                    onClick={handleDeposit}
                                    disabled={isDepositing}
                                >
                                    {isDepositing ? 'Đang xử lý...' : 'Tiếp tục'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => !isDepositing && setShowConfirmModal(false)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Xác nhận nạp tiền</h3>
                        </div>
                        <div className="confirm-content">
                            <p>Bạn có chắc chắn muốn nạp <strong>{formatCurrency(parseMoney(depositAmount))}</strong></p>
                            <p>từ tài khoản thẻ <strong>**** **** **** {visaInfo.cardNumber.replace(/\s/g, '').slice(-4)}</strong></p>
                            <p>của <strong>{visaInfo.cardHolder}</strong></p>
                            <p>vào ví không?</p>
                        </div>
                        <div className="form-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isDepositing}
                            >
                                Hủy
                            </button>
                            <button
                                className="confirm-btn"
                                onClick={handleConfirmDeposit}
                                disabled={isDepositing}
                            >
                                {isDepositing ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWallet;

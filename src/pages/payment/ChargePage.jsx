import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';


const token = localStorage.getItem("accessToken");

export default function ChargePage() {
    const [amount, setAmount] = useState('');
    const navigate = useNavigate();

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleCheckout = () => {
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 결제 페이지로 이동
        navigate(`/payment/checkout?amount=${amount}`);
    };

    return (
        <div className="charge-page">
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/home')}>←</button>
                <h1 className="app-title">충전</h1>
            </header>

            <main className="main-content">
                <div className="charge-container">
                    <div className="charge-input">
                        <label htmlFor="amount">충전 금액</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="금액 입력"
                            min="1"
                        />
                    </div>
                    <button className="main-btn" onClick={handleCheckout}>
                        결제하기
                    </button>
                </div>
            </main>

            {/* 하단 네비게이션 */}
            <nav className="tab-bar">
                <Link to="/home" className="tab active">Home</Link>
                <Link to="/club" className="tab">Club</Link>
                <Link to="/board" className="tab">Board</Link>
                <Link to="/myclubs" className="tab">My Clubs</Link>
                <Link to="/profile" className="tab">Profile</Link>
            </nav>
        </div>
    );
}

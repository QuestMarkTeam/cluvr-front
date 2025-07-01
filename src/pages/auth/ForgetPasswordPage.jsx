import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgetPasswordPage() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // ✅ 실제 비밀번호 재설정 API 호출 필요
        alert('비밀번호 재설정 링크가 전송되었습니다!');
        navigate('/login');
    };

    return (
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <form className="forget-card" onSubmit={handleSubmit}>
                <div className="forget-title">Forget Password</div>
                <input
                    name="email"
                    type="email"
                    className="forget-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" className="forget-btn">Send Reset Link</button>
                <div style={{ marginTop: '8px' }}>
                    <Link to="/login" className="forget-link">Back to Login</Link>
                </div>
            </form>
        </main>
    );
}

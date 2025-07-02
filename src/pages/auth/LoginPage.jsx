import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/auth.css';

const API_DOMAIN_URL = 'http://localhost:80'; // 개발용
// const API_DOMAIN_URL = 'http://44.239.99.137:80'; // 배포용

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            navigate('/home');
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const result = await response.json();

            if (response.ok) {
                const loginData = result.data;
                console.log(loginData);
                localStorage.setItem('accessToken', loginData.accessToken);
                localStorage.setItem('refreshToken', loginData.refreshToken);
                localStorage.setItem('userId', loginData.id);
                localStorage.setItem('userName', loginData.name);
                localStorage.setItem('userEmail', loginData.email);
                alert('로그인 성공!');
                navigate('/home');
            } else {
                setError(result.result?.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            console.error('로그인 오류:', err);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-title">Cluvr</div>
                <input
                    name="email"
                    type="email"
                    className="login-input"
                    placeholder="이메일"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    className="login-input"
                    placeholder="비밀번호"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                </button>
                <button type="button" className="login-social-btn login-kakao">카카오 로그인</button>
                <button type="button" className="login-social-btn login-google">구글 로그인</button>
                <div style={{ marginTop: '8px' }}>
                    <Link to="/signup" className="login-link">회원가입</Link>
                    <Link to="/forget-password" className="login-link">비밀번호 찾기</Link>
                </div>
            </form>
        </main>
    );
}

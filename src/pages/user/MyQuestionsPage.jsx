import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/question.css';
const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function MyQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [clover, setClover] = useState([]);
    useEffect(() => {
        fetchGetClover();
        fetchMyQuestions();
        fetchUserProfile();
    }, []);
    const fetchGetClover= async () =>{
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clovers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                },
            });

            if (res.status === 401) {
                localStorage.clear();
                return;
            }

            if (!res.ok) {
                throw new Error('클로버를 불러오지 못했습니다.');
            }

            const data = await res.json();
            console.log(data.data.score);
            setClover(data.data.score);
        } catch (err) {
            console.error('클럽 목록 조회 실패:', err);
            setClover([]);
        }
    }
    const fetchUserProfile = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            if (!res.ok) throw new Error('프로필 정보를 불러오지 못했습니다.');

            const data = await res.json();
            setUserProfile(data.data);

            localStorage.setItem('userName', data.data.name || '사용자');
            localStorage.setItem('userGem', data.data.gem || 0);
            localStorage.setItem('userClover', data.data.clover || 0);

            const newUserInfo = {
                userName: data.data.name || '사용자',
                userEmail: data.data.email || '',
            };
            setUserInfo(newUserInfo);
        } catch (err) {
            console.error('프로필 정보 불러오기 오류:', err);
        }
    };
    const fetchMyQuestions = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/boards/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.clear();
                setError('로그인 세션이 만료되었습니다.');
                return;
            }

            if (!response.ok) {
                throw new Error('질문 목록을 불러오지 못했습니다.');
            }

            const result = await response.json();
            setQuestions(result.data.content || []);
        } catch (err) {
            console.error(err);
            setError('질문 목록을 불러오지 못했습니다.');
        }
    };

    return (
        <>
            {/* 상단 바 */}
            <header className="app-bar">
                <h1 className="app-title">나의 질문</h1>
                <div className="user-info">
                    <span className="user-name">사용자</span>
                    <span className="user-gem">💎 {userProfile?.gem || 0}</span>
                    <span className="user-clover">🍀 {clover|| 0}</span>
                </div>
            </header>

            <main className="main-content">
                {error && <p className="error-message">{error}</p>}
                {questions.length === 0 ? (
                    <div className="empty-state">
                        <p>작성한 질문이 없습니다.</p>
                    </div>
                ) : (
                    <ul className="question-list">
                        {questions.map((question) => (
                            <li key={question.id} className="question-card">
                                <h2 className="question-title">{question.title}</h2>
                                <p className="question-content">{question.content}</p>
                                <p className="question-created-at">{new Date(question.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {/* 하단 바 */}
            <footer className="footer">
                <button className="footer-btn" onClick={() => navigate('/home')}>대시보드로 돌아가기</button>
            </footer>
        </>
    );
}

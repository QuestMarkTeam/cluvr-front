import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/board.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

const boardTypes = [
  { label: '자유게시판', value: 'CHITCHAT' },
  { label: '질문게시판', value: 'QUESTION' }
];
const categories = [
  { label: '개발', value: 'DEVELOPMENT' },
  { label: '알고리즘', value: 'ALGORITHMS_CODING_TESTS' },
  { label: '면접', value: 'INTERVIEW_PREPARATION' },
  { label: '자격증', value: 'CERTIFICATIONS_EXAMS' },
  { label: '디자인', value: 'DESIGN' },
  { label: '언어', value: 'LANGUAGE_LEARNING' },
  { label: 'AI/데이터', value: 'AI_DATA_SCIENCE' },
  { label: '대외활동', value: 'EXTRACURRICULAR_COMPETITIONS' },
  { label: '음악', value: 'MUSIC_EDUCATION' },
  { label: '기타', value: 'OTHERS' }
];

export default function WriteBoardPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    boardType: 'CHITCHAT',
    category: 'DEVELOPMENT',
    clover: 0
  });
      const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_DOMAIN_URL}/api/boards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        localStorage.clear();
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.result?.message || '게시글 등록에 실패했습니다.');
      }

      alert('게시글이 등록되었습니다!');
      navigate('/board');
    } catch (err) {
      console.error('게시글 등록 오류:', err);
      alert(err.message || '에러 발생');
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
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
      if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
      const data = await res.json();
      
      setUserInfo({
        userName: data.data.name || '사용자',
        gem: data.data.gem || 0,
        clover: data.data.clover || 0
      });
            } catch (err) {
            console.error('사용자 정보 불러오기 오류:', err);
        }
    };

    const handleNotificationClick = () => {
        setShowNotificationModal(true);
        fetchNotifications();
    };

    const fetchNotifications = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/notifications`, {
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
            if (!res.ok) throw new Error('알림을 불러오지 못했습니다.');
            const data = await res.json();
            setNotifications(data.data || []);
        } catch (err) {
            console.error('알림 불러오기 오류:', err);
            setNotifications([]);
        }
    };

  return (
    <div className="write-board-page">
                  {/* 상단바 */}
            <header className="app-bar" style={{ position: 'relative' }}>
        <h1 className="app-title">글쓰기</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>{userInfo.userName}</span>
          <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>💎 {userInfo.gem}</span>
          <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>🍀 {userInfo.clover}</span>
                              <button 
                        className="icon-btn" 
                        onClick={handleNotificationClick}
                        style={{ fontSize: '1.2rem', color: '#666' }}
                    >
                        🔔
                    </button>
        </div>
      </header>

      {/* 본문 */}
      <main className="main-content" style={{ paddingTop: 0 }}>
        <form className="write-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <label>게시판 종류</label>
            <select name="boardType" value={form.boardType} onChange={handleChange} required>
              {boardTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label>카테고리</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label>제목</label>
            <input
              name="title"
              placeholder="제목"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-section">
            <label>내용</label>
            <textarea
              name="content"
              placeholder="내용"
              value={form.content}
              onChange={handleChange}
              required
              style={{ resize: 'none', height: '120px' }}
            />
          </div>
          <div className="form-section">
            <label>클로버 (0~100)</label>
            <input
              name="clover"
              type="number"
              min={0}
              max={100}
              value={form.clover}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="main-btn">등록</button>
        </form>
      </main>
                  <TabBar />

            {/* 알림 드롭다운 */}
            {showNotificationModal && (
                <div style={{
                    position: 'fixed',
                    top: '70px',
                    right: '420px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    width: '300px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: '1px solid #eee'
                }}>
                    {/* 드롭다운 헤더 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>알림</h4>
                        <button 
                            onClick={() => setShowNotificationModal(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* 알림 리스트 */}
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#888',
                                padding: '20px'
                            }}>
                                알림이 없습니다.
                            </div>
                        ) : (
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {notifications.map((notification, index) => (
                                    <li key={notification.id || index} style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            marginBottom: '4px',
                                            color: '#333'
                                        }}>
                                            {notification.title || '알림'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#666',
                                            marginBottom: '4px',
                                            lineHeight: '1.3'
                                        }}>
                                            {notification.content || '알림 내용'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#999'
                                        }}>
                                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

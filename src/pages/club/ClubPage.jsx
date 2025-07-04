import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
export default function ClubPage() {
    const [currentClubType, setCurrentClubType] = useState('STUDY');
    const [clubs, setClubs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        greeting: '',
        maxMemberCounter: 10,
        clubType: 'STUDY'
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchClubs();
    }, [currentClubType]);

    const fetchClubs = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs?clubType=${currentClubType}`, {
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
                throw new Error('클럽 리스트를 불러오지 못했습니다.');
            }
            
            const data = await res.json();
            console.log(data.data)
            setClubs(data.data?.content || []); // clubs 상태 업데이트
        } catch (err) {
            console.error('클럽 목록 조회 실패:', err);
            setClubs([]);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const createClub = async () => {
        const { name, greeting, maxMemberCounter, clubType } = formData;
        if (!name || !greeting || !maxMemberCounter) return alert('모든 필드를 입력해주세요.');

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    greeting,
                    maxMemberCounter: parseInt(maxMemberCounter),
                    clubType
                })
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '클럽 생성에 실패했습니다.');
            }

            alert('클럽이 생성되었습니다!');
            setShowModal(false);
            fetchClubs();
        } catch (err) {
            console.error('클럽 생성 실패:', err);
            alert(err.message || '클럽 생성 실패');
        }
    };

    return (
        <div className="club-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1 className="app-title">Club</h1>
                <span style={{width: '2rem'}}></span>
            </header>

            {/* 카테고리 탭 */}
            <div className="board-type-tabs">
                {[
                    { label: '스터디', value: 'STUDY' },
                    { label: '프로젝트', value: 'PROJECT' },
                    { label: '커뮤니티', value: 'COMMUNITY' }
                ].map(type => (
                    <button
                        key={type.value}
                        className={`board-type-btn ${currentClubType === type.value ? 'active' : ''}`}
                        onClick={() => setCurrentClubType(type.value)}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* 클럽 목록 */}
            <main className="main-content club-list-container">
                <ul className="group-list">
                    {clubs.length === 0 ? (
                        <div style={{color: '#888', textAlign: 'center', padding: '40px 0'}}>클럽이 없습니다.</div>
                    ) : (
                        clubs.map(club => (
                            <li
                                key={club.clubId}
                                className="group-card"
                                onClick={() => navigate(`/club/${club.clubId}`)}
                            >
                                <img src={club.posterUrl}
                                     className="group-thumb"/>
                                <div className="group-info">
                                    <div className="group-title">{club.name}</div>
                                    <div className="group-desc">{club.greeting}</div>
                                    <div className="group-meta">멤버 {club.maxMemberCounter}명</div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                <button 
                    className="main-btn" 
                    style={{ marginBottom: '60px' }}
                    onClick={() => navigate('/club/create')}
                >
                    Create Club
                </button>
            </main>

            <TabBar />

            {showModal && (
                <div className="modal" style={{display: 'flex'}}>
                    <form className="create-form">
                        <h3>클럽 생성</h3>
                        <input name="name" placeholder="클럽명" onChange={handleInputChange} required/>
                        <input name="greeting" placeholder="소개말" onChange={handleInputChange} required/>
                        <input name="maxMemberCounter" type="number" min="2" max="100" defaultValue="10"
                               onChange={handleInputChange} required/>
                        <select name="clubType" onChange={handleInputChange} required>
                            <option value="STUDY">스터디</option>
                            <option value="PROJECT">프로젝트</option>
                            <option value="COMMUNITY">커뮤니티</option>
                        </select>
                        <button type="button" onClick={createClub} className="main-btn">생성</button>
                        <button type="button" onClick={() => setShowModal(false)}
                                style={{width: '100%', marginTop: 8}}>
                            취소
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

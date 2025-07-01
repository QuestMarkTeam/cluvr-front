import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';

const API_DOMAIN_URL = 'http://localhost:80'; // 개발용

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
        const res = await fetch(`${API_DOMAIN_URL}/api/clubs?clubType=${currentClubType}`);
        const data = await res.json();
        setClubs(data.data?.content || []);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const createClub = async () => {
        const { name, greeting, maxMemberCounter, clubType } = formData;
        if (!name || !greeting || !maxMemberCounter) return alert('모든 필드를 입력해주세요.');

        const res = await fetch(`${API_DOMAIN_URL}/api/clubs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name,
                greeting,
                maxMemberCounter: parseInt(maxMemberCounter),
                clubType
            })
        });

        if (res.ok) {
            alert('클럽이 생성되었습니다!');
            setShowModal(false);
            fetchClubs();
        } else {
            const err = await res.json();
            alert(err.message || '클럽 생성 실패');
        }
    };

    return (
        <div>
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1 className="app-title">Club</h1>
                <span style={{width: '2rem'}}></span>
            </header>

            <div className="category-section">
                <div className="category-title">카테고리</div>
                    <div className="category-tabs">
                        {['STUDY', 'PROJECT', 'HOBBY'].map(type => (
                            <button
                                key={type}
                                className={`category-tab-btn  ${currentClubType === type ? 'active' : ''}`}
                                onClick={() => setCurrentClubType(type)}
                            >
                                {type === 'STUDY' ? '스터디' : type === 'PROJECT' ? '프로젝트' : '취미'}
                            </button>
                        ))}
                    </div>
                </div>
                <main className="main-content" style={{paddingTop: 0}}>
                    <ul className="group-list">
                        {clubs.length === 0 ? (
                            <div style={{color: '#888', textAlign: 'center'}}>클럽이 없습니다.</div>
                        ) : (
                            clubs.map(club => (
                                <li
                                    key={club.clubId}
                                    className="group-card"
                                    onClick={() => navigate(`/club/${club.clubId}`)}
                                >
                                    <img src={club.posterUrl || '/static/img/study-coding.png'}
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
                    <button className="main-btn" onClick={() => setShowModal(true)}>
                        Create Club
                    </button>
                </main>

                <nav className="tab-bar">
                    <Link to="/home" className="tab active">Home</Link>
                    <Link to="/club" className="tab">Club</Link>
                    <Link to="/board" className="tab">Board</Link>
                    <Link to="/myclubs" className="tab">My Clubs</Link>
                    <Link to="/profile" className="tab">Profile</Link>
                </nav>

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
                                <option value="HOBBY">취미</option>
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

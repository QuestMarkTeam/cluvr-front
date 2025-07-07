import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function ClubDetailPage() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    
    const [club, setClub] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinData, setJoinData] = useState({
        joinType: '',
        answer: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClubDetail();
    }, [clubId]);

    useEffect(() => {
        if (showJoinModal && club?.joinType) {
            setJoinData(prev => ({
                ...prev,
                joinType: club.joinType
            }));
        }
    }, [showJoinModal, club]);

    const fetchClubDetail = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
                return;
            }

            if (!res.ok) {
                throw new Error('클럽 정보를 불러오지 못했습니다.');
            }

            const data = await res.json();
            setClub(data.data);
            setLoading(false);
        } catch (err) {
            console.error('클럽 상세 조회 실패:', err);
            alert(err.message || '클럽 정보를 불러오지 못했습니다.');
            navigate('/club');
        }
    };

    const handleJoinRequest = async () => {
        if (!joinData.answer.trim()) {
            alert('가입 답변을 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(joinData)
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '가입 신청에 실패했습니다.');
            }

            alert('가입 신청이 완료되었습니다!');
            setShowJoinModal(false);
            navigate('/club');
        } catch (err) {
            console.error('가입 신청 실패:', err);
            alert(err.message || '가입 신청에 실패했습니다.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJoinData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getClubTypeLabel = (clubType) => {
        switch (clubType) {
            case 'STUDY': return '스터디';
            case 'PROJECT': return '프로젝트';
            case 'COMMUNITY': return '커뮤니티';
            default: return clubType;
        }
    };

    const getCategoryLabel = (categoryDetail) => {
        const categoryMap = {
            'DEVELOPMENT': '개발',
            'ALGORITHMS_CODING_TESTS': '알고리즘',
            'INTERVIEW_PREPARATION': '면접',
            'CERTIFICATIONS_EXAMS': '자격증',
            'DESIGN': '디자인',
            'LANGUAGE_LEARNING': '언어',
            'AI_DATA_SCIENCE': 'AI/데이터',
            'EXTRACURRICULAR_COMPETITIONS': '대외활동',
            'MUSIC_EDUCATION': '음악',
            'OTHERS': '기타'
        };
        return categoryMap[categoryDetail] || categoryDetail;
    };

    // 다이렉트 조인 처리 함수
    const handleDirectJoin = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}/direct-join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '바로 가입에 실패했습니다.');
            }

            alert('클럽에 바로 가입되었습니다!');
            navigate('/club');
        } catch (err) {
            console.error('바로 가입 실패:', err);
            alert(err.message || '바로 가입에 실패했습니다.');
        }
    };

    // 가입 신청 버튼 클릭 핸들러
    const handleJoinButtonClick = () => {
        if (club?.joinType === 'DIRECT_JOIN') {
            handleDirectJoin();
        } else {
            setShowJoinModal(true);
        }
    };

    if (loading) {
        return (
            <div className="club-detail-page">
                <header className="app-bar">
                    <button className="icon-btn" onClick={() => navigate('/club')}>&larr;</button>
                    <h1 className="app-title">클럽 상세</h1>
                    <span style={{ width: '2rem' }} />
                </header>
                <main className="main-content">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</div>
                </main>
                <TabBar />
            </div>
        );
    }

    return (
        <div className="club-detail-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/club')}>&larr;</button>
                <h1 className="app-title">클럽 상세</h1>
                <span style={{ width: '2rem' }} />
            </header>

            {/* 클럽 상세 정보 */}
            <main className="main-content">
                {club && (
                    <div className="club-detail-container">
                        {/* 클럽 포스터 */}
                        <div className="club-poster">
                            <img 
                                src={club.postUrl || '/static/img/study-coding.png'} 
                                alt={club.name}
                                className="club-poster-img"
                            />
                        </div>

                        {/* 클럽 기본 정보 */}
                        <div className="club-info-section">
                            <h2 className="club-name">{club.name}</h2>
                            <div className="club-meta-info">
                                <span className="club-type-badge">{getClubTypeLabel(club.clubType)}</span>
                                <span className="club-category-badge">{getCategoryLabel(club.categoryDetail)}</span>
                            </div>
                            <p className="club-greeting">{club.greeting}</p>
                        </div>

                        {/* 클럽 상세 설명 */}
                        <div className="club-description-section">
                            <h3>클럽 소개</h3>
                            <p className="club-description">{club.description}</p>
                        </div>

                        {/* 클럽 생성일 */}
                        <div className="club-created-at">
                            <p>생성일: {club.createAt?.split('T')[0]}</p>
                        </div>
                    </div>
                )}

                {/* 가입 신청 버튼 */}
                <div className="join-button-container">
                    <button 
                        className="main-btn join-btn"
                        onClick={handleJoinButtonClick}
                    >
                        가입 신청하기
                    </button>
                </div>
            </main>

            {/* 가입 신청 모달 */}
            {showJoinModal && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>가입 신청</h3>
                        <p className="modal-description">
                            {club?.name} 클럽에 가입 신청합니다.
                        </p>
                        <textarea
                            name="answer"
                            placeholder="가입 신청 답변을 작성해주세요. (자기소개, 가입 동기 등)"
                            value={joinData.answer}
                            onChange={handleInputChange}
                            required
                            rows="6"
                        />
                        <div className="modal-buttons">
                            <button type="button" className="btn-secondary form-btn" onClick={() => setShowJoinModal(false)}>취소</button>
                            <button type="button" className="main-btn form-btn" onClick={handleJoinRequest}>신청하기</button>
                        </div>
                    </div>
                </div>
            )}

            <TabBar />
        </div>
    );
} 
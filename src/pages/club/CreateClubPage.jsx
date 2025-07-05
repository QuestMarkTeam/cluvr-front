import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

const clubTypes = [
    { label: '스터디', value: 'STUDY' },
    { label: '프로젝트', value: 'PROJECT' },
    { label: '커뮤니티', value: 'COMMUNITY' }
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

const joinTypes = [
    { label: '문제 양식 제출', value: 'PROBLEM_FORM' },
    { label: '가입 신청서 제출', value: 'SUBMISSION_FORM' },
    { label: '바로 가입', value: 'DIRECT_JOIN' },
    { label: '단순 신청', value: 'SIMPLE_REQUEST' },
    { label: '초대코드', value: 'INVITE_CODE' }
];

export default function CreateClubPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        clubType: 'STUDY',
        categoryDetail: 'DEVELOPMENT',
        minCloverRequirement: 0,
        maxMemberCount: 5,
        greeting: '',
        description: '',
        posterUrl: '',
        isPublic: true,
        joinType: 'DIRECT_JOIN'
    });

    // 모달 상태
    const [showProblemModal, setShowProblemModal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    // 문제 양식 데이터
    const [problemFormData, setProblemFormData] = useState({
        problemTemplate: '',
        submissionInstructions: '',
        gradingCriteria: ''
    });

    // 가입 신청서 데이터
    const [submissionFormData, setSubmissionFormData] = useState({
        submissionForm: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProblemFormChange = (e) => {
        const { name, value } = e.target;
        setProblemFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmissionFormChange = (e) => {
        const { name, value } = e.target;
        setSubmissionFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleJoinTypeSelect = (joinType) => {
        setFormData(prev => ({ ...prev, joinType }));
        
        if (joinType === 'PROBLEM_FORM') {
            setShowProblemModal(true);
        } else if (joinType === 'SUBMISSION_FORM') {
            setShowSubmissionModal(true);
        } else if (joinType === 'INVITE_CODE') {
            setShowInviteCodeModal(true);
        }
    };

    const createProblemForm = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/problem-forms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(problemFormData)
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '문제 양식 생성에 실패했습니다.');
            }

            alert('문제 양식이 생성되었습니다!');
            setShowProblemModal(false);
        } catch (err) {
            console.error('문제 양식 생성 실패:', err);
            alert(err.message || '문제 양식 생성에 실패했습니다.');
        }
    };

    const createSubmissionForm = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/submission-forms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionFormData)
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '가입 신청서 생성에 실패했습니다.');
            }

            alert('가입 신청서가 생성되었습니다!');
            setShowSubmissionModal(false);
        } catch (err) {
            console.error('가입 신청서 생성 실패:', err);
            alert(err.message || '가입 신청서 생성에 실패했습니다.');
        }
    };

    const createInviteCode = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/invite-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.clear();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.result?.message || '초대코드 생성에 실패했습니다.');
            }

            const data = await res.json();
            setInviteCode(data.data?.inviteCode || '');
        } catch (err) {
            console.error('초대코드 생성 실패:', err);
            alert(err.message || '초대코드 생성에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 필수 필드 검증
        if (!formData.name || !formData.greeting || !formData.description || !formData.posterUrl) {
            alert('모든 필수 필드를 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    minCloverRequirement: parseInt(formData.minCloverRequirement),
                    maxMemberCount: parseInt(formData.maxMemberCount)
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

            alert('클럽이 성공적으로 생성되었습니다!');
            navigate('/club');
        } catch (err) {
            console.error('클럽 생성 실패:', err);
            alert(err.message || '클럽 생성에 실패했습니다.');
        }
    };

    return (
        <div className="create-club-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/club')}>&larr;</button>
                <h1 className="app-title">클럽 생성</h1>
                <span style={{ width: '2rem' }} />
            </header>

            {/* 클럽 생성 폼 */}
            <main className="main-content">
                <form className="create-club-form" onSubmit={handleSubmit}>
                    {/* 클럽 타입 선택 */}
                    <div className="form-section">
                        <h3>클럽 타입</h3>
                        <div className="board-type-tabs">
                            {clubTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`board-type-btn ${formData.clubType === type.value ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, clubType: type.value }))}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 카테고리 선택 */}
                    <div className="form-section">
                        <h3>카테고리</h3>
                        <select 
                            name="categoryDetail" 
                            value={formData.categoryDetail} 
                            onChange={handleInputChange}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 기본 정보 */}
                    <div className="form-section">
                        <h3>기본 정보</h3>
                        <input
                            name="name"
                            placeholder="클럽명 (2~20자)"
                            value={formData.name}
                            onChange={handleInputChange}
                            minLength="2"
                            maxLength="20"
                            required
                        />
                        <input
                            name="greeting"
                            placeholder="소개말 (2~100자)"
                            value={formData.greeting}
                            onChange={handleInputChange}
                            minLength="2"
                            maxLength="100"
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="설명 (2~255자)"
                            value={formData.description}
                            onChange={handleInputChange}
                            minLength="2"
                            maxLength="255"
                            required
                            rows="4"
                        />
                        <input
                            name="posterUrl"
                            placeholder="포스터 이미지 URL"
                            value={formData.posterUrl}
                            onChange={handleInputChange}
                            type="url"
                            required
                        />
                    </div>

                    {/* 설정 */}
                    <div className="form-section">
                        <h3>설정</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>클로버 제한</label>
                                <input
                                    name="minCloverRequirement"
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={formData.minCloverRequirement}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>최대 인원수</label>
                                <input
                                    name="maxMemberCount"
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={formData.maxMemberCount}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        
                        {/* 가입 방식 버튼 */}
                        <div className="form-section">
                            <h3>가입 방식</h3>
                            <div className="join-type-buttons">
                                {joinTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`join-type-btn ${formData.joinType === type.value ? 'active' : ''}`}
                                        onClick={() => handleJoinTypeSelect(type.value)}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <label>
                                <input
                                    name="isPublic"
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={handleInputChange}
                                />
                                공개 클럽
                            </label>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary form-btn" onClick={() => navigate('/club')}>
                            취소
                        </button>
                        <button type="submit" className="main-btn form-btn">
                            클럽 생성
                        </button>
                    </div>
                </form>
            </main>

            {/* 문제 양식 모달 */}
            {showProblemModal && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>문제 양식 생성</h3>
                        <textarea
                            name="problemTemplate"
                            placeholder="문제 양식을 작성해주세요."
                            value={problemFormData.problemTemplate}
                            onChange={handleProblemFormChange}
                            required
                            rows="4"
                        />
                        <textarea
                            name="submissionInstructions"
                            placeholder="문제 설명을 작성해주세요."
                            value={problemFormData.submissionInstructions}
                            onChange={handleProblemFormChange}
                            required
                            rows="3"
                        />
                        <input
                            name="gradingCriteria"
                            placeholder="체점 방식 (2~100자)"
                            value={problemFormData.gradingCriteria}
                            onChange={handleProblemFormChange}
                            minLength="2"
                            maxLength="100"
                            required
                        />
                        <div className="modal-buttons">
                            <button type="button" className="btn-secondary form-btn" onClick={() => setShowProblemModal(false)}>취소</button>
                            <button type="button" className="main-btn form-btn" onClick={createProblemForm}>생성</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 가입 신청서 모달 */}
            {showSubmissionModal && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>가입 신청서 생성</h3>
                        <textarea
                            name="submissionForm"
                            placeholder="가입 양식을 작성해주세요."
                            value={submissionFormData.submissionForm}
                            onChange={handleSubmissionFormChange}
                            required
                            rows="6"
                        />
                        <div className="modal-buttons">
                            <button type="button" className="btn-secondary form-btn" onClick={() => setShowSubmissionModal(false)}>취소</button>
                            <button type="button" className="main-btn form-btn" onClick={createSubmissionForm}>생성</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 초대코드 모달 */}
            {showInviteCodeModal && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>초대코드 생성</h3>
                        {inviteCode ? (
                            <div className="invite-code-result">
                                <p>생성된 초대코드:</p>
                                <div className="invite-code-display">{inviteCode}</div>
                            </div>
                        ) : (
                            <p>초대코드를 생성하시겠습니까?</p>
                        )}
                        <div className="modal-buttons">
                            {!inviteCode ? (
                                <button type="button" className="main-btn form-btn" onClick={createInviteCode}>생성</button>
                            ) : (
                                <button type="button" className="main-btn form-btn" onClick={() => {
                                    setShowInviteCodeModal(false);
                                    setInviteCode('');
                                }}>확인</button>
                            )}
                            <button type="button" className="btn-secondary form-btn" onClick={() => {
                                setShowInviteCodeModal(false);
                                setInviteCode('');
                            }}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            <TabBar />
        </div>
    );
} 
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;


export default function SignupPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        birthday: '',
        email: '',
        phoneNumber: '',
        gender: '',
        categoryType: '',
        password: '',
        confirmPassword: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [error, setError] = useState('');
    const [isVerifyStep, setIsVerifyStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setProfileImage(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        } else {
            setProfileImage(null);
            setImagePreview('');
        }
    };

    const showError = (msg) => {
        setError(msg);
    };

    const uploadImageToS3 = async (file) => {
        const fileName = encodeURIComponent(file.name);
        const res = await fetch(`${API_DOMAIN_URL}/api/image?fileName=${fileName}`);
        const { uploadUrl, fileUrl } = await res.json();
        console.log(uploadUrl);
        console.log(fileUrl);
        await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });

        return fileUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const { name, birthday, email, phoneNumber, gender, categoryType, password, confirmPassword } = form;

        if (password !== confirmPassword) {
            showError('비밀번호가 일치하지 않습니다.');
            return;
        }

        const birthdayDate = new Date(birthday);
        const today = new Date();
        if (birthdayDate >= today) {
            showError('생년월일은 과거 날짜여야 합니다.');
            return;
        }

        const phoneRegex = /^\d{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            showError('전화번호는 10-11자리 숫자여야 합니다.');
            return;
        }

        let imageUrl = null;
        if (profileImage) {
            try {
                imageUrl = await uploadImageToS3(profileImage);
            } catch (uploadError) {
                showError('이미지 업로드에 실패했습니다.');
                return;
            }
        }

        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    birthday,
                    email,
                    phoneNumber,
                    gender,
                    categoryType,
                    imageUrl,
                    password,
                    confirmPassword,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = '회원가입에 실패했습니다.';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.result?.message || errorMessage;
                } catch (e) {
                    if (response.status === 403) errorMessage = '접근이 거부되었습니다. (403)';
                    else if (response.status === 500) errorMessage = '서버 오류가 발생했습니다. (500)';
                    else errorMessage = `오류가 발생했습니다. (${response.status})`;
                }
                showError(errorMessage);
                return;
            }

            // 인증코드 입력 단계로 전환
            setIsVerifyStep(true);
            alert('이메일로 인증코드를 보냈습니다. 인증코드를 입력해 주세요!');
        } catch (err) {
            console.error('회원가입 오류:', err);
            showError('서버 연결에 실패했습니다.');
        }
    };

    // 인증코드 검증
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    code: verificationCode,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = '인증에 실패했습니다.';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.result?.message || errorMessage;
                } catch (e) {
                    errorMessage = `오류가 발생했습니다. (${response.status})`;
                }
                showError(errorMessage);
                return;
            }

            alert('이메일 인증이 완료되었습니다! 로그인 해주세요.');
            navigate('/login');
        } catch (err) {
            showError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!isVerifyStep ? (
                <form className="signup-card" onSubmit={handleSubmit}>
                    <div className="signup-title">Sign Up</div>

                    <input
                        name="name"
                        type="text"
                        className="signup-input"
                        placeholder="이름 (최대 10자)"
                        maxLength="10"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="birthday"
                        type="date"
                        className="signup-input"
                        value={form.birthday}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        type="email"
                        className="signup-input"
                        placeholder="이메일"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="phoneNumber"
                        type="tel"
                        className="signup-input"
                        placeholder="전화번호 (10-11자리)"
                        pattern="[0-9]{10,11}"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="gender"
                        className="signup-select"
                        value={form.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">성별 선택</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                        <option value="OTHER">기타</option>
                    </select>

                    <select
                        name="categoryType"
                        className="signup-select"
                        value={form.categoryType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">카테고리 선택</option>
                        <option value="DEVELOPMENT">개발</option>
                        <option value="ALGORITHMS_CODING_TESTS">알고리즘</option>
                        <option value="INTERVIEW_PREPARATION">면접</option>
                        <option value="CERTIFICATIONS_EXAMS">자격증</option>
                        <option value="DESIGN">디자인</option>
                        <option value="LANGUAGE_LEARNING">언어</option>
                        <option value="AI_DATA_SCIENCE">AI/데이터</option>
                        <option value="EXTRACURRICULAR_COMPETITIONS">대외활동</option>
                        <option value="MUSIC_EDUCATION">음악</option>
                        <option value="OTHERS">기타</option>
                    </select>

                    <input
                        name="password"
                        type="password"
                        className="signup-input"
                        placeholder="비밀번호 (8-20자)"
                        minLength="8"
                        maxLength="20"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        className="signup-input"
                        placeholder="비밀번호 확인"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <div className="image-upload" style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6 }}>프로필 이미지 선택:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <label htmlFor="profile-image-upload" className="image-upload-label" style={{
                                background: '#f5f5f5',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}>
                                이미지 업로드
                                <input
                                    type="file"
                                    id="profile-image-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </label>
                            {imagePreview ? (
                                <img src={imagePreview} alt="미리보기" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                            ) : (
                                <span style={{ color: '#aaa', fontSize: 14 }}>이미지를 선택하세요</span>
                            )}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="signup-btn">회원가입</button>

                    <div style={{ marginTop: '8px' }}>
                        <Link to="/login" className="signup-link">로그인으로 돌아가기</Link>
                    </div>
                </form>
            ) : (
                <form className="signup-card" onSubmit={handleVerify}>
                    <div className="signup-title">이메일 인증</div>
                    <div style={{ marginBottom: 16 }}>
                        이메일로 전송된 인증코드를 입력해 주세요.
                    </div>
                    <input
                        type="text"
                        className="signup-input"
                        placeholder="인증코드"
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        required
                    />
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="signup-btn">인증하기</button>
                </form>
            )}
        </main>
    );
}

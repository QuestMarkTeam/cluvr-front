import React, { useState, useEffect } from 'react';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL;
const token = localStorage.getItem("accessToken");

const CreateRoom = () => {
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('MEMBER');
    const [imageUrl, setImageUrl] = useState('');
    const [notification, setNotification] = useState('');
    const [notificationType, setNotificationType] = useState('');
    const [clubId, setClubId] = useState('');


    // 에러 처리 함수
    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            showNotification('인증이 만료되었습니다. 다시 로그인해주세요.', 'error');

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else if (error.response?.status === 403) {
            showNotification('접근 권한이 없습니다.', 'error');
        } else if (error.response?.status === 404) {
            showNotification('요청한 리소스를 찾을 수 없습니다.', 'error');
        } else if (error.response?.status >= 500) {
            showNotification('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } else {
            showNotification(defaultMessage, 'error');
        }
    };

    // 알림 표시 함수
    const showNotification = (message, type) => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
            setNotification('');
        }, 3000);
    };

    // 페이지 로드 시 초기화
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');

        if (!clubId || !token) {
            showNotification('필수 정보가 누락되었습니다.', 'error');
            return;
        }

        setClubId(clubId);
    }, []);

    // 채팅방 생성 함수
    const createChatRoom = async (e) => {
        e.preventDefault();

        if (!roomName) {
            showNotification('채팅방 이름을 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    imageUrl: imageUrl || '',
                    type: roomType,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (response.ok) {
                showNotification('채팅방이 성공적으로 생성되었습니다!', 'success');
                setTimeout(() => {
                    window.location.href = `/chatroomlist?clubId=${clubId}&token=${encodeURIComponent(token)}`;
                }, 1500);
            } else {
                showNotification(result.message || '채팅방 생성에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('채팅방 생성 오류:', error);
            handleApiError(error, '채팅방 생성에 실패했습니다.');
        }
    };

    // 뒤로가기 함수
    const goBack = () => {
        window.location.href = `/chatroomlist?clubId=${clubId}&token=${encodeURIComponent(token)}`;
    };

    return (
        <div className="create-room-container">
            <div className="header">
                <h1>🍀 새 채팅방 만들기</h1>
                <p>클럽 멤버들과 소통할 새로운 공간을 만들어보세요</p>
            </div>

            {notification && (
                <div className={`notification ${notificationType}`}>
                    {notification}
                </div>
            )}

            <form onSubmit={createChatRoom}>
                <div className="form-group">
                    <label htmlFor="roomName">채팅방 이름 *</label>
                    <input
                        type="text"
                        id="roomName"
                        name="roomName"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                        placeholder="예: 프로젝트 회의실, 일상 대화방"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="roomType">채팅방 타입 *</label>
                    <select
                        id="roomType"
                        name="roomType"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        required
                    >
                        <option value="MEMBER">일반 멤버용</option>
                        <option value="MANAGER">관리자용</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">채팅방 이미지 URL (선택사항)</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="button-group">
                    <button type="button" className="btn btn-secondary" onClick={goBack}>취소</button>
                    <button type="submit" className="btn btn-primary">채팅방 생성</button>
                </div>
            </form>
        </div>
    );
};

export default CreateRoom;

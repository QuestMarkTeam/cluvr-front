import React, { useEffect, useState } from 'react';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL;
const token = localStorage.getItem("accessToken");

function getClubId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('clubId');
}

const ChatRoomList = () => {
    const [clubName, setClubName] = useState('');
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateRoomButton, setShowCreateRoomButton] = useState(false);

    const clubId = getClubId();

    // 에러 처리 함수
    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            alert('인증이 만료되었습니다. 다시 로그인해주세요.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else if (error.response?.status === 403) {
            alert('접근 권한이 없습니다.');
        } else if (error.response?.status === 404) {
            alert('요청한 리소스를 찾을 수 없습니다.');
        } else if (error.response?.status >= 500) {
            alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            alert(defaultMessage);
        }
    };

    // 페이지 로드 시 API 호출 및 상태 초기화
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');

        if (!clubId || !token) {
            alert('잘못된 접근입니다.');
            return;
        }

        const fetchChatRooms = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/list`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                console.log('채팅방 리스트 API 응답 data:', data); // 전체 응답 로그

                // 클럽명 표시
                const clubName = data.data?.clubName || '클럽명 없음';
                setClubName(clubName);

                // 채팅방 목록 표시
                const rooms = data.data?.chatRooms || [];
                setChatRooms(rooms);

                // 채팅방 생성 버튼 노출 조건
                const userRole = data.data?.role || '';
                console.log('userRole:', userRole);
                setShowCreateRoomButton(userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'OWNER');

                setLoading(false);
            } catch (error) {
                console.error('채팅방 목록 조회 실패:', error);
                handleApiError(error, '채팅방 목록을 불러올 수 없습니다.');
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    const goToChat = (roomId, clubName) => {
        console.log('clubId:', clubId);
        const roomName = chatRooms.find(room => room.id === roomId)?.name || '';
        window.location.href = `/chat?clubId=${clubId}&roomId=${roomId}&clubName=${clubName}&roomName=${encodeURIComponent(roomName)}`;
    };

    const goToCreateRoom = () => {
        window.location.href = `/crateroom?clubId=${clubId}`;
    };

    return (
        <div className="container">
            {loading && <div id="loading" style={{ textAlign: 'center', color: '#888', margin: '40px 0' }}>로딩 중...</div>}

            {!loading && (
                <>
                    <h2 id="clubNameH2" style={{ display: clubName ? 'block' : 'none' }}>
                        {clubName}
                    </h2>

                    <div id="chatRoomListTitle" style={{ fontSize: '1.1em', color: '#388e3c', marginBottom: '10px', display: chatRooms.length > 0 ? 'block' : 'none' }}>
                        채팅방 리스트
                    </div>

                    <div id="chatRoomList" style={{ display: chatRooms.length > 0 ? 'block' : 'none' }}>
                        {chatRooms.map(room => (
                            <div
                                key={room.id}
                                className="chat-room-item"
                                style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #eee' }}
                                onClick={() => goToChat(room.id, clubName)}
                            >
                                {room.name}
                            </div>
                        ))}
                        {chatRooms.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#888' }}>
                                채팅방이 없습니다.
                            </div>
                        )}
                    </div>

                    {showCreateRoomButton && (
                        <div id="createRoomSection" style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button onClick={goToCreateRoom}>➕ 새 채팅방 만들기</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatRoomList;

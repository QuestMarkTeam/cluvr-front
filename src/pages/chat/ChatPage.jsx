import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_DOMAIN_URL = 'http://44.239.99.137:80';
const API_CHAT_URL = 'http://54.200.146.243';

function ChatPage() {
    const [clubId, setClubId] = useState(1);
    const [userId, setUserId] = useState(1);
    const [token, setToken] = useState('');
    const [chatRooms, setChatRooms] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentRoomName, setCurrentRoomName] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 클럽 정보 및 채팅방 목록을 불러오기
        fetchChatRooms();
    }, []);

    // 채팅방 목록 불러오기
    const fetchChatRooms = async () => {
        try {
            const response = await fetch(`${API_CHAT_URL}/chat/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ clubId, userId }),
            });
            const data = await response.json();
            if (data.data) {
                setChatRooms(data.data.chatRooms || []);
                updateClubInfo(data.data.clubName);
            }
        } catch (error) {
            console.error('채팅방 목록 불러오기 실패: ', error);
        }
    };

    // 클럽 정보 업데이트
    const updateClubInfo = (clubName) => {
        setCurrentRoomName(clubName);
    };

    // 채팅방 입장
    const joinChatRoom = async (roomId, roomName) => {
        setCurrentRoomId(roomId);
        setCurrentRoomName(roomName);
        const response = await fetch(`${API_CHAT_URL}/chat/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ clubId, userId, roomId }),
        });
        if (response.ok) {
            fetchMessages(roomId);
        }
    };

    // 메시지 불러오기
    const fetchMessages = async (roomId) => {
        const response = await fetch(`${API_CHAT_URL}/chat/${roomId}`);
        const data = await response.json();
        setMessages(data.data || []);
    };

    // 메시지 전송
    const sendMessage = async () => {
        if (message.trim() && currentRoomId) {
            const payload = {
                roomId: currentRoomId,
                userId: parseInt(userId),
                message: message,
                type: 'TALK',
            };

            await fetch(`${API_CHAT_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            setMessages([...messages, { message, userId }]);
            setMessage('');
        }
    };

    return (
        <div className="container">
            <h2>💬 Cluvr Chat</h2>

            {/* 클럽 정보 */}
            <div id="clubInfo" className="club-info" style={{ display: currentRoomName ? 'block' : 'none' }}>
                <span id="clubName">🏛️ {currentRoomName}</span>
            </div>

            {/* 사용자 정보 입력 */}
            <div className="input-section">
                <div className="input-group">
                    <label>Club ID:</label>
                    <input type="number" value={clubId} onChange={(e) => setClubId(e.target.value)} />
                    <label>내 ID:</label>
                    <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
                    <label>token:</label>
                    <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="여기에 토큰을 입력하세요" />
                    <button onClick={fetchChatRooms}>📜 채팅방 불러오기</button>
                </div>
            </div>

            {/* 채팅방 목록 */}
            <div id="chatRoomList" className="chat-rooms-section">
                {chatRooms.length > 0 ? (
                    <>
                        <h3>📦 채팅방 리스트</h3>
                        <div className="room-list">
                            {chatRooms.map((room) => (
                                <button
                                    key={room.id}
                                    className={`room-btn ${currentRoomId === room.id ? 'active' : ''}`}
                                    onClick={() => joinChatRoom(room.id, room.name)}
                                >
                                    {room.name} ({room.type})
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>채팅방 목록이 없습니다.</p>
                )}
            </div>

            {/* 채팅방 영역 */}
            <hr className="divider" />
            <div className="chat-layout">
                <div className="chat-container">
                    <div className="chat-header">
                        💬 채팅 - <span id="currentRoomName">{currentRoomName || '채팅방을 선택해주세요'}</span>
                    </div>
                    <div id="chatBox">
                        {messages.map((msg, index) => (
                            <div className={`chat ${parseInt(msg.userId) === parseInt(userId) ? 'me' : 'other'}`} key={index}>
                                <div className="message-bubble">
                                    <strong>{msg.nickname || '익명'}</strong>
                                    <br />
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="message-input-container">
                        <input
                            type="text"
                            id="messageInput"
                            placeholder="메시지를 입력하세요"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={!currentRoomId}
                        />
                        <button className="send-btn" onClick={sendMessage} disabled={!currentRoomId || !message.trim()}>
                            📤
                        </button>
                    </div>
                </div>

                {/* 멤버 리스트 패널 */}
                <div className="members-panel">
                    <div className="members-header">
                        👥 채팅 멤버 (<span id="memberCount">{chatRooms.length}</span>)
                    </div>
                    <div className="members-list" id="membersList">
                        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                            채팅방을 선택하면<br />멤버 목록이 표시됩니다
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;

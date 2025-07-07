import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/chat.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { jwtDecode } from "jwt-decode";

const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL;
const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const token = localStorage.getItem("accessToken");

function getClubId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('clubId');
}

// JWT에서 userId 추출 함수
async function getMyUserIdFromJWT(token) {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        console.log('JWT 디코드 결과:', decoded);
        const sub = decoded.sub || null;
        
        if (!sub) return null;
        
        // sub를 실제 사용자 ID로 변환하는 API 호출
        const response = await fetch(`${API_DOMAIN_URL}/api/users/sub/${sub}/user-id`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            localStorage.clear();
            return null;
        }
        
        if (!response.ok) {
            console.error('사용자 ID 조회 실패:', response.status);
            return null;
        }
        
        const data = await response.json();
        const userId = data.data;
        console.log('실제 사용자 ID:', userId);
        return userId;
    } catch (e) {
        console.error('JWT 디코드 또는 사용자 ID 조회 실패:', e);
        return null;
    }
}

// 메시지 렌더링 컴포넌트
const MessageComponent = ({ message, isMyMessage }) => {
    if (message.type === "ENTER" || message.type === "LEAVE") {
        return (
            <div className="chat system">
                <div className="system-message">{message.message}</div>
            </div>
        );
    }
    return (
        <div className={isMyMessage ? "chat me" : "chat other"}>
            <div className="message-content">
                <div className="message-bubble">
                    <div className="message-nickname">{message.nickname || '익명'}</div>
                    <div className="message-text">{message.message}</div>
                </div>
                <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Seoul'
                    })}
                </div>
            </div>
        </div>
    );
};

const Chat = () => {
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [roomName, setRoomName] = useState('채팅방을 선택해주세요');
    const [clubName, setClubName] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [myUserId, setMyUserId] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('연결 중...');


    // 소켓/구독/roomId 등은 useRef로 관리
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const socketRef = useRef(null);
    const currentRoomIdRef = useRef(null);
    const lastDisplayedDateRef = useRef(null);

    const clubId = getClubId();

    // 채팅방 입장
    const joinChatRoom = useCallback((roomId) => {
        return fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).catch(error => {
            console.error('채팅방 입장에 실패했습니다.', error);
        });
    }, [clubId]);

    // 멤버 목록 조회
    const fetchRoomMembers = useCallback((roomId) => {
        fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.clear();
                    return;
                }
                
                if (!response.ok) {
                    throw new Error('멤버 목록을 불러오지 못했습니다.');
                }
                
                return response.json();
            })
            .then(data => {
                if (data) {
                    setMembers(data.data || []);
                }
            })
            .catch(error => {
                console.error('멤버 목록 조회 실패:', error);
            });
    }, [clubId]);

    // 메시지 렌더링 함수 (useCallback으로 메모이제이션)
    const renderMessage = useCallback((message) => {
        console.log('renderMessage 호출', message);
        const chatBox = document.getElementById("chatBox");
        if (!message.createdAt) {
            message.createdAt = new Date().toISOString();
        }
        const messageDate = new Date(message.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDateStr = messageDate.toDateString();
        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();
        let dateLabel;
        if (messageDateStr === todayStr) {
            dateLabel = "Today";
        } else if (messageDateStr === yesterdayStr) {
            dateLabel = "Yesterday";
        } else {
            dateLabel = messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        if (lastDisplayedDateRef.current !== messageDateStr) {
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<span class="date-text">${dateLabel}</span>`;
            chatBox.appendChild(dateDiv);
            lastDisplayedDateRef.current = messageDateStr;
        }
        const msgDiv = document.createElement("div");
        if (message.type === "ENTER" || message.type === "LEAVE") {
            msgDiv.className = "chat system";
            msgDiv.innerHTML = `<div class="system-message">${escapeHtml(message.message)}</div>`;
        } else {
            msgDiv.className = "chat other";
            const contentDiv = document.createElement("div");
            contentDiv.className = "message-content";
            const bubble = document.createElement("div");
            bubble.className = "message-bubble";
            bubble.innerHTML = `<strong>${escapeHtml(message.nickname || '익명')}</strong><br>${escapeHtml(message.message)}`;
            const timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            const messageTime = new Date(message.createdAt);
            timeDiv.textContent = messageTime.toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Seoul'
            });
            contentDiv.appendChild(bubble);
            contentDiv.appendChild(timeDiv);
            msgDiv.appendChild(contentDiv);
        }
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, []);

    // 소켓 연결 및 구독 (roomId 변경 시만 재연결)
    const connectSocketAndSubscribe = useCallback((roomId) => {
        // 이미 같은 방에 연결되어 있으면 재연결하지 않음
        if (currentRoomIdRef.current === roomId && stompClientRef.current?.connected && subscriptionRef.current) {
            console.log('[WebSocket] 이미 같은 방에 연결되어 있음:', roomId);
            return;
        }
        
        console.log('[WebSocket] 연결 시작 - roomId:', roomId);
        
        // 기존 연결 해제
        if (subscriptionRef.current) {
            console.log('[WebSocket] 기존 구독 해제');
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }
        if (stompClientRef.current && stompClientRef.current.connected) {
            console.log('[WebSocket] 기존 STOMP 연결 해제');
            stompClientRef.current.disconnect();
        }
        if (socketRef.current) {
            console.log('[WebSocket] 기존 소켓 연결 해제');
            socketRef.current.close();
        }
        
        currentRoomIdRef.current = roomId;
        
        // 소켓 연결
        if (!token) {
            console.warn('[WebSocket] 토큰이 없습니다!');
            return;
        }
        
        console.log('[WebSocket] 새로운 소켓 연결 시도');
        socketRef.current = new SockJS(`${API_CHAT_URL}/ws/chat?token=${encodeURIComponent(token)}`, null, {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
            timeout: 5000,
            heartbeat: 25000
        });
        socketRef.current.onopen = () => {
            console.log('[WebSocket] 소켓 연결 open!');
            setConnectionStatus('연결됨');
        };
        socketRef.current.onclose = (event) => {
            console.warn('[WebSocket] 소켓 연결 close!', event);
            setConnectionStatus('연결 끊김');
        };
        socketRef.current.onerror = (event) => {
            console.error('[WebSocket] 소켓 에러!', event);
            setConnectionStatus('연결 실패');
        };
        
        stompClientRef.current = Stomp.over(socketRef.current);
        stompClientRef.current.connect({
            heartbeat: {
                outgoing: 10000,
                incoming: 10000
            }
        }, () => {
            console.log('[WebSocket] STOMP 연결 성공, 채팅방 입장 시도');
            joinChatRoom(roomId).then(() => {
                console.log('[WebSocket] 채팅방 입장 성공, 구독 시작');
                subscriptionRef.current = stompClientRef.current.subscribe(
                    `/sub/ws/chat/rooms/${roomId}`,
                    (msg) => {
                        console.log('수신 메시지~~~~~~:', msg);
                        const msgObj = JSON.parse(msg.body);
                        setMessages(prev => {
                            // 중복 메시지 방지 (messageId로 체크)
                            const isDuplicate = prev.some(existingMsg => 
                                existingMsg.messageId === msgObj.messageId
                            );
                            if (isDuplicate) {
                                console.log('중복 메시지 무시:', msgObj.messageId);
                                return prev;
                            }
                            
                            // ENTER/LEAVE 메시지일 때 멤버 목록 갱신
                            if (msgObj.type === 'ENTER' || msgObj.type === 'LEAVE') {
                                console.log('멤버 입장/퇴장 감지, 멤버 목록 갱신');
                                setTimeout(() => fetchRoomMembers(roomId), 500); // 약간의 딜레이 후 갱신
                            }
                            
                            return [...prev, msgObj];
                        });
                    }
                );
                console.log('[WebSocket] 구독 완료 - subscriptionId:', subscriptionRef.current?.id);
            });
            fetchRoomMembers(roomId);
        }, (error) => {
            console.error('[WebSocket] STOMP 연결 실패:', error);
            setConnectionStatus('연결 실패');
            
            // 3초 후 재연결 시도
            setTimeout(() => {
                if (currentRoomIdRef.current === roomId) {
                    console.log('[WebSocket] 재연결 시도...');
                    setConnectionStatus('재연결 중...');
                    connectSocketAndSubscribe(roomId);
                }
            }, 3000);
        });
    }, [fetchRoomMembers, joinChatRoom]);

    // 언마운트 시 소켓/구독 해제
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
            if (stompClientRef.current && stompClientRef.current.connected) stompClientRef.current.disconnect();
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    // 쿼리스트링에서 roomId, roomName, clubName 읽어서 연결
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId');
        const roomName = params.get('roomName');
        const clubNameFromQuery = params.get('clubName');
        
        if (clubNameFromQuery) setClubName(decodeURIComponent(clubNameFromQuery));
        if (roomId && roomName) {
            setRoomId(roomId); // roomId 상태 설정 추가
            setRoomName(decodeURIComponent(roomName)); // roomName 상태 설정 추가
            
            // 1. 방 멤버 목록 조회
            fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => {
                if (res.status === 401) {
                    localStorage.clear();
                    return;
                }
                
                if (!res.ok) {
                    throw new Error('멤버 목록을 불러오지 못했습니다.');
                }
                
                return res.json();
            })
            .then(async (data) => {
                if (data) {
                    const members = data.data || [];
                    const myUserId = await getMyUserIdFromJWT(token);
                    const alreadyJoined = members.some(m => String(m.userId) === String(myUserId));
                    if (!alreadyJoined) {
                        // 2. 아직 입장 안 했으면 조인 API 호출 → 성공 후 소켓 연결 (딜레이 추가)
                        joinChatRoom(roomId).then(() => {
                            setTimeout(() => connectSocketAndSubscribe(roomId), 200);
                        });
                    } else {
                        // 3. 이미 입장했으면 바로 소켓 연결
                        connectSocketAndSubscribe(roomId);
                    }
                }
            })
            .catch(error => {
                console.error('채팅방 초기화 실패:', error);
            });
        }
    }, []); // 의존성 배열을 빈 배열로 변경하여 한 번만 실행되도록 함

    // ESC 키로 오버레이 닫기
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') setIsOverlayVisible(false);
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, []);

    // 메시지 전송
    const sendMessage = () => {
        console.log('sendMessage 호출', { message, connected: stompClientRef.current?.connected });
        if (!message || !currentRoomIdRef.current || !stompClientRef.current || !stompClientRef.current.connected) {
            console.log("❌ 메시지 전송 실패:", { message, currentRoomId: currentRoomIdRef.current, connected: stompClientRef.current?.connected });
            return;
        }
        const messageData = {
            roomId: currentRoomIdRef.current,
            message: message,
            type: "TALK",
            createdAt: new Date().toISOString()
        };
        console.log("전송할 메시지:", messageData);
        stompClientRef.current.send("/app/message", {}, JSON.stringify(messageData));
        setMessage('');
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const goBackToMyClubs = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');
        window.location.href = `/chatroomlist?clubId=${clubId}`;
    };

    const toggleOverlay = () => {
        setIsOverlayVisible(prevState => {
            const newState = !prevState;
            console.log('멤버 오버레이 토글:', newState);
            
            // 오버레이를 열 때마다 멤버 목록 갱신
            if (newState && currentRoomIdRef.current) {
                fetchRoomMembers(currentRoomIdRef.current);
            }
            
            return newState;
        });
    };

    // JWT에서 내 userId 추출
    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const userId = await getMyUserIdFromJWT(token);
                    setMyUserId(userId);
                } catch (e) {
                    console.error('사용자 ID 추출 실패:', e);
                    setMyUserId(null);
                }
            }
        };
        
        fetchUserId();
    }, []);

    // 채팅방 입장 시 이전 대화내역 불러오기 (입장 시점부터)
    useEffect(() => {
        if (!roomId || !myUserId) return;
        console.log('🥕🥕🥕 이전 대화내역 불러오기 실행~~~~~~~~~~');
        
        // 먼저 사용자의 입장 시간을 조회
        fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            
            if (!res.ok) {
                throw new Error('멤버 정보를 불러오지 못했습니다.');
            }
            
            return res.json();
        })
        .then(data => {
            if (data) {
                const members = data.data || [];
                const myMemberInfo = members.find(m => String(m.userId) === String(myUserId));
                
                if (myMemberInfo && myMemberInfo.joinedAt) {
                    // 입장 시간 이후의 메시지만 조회
                    const joinTime = new Date(myMemberInfo.joinedAt).toISOString();
                    console.log('내 입장 시간:', joinTime);
                    
                    // 백엔드에서 입장 시간 이후 메시지 조회 API 호출
                    fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}?from=${joinTime}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    .then(res => {
                        if (res.status === 401) {
                            localStorage.clear();
                            return;
                        }
                        
                        if (!res.ok) {
                            throw new Error('메시지를 불러오지 못했습니다.');
                        }
                        
                        return res.json();
                    })
                    .then(data => {
                        if (data && data.data && Array.isArray(data.data)) {
                            setMessages(data.data);
                        }
                    })
                    .catch(error => {
                        console.error('메시지 조회 실패:', error);
                    });
                } else {
                    // 입장 시간 정보가 없으면 모든 메시지 조회
                    fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    .then(res => {
                        if (res.status === 401) {
                            localStorage.clear();
                            return;
                        }
                        
                        if (!res.ok) {
                            throw new Error('메시지를 불러오지 못했습니다.');
                        }
                        
                        return res.json();
                    })
                    .then(data => {
                        if (data && data.data && Array.isArray(data.data)) {
                            setMessages(data.data);
                        }
                    })
                    .catch(error => {
                        console.error('메시지 조회 실패:', error);
                    });
                }
            }
        })
        .catch(error => {
            console.error('멤버 정보 조회 실패:', error);
        });
    }, [clubId, roomId, myUserId]);

    // 메시지 수신 시 messages state에 추가
    const onMessageReceived = useCallback((msg) => {
        const msgObj = JSON.parse(msg.body);
        setMessages(prev => {
            // 중복 메시지 방지 (messageId로 체크)
            const isDuplicate = prev.some(existingMsg => 
                existingMsg.messageId === msgObj.messageId
            );
            if (isDuplicate) {
                console.log('중복 메시지 무시:', msgObj.messageId);
                return prev;
            }
            return [...prev, msgObj];
        });
    }, []);

    return (
        <div>
            <div className="backtotheclublist">
                <button onClick={goBackToMyClubs}> ← </button>
            </div>
            <div className="container">
                <h2 id="clubNameHeader">{clubName}</h2>
            </div>
            <div className="chat-layout">
                <div className="chat-container">
                    <div className="chat-header">
                        💬  <span id="currentRoomName">{roomName}</span>
                        <span className={`connection-status ${stompClientRef.current?.connected ? 'connected' : 'disconnected'}`}></span>
                        <button id="openMembersBtn" title="채팅 멤버 보기" onClick={toggleOverlay}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C17.16 14.1 19 15.03 19 16.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </button>
                    </div>
                    <div id="chatBox">
                        {messages.map((msg, idx) => {
                            const isMyMessage = String(msg.userId) === String(myUserId);
                            return (
                                <MessageComponent 
                                    key={msg.messageId || `msg-${idx}`} 
                                    message={msg} 
                                    isMyMessage={isMyMessage}
                                />
                            );
                        })}
                    </div>
                    <div className="message-input-container">
                        <input
                            type="text"
                            id="messageInput"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={connectionStatus === '연결됨' ? "메시지를 입력하세요" : "연결 중..."}
                            disabled={!stompClientRef.current?.connected}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') sendMessage();
                            }}
                        />
                        <button
                            className="send-btn"
                            id="sendBtn"
                            onClick={sendMessage}
                            disabled={!stompClientRef.current?.connected}
                        >
                            📤
                        </button>
                    </div>
                    {/* 멤버 오버레이 */}
                    <div
                        id="membersOverlay"
                        className={isOverlayVisible ? "show" : ""}
                    >
                        <div className="members-header">
                            <span>👥 Member (<span id="memberCount">{members.length}</span>)</span>
                            <button id="closeMembersBtn" title="닫기" onClick={toggleOverlay}>✕</button>
                        </div>
                        <hr className="divider" />
                        <div className="members-list">
                            {members.map(member => (
                                <div className="member-item" key={member.userId}>
                                    <div className="member-avatar">{member.nickname.charAt(0).toUpperCase()}</div>
                                    <div className="member-info">
                                        <div className="member-name">{member.nickname || '익명'}</div>
                                        <div className="member-role">
                                            <span className={`role-badge role-${member.clubRole.toLowerCase()}`}>{member.clubRole}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;

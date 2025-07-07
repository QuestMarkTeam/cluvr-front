import React, { useEffect, useState } from "react";

const API_NOTIFICATION_URL = import.meta.env.VITE_API_NOTIFICATION_URL;
const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;


const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    fetchNotifications();
    connectSSE();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_NOTIFICATION_URL}/notifications`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        alert("알림을 불러오는데 실패했습니다.");
        return;
      }

      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("알림을 불러오는데 실패했습니다.");
    }
  };

  const markAsRead = async (notiId) => {
    try {
      await fetch(`${API_NOTIFICATION_URL}/notifications/${notiId}/read`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleNotificationClick = async (noti) => {
    if (!noti.isRead) {
      await markAsRead(noti.id);
      setNotifications((prev) =>
          prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      );
    }

    if (noti.targetType === "BOARD") {
      window.location.href = `/boards/${noti.targetId}`;
    }
  };

  const connectSSE = () => {
    try {
      // API_NOTIFICATION_URL 사용하고 토큰을 파라미터로 전달
      const sse = new EventSource(`${API_NOTIFICATION_URL}/notifications/stream/connect?token=${token}`);

      sse.onopen = () => {
        console.log("SSE 연결 성공!");
      };

      sse.onmessage = (e) => {
        try {
          const newNoti = JSON.parse(e.data);
          setNotifications((prev) => [newNoti, ...prev]);
        } catch (error) {
          console.error("SSE 메시지 파싱 오류:", error);
        }
      };

      sse.onerror = (error) => {
        console.warn("SSE 오류 발생:", error);
        console.warn("SSE 재연결 시도 중...");
        sse.close();
        setTimeout(connectSSE, 5000);
      };

      // 컴포넌트 언마운트 시 연결 정리
      return () => {
        sse.close();
      };
    } catch (error) {
      console.error("SSE 연결 오류:", error);
      setTimeout(connectSSE, 5000);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  return (
      <div>
        <h1>🔔 내 알림</h1>
        <button onClick={logout}>로그아웃</button>
        <div id="notifications">
          {notifications.length > 0 ? (
              notifications.map((noti) => (
                  <div
                      key={noti.id}
                      className={`notification${noti.isRead ? "" : " unread"}`}
                      onClick={() => handleNotificationClick(noti)}
                  >
                    <div>{noti.content}</div>
                    <div className="timestamp">
                      {new Date(noti.createdAt).toLocaleString()}
                    </div>
                  </div>
              ))
          ) : (
              <div>알림이 없습니다.</div>
          )}
        </div>
      </div>
  );
};

export default NotificationPage;
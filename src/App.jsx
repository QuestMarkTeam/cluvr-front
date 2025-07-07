import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgetPasswordPage from './pages/auth/ForgetPasswordPage';
import MyClubPage from './pages/club/MyClubPage.jsx';
import ClubPage from './pages/club/ClubPage.jsx';
import CreateClubPage from './pages/club/CreateClubPage.jsx';
import ClubDetailPage from './pages/club/ClubDetailPage.jsx';
import BoardPage from './pages/board/BoardPage';
import BoardDetailPage from './pages/board/BoardDetailPage';
import WriteBoardPage from './pages/board/WriteBoardPage';
import HomePage from './pages/HomePage.jsx';
import ChargePage from './pages/payment/ChargePage.jsx';
import PaymentPage from './pages/payment/PaymentPage.jsx';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage.jsx';
import PaymentFailPage from './pages/payment/PaymentFailPage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import ChatPage from './pages/chat/ChatPage.jsx';
import ChatRoomListPage from './pages/chat/ChatRoomListPage.jsx';
import CreateChatRoomPage from './pages/chat/CreateChatRoomPage.jsx';
import NotificationPage from './pages/notification/NotificationPage.jsx';
import NoticeListPage from './pages/notice/NoticeListPage.jsx';
import NoticeCreatePage from './pages/notice/NoticeCreatePage.jsx';
import NoticeDetailPage from './pages/notice/NoticeDetailPage.jsx';
import GemLogPage from './pages/gem/GemLogPage.jsx';
import MyQuestionsPage from './pages/user/MyQuestionsPage.jsx';
import MyAnswersPage from './pages/user/MyAnswersPage.jsx';

function App() {
    return (
        <Router>
            <Routes>
                {/* 초기 경로 - /login으로 이동 */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forget-password" element={<ForgetPasswordPage />} />
                {/* 경로 - /클럽  */}
                <Route path="/club" element={<ClubPage />} />
                <Route path="/myclubs" element={<MyClubPage />} />
                <Route path="/club/create" element={<CreateClubPage />} />
                <Route path="/club/:clubId" element={<ClubDetailPage />} />
                {/* 경로 - /게시판  */}
                <Route path="/board" element={<BoardPage />} />
                <Route path="/board/:boardId" element={<BoardDetailPage />} />
                <Route path="/board/write" element={<WriteBoardPage />} />
                {/* 경로 - /결제  */}
                <Route path="/payment/charge" element={<ChargePage />} />
                <Route path="/payment/checkout" element={<PaymentPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/fail" element={<PaymentFailPage />} />
                {/* 경로 - /유저  */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/myquestions" element={<MyQuestionsPage />} />
                <Route path="/myanswers" element={<MyAnswersPage />} />
                {/* 경로 - /채팅  */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chatroomlist" element={<ChatRoomListPage />} />
                <Route path="/crateroom" element={<CreateChatRoomPage />} />
                {/* 경로 - /공지사항 */}
                <Route path="/notice/list" element={<NoticeListPage />} />
                <Route path="/notice/create" element={<NoticeCreatePage />} />
                <Route path="/notice/detail" element={<NoticeDetailPage />} />
                {/* 경로 - /알림 */}
                <Route path="/notifications" element={<NotificationPage />} />
                {/* 경로 - /gem */}
                <Route path="/gems/log" element={<GemLogPage />} />
                {/* 없는 경로 처리 */}
                <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>404 - 페이지를 찾을 수 없습니다.</div>} />
            </Routes>
        </Router>
    );
}

export default App;

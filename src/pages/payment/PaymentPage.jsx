/* global TossPayments */ // TossPayments 객체를 전역 변수로 선언

import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const API_DOMAIN_URL = 'http://localhost:80';

export default function PaymentPage() {
    const location = useLocation();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v2/standard';
        script.async = true;
        script.onload = () => {
            main();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const main = async () => {
        const params = new URLSearchParams(location.search);
        const amount = params.get('amount');
        const token = localStorage.getItem('accessToken');

        // 서버에 결제정보 저장
        const response = await fetch('http://localhost/api/payments/prepare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                amount: amount,
                orderName: 'Gem 충전',
            }),
        });

        const responseBody = await response.json();
        const data = responseBody.data;
        const uuid = data.uuid;
        const orderId = data.orderId;
        const orderName = data.orderName;
        const paymentAmount = data.amount;

        // 결제 위젯 초기화
        const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
        const tossPayments = TossPayments(clientKey);

        const widgets = tossPayments.widgets({
            customerKey: uuid,
        });

        // 결제 금액 설정
        await widgets.setAmount({
            currency: 'KRW',
            value: paymentAmount,
        });

        // 결제 UI와 이용약관 UI 렌더링
        await Promise.all([
            widgets.renderPaymentMethods({
                selector: '#payment-method',
                variantKey: 'DEFAULT',
            }),
            widgets.renderAgreement({
                selector: '#agreement',
                variantKey: 'AGREEMENT',
            }),
        ]);

        // 결제 버튼 클릭 시 결제 요청
        document.getElementById('payment-button').addEventListener('click', async () => {
            try {
                await widgets.requestPayment({
                    orderId: orderId,
                    orderName: orderName,
                    successUrl: window.location.origin + '/payment/success',
                    failUrl: window.location.origin + '/payment/fail',
                });
            } catch (err) {
                alert('결제 실패: ' + err.message);
            }
        });
    };

    return (
        <div className="payment-page">
            <header className="app-bar">
                <a href="/home" className="icon-btn">←</a>
                <h1 className="app-title">결제</h1>
            </header>

            <main className="main-content">
                {/* 결제 UI */}
                <div id="payment-method"></div>
                {/* 이용약관 UI */}
                <div id="agreement"></div>

                {/* 결제하기 버튼 */}
                <button className="button" id="payment-button" style={{marginTop: '30px'}}>결제하기</button>
            </main>

            {/* 하단 네비게이션 */}
            <nav className="tab-bar">
                <Link to="/home" className="tab">Home</Link>
                <Link to="/club" className="tab">Club</Link>
                <Link to="/board" className="tab active">Board</Link>
                <Link to="/myclubs" className="tab">My Clubs</Link>
                <Link to="/profile" className="tab">Profile</Link>
            </nav>
        </div>
    );
}

import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/payment.css';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const token = localStorage.getItem('accessToken');

export default function PaymentSuccessPage() {
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amount = urlParams.get('amount');

        // 상태 업데이트, 결제 정보 표시 등을 할 수 있습니다.
        document.getElementById('paymentKey').textContent = paymentKey;
        document.getElementById('orderId').textContent = orderId;
        document.getElementById('amount').textContent = `${amount}원`;
    }, [location]);

    const confirmPayment = async () => {
        const urlParams = new URLSearchParams(location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amount = urlParams.get('amount');
        const gem = amount;


        const response = await fetch(`${API_DOMAIN_URL}/api/payments/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                paymentKey,
                orderId,
                gem,
            }),
        });

        if (response.ok) {
            alert('결제가 완료되었습니다!');
        } else {
            alert('결제 실패');
        }
    };

    return (
        <div className="wrapper w-100">
            {/* 결제 요청 성공 화면 */}
            <div className="flex-column align-center confirm-loading w-100 max-w-540">
                <div className="flex-column align-center">
                    <img
                        src="https://static.toss.im/lotties/loading-spot-apng.png"
                        width="120"
                        height="120"
                        alt="loading"
                    />
                    <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
                    <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
                </div>
                <div className="w-100">
                    <button
                        id="confirmPaymentButton"
                        className="btn primary w-100"
                        onClick={confirmPayment}
                    >
                        결제 승인하기
                    </button>
                </div>
            </div>

            {/* 결제 성공 화면 */}
            <div className="flex-column align-center confirm-success w-100 max-w-540">
                <img
                    src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
                    width="120"
                    height="120"
                    alt="success"
                />
                <h2 className="title">결제를 완료했어요</h2>
                <div className="response-section w-100">
                    <div className="flex justify-between">
                        <span className="response-label">결제 금액</span>
                        <span id="amount" className="response-text"></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="response-label">주문번호</span>
                        <span id="orderId" className="response-text"></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="response-label">paymentKey</span>
                        <span id="paymentKey" className="response-text"></span>
                    </div>
                </div>

                <div className="w-100 button-group">
                    <div className="flex" style={{ gap: '16px' }}>
                        {/* '다시 테스트하기' 버튼을 Link로 변경 */}
                        <Link
                            to="https://developers.tosspayments.com/sandbox"
                            className="btn w-100"
                        >
                            다시 테스트하기
                        </Link>
                        {/* '결제 연동 문서가기' 버튼을 Link로 변경 */}
                        <Link
                            to="https://docs.tosspayments.com/guides/v2/payment-widget/integration"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="btn w-100"
                        >
                            결제 연동 문서가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

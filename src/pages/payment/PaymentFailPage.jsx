import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/payment.css';

export default function PaymentFailPage() {
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const errorCode = urlParams.get('code');
        const errorMessage = urlParams.get('message');

        // 에러 코드와 메시지 화면에 표시
        document.getElementById('error-code').textContent = errorCode;
        document.getElementById('error-message').textContent = errorMessage;
    }, [location]);

    return (
        <div className="wrapper w-100">
            {/* 결제 실패 화면 */}
            <div className="flex-column align-center w-100 max-w-540">
                <img
                    src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
                    width="160"
                    height="160"
                    alt="error"
                />
                <h2 className="title">결제를 실패했어요</h2>
                <div className="response-section w-100">
                    <div className="flex justify-between">
                        <span className="response-label">code</span>
                        <span id="error-code" className="response-text"></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="response-label">message</span>
                        <span id="error-message" className="response-text"></span>
                    </div>
                </div>
                <div className="w-100 button-group">
                    {/* 다시 테스트하기 */}
                    <Link
                        to="https://developers.tosspayments.com/sandbox"
                        className="btn"
                    >
                        다시 테스트하기
                    </Link>
                    <div className="flex" style={{ gap: '16px' }}>
                        {/* 에러코드 문서보기 */}
                        <Link
                            to="https://docs.tosspayments.com/reference/error-codes"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="btn w-100"
                        >
                            에러코드 문서보기
                        </Link>
                        {/* 실시간 문의하기 */}
                        <Link
                            to="https://techchat.tosspayments.com"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="btn w-100"
                        >
                            실시간 문의하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

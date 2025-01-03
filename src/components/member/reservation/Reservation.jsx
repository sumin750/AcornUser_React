import React, { useState, useEffect } from 'react';
import Header from "../../common/Header.jsx";
import ReservationSuccess from './ReservationSuccess';
import TimePickerComponent from "./Picker/TimePickerComponent";
import axios from "axios";

function Reservation({ isLogin, logout }) {
    const [state, setState] = useState({});
    const [services, setServices] = useState([]); // 서비스 목록 상태
    const [members, setMembers] = useState([]); // 담당 직원 목록 상태
    const [customerData, setCustomerData] = useState({}); // 고객 데이터 상태
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [selectedReservation, setSelectedReservation] = useState({
        serviceName: '',
        memberName: '',
        reservationDate: '',
        reservationTime: '',
        reservationComm: '',
    });

    useEffect(() => {
        fetch('http://localhost:8080/reservation/service/user')
            .then(response => response.json())
            .then(data => setServices(data))
            .catch(err => console.error('Error fetching services:', err));

        fetch('http://localhost:8080/reservation/member/user')
            .then(response => response.json())
            .then(data => setMembers(data))
            .catch(err => console.error('Error fetching members:', err));

        fetch('http://localhost:8080/reservation/customer/username', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                setCustomerData(data); // 고객 데이터를 상태에 저장
            })
            .catch(err => console.error('Error fetching customerdata:', err));
    }, []);

    const handleFieldChange = (name, value) => {
        setSelectedReservation(prev => ({
            ...prev,
            [name]: value,
        }));
        handleChange({ target: { name, value } });
    };

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const handleInsert = () => {
        if (!selectedReservation.serviceName || !selectedReservation.memberName) {
            alert("서비스와 직원은 필수 입력 항목입니다.");
            return;
        }

        const dataToInsert = {
            serviceName: selectedReservation.serviceName,
            customerName: customerData.customerName,
            memberName: selectedReservation.memberName,
            reservationDate: selectedReservation.reservationDate,
            reservationTime: selectedReservation.reservationTime,
            reservationComm: selectedReservation.reservationComm,
        };

        axios.post("http://localhost:8080/reservation/user", dataToInsert)
            .then((res) => {
                if (res.data.isSuccess) {
                    notifyERP(res.data); // ERP 알림 전송 함수
                    setShowSuccessModal(true);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const notifyERP = (reservationData) => {
        const token = localStorage.getItem('authToken');  // 로컬 스토리지에서 JWT 토큰을 가져옴
        const message = `새로운 예약: ${reservationData.customerName}님, 예약 시간: ${reservationData.reservationTime}`;

        // 줄바꿈 처리
        const formattedContent = message.replace(/\n/g, '<br />'); // 줄바꿈 처리

        axios.post('http://localhost:8080/api/notifications', {
            message: formattedContent, // 예약 메시지 내용
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                console.log('ERP 알림 전송 성공:', response);
            })
            .catch(error => {
                console.error('ERP 알림 전송 실패:', error);
            });
    };

    return (
        <div>
            {/*<Header isLogin={isLogin} logout={logout} />*/}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <h1>예약하기</h1>

                    <form>
                        <div className="mb-3">
                            <label>서비스 명</label>
                            <select
                                name="serviceName"
                                value={selectedReservation.serviceName}
                                onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
                                className="form-control"
                            >
                                <option value="">서비스를 선택하세요</option>
                                {Array.isArray(services) && services.map((service) => (
                                    <option key={service.serviceCode} value={service.serviceName}>
                                        {service.serviceName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label>예약자</label>
                            <input
                                type="text"
                                name="customerName"
                                value={customerData.customerName || 'Loading...'}
                                className="form-control"
                                readOnly
                            />
                        </div>

                        <div className="mb-3">
                            <label>담당 직원</label>
                            <select
                                name="memberName"
                                value={selectedReservation.memberName}
                                onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
                                className="form-control"
                            >
                                <option value="">직원을 선택하세요</option>
                                {Array.isArray(members) && members.map((member) => (
                                    <option key={member.memberId} value={member.memberName}>
                                        {member.memberName} / {member.memberJob}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label>예약 날짜</label>
                            <input
                                type="date"
                                name="reservationDate"
                                value={selectedReservation.reservationDate}
                                onFocus={(e) => e.target.showPicker()}
                                onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
                                className="form-control"
                                min={new Date().toLocaleDateString('en-CA')}
                            />
                        </div>

                        <div className="mb-3">
                            <label>예약 시간</label>
                            <TimePickerComponent
                                value={selectedReservation.reservationTime}
                                onChange={(value) => handleFieldChange('reservationTime', value)}
                                isEditing={true}
                            />
                        </div>

                        <div className="mb-3">
                            <label>특이사항</label>
                            <input
                                type="text"
                                name="reservationComm"
                                value={selectedReservation.reservationComm}
                                onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
                                className="form-control"
                            />
                        </div>

                        <div className="mt-3" style={{ textAlign: 'right' }}>
                            <button type="button" className="btn btn-primary" onClick={handleInsert}>
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showSuccessModal && (
                <ReservationSuccess setShowSuccessModal={setShowSuccessModal} />
            )}
        </div>
    );
}

export default Reservation;
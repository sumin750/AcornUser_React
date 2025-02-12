import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Pagination from "../../common/Pagination.jsx"; // 페이지네이션 컴포넌트
import "../../../assets/styles/Notice/Notice.css";
import "bootstrap/dist/css/bootstrap.min.css";
import defaultServiceImage from "../../../assets/images/logo_black.png"; // 기본 이미지

function Notice() {
  const [notices, setNotices] = useState([]); // 공지 데이터를 저장할 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [itemsPerPage] = useState(9); // 페이지당 아이템 수 (고정)
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 함수

  // 공지 목록을 가져오는 함수
  const fetchNotices = async (page) => {
    try {
      const response = await axios.get(
          `http://localhost:8080/notice?page=${page - 1}&size=${itemsPerPage}`
      );
      setNotices(response.data.content); // 공지 데이터 설정
      setTotalPages(response.data.totalPages); // 총 페이지 수 설정
      setIsLoading(false); // 로딩 상태 완료
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotices(page);
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage]);

  if (isLoading) {
    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="mt-5">
          <Alert variant="danger">
            데이터를 불러오는 중 오류가 발생했습니다: {error}
          </Alert>
        </Container>
    );
  }

  return (
      <div>
        {/* 공지사항 리스트 */}
        <Container className="notice-container mt-5">
          <h1 className="mb-4 text-start">공지사항</h1>
          <Row>
            {notices.length > 0 ? (
                notices.map((notice) => (
                    <Col key={notice.noticeNo} md={4} className="mb-4">
                      <Card className="notice-card">
                        <Card.Img
                            variant="top"
                            src={
                              notice.noticeImagePath && notice.noticeImagePath.trim()
                                  ? notice.noticeImagePath
                                  : defaultServiceImage
                            }
                            alt="공지 사진"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/notice/${notice.noticeNo}`)}
                        />
                        <Card.Body>
                          <Card.Title
                              className="notice-title"
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate(`/notice/${notice.noticeNo}`)}
                          >
                            {notice.noticeCheck && <span className="important">📍</span>}
                            {notice.noticeTitle}
                          </Card.Title>
                          <Card.Text className="notice-date">
                            작성일: {new Date(notice.noticeReg).toLocaleDateString()}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                ))
            ) : (
                <Alert variant="info" className="mt-4 text-center">
                  등록된 공지사항이 없습니다.
                </Alert>
            )}
          </Row>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
              <div className="pagination-container">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
              </div>
          )}
        </Container>
      </div>
  );
}

export default Notice;
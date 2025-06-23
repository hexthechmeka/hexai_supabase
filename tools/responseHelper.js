// tools/responseHelper.js
// API 응답 표준화 헬퍼

exports.successResponse = (res, data = null, message = '요청이 성공적으로 처리되었습니다.') => {
  res.json({
    success: true,             // 성공 여부
    code: 'SUCCESS',           // 표준 코드
    message,                   // 사용자에게 전달할 메시지
    data                       // 실제 데이터 (없으면 null)
  });
}

exports.errorResponse = (res, code = 'ERROR', message = '요청 처리 중 오류가 발생했습니다.', status = 400) => {
  res.status(status).json({
    success: false,            // 실패 여부
    code,                      // 에러 코드
    message,                   // 사용자에게 전달할 메시지
    data: null                 // 실패 시 데이터는 null
  });
}

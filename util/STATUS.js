const STATUS = {
    S200 :{result : 200, resultDesc:"Success",}, // 성공
	S201 :{result : 201, resultDesc:"데이터 없음"},
	E100 :{result : -100, resultDesc:"필수 파라메터 에러"},
	E101 :{result : -101, resultDesc:"cmd 에러"},
	E102 :{result : -102, resultDesc:"허용 범위 초과"},
	E200 :{result : -200, resultDesc:"Auth fail ( 인증 실패 -인증토큰 / 허용 IP / 허용 mac 에러 )"},
	E300 :{result : -300, resultDesc:"DB 연동 실패"},
	E301 :{result : -301, resultDesc:"DB 정보 암호화 실패"},
	E400 :{result : -400, resultDesc:"처리 실패"},
	E404 :{result : -404, resultDesc:"파일 없음"},
	E500 :{result : -500, resultDesc:"서버 처리 실패"},
	E701 :{result : -701, resultDesc:"중복된 트랜잭션 요청"}
  };
module.exports = STATUS;
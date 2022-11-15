
// 게임 종료
function finishRound(player, matzip, currTurn) {
  
  // 축하배너 추가
  var w = []; for(var i in player) if(player[i][11] > 0) w = player[i]; // 승리한놈 찾기
  var celltxt = '#1/25. ' + w[1]+w[2]; // 축하배너 추가
  mg_main.getRange(16,38, 13,30).breakApart();
  mg_inf.getRange(48, 21, 13, 26).copyTo(mg_main.getRange(16, 40), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  mg_main.getRange(16, 40).setValue(celltxt).setFontColor('#ffffff').setFontSize(40)
  .setRichTextValue(SpreadsheetApp.newRichTextValue().setText(celltxt)
                    .setTextStyle(0, 2, SpreadsheetApp.newTextStyle().setForegroundColor('#ffd966').setFontSize(50).build())
                    .setTextStyle(2, 6, SpreadsheetApp.newTextStyle().setForegroundColor('#999999').setFontSize(40).build())
                    .build());
    
  //debugConsoleLog("플레이어DB 반영중..");
  db_rewrite(mg_player, player); // 변경된 플레이어 내용을 DB 전체에 덮어쓴다.
  //debugConsoleLog("DB백업완료. 맛집DB 반영중..");
  db_rewrite(mg_matzip, matzip); // 변경된 맛집 내용을 DB 전체에 덮어쓴다.
  //debugConsoleLog("게임 상태 백업중..");
  game_backup(currTurn); // 현재시점의 DB를 백업한다.
  
  mg_main.getRange(7, 5).setValue('종료'); // turn = 종료 확실하게 박아놓기
  mg_main.getRange(8, 15).setValue(new Date()); // '최근 턴' 란에 종료시각 확실하게 박아놓기
  mg_main.getRange(9, 15).setValue('10:00 ~ 10:15'); // '다음 턴' 란에 다음 시작시각 확실하게 박아놓기
  
  mg_roundlog.getRange(mg_roundlog.getLastRow(), 3).setValue(new Date()); // 가장 최근회차 종료시각에 현재시각을 박아놈
  
  log("다음 게임은 돌아오는 아침 ⏰10:00 ~ 10:15 사이에 시작됩니다.");
  log("🎉🎉🎉 축하합니다!" + w[1] + w[2] + "님이 이번 경기에서 우승하였습니다! 🎉🎉🎉");
  
  mg_main.getRange(7, 15).setValue("IDLE").setFontColor("#444444"); // CALC = IDLE

  refresh();

  mg_inf.getRange(65, 27, 19, 20).copyTo(mg_inf.getRange(65, 2)); // 멀쩡한 우측맵을 전체복사하여 좌측에 붙여넣기      

  
  //debugConsoleLog("라운드 무사히 정상종료 다행임.");
  return; // 돌아가면 모든 연산을 멈추고 모든 프로그램을 종료함
}

  
// 게임 시작
function startRound() {
  //log("게임을 시작합니다!");
  // 라운드 새로 써넣기 (증가처리)
  var currRound = mg_roundlog.getRange(mg_roundlog.getLastRow(), 1).getValue(); // 가장 최근 회차임
  var newRound = Number(currRound) + 1; // 신규회차를 만듬
  mg_roundlog.getRange(mg_roundlog.getLastRow()+1, 1, 1, 2).setValues([[newRound, new Date()]]); // 가장 최근회차 밑줄 왼쪽두칸에 [신규회차, 현재시각]을 박아놈
  mg_main.getRange(6, 5).setValue(newRound); // 메인화면 GAME란에 새로운 회차 써놈
  
  // 로그 데이터 초기화 : mg_log의 3번째줄은 살려둔다.
  mg_main.getRange(30, 38, 25, 30).copyTo(mg_main.getRange(6, 38)); // 메인화면 로그 초기화
  mg_log.deleteRows(4, (mg_log.getLastRow()>=4)?(mg_log.getLastRow()-3):1); // mg_log 초기화
  
  log("메세지 로그 초기화..");
  
  log("신규회차 데이터 준비..");
  
  // 턴 새로 써넣기
  mg_main.getRange(7, 5).setValue(0); // 새턴 시작(0) >> 겜이 종료되지 않고 곧 메인루프를 돌면서 1턴으로 바뀌고 게임 시작.

  log("DB 초기화..");

  // 플레이어 데이터 초기화
  sheetCleaning(); // 플레이어 데이터를 읽기 전에 시트 양식을 청소
  var sheetlist = sh_study.getRange("D8:D37").getValues(); // 시트내의 플레이어 리스트를 읽어옴

  // 유저 이름만으로 이루어진 배열을 랜덤 쏠팅한다.
  sheetlist.sort(function() { return Math.random() - Math.random(); });
  
  var sheeters = []; // 플레이어 데이터를 최종적으로 긁어올 변수내용임
  for(var i in sheetlist) {
    var a = sheetlist[i].join(""); // 막 주워온 셀내용은 문자열이 아니라 문자 하나하나를 모아놓은 일종의 '문자 배열집합'이다. 그래서 join을 한번 해줘야 된다.
    if(a != '(빈자리)' && a.length >= 1) sheeters.push(sheetlist[i]); // 빈자리가 아니며 동시에 길이가 1 이상일 때에만 플레이어 목록에 추가시킨다.
  }
  
  var newPlayers = [];
  for(var i in sheeters) { // 플레이어 변수늘릴때 변수 늘릴때 조심해야한다 변수추가하고나면 여기에도 데이터를 새로 추가해야되기때문
    newPlayers[i] = [i, '☂️', sheeters[i], // 시트배열을 1차원으로 갖고오는거야? 확인필요.
    'x', 'x', 'x', 'x', 'x', 'x', 'x', 1, 1, 'x', 'x', 'x',  // 중간에 1,1은 체력 설정
    Math.floor(Math.random() * 19)+1, Math.floor(Math.random() * 20)+1, // 좌표(row 1~19 col 1~20)
    'x', 'x', 0, 0, 0, 0, 0, 0, 0, 'x', 'x', 'x']; // 나머지는 다 0
  }
  mg_player.deleteRows(3, mg_player.getLastRow()-2); // mg_player 초기화
  mg_player.getRange(3, 1, newPlayers.length, newPlayers[0].length).setValues(newPlayers); // 셀을 새로운 플레이어정보로 전부 채움
  
  log("플레이어 준비..");
  
  // 맛집 데이터 초기화
  mg_matzip.getRange(3, 7, 34, 30).setValue(true); // 맛집 T/F 초기화
  
  log("건물 파밍 준비..");
  
  // 공중보급 데이터 완전삭제
  if(mg_matzip.getLastRow() >= 37) mg_matzip.deleteRows(37, mg_matzip.getLastRow() - 36);
  
  log("자기장 초기화..");
  
  // 자기장/레드존 초기화
  mg_main.getRange(8, 5).setValue("없음"); // 자기장 초기화
  mg_main.getRange(9, 5).setValue("없음"); // 레드존 초기화
  
  log("새 게임 준비 완료.");

  // 메세지
  log("게임이 시작되고 스터디원들이 ✈️비행기✈️에 탑승합니다!");
  log("섬을 횡단하는 ✈️비행기✈️에서 점프하여, 안전하고 아이템 가득한 곳을 찾아 ☂️낙하산☂️을 타고 하강합니다..");

  // 메인화면에 시간관련 내용을 기록한다.
  var nextTurn_raw = new Date(new Date().getTime() + 1000*60*60*routineHour); // x시간후 (현재0.5시간일걸)
  var nextTurnTime = Utilities.formatDate(new Date(nextTurn_raw), 'GMT+9', 'MM/dd HH:mm:ss'); // x시간후 - 포맷만 다르고 엑셀입력하면 값은 똑같음 (현재24시간일걸)
  mg_main.getRange(8, 15).setValue(new Date()); // '최근 턴' ⇒ 현재 시각을 기록
  mg_main.getRange(9, 15).setValue(nextTurnTime); // '다음 턴' 란에 다음 시작시각 확실하게 박아놓기
  
  // 맵, 캐릭터 등 모든 디스플레이 초기화
  refresh();
  
}


// 모든 플레이어 아이콘을 낙하산에서 랜덤아이콘으로 바꿔줌
function revealPlayerIcon(player) {
  var allIcons = icon; // 아이콘 배열 통째로 갖고옴
  var newIcons = []; // 이거 플레이어 배열에 그대로 집어넣을거임
  for(var i = 0; i < player.length; i++) { // 랜덤아이콘을 갖고 플레이어배열에 집어넣을 아이콘리스트 만듬
    var rnd = Math.floor(Math.random() * allIcons.length); // 0 <= x < allIcons.length 인 정수
    newIcons[i] = [allIcons[rnd]];
    player[i][1] = newIcons[i];
    allIcons.splice(rnd, 1);
  }
  mg_player.getRange(3, 2, newIcons.length, 1).setValues(newIcons); // DB내 모든사람의 아이콘을 랜덤아이콘으로 다교체함
  
  // 모든 플레이어의 아이콘이 낙하산에서 랜덤아이콘으로 바뀌면서 본격 게임 시작.
  // 당연히 모든 스탯 및 맵을 갱신해줌. → 버그 수정과정에서 필수갱신은 안하도록 바꿈
  //refresh();
 
  return player;
}

//////////////// 현재 서버 상태를 백업
function game_backup(currTurn) {

  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
  var matzip = mg_matzip.getRange(3, 1, mg_matzip.getLastRow()-2, mg_matzip.getLastColumn()).getValues();
  var mag = mg_main.getRange(8,5).getValue();
  var red = mg_main.getRange(9,5).getValue();
  
  for(var i in player) player[i] = player[i].join(";");
  player = player.join("\n");
  for(var j in matzip) matzip[j] = matzip[j].join(";");
  matzip = matzip.join("\n");
  
  var input = [new Date(), mg_main.getRange(6,5).getValue(), currTurn, player, matzip, mag, red];
  mg_record.getRange(mg_record.getLastRow()+1, 1, 1, 7).setValues([input]);  
  
}


// 저장된 백업으로부터 복구
function backsub(targetRow) {

  // 턴을 입력해서 함수를 불러왔다면 해당 턴을 목표로. 안입력했다면 아래와같이 DB의 마지막 줄(마지막 백업)을 지시.
  if( targetRow === undefined ) targetRow = mg_record.getLastRow();

  // 턴, 존 복구
  var time = mg_record.getRange(targetRow, 1).getValue();
  var round = mg_record.getRange(targetRow, 2).getValue();
  var turn = mg_record.getRange(targetRow, 3).getValue();
  var mag = mg_record.getRange(targetRow, 6).getValue();
  var red = mg_record.getRange(targetRow, 7).getValue();
  //debugConsoleLog([[time],["없음"]]);
  //debugConsoleLog([[round],[turn],[mag],[red]]);
  mg_main.getRange(8, 15, 2, 1).setValues([[time],["없음"]]);
  mg_main.getRange(6, 5, 4, 1).setValues([[round],[turn],[mag],[red]]);
  
  // 플레이어 복구
  var player = mg_record.getRange(targetRow, 4).getValue();
  player = player.split("\n"); // 쪼개고
  for(var i in player) player[i] = player[i].replace(/	/gi, ';').split(";"); // 또 쪼갠다.
  mg_player.deleteRows(3, mg_player.getLastRow()-2); // mg_player 초기화
  mg_player.getRange(3, 1, player.length, player[0].length).setValues(player);
  
  // 맛집 복구
  var matzip = mg_record.getRange(targetRow, 5).getValue();
  matzip = matzip.split("\n"); // 쪼개고
  for(var i in matzip) matzip[i] = matzip[i].replace(/	/gi, ';').split(";"); // 또 쪼갠다.
  mg_matzip.deleteRows(3, mg_matzip.getLastRow()-2); // mg_matzip초기화
  mg_matzip.getRange(3, 1, matzip.length, matzip[0].length).setValues(matzip);
  
  // refresh(); 꼭 리프레시할 필요는 없는거같다.
}
function backsubByTxt() {
  var backsubNum = mg_inf.getRange(112, 24).getValue();
  backsub(backsubNum);
}
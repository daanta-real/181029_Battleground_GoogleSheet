/*
✅ = 메인화면 오른쪽 로그 조작
🅾️ = DB용 변수를 조작
🗺️️ = 맵화면 조작
🚹 = 스테이터스 화면 조작
💟 = 향후 업데이트 필요
Ⓜ️ = 디버그 표시
//debugConsoleLog('#1/25. ' + pl[1]+pl[2]);
*/

function debugTest() { // 플레이어별 루틴 페이즈
  loop_main('on');
  //refresh();
}
////////////////////////Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️////////////////////////
function debugInfVer() { // 계기판에서 실행하는 디버그
}
////////////////////////Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️Ⓜ️////////////////////////


//루프 실제로 구동되는 핵심부분.
// 루프 1. loop_chk(게임 시작/종료/트리거 등의 접촉관리)
// 루프 2. loop_player(플레이어별 행동처리)
// 루프 3. loop_system(자기장,레드존,공중보급,선물상자 등의 처리)
//이렇게 세개로 이루어짐.
function loop_main(debug, turns) {

  // 필요 변수 준비
  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
  var matzip = mg_matzip.getRange(3, 1, mg_matzip.getLastRow()-2, mg_matzip.getLastColumn()).getValues();

  var currTurn = mg_main.getRange(7, 5).getValue(); // 게임상태 변수 (턴수에 따라 행동변화)
  var server = mg_main.getRange(6, 15).getValue(); // 서버상태 변수 (관리자가 ON/OFF로 입력하여 게임을 진행/중단시킴)
  var calc = mg_main.getRange(7, 15).getValue(); // 메인시트의 'CALC'항목으로 점검할거  
  
  var lastTime = mg_main.getRange(8,15).getValue(); // 기록된 마지막 턴 시작시간 ('최근 턴'란) (* 이게 전 라운드 종료시각이다.)
  var elapsedHours = Math.floor((new Date() - new Date(lastTime))/(1000*60*60)); // 상기 마지막 턴시작시점으로부터 지난 시각량
  var elapsedMins = Math.floor((new Date() - new Date(lastTime))/(1000*60)); // 상기 마지막 턴시작시점으로부터 몇분 지났는지 계산함.
  var elapsedH = Math.floor(elapsedMins/60);
  var elapsedM = (elapsedMins % 60);
  if(debug == 'on') log("[SYSTEM] 마지막 실행으로부터 " + elapsedHours + "시간 / " + elapsedH  + "시간 " + elapsedM + '분 지났습니다. debug = ' + debug);
  
  var nextTurn_raw = new Date(new Date().getTime() + 1000*60*60*routineHour); // x시간후 (현재0.5시간일걸)
  var nextTurnTime = Utilities.formatDate(new Date(nextTurn_raw), 'GMT+9', 'MM/dd HH:mm:ss'); // x시간후 - 포맷만 다르고 엑셀입력하면 값은 똑같음 (현재24시간일걸)
  
  // debugConsoleLog(new Date() + ", (last)Turn:" + currTurn + ", lastTime=" + lastTime + ", elapsed " + elapsedH  + "시간 " + elapsedM + '분 --- 루틴 진행합니다.');

  // 루프 0. game_chk(게임 시작/종료/트리거 등의 접촉관리)
  // 체크 루프를 돈다.
  
  // 1. 서버상태 점검부: 서버 ON?
  // 게임을 임의로 멈췄다면 (서버 상태가 ON이 아니면)
  if(server != 'ON') { // 서버 상태가 ON이 아닌 다른 어떤것이면
    log("[SYSTEM] 디버그 관계로 게임이 잠시 멈췄으며, 속행 예정입니다.");
    return; // 턴종료 행동이고 뭐고 그냥 바로 셧다운해라
  }  
  
  // 2. 연산상태 점검부: LOADING / IDLE ? → LOADING 표기된이후 15분이 지났는가? 그리고 LOADING중인가?
  if (calc == 'LOADING' && elapsedHours > routineHour) { // 즉 연산이 진행중이고, 그 채로 한 루틴분량의 시간이 지났으면 → 틀림없이 중간에 뻑난거임
    log("[SYSTEM] " + elapsedH  + "시간 " + elapsedM + '분이 지나도록 지난 턴을 마치지 못하였습니다. 에러가 나기 직전 턴으로 백섭합니다.');
    backsub(); // 백섭만 하고 재시도
    log('바로 전 턴으로 백섭 완료하였습니다. 경기를 다시 진행합니다.');
  } else if (calc == 'LOADING') {
    log("[SYSTEM] 선행연산 진행중으로 중복연산 방지를 위해 본 루틴을 중단합니다.");
    return;
  }
  
  // 3. 새라운드 시작부: 겜 종료및 다음라운드 대기중?
  if(currTurn == '종료') { // 게임이 종료되어 다음 라운드를 기다리고 있는 상태라면 (턴 = '종료'일 때)
    // 현재시각이 게임 개시시각 ~ +8시간 범위 이내이거나, 디버그모드가 켜져있다면
    if((new Date().getHours() >= nextGameStartHour && new Date().getHours() < nextGameStartHour + 8) || debug == 'on') {
      startRound(); // 아침 10시가 지났다면 새게임 스타트시킴. 0턴으로 시작하며, 밑에 메인루프를 돌면서 턴+1 되며 바로 게임 시작함.
      player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
      matzip = mg_matzip.getRange(3, 1, mg_matzip.getLastRow()-2, mg_matzip.getLastColumn()).getValues();
    } else {
      return ;// 겜은 종료상태고 24시간이 아직 안 지났다면 서버가 할게없다. 턴종료 행동이고 뭐고 그냥 바로 셧다운해라
    }
  }
  if(debug == 'on') log("경기가 종료상태가 아닙니다. 다음 턴을 정상진행합니다.");
  
  
  // 루프 0. 여기까지 왔으면 서버는 켜져 있고, 생존자가 2명 이상 있다 즉 게임이 본격 정상진행중이라는 얘기다.
  // 새 턴을 진행한다. (* player, matzip, currTurn을 위에서 불러와서 갖고잇음)
  
  mg_main.getRange(7,15).setValue("LOADING").setFontColor("#c84533"); // CALC = 로딩
  mg_main.getRange(8,15).setValue(new Date()); // '최근 턴' ⇒ 현재 시각을 기록
  var logtxt = []; // 루틴을 끝내고 업데이트할 시스템 메세지 전체목록
  currTurn = mg_main.getRange(7, 5).getValue(); // 게임상태 변수 (턴수에 따라 행동변화)
  var roundStartTime = mg_roundlog.getRange(mg_roundlog.getLastRow(), 2).getValue();
  roundStartTime = new Date(roundStartTime).getDate();
  var todayDay = new Date().getDate();
  if(debug == 'on') log("라운드 시작이 몇시?=" + roundStartTime + " / 오늘 며칠?=" + todayDay + " / 같은날짜임?=" + (roundStartTime == todayDay));
  
  if(debug >= 0) { log("디버그 모드 on. " + debug + "개의 턴을 진행합니다"); var lackedTurns = debug; } // 디버그 모드면, 넘겨받은 숫자를 남은 턴수로.
  else if(roundStartTime != todayDay) { var lackedTurns = 5; } // 자정이 넘었는데도 게임이 안 끝나면, 무조건 5 (빨리진행)
  else { var lackedTurns = getEstimatedRoutines() - currTurn; } // 그 외엔 처리하지 못한 턴수를 센다.
  var proceededTurns = 0; // 한번에 최대 5턴까지만 처리하도록..
  if(debug == 'on') log( lackedTurns + "턴 더 진행해야겠는데요.");
  while(lackedTurns > 0 && proceededTurns < 5) {
  
    currTurn = currTurn + 1;
    
    // 루프 2. 새라운드 시작 ~ 낙하산 착지까지: 게임 진행 턴수별 점검 - 낙하산펴기전임? / 낙하산펴는턴임?
    if(currTurn < parachuteTurn) { // 2-1) 게임이 시작된 상태이고, 낙하산 아직 펴져있는 단계면 (턴기준 = 10턴. 30분당 1턴이면 10턴=300분=5시간임) 전이면
      if(debug == 'on') log("아직 낙하산 타는 중.지상에 착륙하기 " + (parachuteTurn - currTurn) + "턴 전");
      logtxt.push(["☂️☂️☂️ 스터디원들이 낙하산을 타고 활강중입니다. 지상에 착륙하기 " + (parachuteTurn - currTurn) + "턴 전입니다.. ☂️☂️☂️", currTurn]);
    } else if(currTurn == parachuteTurn) { // 2-2) 게임이 시작된 상태고, 10턴 되면 (턴 = 10일 때)
      if(debug == 'on') log("낙하산에서 지상으로 인제 막 착륙. 현재턴: " + currTurn);
      player = revealPlayerIcon(player); // 플레이어 아이콘을 낙하산에서 정상으로 바꾸고, 바꿔진 DB변수를 돌려받는다 (맵갱신이나 DB반영은 막판에 할것임)
      logtxt.push(["모든 스터디원들이 지상에 착지했습니다!", currTurn]); // 여기까지만 하고 턴 끝낸다.    
    } else { // 2-3) 게임이 시작했고, 11턴 이후면 아래 루프 3과 4를 돈다.
      
      // 루프 3. loop_player(플레이어별 행동처리)
      // 플레이어별 루프를 돌고, [logtxt, 수정된player, 수정된matzip] 변수를 돌려받는다.
      if(debug == 'on') log("플레이어부 시작");
      var ploop = loop_player(player, matzip, currTurn);
      if(ploop[0].length > 0) logtxt = logtxt.concat(ploop[0]);
      player = ploop[1], matzip = ploop[2];
      if(debug == 'on') log("플레이어부 끝");
      
      // 루프 4. loop_system(자기장,레드존,공중보급,보상상자 등의 처리)
      // 시스템 루프를 돌고, [logtxt, 수정된player, 수정된matzip] 변수를 돌려받는다.
      var sloop = loop_system(player, matzip, currTurn);
      if(sloop[0] != '없음') logtxt = logtxt.concat(sloop[0]);
      player = sloop[1], matzip = sloop[2];
      if(debug == 'on') log("시스템부 끝");
      
    }
    
    // 루프 5. 게임 종료 처리 판단한다.
    var lives = 0; for(var i in player) if(player[i][11] > 0) lives++; // HP 1 이상있는놈 명수 (생존자 명수)
    if(lives <= 1) { // 1) 생존자가 없거나 한 명이라면 (lives = 1명 이하일 때)
      log(logtxt); // 일단 모든 로그텍스트를 출력한뒤
      finishRound(player, matzip, currTurn); // 게임 끝내기처리
      return ; // 메세지는 함수안에서 다 썼다.. 프로그램 다 종료시켜버려야됨.
    } else { // 2) 생존자가 충분하다면 (2명 이상인 정상 상황일 경우)
      var lives = 0; for(var i in player) if(player[i][11] > 0) lives++; // HP 1 이상있는놈 명수 (생존자 명수)
      logtxt.push(["🔶🔶🔶🔶" + currTurn + "번째 턴 종료! 생존자 " + lives + "명, 다음 턴 시간: ⏰" + nextTurnTime + "🔶🔶🔶🔶", currTurn]); // 게임 종료 아닐 때
    }
    
    lackedTurns--;
    proceededTurns++;
    
  }
  // 턴 돌리기 다끝냄
  if(debug == 'on') log("턴 돌리기 다끝냄");


  
  // 루프 끝내고 모든 로그메세지 출력
  if(debug == 'on') log("로그메세지 출력..");
  if(logtxt.length > 0) log(logtxt);
  // 여기까지 정상적으로 왔다면 턴 종료 처리한다.
  if(debug == 'on') log("플레이어DB 반영중..");
  db_rewrite(mg_player, player); // 변경된 플레이어 내용을 DB 전체에 덮어쓴다.
  if(debug == 'on') log("DB백업완료. 맛집DB 반영중..");
  db_rewrite(mg_matzip, matzip); // 변경된 맛집 내용을 DB 전체에 덮어쓴다.
  if(debug == 'on') log("게임 상태 백업중..");
  game_backup(currTurn); // 현재시점의 DB를 백업한다.
  
  // 메인화면 내용을 기록한다.
  mg_main.getRange(8, 15).setValue(new Date()); // '최근 턴' ⇒ 현재 시각을 기록
  mg_main.getRange(9, 15).setValue(nextTurnTime); // '다음 턴' 란에 다음 시작시각 확실하게 박아놓기
  mg_main.getRange(7, 5).setValue(currTurn); // TURN ⇒ 마지막으로 끝낸 턴 기입

  // 시스템의 완전한 종료.
  mg_main.getRange(7, 15).setValue("IDLE").setFontColor("#444444"); // CALC = IDLE
  refresh(); // 모든 디스플레이를 갱신한다.
}
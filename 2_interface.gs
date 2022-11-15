

// 0idx 1아이콘 2이름 3탈것 4무기 5헤드 6외투 7상의 8신발 9하의 10최대HP 11현재HP 12가방 13가방보관물1 14가방보관물2 15row 16col

// 주로 메인루프부에서 사용하며, 맵/캐릭터 모든것들을 갱신하는 상위함수임.
function refresh(player) {
  if(player === undefined) var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();

  initializeMap();  
  mapSetAllPlayers(player);
  
  refreshPlayerStatAll(player);
  
  refreshTotalLives();
}

//////////////////// 맵 완전 새로그리기 ////////////////////
function initializeMap() {
  mg_inf.getRange(65, 27, 19, 20).copyTo(mg_inf.getRange(65, 2)); // 다시 멀쩡한 우측맵을 전체복사하여 좌측에 붙여넣기 (청소)
  
  // 자기장 - 맵 순 표기
  var mag = readZone('자기장');
  if(mag == '없음') { // 자기장이 없으면
    mg_inf.getRange(65, 2, 19,20).copyTo(mg_main.getRange(10,2)); // 🗺️ 활짝 갠 맵을 뿌리고
    return; // 끝냄
  } else { // 자기장이 없음이 아니면
    mg_inf.getRange(88,2, 19,20).copyTo(mg_main.getRange(10,2)); // 일단 전체영역에 자기장 뿌리고봄
    if (mag == '전체') { // 전체자기장이면
      return; // 그뒤에 아래 정상맵 부분 붙여넣기 할필요 없음 그냥 이걸로 끝임
    } else { // 부분자기장이면
      mg_inf.getRange(65, 27, 19, 20).copyTo(mg_inf.getRange(65, 2)); // 멀쩡한 우측맵을 전체복사하여 좌측에 붙여넣기      
      mg_inf.getRange(64 + mag[0][0]+1, 1 + mag[0][1]+1, mag[1][0]-mag[0][0]-1, mag[1][1]-mag[0][1]-1) // 붙여넣은 좌측맵의
      .setBorder(true, true, true, true, null, null, // 테두리에 자기장 외곽선 퍼렁이 주고
                 '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM) // 그 퍼렁이 외곽선을 볼드하고
      .copyTo(mg_main.getRange(10+mag[0][0],2+mag[0][1])); // 그녀석을 최종적으로 메인화면에 붙여넣기
      mg_inf.getRange(65, 27, 19, 20).copyTo(mg_inf.getRange(65, 2)); // 다시 멀쩡한 우측맵을 전체복사하여 좌측에 붙여넣기 (청소)
/* 원본 방식
      mg_main.getRange(a, b, c, d)
      .setBorder(true, true, true, true, false, false, // 자기장 외곽선 퍼렁이 주기
                 '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 바깥영역에 볼드
*/
/* 밖에서 볼드 방식
      mg_main.getRange(a-1, b, 1, d).setBorder(null, null, true, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 위쪽 퍼렁이 주기
      mg_main.getRange(a+c, b, 1, d).setBorder(true, null, null, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
      mg_main.getRange(a, b-1, c, 1).setBorder(null, null, null, true, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
      mg_main.getRange(a, b+d, c, 1).setBorder(null, true, null, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
*/
/* 안에서 볼드 방식
      mg_main.getRange(a, b, 1, d).setBorder(true, null, null, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 위쪽 퍼렁이 주기
      mg_main.getRange(a+c-1, b, 1, d).setBorder(null, null, true, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
      mg_main.getRange(a, b, c, 1).setBorder(null, true, null, null, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
      mg_main.getRange(a, b+d-1, c, 1).setBorder(null, null, null, true, null, null, '#3c78d8', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); // 자기장 외곽선 퍼렁이 주기, 바깥영역에 볼드
*/
    }
  } // 자기장 표시부 끝
  
  // 레드존 표기부
  var red = readZone('레드존');
  if(red != '없음') {    
    mg_main.getRange(9+red[0][0], 1+red[0][1], 2, 2)
    .setBorder(true, true, true, true, null, null, '#c84533', SpreadsheetApp.BorderStyle.SOLID_THICK)
    .setBorder(null, null, null, null, true, true, '#c84533', SpreadsheetApp.BorderStyle.DASHED)
    .setBackground('#e6b8af');
  }
  
  // 공중보급 표기부. 공중보급이 캐릭터 앞길을 막는 것을 방지하고자 빨간맛에는 올라설 수 있게 했으므로, 캐릭터 표시전에 공중보급을 먼저 표기한다.
  if(mg_matzip.getLastRow() > 36) { // 기본 맛집수는 33번(배열은 36행까지 씀)인데, 이를 넘는다면 빨간 맛이 새로 생겼다는 얘기임.
    var matzipLocs = mg_matzip.getRange(37, 3, mg_matzip.getLastRow()-36, 5).getValues(); // 빨간맛의 위치를 불러옴 [아이콘, 이름, row, col, 방문가능여부]
    for(var i in matzipLocs) {
      //log(matzipLocs[i][0] + ", " + matzipLocs[i][2] + ", " + matzipLocs[i][3] + ", " + matzipLocs[i][4]);
      // 자기장에 잠기지 않아 방문가능할때만 맛집으로서 표시를 한다.
      if(matzipLocs[i][4] == true) mapSetIcon(matzipLocs[i][0], matzipLocs[i][2], matzipLocs[i][3]);
    }    
  }
}

//////////////////// 플레이어 아이콘 모두 늘어놓기 ////////////////////
function mapSetAllPlayers(player, debug) {
  for(var i in player) {
    if(player[i][11] > 0) {
      //debugConsoleLog(player[i][1]+player[i][2] + "(" + player[i][15] +', '+ player[i][16] +")");
      mapSetIcon(player[i][1], player[i][15], player[i][16], debug); // 🗺️
    }
  }
}
function mapSetAllPlayersByTxt() { // 2차원 배열로 입력되었을 씨 배열 스캔 버전
  
  var player = mg_inf.getRange(92, 23).getValue();
  player = player.split("\n"); // 쪼개고
  for(var i in player) {
    player[i] = player[i].replace( /	/gi, ',').replace( /        /gi, '나').split(","); // 또 쪼갠다.
  }
  mapSetAllPlayers(player, 'infMap');
  
  var mag = readZone('자기장', true);
  var red = readZone('레드존', true); 
  
}

//////////////////// 맵에서 원하는 곳에 아이콘 늘어놓기 ////////////////////
function mapSetIcon(toVal, row, col, debug) {
  if (debug !== undefined && debug == 'infMap') {
    var posRow = 64, posCol = 26, targetDb = mg_inf;
  } else {
    var posRow = 9, posCol = 1, targetDb = mg_main;
  }
  targetDb.getRange(posRow+Number(row), posCol+Number(col)).setValue(toVal); // 🗺️
}

//////////////////// 전체 인원의 정보부를 갱신함 ////////////////////
function refreshPlayerStatAll(player) {
  mg_main.getRange(33, 2, 29, 34).clearContent().clearNote(); // 플레이어란의 내용 및 노트 전부 비우기
  var pls = [];
  for(var i in player) {
    player[i][50] = getScore(player[i]); // 각 플레이어 점수구하기
    pls.push(player[i]); // 점수 구한대로 pls에 넣기
  }
  pls.sort(function(a, b) { return b[50] - a[50]; }); // 점수순으로 내림차순 정렬
  for(var j in pls) pls[j][51] = j;
  for(var k in pls) refreshPlayerStat1Person(pls[k]);
}

//////////////////// 한사람의 정보 전체를 갱신함 ////////////////////
function refreshPlayerStat1Person(pl, targetSheet, row, col, formRequired) { // 🚹
  
  // 전체표시모드인지 검사하여 맞을경우 idx(=표시좌표위치)를 바꿔주기
  if(pl[51] >= 0) var position = pl[51];
  else position = pl[0];
  
  // 디버그모드 검사하여 시트 오브젝트와 좌표변수 다르게 적용
  if (targetSheet === undefined) { // 디버그모드가 아니면
    var d = true;
    var targetSheet = mg_main, row = playerDisplayLocation[position][0], col = playerDisplayLocation[position][1]; // 좌표
  } else d = false;// 디버그모드면, targetSheet row col 모두 호출시 같이 넘어옴.
  
  
  // 플레이어 이름 및 장비정보(탈것,무기,헤드,외투,상의,신발,하의) 리프레시
  if (pl[11] <= 0 && targetSheet === undefined) { // 체력 0이하면 유령만 표시
    var dispArr = [[pl[1], '', pl[2], ''],['', '', '', ''],['👻', '', '', ''],['', '', '', '']];
  } else { // 체력 있으면 정상 스테이터스 표시
    var dispArr = [[((targetSheet !== undefined && pl[11] <= 0)? '👻':pl[1]), '', ((d) ? pl[2] : pl[0]+","+pl[2]), ''],// 아이콘, x, 이름, x
                   ['', '', ((pl[4]>=0)?item[pl[4]][2]:''), ((pl[5]>=0)?item[pl[5]][2]:'') ], // x, x, 무기, 헤드
                   [((pl[3]>=0)?item[pl[3]][2]:''), '', ((pl[6]>=0)?item[pl[6]][2]:''), ((pl[7]>=0)?item[pl[7]][2]:'') ], // 탈것, x, 외투, 상의
                   ['', '', ((pl[8]>=0)?item[pl[8]][2]:''), ((pl[9]>=0)?item[pl[9]][2]:'') ] ]; // x, x, 신발, 하의
  }
  
  if (formRequired !== undefined) { // 폼이 필요하면
    mg_inf.getRange(5, 14, 4, 6).copyTo(targetSheet.getRange(row, col), SpreadsheetApp.CopyPasteType.PASTE_NORMAL);
  }
  
  // 🚹 대상 (row,col) 자리에 모든 정보 붙여넣기
  targetSheet.getRange(row, col, 4, 4).setValues(dispArr);
  
  // 🚹 대상 (row,col) 자리에 소지아이템 정보를 메모로 추가
  var stats = getItmeInfo(pl, 'stats');
  if(stats != '없음') targetSheet.getRange(row, col, 1, 1).setNote(stats);
  
  var equips = getItmeInfo(pl, 'equips');
  if(equips != '없음') targetSheet.getRange(row, col+2, 1, 1).setNote(equips);
  
  var vehicles = getItmeInfo(pl, 'vehicles');
  if(vehicles != '없음') targetSheet.getRange(row+2, col, 1, 1).setNote(vehicles);
  
  // 메모추가가 시간이 무척 오래 걸린다. 생각보다 시간소모가 굉장하다..
  
  // 🚹 HP부 리프레시
  refreshPlayerStatHP(pl, targetSheet, row, col);
  
  // 🚹 가방부 리프레시
  refreshPlayerStatBag(pl, targetSheet, row, col);
}

//////////////////// 한사람의 HP를 갱신함 ////////////////////
function refreshPlayerStatHP(pl, targetSheet, row, col) { // 🚹

  // 초기 DB 로딩
  var idx = Number(pl[0]), maxHP = Number(pl[10]), currHP = Number(pl[11]);
  
  // 디버그모드 검사하여 시트 오브젝트와 좌표변수 다르게 적용
  if (targetSheet === undefined) { // 디버그모드가 아니면
    targetSheet = mg_main;
    var row = playerDisplayLocation[idx][0], col = playerDisplayLocation[idx][1];
  } // 디버그모드면, targetSheet row col 모두 호출시 같이 넘어옴.
  
  // 🚹 최대HP에 따라 배경색을 다르게 적용
  if(currHP <= 0) { // 당장 현재HP가 없으면 검은맛 세칸
    targetSheet.getRange(row+1, col+4, 3, 1).setBackground("#444444");
  } else switch(maxHP) {
    case 3: // 빨간배경 세칸
      targetSheet.getRange(row+1, col+4, 3, 1).setBackground("#c84533");
      break;
    case 2: // 검은맛 한칸 빨간배경 두칸
      targetSheet.getRange(row+1, col+4, 1, 1).setBackground("#444444");
      targetSheet.getRange(row+2, col+4, 2, 1).setBackground("#c84533");
      break;
    case 1: // 검은맛 두칸 빨간배경 한칸
      targetSheet.getRange(row+1, col+4, 2, 1).setBackground("#444444");
      targetSheet.getRange(row+3, col+4, 1, 1).setBackground("#c84533");
      break;
  }
  
  // 🚹 현재HP에 따라 이모지 적용
  var hp = [];
  switch(currHP) {
    case 3: hp = [["❤️"], ["❤️"], ["💟"]]; break;
    case 2: hp = [[""], ["❤️"], ["💟"]]; break;
    case 1: hp = [[""], [""], ["💟"]]; break;
    case 0: hp = [[""], [""], [""]]; break;
    default: case -1: hp = [[""], [""], ["💟"]]; break;
  } 
  targetSheet.getRange(row+1, col+4, 3, 1).setValues(hp);
}

//////////////////// 한사람의 가방 정보를 갱신함 ////////////////////
function refreshPlayerStatBag(pl, targetSheet, row, col) { // 🚹
  // 각종 정보 가져오기
  var playerBag = pl[12], playerIdx = pl[0]; // 플레이어 위치 가져오기
  
  // 디버그모드 검사하여 시트 오브젝트와 좌표변수 다르게 적용
  if (targetSheet === undefined) { // 디버그모드가 아니면
    targetSheet = mg_main;
    var row = playerDisplayLocation[playerIdx][0], col = playerDisplayLocation[playerIdx][1]; // 디스플레이 위치 정의
  } // 디버그모드면, targetSheet row col 모두 호출시 같이 넘어옴.
  
  // 가방이 있다면 가방정보 가져옴
  if(playerBag != 'x') {
    var bagItem = item[pl[12]], bagIcon = bagItem[2], bagSize = bagItem[3]; // 가방 정보 가져옴
    var item1Idx = pl[13], item2Idx = pl[14]; // 보관물 정보 가져옴
    //log("가방 정보 가져오기 - 가방 "+pl[12] + bagIcon+"@"+bagSize+"칸짜리 잇음("+item1Idx+","+item2Idx+")");
  } else {
    var bagItem = false; // 가방 없으면 글렀음
    //log("가방이 없음");
  }

  //log("가방보유여부를 보자");
  if(bagItem === false) { // 🚹 가방보유 안하면 세칸 다 꺼멓게 만들고 내용물 빈칸으로 채워넣음
    //log("가방 없어서 업는처리"); 
    targetSheet.getRange(row+1, col+5, 3, 1).setBackground("#444444").setValue("");//.setBorder(null, null, null, true, null, null, "#3d4e44", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
  } else { // 가방보유 하면
    //log("가방 있어서 있는처리 : 배경색 칠하기"); 
    // 1. 내용물 칠하기
    switch(bagSize) {
      case 1: // 한칸 블랙 두칸 황색
        targetSheet.getRange(row+1, col+5, 1, 1).setBackground("#444444");//.setBorder(null, null, null, true, null, null, "#3d4e44", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
        targetSheet.getRange(row+2, col+5, 2, 1).setBackground("#a69153");//.setBorder(null, null, null, true, null, null, "#3d4e44", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
        break;
      case 2: // 세칸 황색
        targetSheet.getRange(row+1, col+5, 3, 1).setBackground("#a69153");//.setBorder(null, null, null, true, null, null, "#3d4e44", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
        break;
    }
    
    // 2. 🚹 가방 내용물 늘어놓기
    var item1Icon = (bagSize >= 1 && item1Idx != 'x') ? item[item1Idx][2]: "";
    var item2Icon = (bagSize >= 2 && item2Idx != 'x') ? item[item2Idx][2]: "";
    if(playerBag != 'x') targetSheet.getRange(row+1, col+5, 3, 1).setValues([[item2Icon], [item1Icon], [bagIcon]]);
  }
}

///////////////// 주변 8방향 스테이터스: 계기판에 입력된 idx에 따라 대상과 주변 8방향 사람들의 스텟을 표시함. ///////////
function debug8locationStatus() {  
  var r = 15 // 스테이터스 표시부 기준점임
  var c = 2 // 스테이터스 표시부 기준점임
  var locRows = [r, r, r+4, r+8, r+8, r+8, r+4, r];
  var locCols = [c+6, c+12, c+12, c+12, c+6, c, c, c];
  
  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues(); // 플레이어 행렬 로딩
  var plIdx = mg_inf.getRange(r-2, c+4).getValue(); // 주인공 idx
  
  mg_inf.getRange(r, c, 12,18).clearContent(); // 청소
  refreshPlayerStat1Person(player[plIdx], mg_inf, r+4, c+6); // 일단 가운데는 하나 표시
  for(var i=0; i<8; i++) {
    var shifted = shiftedLoc(player[plIdx][15], player[plIdx][16], i);
    var row = shifted[0], col = shifted[1];
    for(var j in player) {
      if(player[j][15] == row && player[j][16] == col) {
        refreshPlayerStat1Person(player[j], mg_inf, locRows[i], locCols[i]);
      }
    }
  }
  
  // 어그로 비우기
  mg_inf.getRange(r+14,c+9).clearContent(); 
  
  // 방향별 [어그로총점, "사람아이콘 스코어1 스코어2 스코어3 스코어4 공격어그로점수"] 얻음
  var aggroList = getAttTarget(plIdx, player, true);
  
  // 3. for문 다 빠져나왔으면 근접자 공격어그로 순위를 점수 내림차순으로 정렬 ([0] = 공격어그로가 가장 높은놈)
  if(aggroList != 'noone') {
    aggroList.sort( function(a, b) { return b[0] - a[0]; } );
    var texted1 = '', texted2 = '';
    for(var k in aggroList) {
      if(k == 0) texted1 += aggroList[k][1];
      else if(k < 4 && k > 0) texted1 += '\n' + aggroList[k][1];
      else if(k == 4) texted2 = aggroList[k][1];
      else if(k < 8) texted2 += '\n' + aggroList[k][1];
    }    
    mg_inf.getRange(r+14,c).setValue(texted1); // 어그로 표시
    mg_inf.getRange(r+14,c+9).setValue(texted2); // 어그로 표시
  }
}

///////////////// 계기판에 입력된 idx에 따라 대상의 스텟을 표시함. ///////////
function debugShowStatsByIdx() { // idx 버전
  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
  var idx = mg_inf.getRange(6, 2).getValue();
  //Browser.msgBox("idx는 " + idx + "이고, 배열값은" + player[idx] + "입니다.");
  refreshPlayerStat1Person(player[idx], mg_inf, 5, 14);
}
function debugShowStatsByTxt() { // 배열 버전
  var pl = mg_inf.getRange(6, 4).getValue();
  pl = pl.split(",");
  
  refreshPlayerStat1Person(pl, mg_inf, 5, 14);
}

// 디버그콘솔창에 캐릭터 스탯 남김
function logChar(player) {
  var row = mg_inf.getRange(4, 71).getValue();
  refreshPlayerStat1Person(player[0], mg_main, row, 39, true);
  refreshPlayerStat1Person(player[1], mg_main, row, 45, true);
  refreshPlayerStat1Person(player[2], mg_main, row, 51, true);
  refreshPlayerStat1Person(player[3], mg_main, row, 57, true);
  mg_inf.getRange(4, 71).setValue((Number(row)+4));
}

//////////////////// 계기판에 플레이어1,2 입력한거 전투정보 표시 ////////////////////
function battleDebug() {
  var t = 0;
  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues(); // 플레이어 로드 (버튼눌러 실행하기때문에 player 따로 불러줘야됨)
  var row = 5, col = 21;
  var attr = mg_inf.getRange(row+2,col).getValue(); // 공격자 idx
  var defr = mg_inf.getRange(row+2,col+2).getValue(); // 방어자 idx
  var attacker = player[attr]; // 공격자 배열 로드
  var defender = player[defr]; // 방어자 배열 로드
  mg_inf.getRange(row, col, 9, 25).clearContent(); // 전체 지우기
  refreshPlayerStat1Person(attacker, mg_inf, row, col+8); // 공격자 스탯창 갱신
  refreshPlayerStat1Person(defender, mg_inf, row, col+16); // 방어자 스탯창 갱신
  mg_inf.getRange(row, col+14).setValue(">>"); // 안내화살표 써넣기
  var perc = attacker[11] * fightPerHP; // 체력에 따른 보너스 전투시도율
  mg_inf.getRange(row,col).setValue("idx 입력"); //
  mg_inf.getRange(row+1,col).setValue("공격자"); //
  mg_inf.getRange(row+1,col+2).setValue("방어자"); // 
  mg_inf.getRange(row,col+4).setValue("계산하기"); // 
  mg_inf.getRange(row,col+4).setValue("계산하기"); // 
  mg_inf.getRange(row+2,col).setValue(attr);
  mg_inf.getRange(row+2,col+2).setValue(defr);
  mg_inf.getRange(row,col+23).setValue("전투발생률\n자기장고려x"); // "전투발생률"이라고 써넣기
  mg_inf.getRange(row+2,col+23).setValue(perc + "%"); // 전투발생률 써넣기
  var att = battleAcc(attacker, defender, 'adv', 'debug'); // 공격자 습격 성공률 계산
  var rev = battleAcc(defender, attacker, 'rev', 'debug'); // 방어자 반격 성공률 계산
  mg_inf.getRange(row+5, col, 4, 1).setValues([[att[0]], [att[1]], [rev[0]], [rev[1]]]); // 공격자-방어자 계산결과 모두 결과창에 표시
}

/////////////////// 생존자 표시부를 업데이트함. //////////////////
function refreshTotalLives(player) {
  if(player === undefined) var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
  var lives = 0; for(var i in player) if(player[i][11] > 0) lives++; // HP 1 이상있는놈 명수 (생존자 명수)
  mg_main.getRange(7, 9).setValue(lives); // player 변수체크용으로 불러온김에 생존자 명수 업데이트
}

/////////////////// 플레이어가 소지중인 아이템에 대한 설명리스트를 여러행의 문자열 형태로 돌려줌. //////////////////
function getItmeInfo(pl, type) {
  
  var idx = mg_inf.getRange(6, 2).getValue();
  var power = getAttDef(pl);
  var p = ["", "★", "★★", "★★★"];
  
  var txt = '없음';
  
  switch(type) {
    case 'stats':
      if(pl[11] > 0) {
        if(pl[12] != 'x') { // 가방처리
          var healitems = 0, buffitems = 0;
          if(pl[12] != 'x') {
            if(pl[13] != 'x') if(item[pl[13]][1] == '회복') healitems++; else buffitems++;
            if(pl[14] != 'x') if(item[pl[13]][1] == '회복') healitems++; else buffitems++;
          }
          txt = "【🍖" + healitems + "⚙️" + buffitems + "】 " + item[pl[12]][2] + item[pl[12]][4] + p[item[pl[12]][3]];
          if(pl[13] != 'x') { // 템1
            txt += " [ " + item[pl[13]][2] + item[pl[13]][4] + " " ;
            if(item[pl[13]][3] >= 0) txt += p[Number(item[pl[13]][3])];
            else txt += item[pl[13]][3];
          }
          if(pl[14] != 'x') { // 템2
            txt += " / " + item[pl[14]][2] + item[pl[14]][4] + " " ;
            if(item[pl[14]][3] >= 0) txt += p[Number(item[pl[14]][3])];
            else txt += item[pl[14]][3];
          }
          txt += " ]";
        }
        txt += " / 【현재】 " + pl[17]; // 이동중 방향 텍스트 추가
      } else txt = '없음';
      break;
    case 'equips':
      txt = "【⚔️" + power[0] + "🛡️️️️️" + power[1] + "】 " ; // 강함
      var txtlength = 0;
      if (pl[4] >= 0 || pl[5] >= 0 || pl[6] >= 0 || pl[7] >= 0 || pl[8] >= 0 || pl[9] >= 0 ) {
        if(pl[4] >= 0) { txt += item[pl[4]][2] + item[pl[4]][4] + " " + p[item[pl[4]][3]]; txtlength++; } // 무기
        if(pl[5] >= 0) { if(txtlength > 0) txt += ' / '; txt += item[pl[5]][2] + item[pl[5]][4] + " " + p[item[pl[5]][3]]; txtlength++; } // 헤드
        if(pl[6] >= 0) { if(txtlength > 0) txt += ' / '; txt += item[pl[6]][2] + item[pl[6]][4] + " " + p[item[pl[6]][3]]; txtlength++; } // 외투
        if(pl[7] >= 0) { if(txtlength > 0) txt += ' / '; txt += item[pl[7]][2] + item[pl[7]][4] + " " + p[item[pl[7]][3]]; txtlength++; } // 상의
        if(pl[8] >= 0) { if(txtlength > 0) txt += ' / '; txt += item[pl[8]][2] + item[pl[8]][4] + " " + p[item[pl[8]][3]]; txtlength++; } // 신발
        if(pl[9] >= 0) { if(txtlength > 0) txt += ' / '; txt += item[pl[9]][2] + item[pl[9]][4] + " " + p[item[pl[9]][3]]; txtlength++; } // 하의
      }
      if(txtlength == 0) txt = '없음';
      break;
    case 'vehicles':
      if(pl[3] != 'x') txt = "【👣" + item[pl[3]][3] + "】 " + item[pl[3]][2] + item[pl[3]][4] + "x" + pl[18]+ " " + p[item[pl[3]][3]]; // 탈것
      else txt = '없음';
      break;
    default: txt = ''; break;
  }

  if (txt == '없음') return '없음';
  else return txt;
  
}

////////////// 플레이어의 강력함 총점을 구함 ////////////////
function getScore(pl) {
  var score = 0;
  if(pl[11] > 0) { // 체력이 있을경우
    var ad = getAttDef(pl); // 공/방력을 구함
    score += ad[0] * 10; // 공격력 점수
    score += ad[1]; // 방어력 점수
    score += pl[11] * 5; // 체력 점수
    if(pl[13] != 'x') score += 4; // 여유템1 점수
    if(pl[14] != 'x') score += 4; // 여유템2 점수
    if(pl[3] != 'x') score += 2; // 탈것 점수
  }
  return score;
}
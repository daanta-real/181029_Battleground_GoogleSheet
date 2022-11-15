function loot(idx, player, matzip) {

  // 루팅리스트 배열은 무조건 2차원으로 처리해야됨. 탈것 잔여이동횟수 관련처리및 차후 성장아이템 업데이트를 위해서임
  // [득템배열(2차원), 득템로그txt, 변경된 플레이어DB 정보] 리턴해야됨

  //debugConsoleLog("득템루틴 시작. 약탈부 시작");
  var lootlist1 = rob(idx, player); // 약탈부 실행하고, 약탈 결과가 있으면 [lootlist(2차원배열), texts(배열), player]을, 없으면 false를 회신받음
  if(lootlist1 != "실패") {
    //debugConsoleLog("소루틴1 약탈, 성공"); //var looted = lootlist1[0]; for (i in looted) log(i+"번째 약탈물: "+looted[i]); // 로그
    //for(var i in lootlist1[1]) log("소루틴1 루팅메세지: '" + lootlist1[1][i] + "'"); // 로그
    return [lootlist1[0], lootlist1[1], lootlist1[2], matzip];
  } // 약탈 결과물이 있다면 약탈 결과물, 로그, 변경된 플레이어DB를 회신하고 득템루틴을 종료.
  
  //debugConsoleLog("약탈부 실패. 파밍부 시작");
  var lootlist2 = farming(idx, player, matzip); // 약탈 못했다면, 파밍부 실행되고, 파밍 결과가 있으면 [lootlist(2차원배열), texts(배열), player, matzip]을, 없으면 '실패'를 회신받음
  if(lootlist2 != "실패") { 
    //debugConsoleLog("소루틴2 파밍, 성공"); //var looted = lootlist2[0]; for (i in looted) log(i+"번째 파밍물: "+looted[i]); // 로그
    //for(var i in lootlist2[1]) log("소루틴2 루팅메세지: '" + lootlist2[1][i] + "'"); // 로그
    return [lootlist2[0], lootlist2[1], lootlist2[2], lootlist2[3]];
  } // 파밍 결과물이 있다면 파밍 결과물, 로그, 변경된 플레이어DB를 회신하고 득템루틴을 종료.
  
  //debugConsoleLog('약탈부, 파밍부 실패. 탐색부로 넘어갑니다');
  var lootlist3 = searchField(idx, player); // 약탈도 파밍도 못했다면, 탐색 실행하고, 탐색 결과가 있으면 루팅리스트(2차원 배열)을, 없으면 false를 회신받음
  if(lootlist3 != "실패") { 
    //debugConsoleLog("소루틴3 탐색, 성공"); //var looted = lootlist3[0]; for (i in looted) log(i+"번째 발견물: "+looted[i]); // 로그
    //for(var i in lootlist3[1]) log("소루틴3 루팅메세지: '" + lootlist3[1][i] + "'"); // 로그
    return [lootlist3[0], lootlist3[1], lootlist3[2], matzip]; 
  } // 탐색 결과물이 있다면 탐색 결과물을 모아서 득템을 마침.
  
  //debugConsoleLog('소루틴 다 실패. 득템부, 약탈부, 파밍부 다 실패했습니다.');
  return [[], '없음', player, matzip]; // 약탈도, 파밍도, 탐색도 실패할 경우 실행됨. [false, 로그 없음, player, 맛집]을 리턴함.
}

//////////////////// 소루틴 1. 약탈부 ////////////////////
// 약탈부 실행하고, 약탈할거 있으면 루팅리스트(2차원 배열)을, 없으면 false를 회신받음
function rob(idx, player) {
  var lootlist = [];  // 바구니 준비
  var pl = player[idx]; // 플레이어 준비
  var texts = []; // 텍스트 배열들 준비
  var listFounded = false;
  
  for(var i in player) {
    if (player[i][26] == idx && player[i][26] != 'x') { // 정벌자idx가 false가 아니고 정확히 해당 플레이어 idx로 기록되어 있는 모든 시체에 대해
      //log(player[i][1] + player[i][2] + "를 약탈할 수 있습니다.");
      var loots = []; // 플레이어별 털어낸 물건담는 자그만바구니 2차원배열
      listFounded = true;
      if(player[i][3] >= 0 ) { loots.push([player[i][3],player[i][18]]); player[i][3] = 'x'; } // 🅾️ 탈것 발견되면 바구니에 넣고 내구도는 참고하며, 시체에서는 존재를 지운다.
      if(player[i][4] >= 0 ) { loots.push([player[i][4]]); player[i][4] = 'x'; } // 🅾️ 무기 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][5] >= 0) { loots.push([player[i][5]]); player[i][5] = 'x'; } // 🅾️ 헤드 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][6] >= 0) { loots.push([player[i][6]]); player[i][6] = 'x'; } // 🅾️ 외투 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][7] >= 0) { loots.push([player[i][7]]); player[i][7] = 'x'; } // 🅾️ 상의 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][8] >= 0) { loots.push([player[i][8]]); player[i][8] = 'x'; } // 🅾️ 신발 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][9] >= 0) { loots.push([player[i][9]]); player[i][9] = 'x'; } // 🅾️ 하의 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][12] >= 0) { loots.push([player[i][12]]); player[i][12] = 'x'; } // 🅾️ 가방 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][13] >= 0) { loots.push([player[i][13]]); player[i][13] = 'x'; } // 🅾️ 보관품1 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      if(player[i][14] >= 0) { loots.push([player[i][14]]); player[i][14] = 'x'; } // 🅾️ 보관품2 발견되면 바구니에 넣고 시체에서는 존재를 지운다.
      lootlist = lootlist.concat(loots); // 큰바구니에 자그만 바구니 2차원 배열 한행 한행 추가한다.
      var loottext = ''; for(var j in loots) loottext += item[loots[j][0]][2]; // 루팅한 아이템 목록 보기좋게 바꾼 loottext 문자열을 준비함
      if (loottext != '') texts.push(pl[1] + pl[2] + ": 약탈 (" + loottext + ") ➰ " + player[i][1] + player[i][2] + "⚰️️️⚰️️️⚰️️️"); // ✅ 약탈 한번에 한'줄'씩 추가
      //log('약탈을 완료하였습니다.');
      player[i][26] = 'x'; // 🅾️ 루팅이 다 끝났으므로 DB에서 정벌자idx를 지워 중복 루팅을 방지한다.
    }
  }
  
  if (listFounded == true) {
    //log("1명 이상을 털었습니다.");
    player[idx][22] += lootlist.length; // 줏은만큼 줍수 증가
    return [lootlist, texts, player]; // 루팅 한개이상 만들어진다면 루팅된 목록을 리턴.
  } else return "실패"; // 루팅한게 전혀 없으면 (루팅리스트 2차원 배열이 전혀 없으면) false를 리턴.
}

//////////////////// 소루틴 2. 파밍부: 옆에 근접한 장소가 있으면 일반 파밍 (없으면 false 회신) ////////////////////
function farming(idx, player, matzip) {
  var lootlist = []; // 바구니 준비
  var pl = player[idx]; // 현재플레이어
  var texts = []; // 회신할 텍스트 (1차원 배열)
  var listFounded = false;
  
  // (일단 주변 8칸 내의 + 아직 파밍하지 않은) 맛집 idx 리스트들을 만들어본다.
  var matziplist = [];
  for(var i in matzip) {
    if (Math.abs(pl[15]-matzip[i][4]) <= 1 && Math.abs(pl[16]-matzip[i][5]) <= 1 && matzip[i][7+Number(idx)] === true ) matziplist.push(i);
    if(i == 30) {
      //debugConsoleLog("노보와의 거리: row " + Math.abs(pl[15]-matzip[i][4]) + ', col ' + Math.abs(pl[16]-matzip[i][5]) + ", matzip[i]["+(7+idx)+"] = " +matzip[i][7+idx]);
      //debugConsoleLog(player[idx][1]+player[idx][2]+"의 가까운 파밍리스트 " + i + "번: " + matzip[i][2] + matzip[i][3] + (matzip[i][7+idx] == true));
    }
  }
  //debugConsoleLog(player[idx][1]+player[idx][2]+"의 파밍리스트: " + matziplist.length + "개 (" + matziplist.join(",") + ")");
  
  // 맛집리스트가 있다면 랜덤아이템 바구니에 담는 단계 실행.
  if(!isEmpty(matziplist)) {
    listFounded = true;
    // 맛집리스트 중 랜덤한 idx 하나를 골라 p로 삼는다.
    var p = randomItem(matziplist);

    // 1개 혹은 2개 랜덤하게 파밍해온다. xxxxxxx 밸런스 문제로 수정함
    var rndNum = 1; //밸런스문제로 수정 //Math.floor(Math.random() * 2)+1; // (0~1랜덤 * 2) = 0~1.999999가 되고, 이를 floor로 내리면 0 or 1임. 여기서 +1 하면 1 or 2 가 됨.
    var looticons = '';
    for(var j = 0; j < rndNum; j++) {
      var gainedItem = getRandomItem(pl); // 랜덤아이템 구함
      lootlist = lootlist.concat([gainedItem]); // 랜덤아이템 파밍한거 바구니에 담음. 변수가 여러개일 경우 한꺼번에 여러개를 담게된다.
      looticons += item[gainedItem[0]][2]; // 보기좋은 문자열 만들기
    }
    texts = pl[1] + pl[2] + ": 파밍 완료 (" + looticons + ") @ " + matzip[p][2]+ matzip[p][3]; // ✅ 1~2개 아이템을 파밍한 결과를 로그로 남김'

    // 🅾️ 파밍이 끝난 뒤 맛집에 false 표시를 한다.
    matzip[p][7+Number(idx)] = false;
  }

  if (listFounded == true) {
    player[idx][22] += lootlist.length; // 줏은만큼 줍수 증가
    return [lootlist, texts, player, matzip]; // 루팅 한개이상 만들어진다면 루팅된 목록을 리턴.
  } else return "실패"; // 루팅한게 전혀 없으면 (루팅리스트 2차원 배열이 전혀 없으면) false를 리턴.
}

//////////////////// 소루틴 3. 탐색부: 5% 확률로 랜덤아이템 하나를 얻은 바구니를 회신 (없으면 false 회신) //////////
function searchField(idx, player) {
  var lootlist = []; // 바구니 준비
  var pl = player[idx];
  var texts = '';
  var listFounded = false;
  if(randomPercent(5) == true) { // 확률(5%)이 TRUE로 실현되면
    listFounded = true;
    lootlist[0] = getRandomItem(player[idx]); // 랜덤아이템을 한개를 장바구니에 받아옴
    texts = pl[1] + pl[2] + ": 새 아이템을 발견! (" + item[lootlist[0][0]][2] + ")"; // ✅ 발견된 한개의 아이템에 대해 문구 추가
    //log('필드서치결과 문구 추가예약: ' + texts);
  }
  
  if (listFounded == true) {
    player[idx][22] += lootlist.length; // 줏은만큼 줍수 증가
    return [lootlist, texts, player]; // 루팅 한개이상 만들어진다면 루팅된 목록을 리턴.
  } else return "실패"; // 루팅한게 전혀 없으면 (루팅리스트 2차원 배열이 전혀 없으면) false를 리턴.
}

/////////// 랜덤한 아이템 1개를 담은 "2차원배열" 한행을 회신함 /////////
function getRandomItem(pl) {

  if(pl[12] == 'x' && randomPercent(20) == true) var newItem = randomItem([28, 29]);   // 가방 없는 사람들 20% 확률로 1렙가방 중 하나 획득
  else { // 가방이 있으면 비율에 따라 아이템 획득
    //debugConsoleLog(pl[1]+pl[2]+"는 가방을 " + pl[12] + '하고있는데, 아무튼 20%확률에 안걸려서 랜덤아이템을 추첨합니다.');
    var ppobki = Math.random() * 100; // 0 ~ 99.999 랜덤
    if(ppobki >= 0 && ppobki < 5) { var newItem = randomItem(itemList_head); /*debugConsoleLog(pl[1]+pl[2]+"는 헤드 " +newItem+"번을 얻는다");*/} // 헤드
    else if(ppobki >= 5 && ppobki < 10) { var newItem = randomItem(itemList_outer); /*debugConsoleLog(pl[1]+pl[2]+"는 외투 " +newItem+"번을 얻는다");*/ } // 외투
    else if(ppobki >= 10 && ppobki < 15) { var newItem = randomItem(itemList_upper); /*debugConsoleLog(pl[1]+pl[2]+"는 상의 " +newItem+"번을 얻는다");*/ } // 상의
    else if(ppobki >= 15 && ppobki < 20) { var newItem = randomItem(itemList_shoes); /*debugConsoleLog(pl[1]+pl[2]+"는 신발 " +newItem+"번을 얻는다");*/ } // 신발
    else if(ppobki >= 20 && ppobki < 25) { var newItem = randomItem(itemList_lower); /*debugConsoleLog(pl[1]+pl[2]+"는 하의 " +newItem+"번을 얻는다");*/ } // 하의
    else if(ppobki >= 25 && ppobki < 35) { var newItem = randomItem(itemList_weapon); /*debugConsoleLog(pl[1]+pl[2]+"는 무기 " +newItem+"번을 얻는다");*/ } // 무기
    else if(ppobki >= 35 && ppobki < 45) { var newItem = randomItem(itemList_talgut); /*debugConsoleLog(pl[1]+pl[2]+"는 탈것 " +newItem+"번을 얻는다");*/ } // 탈것
    else if(ppobki >= 45 && ppobki < 84.5) { var newItem = randomItem(itemList_heal); /*debugConsoleLog(pl[1]+pl[2]+"는 회복 " +newItem+"번을 얻는다");*/ } // 회복
    else if(ppobki >= 84.5 && ppobki < 99.5) { var newItem = randomItem(itemList_bag); /*debugConsoleLog(pl[1]+pl[2]+"는 가방 " +newItem+"번을 얻는다");*/ } // 가방
    else if(ppobki >= 99.5 && ppobki < 100) { var newItem = randomItem(itemList_guitar); /*debugConsoleLog(pl[1]+pl[2]+"는 기타 " +newItem+"번을 얻는다");*/ } // 기타
    else { var newItem = Math.floor(Math.random() * item.length); /*debugConsoleLog(pl[1]+pl[2]+"는 랜덤아이템 " +newItem+"번을 얻는다");*/ } // 그게 아니면 올랜덤 *버그방지용
  }

  // 아이템 종류에 따라 아이템정보를 만듬
  var theItem = makeItemInfo(newItem); 
  
  //log("랜덤획득아이템[0] = " + theItem[0] + (!isEmpty(theItem[1])? "랜덤획득아이템[1] = " + theItem[1] : ''));
  return theItem; // 만들어진 랜덤아이템 리스트를 회신
}



// 시트로부터 각 스터디원의 '이름', '전날 공부량 마크'를 추출하고, 이에 따라 선물박스에 선물을 넣어줌
// 일일 1회 실행 트리거로 돌리는 함수기 때문에, on/off/done/haven't done 이런 트리거 스위치를 따로 체크하지 않아도 된다.
// 몇 시에 실행할지는 아직 모르겠다.
function present() {

  // 기본 변수 준비
  var player = mg_player.getRange(3, 1, mg_player.getLastRow()-2, mg_player.getLastColumn()).getValues();
  var logtxt = [];
  
  // 시트에서 데이터 읽어옴
  sheetCleaning(); // 시트청소
  var sheeters = sh_study.getRange(8, 3, 30, 2).getValues(); // 시트내의 전날 기록을 읽어옴. [공부마크, 이름] 순
  var currTurn = mg_main.getRange(7, 5).getValue(); // 게임상태 변수 (턴수에 따라 행동변화) - present 함수가 별도실행되는 놈이다보니 어쩔수없이 새로 읽어와야힘
  //debugConsoleLog(doubleArrayToText(sheeters)); // 시트에서 읽어온 정보 콘솔에 표시
  
  for(var i in sheeters) {
    // 기본 변수 준비
    var name = sheeters[i][1];
    var studied = sheeters[i][0];
    
    // 축복주기
    for(var j in player) if(player[j][2] == name && player[j][11] > 0) { // 플레이어별로 점검하여, j번재 플레이어가 해당 네임에 맞을경우에만 축복 시행
      // 1. 공부량에 따라 선물상자에 선물을 담음
      if(studied == "🔥" || studied == "📖" || studied == "·") {
        // 첫 번째 축복: 공통 축복: HP+1. 10번 = 최대HP, 11번 = 현재HP
        if(player[j][11] < player[j][10]) {
          player[j][11]++; // 1) 더 채울 HP가 있을 경우, 현재HP +1 하고 끝냄
          logtxt.push([player[j][1] + player[j][2] + ": 스터디에 출석체크를 하여 축복을 받았다! (❤️️+1)", currTurn, player[j][0]]);
        } else if (player[j][11] == player[j][10] && player[j][10] < 3) {
          player[j][10]++; // 2) HP가 꽉 찼으면, 더 늘릴 HP가 있을 경우 최대HP +1 을 해줌
          logtxt.push([player[j][1] + player[j][2] + ": 스터디에 출석체크를 하여 축복을 받았다! HP + 💖 / 최대 HP가 1 늘어났다!", currTurn, player[j][0]]);
        }
      }
      if(studied == "🔥" || studied == "📖") {
        // 두 번째 축복: 공부한사람 축복
        var rndItm = getRandomItem(player[j]);
        player[j][27] = rndItm;
        logtxt.push([player[j][1] + player[j][2] + ": 공부를 열심히 하여 랜덤한 아이템도 받았다! 어서 열어보자!", currTurn, player[j][0]]);
        //debugConsoleLog(player[j][1]+player[j][2]+": 첫 번째 랜덤아이템 '" + rndItm + "' 획득");
      }
      if(studied == "🔥") {
        // 세 번째 축복: 공부 많이한사람 축복
        var rndItm2 = getRandomItem(player[j]);
        player[j][28] = rndItm2;
        logtxt.push([player[j][1] + player[j][2] + ": 공부를 엄청나게 열심히 하여 랜덤한 아이템을 또또 받았다! 어서 열어보자!", currTurn, player[j][0]]);
        //debugConsoleLog(player[j][1]+player[j][2]+": 두 번째 랜덤아이템 '" + rndItm2 + "' 획득");
      }
    }
    // 축복주기 끝
    
  }
  // 플레이어별 축복 끝
  if(logtxt.length > 0) log(logtxt); // 로그가 있으면 출력
  db_rewrite(mg_player, player); // 변경된 플레이어 내용을 DB 전체에 덮어쓴다.
}


/////////// 아이템 idx에 따라 그에 맞는 2차원 정보배열을 리턴함 ////////
function makeItemInfo(idx) {
  
  switch(idx) {
    case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: // 탈것일 경우
      var theItem = [idx, vehicleTimes]; // [탈것idx, 남은탑승횟수] 2차원 배열 한행 생성
      break;
    case 87: // 탈것 중 변기통일 경우
      var theItem = [idx, 1]; // [탈것idx, 남은탑승횟수 1] 2차원 배열 한행 생성
      break;
      // 💟💟 성장아이템일 경우 여기서 처리하면 된다.
    default: // 일반아이템의 경우
      var theItem = [idx]; // [아이템idx] 2차원 배열 한행 생성
      break;
  }
  return theItem;
  
}
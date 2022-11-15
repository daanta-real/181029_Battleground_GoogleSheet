// 루프 2. loop_player(플레이어별 행동처리)
///////////////// 각 플레이어에 대해 행동권을 부여하여 턴을 진행시킨다. //////////////
/////////////// 랜덤 선정한 플레이어에게 P1(전투부) > P2(득템부) > P3(정비부) > P4(이동부) 순으로 행동시키는 것을 모든 플레이어에게 행한다.
/////////////// 당연히 한번 행동한 플레이어는 두번 행동하지는 안흠
function loop_player(player, matzip, currTurn) {
  
  // 플레이어별 턴 실행할 순서가 될 배열 idx 리스트 playOrder를 만든다.
  var playOrder = []; for (var i in player) playOrder[i] = player[i][0];
  
  // idx만으로 이루어진 배열을 랜덤 쏠팅한다.
  playOrder.sort(function() { return Math.random() - Math.random(); });
  
  // 모든 로그를 담는 대 루틴 텍스트
  var logtxt = [];
  var playerText = [];
  
  // 디버그시 이부분 주석 빼고 활성화시킬것.
  var debug = false;//'on';
  //var playOrder = []; playOrder[0] = 16;
  
  for(var i in playOrder) {
    // var plNum = 1; while(1){ //디버그
    // 루틴 0️⃣ 시작. 텍스트 준비
    logtxt = [];
    var plNum = playOrder[i];
    
    if(player[plNum][11] > 0) { // 살아있는 애한테만 실시함. 죽은애한테는 아무것도 실시하지 않음
      //log(doubleArrayToText(player[plNum])+player[plNum].length+logtxt.length);
      //logChar(player[plNum]);
      if(debug == 'on') log(player[plNum][1] + player[plNum][2] + ': 턴 시작 (idx = ' + player[plNum][0] + ')');
      
      // 루틴 1️⃣. 전투 구현
//      if(debug == 'on') { log("1️⃣대루틴 전투부 진입"); log("루틴텍스트: " + logtxt.length + "개"); }
      var fight = battle(plNum, player, currTurn); // 플레이어 plNum번 전투처리하고, [전투로그 txt, 변경된 플레이어DB 정보] 리턴받음
      logtxt = logtxt.concat(fight[0]); // 전체 로그텍스트에 공격한 결과기록 한줄 추가 (fight[0]);
      player = fight[1]; // 🅾️ battle 함수에서 변경한 플레이어 정보 갱신 반영함 (fight[1])
      // 플레이어 변수 늘어놓기
/*      if(debug == 'on' && fight[0] != '없음') {
        log("sysmsg 루틴 1️⃣. 전체 " + logtxt.length + "줄, 전투부 추가분 " + fight[0].length + '줄)');
        log(fight[0]); // 전투부 로그 기록 예정 메세지 표시
        log('1️⃣대루틴 전투부 종료, 플레이어 변수 늘어놓기 시작');
        log(doubleArrayToText(player[plNum])+player[plNum].length+logtxt.length);
      }
*/
      if(player[plNum][11] > 0) { // 플레이어가 전투 후에도 살아있을 때만 다음 루틴 실시하라는 것. <시작>

        // 루틴 2️⃣. 득템 구현
//        if(debug == 'on') { log("2️⃣대루틴 득템부 진입"); log("루틴텍스트: " + logtxt.length + "개"); }
        var looted = loot(plNum, player, matzip); // 플레이어 plNum번 득템하고[득템정보목록(2차원), 득템로그txt, 변경된 플레이어DB 정보, 변경된 맛집정보] 리턴받음 특히 맛집정보는 방문여부 false로 변하는것도 있기때문에 꼭 챙겨야됨
        var lootedItemList = looted[0]; // 루팅한 아이템 목록을 담는 변수 (2차원배열)
        if(looted[1] != '없음') {
          logtxt = logtxt.concat(looted[1]); // 전체 로그텍스트에 득템로그 추가 (looted[1])
/*          if(debug == 'on'){
            log("sysmsg 루틴 2️⃣. 전체 " + logtxt.length + "줄, 득템부 추가분 " + looted[1].length + '줄)');
            log(looted[1]); // 득템부 로그 기록 예정 메세지 표시
          }
*/        }
        player = looted[2]; // 🅾️ moved 함수에서 변경한 플레이어 정보 갱신 반영함 (move[1])
        matzip = looted[3]; // 🅾️ 맛집정보 방문여부 플래그들 변경된거 반영

        // 루틴 3️⃣. 정비 (현재 작업대상)
//        if(debug == 'on') { log("3️⃣대루틴 정비부 진입"); log("루틴텍스트: " + logtxt.length + "개"); }
        var itemPhased = itemPhase(lootedItemList, plNum, player); // 플레이어 plNum번 아이템 사용처리하고, [아이템 사용로그 txt, 변경된 플레이어DB 정보] 리턴받음
        if(itemPhased[0] != '없음') {
          //취급정보량이 두개이상이므로 concat을 쓴다. 취급정보량이 한개인 push로 쓰면 1,2 두개를 삽입할때 [1,2]한개를 삽입한거처럼 취급돼버려서 안된다.
          logtxt = logtxt.concat(itemPhased[0]); // 전체 로그에 아이템관련기록 추가(itemPhased[0]) 
/*          if(debug == 'on') {
            log("sysmsg 루틴 3️⃣. 전체 " + logtxt.length + "줄, 정비부 추가분 " + itemPhased[0].length + '줄)');
            log(itemPhased[0]); // 정비부 로그 기록 예정 메세지 표시
          }
*/        }
        player = itemPhased[1]; // itemUse 함수에서 변경한 플레이어 정보 갱신 반영함 (itemPhased[1])
        
        // 루틴 4️⃣. 이동 구현
//        if(debug == 'on') { log("정비부 끝. 4️⃣대루틴 이동부 진입"); log("루틴텍스트: " + logtxt.length + "개"); }
        var moved = move(plNum, player, matzip); // 플레이어 plNum번 이동처리하고, [이동로그 txt, 변경된 플레이어DB] 리턴받음
        if(moved[0] != '없음') {
          logtxt.push([moved[0]]); // 전체 로그텍스트에 이동한 결과기록 한줄 추가 (move[0])
          if(debug == 'on') {
            log("sysmsg 루틴 4️⃣. 전체 " + logtxt.length + "줄, 이동부 추가분 " + [moved[0]].length + '줄) '+ moved[0]);
            log(moved[0]); // 이동부 로그 기록 예정 메세지 표시
          }
        }
        player = moved[1]; // 🅾️ moved 함수에서 변경한 플레이어 정보 갱신 반영함 (move[1])
        // 플레이어 변수 늘어놓기
        
      } // 2️⃣ ~ 4️⃣ 플레이어가 전투 후에도 살아있을 때만 다음 루틴 실시하라는 것. <끝>
      
      // 개인 턴 완전종료 알림
      if(debug == 'on') {
        log(player[plNum][1] + player[plNum][2] + ': 턴 종료');
        log("턴을 종료한 플레이어 정보: [" + doubleArrayToText(player[plNum]) + "]");
      }
      
    } // 1️⃣ ~ 4️⃣ 산놈 한정으로 반복하는거 끝
    
    // 턴 종료 알림
    if(debug == 'on') logtxt.push(player[plNum][1] + player[plNum][2] + ': 개인 전체 행동 끝 완료(1~4턴 종료)');
    
    // 플레이어당 로그텍스트 정리
    for(var k in logtxt) playerText.push([logtxt[k], currTurn, plNum]);
    
  } // 루틴 plNUm당 대 루틴부 끝
  
  
  // 다끝났으면 살아있는 플레이어들한테 생존턴 입력처리
  for(var i in player) if(player[i][11] > 0) player[i][25] = currTurn; // 게임상태 변수 (턴수에 따라 행동변화)
  
  if(debug == 'on') logtxt.push("플레이어턴 모두 끝");
  return [playerText, player, matzip];
}
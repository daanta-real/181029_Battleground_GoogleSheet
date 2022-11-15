// 루프 3. loop_system(자기장,레드존,공중보급,선물 등의 처리) 
//////////////// S1(자기장) > S2(레드존) > S3(공중보급) 순으로 되어있음.
//////////////// 선물은 일일트리거 별도 셋팅연결된 함수로 처리


function loop_system(player, matzip, currTurn) {
  // 변수준비
  var logtxt = []; // 모든 진행기록이 담기는 부분
  
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 1. 자기장
  var magLooped = loop_system_mag(player, matzip, currTurn); // [logtxt, player, matzip] 리턴받음
  if(magLooped[0] != '없음') {
    logtxt = logtxt.concat(magLooped[0]); // 전체 로그텍스트에 자기장로그 추가 (magLooped[0])
    //logtxt.push("자기장 끝");
    //debugConsoleLog("[기록예정:자기장]");
    //debugConsoleLog(magLooped[0]);// 자기장로그 기록예정 메세지 표시
  }
  player = magLooped[1]; // 플레이어 돌려받음
  matzip = magLooped[2]; // 맛집 돌려받음
  
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 2. 레드존
  var redLooped = loop_system_red(player, currTurn); // [logtxt, player] 리턴받음
  if(redLooped[0] != '없음') {
    logtxt = logtxt.concat(redLooped[0]); // 전체 로그텍스트에 레드존로그 추가 (redLooped[0])
    //logtxt.push("레드존 끝");
    //debugConsoleLog("[기록예정:레드존]");
    //debugConsoleLog(redLooped[0]); // 레드존로그 기록예정 메세지 표시
  }
  player = redLooped[1]; // 플레이어 돌려받음
  
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 3. 공중보급
  var gifted = loop_system_giftBox();
  if(gifted != '없음') {
    logtxt = logtxt.concat(gifted); // 전체 로그텍스트에 공중보급로그 추가 (gifted[0])
    //logtxt.push("공중보급 끝");
    //debugConsoleLog("[공중보급끝]기록예정: " + gifted.length + ", gifted = " + gifted + ", gifted[0] = " + gifted[0] + ", logtxt = " + logtxt+"]]"); // 공중보급로그 기록예정 메세지 표시
  }
  
  //////////////////////////////////////////////////////////////////////////////////////////
  // 다 처리했으면 시스템 로그메세지 모아서 최종배열 만든담에 return
  if(logtxt.length == 0) var logtxts = '없음';
  else {
    var logtxts = [];
    for(var i in logtxt) {
      logtxts.push([logtxt[i], currTurn]);
    }
  }
  return [logtxts, player, matzip];
}


function loop_system_mag(player, matzip, currTurn) {
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 1. 자기장 처리
  var logtxt = [];
  
  // 1. 턴조건 안맞을 경우 조용히 리턴처리
  // 1-1) 10턴 미만미면 리턴
  if(currTurn < magStart) return ['없음', player, matzip];
  // 1-2) 턴이 10턴이나 그 이후라면, 즉 실행조건이 맞다면 자기장 로드
  var mag = readZone('자기장');
  var currMag = readZone('자기장');
  
  // 2. 자기장 범위내 플레이어 체크해서 영역밖 애들 전부 HP-1 깎음
  // 순서는 랜덤으로 해서 깎고 마지막 플레이어는 죽이지 않는다.
  // 살아있는 인원수를 구함
  if (mag != '없음') { // 자기장이 없는거 아닐경우
    player.sort(function() { return Math.random() - Math.random(); }); // 플레이어 전체 배열 랜덤 쏠팅
    for(var i in player) { // 모든 랜덤쏠팅된 플레이어에 대하여
      if(player[i][11] > 0) { // 피가 있는 플레이어들만 대상으로 
        var txt = player[i][1]+player[i][2]+'자기장 피점검-';
        var deadChk = 0;

        // 조건1. 플레이어가 자기장 지지는 지점혹은 그바깥영역에 발을 디디고있거나.
        if(player[i][15] <= mag[0][0]) deadChk++, txt += "안전지대의 위쪽임) "; 
        if(player[i][15] >= mag[1][0]) deadChk++, txt += "안전지대의 아래쪽임) ";
        if(player[i][16] <= mag[0][1]) deadChk++, txt += "안전지대의 왼쪽임) ";
        if(player[i][16] >= mag[1][1]) deadChk++, txt += "안전지대의 오른쪽임) ";
        
        // 조건2. 자기장이 전체자기장일경우, HP 삭감대상이다.
        if(mag == '전체') deadChk++, txt += "안전지대가 아예 없음) ";
        
        if(deadChk > 0) { // HP 삭감처리 시작
          txt+= '삭감처리합니다.';
          var lives = 0; for(var j in player) if(player[j][11] > 0) lives++; // 생존자 명수(HP 1 이상있는놈 명수 ) 구해서
          //log(player[i][1]+player[i][2]+': 생존자 명수는 ' + lives + "명이다!");
          if(lives >= 2) { // 생존자수가 2 이상이면
            //log(player[i][1]+player[i][2]+': 생존자 2명이상이어서 피까기부 들어왔다! 피를깐다.');
            player[i][11] --; // 피 1까기 (1명남았으면 더이상 안깜)
            if (player[i][11] > 0) {
              //log(player[i][1]+player[i][2]+'는 자기장 맞고 피1까였지만 살았다.');              
              logtxt.push(/*txt*/ player[i][1] + player[i][2] + ": 아흣! 자기장의 맛은 너무 아프구나! (❤️️-1)"); // 자기장 맞고 살았을때
            }
            else {
              //log(player[i][1]+player[i][2]+'는 자기장 맞고 피1까여서 피가 0돼서 죽었다.');
              logtxt.push(/*txt*/ "🌐자기장💥💥💥" + '☠️' + player[i][2] + " "+player[i][1] + "나 중능겅가....⚰️😇️⚰️😇️⚰️😇️"); // 자기장 맞고 사망 시 멘트
              for(var k in player) if(player[k][26]==i) player[k][26]='x'; // 혹시 이시점에서 해당 플레이어가 죽여서 루팅해야 되는 시체(정벌자)가 있다면, 모두 없애버린다.
              player[i][25] = currTurn; // 죽은 시점의 턴을 플레이어 배열에 기록처리
            }
          }
        } // HP 삭감처리 끝
        //log(txt);
      } // hp 있는 플레이어 대상 IF문 끝
    } // 플레이어당 for문 처리 끝
    player.sort(function(a, b) { return a[0] - b[0]; }); // 플레이어 전체 배열 idx 정오름차순으로 재복구
  }
  
  // 실행확률 = 사람 꽉찼을때 30% 사람 적을때 100%
  var lives = 0; for(var j in player) if(player[j][11] > 0) lives++; // 생존자 명수(HP 1 이상있는놈 명수 ) 구해서
  var perc = 50 + 60 * ((maxlives - lives) / maxlives);
  if(randomPercent(perc) == true) {  
    // 3. 자기장이 없다면, 자기장을 심어준다.
    if(mag == '없음') mag = [[0,0], [20,21]];
    
    // 4. 자기장 범위 변경: 10턴이후 6턴마다 한번씩 자기장 한칸 전진처리(플레이어 최초 움직이고 난 이후)
    if(mag != '전체') {
    
      // 자기장 모양(세로찌부, 가로찌부, 정사각형)에 따라서 자기장 전진방향을 정해줌
      var magHeight = Math.abs((mag[1][0] - 1) - mag[0][0]);
      var magWidth = Math.abs((mag[1][1] - 1) - mag[0][1]);
      var rnd = '';
      
      // 높이가 너비보다 클 경우 (즉 세로로 짜부 시) ROW를 좁혀준다.
      // ROW를 어디로 좁히느냐는 0 > 아래로 전진(+) // 1 > 위로 전진(-)
      if(magHeight > magWidth) {
        var modification = getmagRCModifications()[0];
        var rand = Math.random();
        if(rand + modification > 0.5) rnd = 0; // 아래로
        else rnd = 1; // 위로
      }
      
      // 너비가 높이와 같거나 클 경우 (즉 가로로 짜부 시거나, 정사각형이거나) COL을 좁혀준다.
      // ROW를 어디로 좁히느냐는 2 > 오른쪽으로 전진(+) // 3 > 왼쪽으로 전진(-)
      else {
        var modification = getmagRCModifications()[1];
        var rand = Math.random();
        if(rand + modification > 0.5) rnd = 2; // 오른쪽으로
        else rnd = 3; // 왼쪽으로
      }
      
      switch(rnd) {
        case 0: mag[0][0]++; logtxt.push("🌐자기장이 아래쪽으로 1칸 좁혀오고 있습니다! " + zoneTxt(currMag) +" ⇒ " + zoneTxt(mag)); break;
        case 1: mag[1][0]--; logtxt.push("🌐자기장이 위쪽으로 1칸 좁혀오고 있습니다! " + zoneTxt(currMag) +" ⇒ " + zoneTxt(mag)); break;
        case 2: mag[0][1]++; logtxt.push("🌐자기장이 오른쪽으로 1칸 좁혀오고 있습니다! " + zoneTxt(currMag) +" ⇒ " + zoneTxt(mag)); break;
        case 3: mag[1][1]--; logtxt.push("🌐자기장이 왼쪽으로 1칸 좁혀오고 있습니다! " + zoneTxt(currMag) +" ⇒ " + zoneTxt(mag)); break;
        default: break;/////////////// 반환형태: [ 좌상첫위험점[r , c] , 우하첫위험점[r , c] ]
      }
      
      // 5. 자기장 밖에있는 맛집 올 false
      for(var k in matzip) {
        if(matzip[k][4] <= mag[0][0]
           || matzip[k][4] >= mag[1][0]    // 맛집의 ROW좌표가 자기장 좌첫위험점 이하거나 우첫위험점 이상임 (=좌우로 자기장선 바깥쪽)
           || matzip[k][5] <= mag[0][1]
           || matzip[k][5] >= mag[1][1]) { // 맛집의 COL좌표가 자기장 상첫위험점 이하거나 하첫위험점 이상임 (=상하로 자기장선 바깥쪽)
          if(matzip[k][6] == true) logtxt.push(matzip[k][2]+matzip[k][3] + " 지역이 🌐자기장에 잠겨버렸다!"); // 신규로 잠기는 맛집만 텍스트 표시
          for(var l = 6; l < matzip[k].length; l++) matzip[k][l] = false;
        }
      }
      
      //log(mag[0][0] + ", " + mag[0][1] + ", " + mag[1][0] + ", " + mag[1][1]);
      if(Math.abs(mag[0][0] - mag[1][0]) == 1 || Math.abs(mag[0][1] - mag[1][1]) == 1) {
        logtxt.push("🚨🚨🚨 자기장이 모든 영역을 덮었습니다! 이제 더 이상 안전지대가 없습니다! 🚨🚨🚨");
        mag = '전체';
      }
    }
    // 6. 변경된 자기장 및 로그 기록
    
    writeZone('자기장', mag);
    
  } else if(logtxt.length == 0) logtxt = '없음'; // 자기장 바뀌는 턴이 아니면서 자기장에 당한사람도 아무도 없다면 logtxt를 []에서 '없음'으로 바꿔준다.
  
  return [logtxt, player, matzip]; // 자기장으로 맞아죽은 인원이 있으면 이시점에서 로그가 있기때문에 정상리턴 해야된다.
  
}

function loop_system_red(player, currTurn) {
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 2. 레드존
  
  var logtxt = [];
  
  // 1. 턴조건 안맞을 경우 조용히 리턴처리
  // 1-1) 15턴 미만미면 리턴
  if(currTurn < redStart) return ['없음', player];
  // 1-2) 턴이 10턴이나 그 이후라면, 즉 실행조건이 맞다면 자기장 로드
  var red = readZone('레드존');
  var currRed = red;
  
  // 2. 레드존 범위내 플레이어 체크해서 HP를 통째로 깎음
  // 랜덤 순서로 깎고 마지막 플레이어는 죽이지 않는다. (종료처리시 버그 방지)
  // 살아있는 인원수를 구함
  if (red != '없음') { // 레드존 없는거 아닐경우
    player.sort(function() { return Math.random() - Math.random(); }); // 플레이어 전체 배열 랜덤 쏠팅
    for(var i in player) { // 모든 랜덤쏠팅된 플레이어에 대하여
      if(player[i][11] > 0) { // 피가 있는 플레이어들만 대상으로
      
        var txt = player[i][1]+player[i][2]+'레드존 피점검-';
        var deadChk = 0;

        // 조건1. 플레이어가 레드존 안쪽이거나
        if((player[i][15] >= red[0][0]) && (player[i][15] <= red[1][0]) && 
          (player[i][16] >= red[0][1]) && (player[i][16] <= red[1][1]))
          deadChk++, txt += "레드존 동서남북선의 안쪽에 있음 ";
        
        // 조건2. 자기장이 전체자기장일경우, HP 삭감대상이다.
        if(red == '전체') deadChk++, txt += "안전지대가 아예 없음) "; //* 실제로는 일어나지 않을 거지만 버그방지용으로..
        
        // 상기 두 조건이 둘 중 하나 만족될 경우, 확률체크를 실시.
        // 확률체크가 만족상태일 경우 삭감처리
        // 미리 설정된 확률대로 HP 삭감처리 시작 (이거 for문 안쪽의 명령문임. 당연히 확률은 매 플레이어마다 다름)
        if(deadChk > 0 && randomPercent(redPerc) == true) {
          txt+= player[i][2] + player[i][1] + "("+player[i][15]+"," + player[i][16]+")" + ' in  레드존(' + red[0][0] + "," + red[0][1] + " ~ " + red[1][0] + ", " + red[1][1] + ') ⇒ 조건이 맞아 폭격처리합니다.';
          var lives = 0; for(var j in player) if(player[j][11] > 0) lives++; // 생존자 명수(HP 1 이상있는놈 명수 ) 구해서
          //log(player[i][1]+player[i][2]+': 생존자 명수는 ' + lives + "명이다!");
          if(lives >= 2) { // 생존자수가 2 이상이면 피 제로화 실행 (*2명 이상이면 안하고 넘어간다)
            //log(player[i][1]+player[i][2]+': 생존자 2명이상이어서 피까기부 들어왔다! 레드존 피를깐다.');
            player[i][11] = 0; // 피 제로화
            //log(player[i][1]+player[i][2]+'는 레드존에서 '+redPerc+'%의 확률을 뚫고 폭격을 맞아서 죽었다.');
            logtxt.push(/*txt*/ "🔥레드존💥💥💥" + '☠️' + player[i][2] + " "+player[i][1] + "아얏! 너무 따끔해....⚰️😇️⚰️😇️⚰️😇️"); // 자기장 맞고 사망 시 멘트
            for(var k in player) if(player[k][26]==i) player[k][26]='x'; // 혹시 이시점에서 해당 플레이어가 죽여서 루팅해야 되는 시체(정벌자)가 있다면, 모두 없애버린다.
            player[i][25] = currTurn; // 죽은 시점의 턴을 플레이어 배열에 기록처리            
          }
        } // HP 삭감처리 끝
        //log(txt);
      } // hp 있는 플레이어 대상 IF문 끝
    } // 플레이어당 for문 처리 끝
    player.sort(function(a, b) { return a[0] - b[0]; }); // 플레이어 전체 배열 idx 정오름차순으로 재복구
  }
  
  // 3. 12턴부터 매 특정턴씩, 자기장 크기가 minimum 아래가 아닌이상 일정 턴마다 레드존 재설정함.
  var mag = readZone('자기장');
  var magHeight = Math.abs((mag[1][0] - 1) - mag[0][0]);
  var magWidth = Math.abs((mag[1][1] - 1) - mag[0][1]);
  if(magWidth <= redDiffLimit || magHeight <= redDiffLimit || mag == '없음' || mag == '전체') { // 자기장의 너비나 높이가 설정된 최소치이거나 그 이하로 축소될 경우
    red = '없음';
    writeZone('레드존', red);
  } else if(currTurn % redFreq == 0 && currTurn >= 12) { // 12턴 이후 redFreq턴(현재 5턴)이 돌아올 때마다 레드존 재지정 실행
    // 새로운 레드존을 지정한다.
    red = [[0, 0], [0, 0]]; // 변수초기화
    // 레드존 생성영역은 자기장 안에서 완전히 랜덤이며, 최대 한칸까지 벗어날수 있다.
    red[0][0] = mag[0][0] + Math.floor(Math.random() * (magHeight)); // row 윗좌표
    if(red[0][0] <= 0) red[0][0] = 1;
    if(red[0][0] >= 19) red[0][0] = 19;
    red[0][1] = mag[0][1] + Math.floor(Math.random() * (magWidth + 1)); // col 왼자표
    if(red[0][1] <= 0) red[0][1] = 1;
    if(red[0][1] >= 20) red[0][1] = 19;
    // 레드존의 크기는 2 x 2 고정이다.
    red[1][0] = red[0][0] + 1; // row 아래좌표
    red[1][1] = red[0][1] + 1; // col 오른좌표
    
    // 4. 변경된 레드존 및 로그 기록
    writeZone('레드존', red);
    logtxt.push("🔥새로운 레드존에 폭격이 쏟아집니다! " + zoneTxt(currRed) +" ⇒ " + zoneTxt(red));
    
  }
  
  if(logtxt.length == 0) logtxt = '없음'; // 레드존에 당한사람도 아무도 없고, 레드존 바뀌는 턴도 아니라면 logtxt를 []에서 '없음'으로 바꿔준다.
  return [logtxt, player]; // 레드존으로 맞아죽은 인원이 있으면 이시점에서 로그가 있기때문에 정상리턴 해야된다.
}

function loop_system_giftBox() {
  //////////////////////////////////////////////////////////////////////////////////////////
  /// 시스템 3. 공중보급
  // 기본 변수 준비
  // 현재 베이스 맛집이 36행(idx ~33)까지 차지하고 있으므로, getLastRow를 하면 겜초기 36으로 구해짐.
  // 즉 기본적으로 보급상자는 37행부터 시작하게 된다.
  
  var mag = readZone('자기장');
  var magHeight = Math.abs((mag[1][0] - 1) - mag[0][0]);
  var magWidth = Math.abs((mag[1][1] - 1) - mag[0][1]);
  //debugConsoleLog(doubleArrayToText(mag));

  // 자기장이 시작되지 않았거나 전체 영역이 자기장 이 거 나
  // 남은 맵폭이 5이하(디폴트값,설정변경가능) 이 거 나
  // 확률(기본 10%)굴림에 실패해도 리턴한다.
  if(mag == '전체' || mag == '없음' || randomPercent(giftFreq) == false || magHeight <= presentDiffLimit || magWidth <= presentDiffLimit ) {
    //debugConsoleLog("자기장이 없거나 전체거나 보급생성 확률이 안됩니다.");
    return '없음';
  } else {
    var logtxt = [];
    var fRow = mg_matzip.getLastRow();
    
    //debugConsoleLog('좌표긁기');
    // 자기장으로부터 안전한 안전지대 영역 안쪽의 아무 좌표나 구한다.
    var row = (mag[0][0]+1) + Math.floor(Math.random() * (mag[1][0]-mag[0][0]-1));
    var col = (mag[0][1]+1) + Math.floor(Math.random() * (mag[1][1]-mag[0][1]-1));
    
    //debugConsoleLog('좌표: ' + row + ',' + col);
    // DB반영 및 메세지 출력
    logtxt.push("하늘에서 빨간 맛이 내려왔다! 🎁 @ (" + row + ", " + col + ")");
    
    //debugConsoleLog(logtxt[0]);
    mg_matzip.getRange(fRow+1, 1, 1, 6).setValues([[fRow-3, false, "🎁", "빨간 맛", row, col]]); // 기본 변수 세팅 (방문가능=true)
    
    //debugConsoleLog('보급 기본변수세틴 완료');
    mg_matzip.getRange(fRow+1, 7, 1, mg_matzip.getLastColumn()-6).setValue(true); // 나머지 변수 false

    //debugConsoleLog('보급 전변수세팅 완료');
    // logtxt 존재여부에 따라서 다르게 리턴
    return logtxt;
  }
}

/////////////// 시트에서 존의 형태를 읽어옴
/////////////// 반환형태: [ 좌상첫위험점[r , c] , 우하첫위험점[r , c] ]
function readZone(type, debug) {
/* 샘플사용법
   log(readZone('자기장')[0]);
   log(readZone('자기장')[1]);
   log(readZone('레드존')[0]);
   log(readZone('레드존')[1]);
*/
  if(debug === undefined) { // 통상시
    if(type == '자기장') var pos = mg_main.getRange(8, 5);
    else if(type == '레드존') var pos = mg_main.getRange(9, 5);
  } else { // 디버그시
    if(type == '자기장') var pos = mg_inf.getRange(97, 23);
    else if(type == '레드존') var pos = mg_main.getRange(98, 23);
  }
  var txt = pos.getValue();
  if(txt == '없음') { // 1) 장 자체가 없다면
    return '없음';
  } else if(txt == '전체') { // 2) 막판이라 자기장이 전체 영역에 걸쳐 있다면
    return '전체';
  } else { // 3) 그 외의 경우 즉 자기장이 정상적으로 범위를 갖고 형성되어 있을 때
    txt = txt.split(" ~ ");
    for(var i in txt) {
      txt[i] = txt[i].split(",");
      txt[i][0] = Number(txt[i][0]); // 혹시모르니 숫자화시켜줌
      txt[i][1] = Number(txt[i][1]); // 혹시모르니 숫자화시켜줌
    }
    return txt;
  }
}

/////////////// 바뀐 존의 형태를 시트변수 자리에 반영함
function writeZone(type, zone) {
/* 샘플사용법
   writeZone('자기장', [[1,2],[3,4]]);
   writeZone('레드존', [[5,6],[7,8]]);
   writeZone('자기장', '없음');
   writeZone('레드존', '전체');
*/
  if(type == '자기장') var pos = mg_main.getRange(8, 5);
  else if(type == '레드존') var pos = mg_main.getRange(9, 5);
  
  if(zone == '없음') var txt = '없음';
  else if(zone == '전체') var txt = '전체';
  else var txt = zone[0][0] + "," + zone[0][1] + " ~ " + zone[1][0] + "," + zone[1][1];
  pos.setValue(txt);
}

/////////////// 현재 자기장 or 레드존 형태를 로그텍스트 출력용 문자열로 표현해줌
function zoneTxt(zone) {
  if (zone == '없음') return '(없음)';
  else {
    var txt = "(";
    txt += zone[0][0] + ", " + zone[0][1];
    txt += ") ~ (";
    txt += zone[1][0] + ", " + zone[1][1];
    txt += ")";
    return txt;
  }
}

/////////////// 게임이 정상진행됐다면 지금 시점에 몇턴까지 진행됐어야 하는지 구해줌.
function getEstimatedRoutines() {
  var hours = new Date().getHours();
  var mins = new Date().getMinutes();
  var currMins = hours * 60 + mins;
  //debugConsoleLog(hours); // 현재 시간의 시간값
  //debugConsoleLog(mins); // 현재 시간의 분값
  //debugConsoleLog(hours + ":" + mins); // 현재 시간 및 분 표시
  //debugConsoleLog(currMins); // 자정으로부터 현재시각의 총 분수 표시

  
  var sHours = nextGameStartHour * 60 ; // 게임 개시 시점의 분값
  var currRoutineTurn = Math.ceil((currMins - sHours) / (60 * routineHour)); // 현재 진행되었어야 할 루틴갯수 = {(게임개시후 경과된 분수) / (루틴주기 분수)}의 올림값
  // 올림값(ceil)을 굳이 쓰는 이유는, 내림값으로 하면 10시 1분~14분 사이에는 0턴까지밖에 실행을 안 하기 때문임. 올림값으로 해놔야 10시 1분에 1턴까지 실행함.
  // 첫 시작이 1턴(낙하산 막 펴는시점)이기 때문에, 처음부터 올림값으로 표현하는게 타당함.
  
  return currRoutineTurn;
}

//////////////// 현재 라운드의 자기장 중심좌표값을 리턴해줌. ///////////////
function getmagRC(debug) {
  // 라운드값을 시드로 해서 1 ~ 380 사이의 난수 생성
  var currRound = mg_main.getRange(6,5).getValue();
  var roundRandomSeed = Math.floor(randomBySeed(currRound) * (19 * 20)) + 1; // 올림값(0~1랜덤 * 380) + 1 = <1 ~ 380 사이의 값>
  var magR = Math.floor(roundRandomSeed/20) + 1;
  var magC = roundRandomSeed % 20;
  if(debug == 'on') debugConsoleLog(currRound + ' 라운드의 랜덤좌표값=' + roundRandomSeed + "(" + magR + ", " + magC + ")");
  return [magR, magC];
}

//////////////// 현재 라운드의 자기장 중심좌표값에 따라 기울기 확률을 구해줌. ///////////////
function getmagRCModifications() {
  // 자기장 중심좌표값 로드
  var magCenter = getmagRC();
  var magR = magCenter[0];
  var magC = magCenter[1];
  
  // 좌표값을 random()의 플마 보정용 값으로 환산함.
  // 예를들어 만약 좌표의 범위가 1~20이라면, 보정용 값은 -0.5 ~ +0.5가 됨.
  // 최종 자기장 방향은 random() + 보정값이 0.5를 넘느냐 마느냐로 따지므로,
  // -0.5면 거의 감소 확정, +0.5는 거의 증가 확정이라 보면 됨.
  var modifitionR = (magR-10)/20;
  var modifitionC = (magC-10.5)/20;
  return [modifitionR, modifitionC];
}
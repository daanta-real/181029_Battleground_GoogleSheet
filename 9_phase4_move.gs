//////////////////// 개인 플레이어를 DB 내에서 이동처리하고, 그 결과를 로그로 남기며 플레이어 변수 수정함 ////////////////////
function move(playerIdx, player, matzip) {

  var debug = false;//true;
  if(debug == true) log(player[playerIdx][1]+player[playerIdx][2]+': 이동 시작');
  var beforeRow = Number(player[playerIdx][15]), beforeCol = Number(player[playerIdx][16]); // 처음 위치 기억
  
  // 탈것 idx에 따라 이동력 적용. but 탈것내구도가 1 이상일때 적용함.
  var vehicle = Number(player[playerIdx][3]);
  switch(vehicle) {
    case 44: case 45: if(player[playerIdx][18] > 0) var leftMoves = 3; else var leftMoves = 1; break; // 이동력 +2
    case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: if(player[playerIdx][18] > 0) var leftMoves = 2; else var leftMoves = 1; break; // 이동력 +1
    default: var leftMoves = 1; break; // 이동력 +0 (1. 노말이동력)
  }
  
  // 이동력만큼 이동처리
  if(debug == true) log("이동력 부여횟수: " + leftMoves);
  var dirList = ""; // 이동방향 기록모음
  for(; leftMoves >= 1; leftMoves--) {
    var location = getWhereTo(playerIdx, player, matzip); // [이동할 row, 이동할 col, 이동 목표지 idx, 목적지 방향, 목적지까지의 거리] 회신받음
  if(debug == true) log("이동방향 계산 끝:" + typeof location + ' = ' + location[0] + ', 이동할 row=' + location[1] + ', 이동할 col=' + location[2] + ', 이동할 목표지=' + location[3] + ", 직선거리=" + location[4]);
    if (location != 'stop') { // 이동을 성공했을 경우, 플레이어 row/col값을 변경함
      player[playerIdx][15] = Number(location[0]); // 🅾️ 플레이어db row값 새값으로 변경
      player[playerIdx][16] = Number(location[1]); // 🅾️ 플레이어db col값 새값으로 변경
      player[playerIdx][24]++; // 플레이어 뽈수 +1
      if(debug == true) log('목표지="'+location[3]+'"');
      dirList += " " + location[3]; // 방향값 추가
      var tttxt = "player값 변경: (" + player[playerIdx][15] + ", " + player[playerIdx][16] + ") ";
      tttxt += "잔여이동력 " + leftMoves + " / ("+ player[playerIdx][15] +", " + player[playerIdx][16] + ") → (" + player[playerIdx][15] + ", " + player[playerIdx][16] + ") 이동함";
      if(debug == true) log(tttxt);
    }
  }
  
  // 다움직였으면 이동정보와 ✅ 이동메세지를 최종 작성한다.
  var logtxt = player[playerIdx][1]+player[playerIdx][2] + ': ';
  var talgut = (player[playerIdx][3] >= 0) ? (item[player[playerIdx][3]][2]) : '👣'; // 탈것마크
  if(debug == true) log('탈것마크='+talgut);
  if(beforeRow != player[playerIdx][15] || beforeCol != player[playerIdx][16]) { // 플레이어가 한발자국이라도 움직였으면
    if(debug == true) log("플레이어는 조금이라도 움직였다." + typeof matzip[location[2]] + "방향을 향해서임.");
    if(isEmpty(matzip[location[2]])) {
      var matzipIcon = '🏞️', matzipName = '중앙지대';
    } else {
      var matzipIcon = matzip[location[2]][2], matzipName = matzip[location[2]][3];
    }
    player[playerIdx][17] = '이동중: (' + beforeRow + ', ' + beforeCol + ')' + dirList + ' for ' + matzipIcon + matzipName + ' (' + player[playerIdx][15] + ', ' + player[playerIdx][16] + ')';
    logtxt += matzipIcon + matzipName + ' 방향으로 이동 (' + beforeRow + ', ' + beforeCol + ')  '+talgut+' ' + dirList + '  >>  (' + player[playerIdx][15] + ', ' + player[playerIdx][16] + ')';
    if(debug == true) log(logtxt);
  } else if(location[4] < 1.5) { // 목표지와의 거리 1.5보다 적으면 = 즉, 칸수로 따졌을때 전방 8방향 안에 목표가 있다면
    logtxt += '새 목표에 도착하였습니다.';
    player[playerIdx][17] = matzipIcon + matzipName + '(' + player[playerIdx][15] + ', ' + player[playerIdx][16] + ')에 도착';
    if(debug == true) log(logtxt);
  } else { // 플레이어가 전혀 움직이지 않았고, 목표지와의 거리가 한칸을 초과한다면
    logtxt += '막혀서 움직이지 못함';
    player[playerIdx][17] = player[playerIdx][15] + ', ' + player[playerIdx][16] + ')에서 움직이지 못함';
    if(debug == true) log(logtxt);
  }
  
  // 다 탔으면 탈것내구도 -1. 이동력과 다르다 이동력은 해당턴에 여러번 움직이려 쓰는거고 탈것내구도는 그렇게 이동력 증가상태로 움직일수있는 횟수를 얘기하는것이다.
  if(debug == true) log("탈것정보: " + (player[playerIdx][3]>=0) + "("+player[playerIdx][3]+"번 기체, 잔여탑승 "+player[playerIdx][18]+"번 남았었던 그것)");
  var takeoff = false;
  if (player[playerIdx][3] > 0) { // 탈것 내구도가 1 혹은 그 이상이라면
    player[playerIdx][18] = Number(player[playerIdx][18]) - 1; // 🅾️ 탈것내구도 -1
    if (player[playerIdx][18] == 0) {
      if(debug == true) log("탈것 내구 0 버립니다.");
      player[playerIdx][3] = 'x'; // 🅾️ 탈것 없애버림
      logtxt += " / 다 쓴 탈것을 버림"; // ✅ 탈것 내구도 다했을 경우 버림텍스트 추가
    } else logtxt += " / 탈것 잔여횟수 " + talgut + "x" + player[playerIdx][18];
  }
  if(debug == true) log("탈것정보: " + (player[playerIdx][3]>=0) + "("+player[playerIdx][3]+"번 기체, 잔여탑승 "+player[playerIdx][18]+"번 남게된 그것)");
  
  return [logtxt, player]; // 이동정보(옮기기전row,col,옮긴후row,col) , 로그txt, 변경된 플레이어 정보 리턴
}

//////////////////// 플레이어 idx를 넘기면 어디로 갈 지 이동방향을 판단하여 좌표값을 리턴해줌 ////////////////////
function getWhereTo(plIdx, player, matzip) {

  var debug = false;//true;

  // 기본 변수 준비
  var pl = player[plIdx]; // 처리를 원하는 플레이어 idx 
  pl[15] = Number(pl[15]);
  pl[16] = Number(pl[16]);
  
  // 가장 가까운 지점을 구하여, nRow에 담음
  var near = getNearestPlace(pl, matzip); // row, col, 맛집idx, 거리 회신받음
  var nRow = near[0], nCol = near[1], nearestMatzipIdx = near[2];
  
  // 8방향 중 갈 수 있는 방향을 정리
  // 방향: 7  0  1 12시부터 시계방향으로
  //      6     2 북-북동-동-남동-남-남서-서-북서
  //      5  4  3
  var dirs = [true, true, true, true, true, true, true, true];
  var diff = [(nRow - pl[15]), (nCol - pl[16])]; // 좌표거리
//  if(diff[0] > 0) { dirs[7] = false; dirs[0] = false; dirs[1] = false; /*log("위로 가지 않습니다.");*/     } // 아래쪽으로 향할 때, 윗방향 정리
//  if(diff[0] < 0) { dirs[5] = false; dirs[4] = false; dirs[3] = false; /*log("아래쪽으로 가지 않습니다.");*/ } // 위쪽으로 향할 때, 아랫방향 정리
//  if(diff[1] > 0) { dirs[7] = false; dirs[6] = false; dirs[5] = false; /*log("왼쪽으로 가지 않습니다.");*/  } // 오른쪽으로 향할 때, 왼쪽방향 정리
//  if(diff[1] < 0) { dirs[1] = false; dirs[2] = false; dirs[3] = false; /*log("오른쪽으로 가지 않습니다.");*/ } // 왼쪽으로 향할 때, 오른쪽 방향 정리
  if(debug == true) log("이동계산 시작. 웨이포인트 선정: 플레이어위치:" + pl[1] + '(' + pl[15] + "," + pl[16] + "), 맛집네임(" +getMatzipName(nRow, nCol, matzip)+ ")-" + nRow + ", " + nCol + ' / 좌표거리 ' + diff[0] + ", " + diff[1] + ' / 직선거리: ' + near[3] + '');
  var txt = "갈 수 있는 방향:"; for(var i in dirs) if(dirs[i] == true) { switch(i) { case '0': txt += " 북"; break; case '1': txt += " 북동"; break; case '2': txt += " 동"; break; case '3': txt += " 남동"; break; case '4': txt += " 남"; break; case '5': txt += " 남서"; break; case '6': txt += " 서"; break; case '7': txt += " 북서"; break; } }
  if(debug == true) log(txt);
  var inMag = getIfInMag(pl[15], pl[16]); // 자기가 자기장 영향하에있는지 확인하는 변수
  
  // 갈 수 있는 방향 중에서 진로가 막혀있는 곳을 대상에서 제외하고, 추려진 방향배열을 만듬
  for(var j in dirs) {
    var shifted = shiftedLoc(pl[15], pl[16], j);
    if(shifted[0] >= 1 && shifted[0] <= 19 && shifted[1] >= 1 && shifted[1] <= 20) { // 전체맵 안의 좌표일 때만 조건검사로 넘어가며, 불만족시 무조건 통과=false로 강제결정.
      if(dirs[j] == true) { // dir에 이동은 할 수 있는 경우
        if(debug == true) log('dirs['+j+'] = true, 장애물 검사 실시합니다.');
        if(debug == true) log(j+'방향 진로검사.플레이어 좌표: ' + pl[15] + "," + pl[16] + "  시프티드 = " + shifted); //시프티드 = 0:row, 1:col
        
        // 조건 1. 그 자리가 레드존 영향구역이면 redGoPerc(현재 셋팅 50%)때문에 못감
        var red = readZone('레드존');
        if(debug == true) log("1) 레드존 검사. 현재 레드존:" + zoneTxt(red));
        if (red != '없음' && red != '전체') { // 레드존이 있긴 있다면
          if (shifted[0] >= red[0][0] && shifted[0] <= red[1][0] && // 옮겼을때 ROW좌표가 레드존 좌한칸벗어난점 이상이거나 우한칸벗어난점 아래거나 (=좌우로 레드존 안쪽)
              shifted[1] >= red[0][1] && shifted[1] <= red[1][1]) { // 옮겼을때 COL좌표가 레드존 상한칸벗어난점 이상이거나 하한칸벗어난점 위면 (=상하로 레드존 안쪽)
            if (randomPercent(redGoPerc) == false) {
              dirs[j] = false;
              if(debug == true) log('*'+j+'방향은 레드존이 있고 확률굴림 무서워서 못감');
            } // redGoPerc(현재 아마 50%) 확률굴림 실패시 안감
          }
        }
        if(debug == true) log("레드존 검사결과 :" + dirs[j]);
        
        // 조건 2. 그 자리에 맛집이 자리잡고 있으면 못 감
        for(var l in matzip) if (matzip[l][4] == shifted[0] && matzip[l][5] == shifted[1]) {
          if(matzip[l][1] == true) // 맛집이 원래 있던 맛집이라면, 즉 빨간맛등 추가로 보급된 보급상자같은게 아니라면 못지나감. (빨간맛은 밟고 지나갈수있음) 물론 자기장 피하려면 이것도 넘는다.
            dirs[j] = false; if(debug == true) log('*'+j+'방향은'+l+'번째 맛집이 막고있어 접근불가');
        }
        if(debug == true) log("맛집검사 결과: " + dirs[j]);// 지형물 등 건물이 있는 지 검사
        
        // 조건 3. 그 자리가 자기장 영향구역이면 절대 안 감
        var mag = readZone('자기장');
        if (mag != '없음' && mag != '전체') {
          if (shifted[0] <= mag[0][0] || shifted[0] >= mag[1][0]    // 옮겼을때 ROW좌표가 자기장 좌첫위험점 이하거나 우첫위험점 이상이거나 (=좌우로 자기장선 바깥쪽)
              || shifted[1] <= mag[0][1] || shifted[1] >= mag[1][1]) { // 옮겼을때 COL좌표가 자기장 상첫위험점 이하거나 하첫위험점 이상이면 (=상하로 자기장선 바깥쪽)
            dirs[j] = false; if(debug == true) log('*'+j+'방향은 자기장이 있어서 접근불가'); // 자기장이 있는곳으로는 못가게함
          } // 자기장이 있는곳으로는 못가게함
          if (inMag == true) dirs[j] = true; // 그러나 지가 자기장 안에 있으면, 웨이포인트는 무조건 나가는 방향으로 잡히며
          // 레드존도 감수해야 하고, 지형지물(맛집)도 무시해야 하므로 이동 허용
        }
        if(debug == true) log("자기장 검사 결과: 자기장유무=" + inMag + ", 검사결과=" + dirs[j]);// 지형물 등 건물이 있는 지 검사
        
        // 조건 4. 그 자리에 살아있는 플레이어가 있으면 못 감
        for(var k in player) if (player[k][11] > 0 && player[k][15] == shifted[0] && player[k][16] == shifted[1]) {
          dirs[j] = false; // 그 자리에 피가 0 초과인 플레이어가 있는 지 검사
          if(debug == true) log('*'+j+'방향은'+k+'번째 플레이어 있어서 접근불가');
        }
        if(debug == true) log("플레이어 존재여부 검사: " + dirs[j]);// 지형물 등 건물이 있는 지 검사
        
      }
    } else dirs[j] = false;
  }
  var finalDirs = [];
  for(var m in dirs) if (dirs[m] == true) finalDirs.push(m);
  
  // 방해물 검사를 통과한 방향들 중에서 최종 방향을 확정시킨다.
  // 방향이 한개밖에 없으면 그걸로 하고, 두개 이상 있을 때는 우선순위를 따져서 한 개를 고른다.
  if(finalDirs.length > 0) { // 1. 이동할 수 있는 곳이 한 곳 이상일 경우
    if(debug == true) log(pl[1] + pl[2] + ': 방해물 없이 갈 수 있는 곳 ' + finalDirs.length + '방향 (' + finalDirs.join() + ')');
    if(finalDirs.length > 1) { // 1-1. 이동할 수 있는 곳이 두 방향 이상 있다면 - 목적지까지의 거리가 가장 가까운 쪽으로 선택

      // ['방향', '목표물과 거리']로 배열 만듬
      var distances = [];
      for(var o in finalDirs) { 
        var shiftedPos = shiftedLoc(pl[15], pl[16], finalDirs[o]);
        var powRow = Math.pow(nRow - shiftedPos[0], 2);
        var powCol = Math.pow(nCol - shiftedPos[1], 2);
        var distance = Math.sqrt(powRow + powCol);
        distances[o] = [finalDirs[o], distance];
        if(debug == true) log(finalDirs[o] + "방향으로 시프트될 경우 좌표: " + shiftedPos + " / 거리: " + distance);
      }
      
      // 배열을 거리순으로 오름차순 정렬, ([0] = 목적지와의 거리가 최소가 되는 타일)
      distances.sort(function (a, b) { return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0; });
      //for(var p in distances) log(p+"번째 거리 방향: " +distances[p][0]+ "방향 (" + distances[p][1]+ ")");

      // 최종 진행방향 결정
      var finalDir = distances[0][0];
      if(debug == true) log("가장 가까운 거리는 " + finalDir + "방향으로 결정");      
    } else { /* 1-2. 이동할 수 있는 곳이 한 곳일 경우 */ finalDir = finalDirs[0]; if(debug == true) log("이동할 수 있는 곳이 한 곳 밖에 없다(" + finalDir + "로 결정)"); } // 이동 한군데밖에 못하면 최종방향을 거기로 정함
  } else { /* 2. 이동할 수 있는 곳이 하나도 없을 경우 밑에까지 안가고 바로 리턴 */ if(debug == true) log(pl[1]+pl[2]+": 전방이 막혔습니다! 제자리에서 움직이지 못합니다."); return 'stop'; }
  
  // 확정된 최종방향에 대한 이동 후 좌표를 구한다.
  var shifted = shiftedLoc(pl[15], pl[16], finalDir);
  if(debug == true) log(pl[1]+pl[2]+': (' + pl[15] + ", " + pl[16] + ')좌표에서 '+getMatzipName(nRow, nCol, matzip)+'로 향하기 위해, ' + finalDir + '방향인 '  + shifted[0] + ', ' + shifted[1] + '로 이동하기로 했다.');
  
  // 함수의 최종 결과물 회신 - 한칸 이동한 row, 한칸 이동한 col, 웨이포인트(맛집)idx, 방향문자
  return [shifted[0], shifted[1], nearestMatzipIdx, dirArrow(finalDir), near[3]];
} 

//////////////////// row, col, 장소목록배열 주면 가장 가까운 장소좌표를 리턴해줌 ////////////////////
function getNearestPlace(pl, matzip) {
  //log("젤 가까운지점 찾기시작");
  // 자신의 거리와 장소목록별 거리를 계산하여 배열 끝열에 붙임
  var myRow = Number(pl[15]), myCol = Number(pl[16]);

  // 방문안한 장소문자열 가져와서 변수만듬
  //log("아직 방문안한 장소를 찾아봅니다. 살펴볼 개수: "+matzip.length+"개");
  var locs = new Array();
  for(var i in matzip) {  
      //log("장소정보: matzip["+i+"] = " + matzip[i][2] + matzip[i][3] +") = " + matzip[i].join(", "));
      //log("장소정보: matzip["+i+"][7+pl[0](=7+"+pl[0]+")]= **"+matzip[i][(7+(pl[0]*1))]+"** (" + matzip[i][2] + matzip[i][3] +")");
    if(matzip[i][(7+(pl[0]*1))] == true) {
      locs.push([matzip[i][4], matzip[i][5], matzip[i][0]]); // row, col, 맛집idx 순임
      //log("   ┏아직 방문안한 장소목록에 추가");
    }
  }
  
  // 갈수있는 맛집이 없으면 OR 자신이 자기장 안에 있다면 자기장지대의 가장 정중앙, 즉 중앙지대로 설정
  //log("방문안한 장소 목록 개수를 세어, 방문안한곳이 안나온다면 중앙지대로 설정합니다");
  if(locs.length == 0 || getIfInMag(pl[15], pl[16]) == true) {
    //log("모든 장소를 방문했습니다. 선빵필승! 랜덤한 적플레이어에게 돌진합니다.ㅎ 하게할려그랬는데 시간이없어서 모하겟따.");
    var magi = readZone('자기장');
    if (magi != '없음' && magi != '전체') {
      //log(pl[1]+pl[2]+"locs[0] = ("+magi[1][0] + "+" + magi[0][0]+")/2, ("+magi[1][1] + "+" + magi[0][1]+")/2");
      locs[0] = [(magi[1][0]+magi[0][0])/2, (magi[1][1]+magi[0][1])/2]; // 자기장의 가장 정중앙 지대
    } else {
      //log(pl[1]+pl[2]+'자기장이 없거나 전체지역이라 계산이 안됩니다.');
      locs[0] = [10, 10.5]; // 맵의 정중앙으로
    }
    //log(pl[1]+pl[2]+"의 다음 이동지점으로 계산된 locs[0]=(" + locs[0]+")");
  }
    
  //log("방문안한곳: "+locs.length+"개 ("  + (locs.join('/'))?locs.join('/'):'' + ")");

  // locsArr 각 끝열에 거리 입력
  for(var j in locs) {
    var powRow = Math.pow(myRow - locs[j][0],2);
    var powCol = Math.pow(myCol - locs[j][1],2);
    locs[j][3] = Math.sqrt(powRow + powCol); // locs 각배열 끝열에 거리추가
  }
  
  // 거리순으로 정렬, 최소거리 좌표 구하기
  locs.sort(function (a, b) { 
    return a[3] < b[3] ? -1 : a[3] > b[3] ? 1 : 0;  
  });
  
  //여기까지 했으면 loc[0]는 row, col, 맛집idx, 거리 이렇게 되어있음
  var mostNearRow = Number(locs[0][0]), mostNearCol = Number(locs[0][1]);
  //log("getNearestPlace에서 이렇게 회신하려고 합니다. 젤가까운곳 = ("+mostNearRow+ ", "+mostNearCol+") → 맛집idx:" + locs[0][2] + ", 거리: " + locs[0][3] + ")");
  return [mostNearRow, mostNearCol, locs[0][2], locs[0][3]]; // row, col, 맛집idx, 거리 회신
}

//////////////////// 원하는 플레이어를 이동처리 ////////////////////
function mapMove(toVal, fromRow, fromCol, toRow, toCol) {
  mapSetIcon("", fromRow, fromCol); // 🗺️️
  mapSetIcon(toVal, toRow, toCol); // 🗺️️
}

//////////////////// 좌표로 맛집이름 얻기 ////////////////////
function getMatzipName(row, col, matzip) {
  var matzipName = 'none';
  for(i in matzip) if(matzip[i][4] == row && matzip[i][5] == col) matzipName = matzip[i][3];
  return ((matzipName=='none') ? "중앙지대" : matzipName);
}

//////////////////// 자기가 자기장 영향하에 있는지 검색해줌 ////////////////////
function getIfInMag(r, c) {
  var mag = readZone('자기장');
  if(mag == '없음') return false;
  else if(mag == '전체') return true;
  else if( r <= mag[0][0] || r >= mag[1][0] || c <= mag[0][1] || c >= mag[1][1] ) return true;
  else return false;
}
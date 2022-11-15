//////////////////// 개인정비부 MAIN ////////////////////
function itemPhase (lootedItemList, plNum, player) {
  // 변수 정의
  var list = lootedItemList; // 득템단계에서 얻은 아이템의 2차원 배열 정보
  var pl = player[plNum]; // 현재플레이어 정보배열
  var logtxt = []; // 로그는 한줄로 끝내자 되도록이면  
//logtxt.push('정비부 MAIN 시작. 득템부한테서 넘겨받은 내용물: ' + basketInfo(list));// 리스트 내용물 공개

  // 소루틴 0. 가방템 다 꺼내서 list로 가져오고, 선물상자에 있는 물건도 list로 가져옴  
  var prepared = prepareList(list, pl); // 준비 실행 → [가방템과 선물상자 내용이 추가된 list와, 텍스트로그와, 가방내 아이템이 모두 비워진 플레이어 배열정보 pl]을 리턴.
  list = prepared[0]; // 템리스트 업뎃 반영
  if(prepared[1] != '없음') { logtxt = logtxt.concat(prepared[1]); } // 아이템사용 결과텍스트 있으면 반영 (여러줄이라서 concat을 쓴다.);
  pl = prepared[2]; // 가방이 비워진(혹은 그럴듯한) 플레이어 반영

  // 소루틴 1. 장비템 추려서 업글하기
  // log('소루틴1 - 장비업글 시작');
  var upgraded = upgrade(list, pl); // 얻은 장비들 리스트를 들고 업그레이드 실행 -> [이번에 판단못한 잔여아이템 리스트, 전체 로그, 변경된 플레이어변수] 리턴받는다
  list = upgraded[0]; // 템리스트 업뎃 뱐영
  if(upgraded[1] != '없음') logtxt = logtxt.concat(upgraded[1]); // 업글 결과텍스트 있으면 반영
  pl = upgraded[2]; // 장비를 장착하고 새로워진 플레이어
  // logChar(player);
  
  // 소루틴 2. 회복아이템 쓰기
  // log('소루틴2 - 회복 시작. '+pl[1]+pl[2]+'의 HP = ' + pl[11] + "/" + pl[10]);
  var healUsed = healUse(list, pl); // 회복 실행 → [플레이어 가방에서 빼낸 아이템까지 다 담겨있는 장바구니 list와, 텍스트로그와, 가방내 아이템이 모두 비워진 플레이어 배열정보 pl]을 리턴.
  // 여기서 가방에 있는 아이템들이 다 꺼내진다. 주의!
  list = healUsed[0]; // 템리스트 업뎃 뱐영
  if(!isEmpty(healUsed[1])) { logtxt.push(healUsed[1]); } // 치료 결과텍스트 있으면 반영 (1줄이라서 push를 쓴다.)
  pl = healUsed[2]; // 힐링하고 새로워진 플레이어 뱐영
  //logChar(player);

  // 소루틴 3. 기타 사용아이템 쓰기
  var itemUsed = itemUse(list, pl); // 아이템 사용 실행 → [장바구니 list와, 텍스트로그와, 사용한 아이템이 빠진 플레이어 배열정보 pl]을 리턴.
  list = itemUsed[0]; // 템리스트 업뎃 반영
  if(itemUsed[1] != '없음') { logtxt = logtxt.concat(itemUsed[1]); } // 아이템사용 결과텍스트 있으면 반영 (여러줄이라서 concat을 쓴다.)
  pl = itemUsed[2]; // 힐링하고 새로워진 플레이어 뱐영
  //logChar(player);

  // 소루틴 9. 가방에 아이템 넣기
  //log('소루틴9 - 아이템 정리 시작');
  var adjusted = adjust(list, pl); // 사용과 업글이 다 끝났으면 소모품과 가방내용을 다 늘어놓고 가질건 가지고 버릴건 버리는 모드. [로그txt, 가방비워진pl] 이 리턴된다.
  if(adjusted[0] != '없음') logtxt.push(adjusted[0]); // 짐정리 결과텍스트 있을때만 반영
  pl = adjusted[1]; // 가방 내용을 바꾸고 새로워진 플레이어 반영
  // 아이템 업그레이드는 따로 하지 않음. (소루틴3 미사용아이템 추리기 에서 이미 걸렀으니 그대로 버려도 됨. 휘발)
    
  player[plNum] = pl; // 모든 절차를 마친 현재플레이어 정보배열 내용을 전체플레이어 배열에서 갱신반영
  // 아이템은 챙길거 챙기고 다 버리는 거니까 따로 반영할거 없음. (휘발)
  //logChar(player);
  
  // 로그 기록과 업뎃된 플레이어 배열들을 갖고 대루틴으로 귀환
  return [logtxt, player];
  
}

//////////////////// 0 - 준비 PHASE ////////////////////
function prepareList(list,pl) {

  var logtxt = [];

  //log('[1] 플레이어 소지품: (' + ((pl[13] !='x')?item[pl[13]][2]:'') + pl[13] +")("+ ((pl[14] !='x')?item[pl[14]][2]:'') + pl[14]+')');
  //log('0. 준비부 시작. 업글부한테서 넘겨받은 것들: ' + basketInfo(list));// 리스트 내용물 공개  

  // (1) 플레이어 가방속 짐을 다 꺼내서 바구니에 옮겨놓고 바구니만 놓고 생각하기로함.
  if(pl[13] != 'x') list.push(pl[13]);
  if(pl[14] != 'x') list.push(pl[14]);
  pl[13] = 'x', pl[14] = 'x'; // 🅾️

  //log("0. 준비부, 준비된 보상품: " + pl[27] + "," + pl[28]);
  if(pl[27] == 'x' && pl[28] == 'x') {
    //log("발견된 선물없음");
    var viptxt = 'none';
  } else {
    var viptxt = pl[1] + pl[2] + ": 어제 공부를 열심히 하여 ";
    if(pl[27] != 'x') {
      //log("선물1("+pl[27]+item[pl[27]][2]+") 발견. 바구니의 길이-" + list.length + ", 타입-"+ typeof list + "/ 전체-" + list + "/ 0번-" + list[0]); 
      viptxt += item[pl[27]][2];
      //log('바구니에 보상품1 추가 직전: 바구니[' + basketInfo(list) + "] & 길이:" + list.length);// 리스트 내용물 공개
      
      // 아이템 종류에 따라 아이템정보를 만듬
      var newItem = pl[27];
      var theItem = makeItemInfo(newItem);
      
      list.push(theItem);
      pl[27] = 'x';
      //log('템리스트에 보상품1 추가하고 선물상자1은 비움. 바구니[' + basketInfo(list) + "] & 길이:" + list.length);
    }
    if(pl[28] != 'x') {
      //log("선물2("+pl[28]+item[pl[28]][2]+") 발견. 바구니의 길이-" + list.length + ", 타입-"+ typeof list + "/ 전체-" + list + "/ 0번-" + list[0]); 
      viptxt += item[pl[28]][2];
      //log('바구니에 보상품2 추가 직전: 바구니[' + basketInfo(list) + "] & 길이:" + list.length);// 리스트 내용물 공개  
      
      // 아이템 종류에 따라 아이템정보를 만듬
      var newItem = pl[28];
      var theItem = makeItemInfo(newItem);
  
      list.push(theItem);
      pl[28] = 'x';
      //log('템리스트에 보상품2 추가하고 선물상자1은 비움. 바구니[' + basketInfo(list) + "] & 길이:" + list.length);
    }
    viptxt += "를 얻었다!";
  } 
  
  // 상을 받은것이 있는지 점검하여 상 문구 추가함.
  //log('플레이어 상받는 문구 > ' + viptxt);
  if(viptxt != 'none') logtxt.push(viptxt);
  else logtxt = '없음';
  
  //log('소루틴0. 아이템준비 끝난시점 바구니 내용물: ' + basketInfo(list));
  
  return [list, logtxt, pl];
}


//////////////////// 1 - 업글 PHASE ////////////////////
function upgrade(list, pl) {
  
  var b4attdef = getAttDef(pl); // 기존 공방력 정보
  var plIdxs = {'탈것':3, '무기':4, '헤드':5, '외투':6, '상의':7, '신발':8, '하의':9, '가방':12}; // 문자열을 통해 idx를 알수있게 해주는 배열
  var appliedlist = []; // 적용한 장비 idx 리스트, 로그용으로만 쓸거니깐 1차원 배열로 함.
  var nextlist = []; // 리턴 배열 (장비가 모두 추출되고 소모품만 남게될거임)
  //log('소루틴1. 업글phase 내부로 들어옴');
  

  // 플레이어 변수 늘어놓기
//  log(doubleArrayToText(pl));
  //logChar(pl);
  //log('소루틴1. 업글phase가 넘겨받은 물건리스트: [' + basketInfo(list) + "] // 길이:" + list.length);// 리스트 내용물 공개  

  //DEBUG용
  //log("4또냐? 길이-" + list.length + ", 타입-"+ typeof list + "/ 전체-" + list + "/ 0번-" + list[0]); 
  //log('5list 추가전 리스트: [' + basketInfo(list) + "] & 길이:" + list.length);// 리스트 내용물 공개  
  /////list.concat([59],[82],[45,10],[27],[9],[47],[49],[84],[38,2],[40,2],[44,2],[36,10]); → 버그나서 안먹힘 이유는 모르겠음
  //log('6list 추가후 리스트: [' + basketInfo(list) + "] & 길이:" + list.length);// 리스트 내용물 공개  
  //log("7또di?"); 
  
//  log("선물코너 끝, 장비교체파트로 들어옴");
  for(var i in list) { // 리스트 내 모든 아이템 [idx, 차량의경우남은탑승횟수]
    // 0. 대상장비 idx 및 타입을 구함
    if (typeof list[i] == 'object' && list[i].length >= 2) var targetIdx = list[i][0]; // 배열 두개짜리면 탈것이나 특수아이템이므로 효과수치도 같이 들어있는것임
    else var targetIdx = list[i]; // 배열 한개짜리면 단순템임
    var type = item[targetIdx][1]; // 해당 아이템의 타입명('무기','외투', ...)
//    log(i+'번 장비 ' + item[targetIdx][2] + '('+type+')');
    
    // 1. 아이템의 종류가 장비류인지 확인함 (장비라 함은, 현재기준 탈것/무기/헤드/외투/상의/신발/하의/가방 8종류를 말함)
    if(type == '탈것' || type == '무기' || type == '헤드' || type == '외투' || type == '상의' || type == '신발' || type == '하의' || type == '가방') {
      
      // 장비라면, newlist 배열에 등록하지 않음 즉 플레이어한테 옮겨가서 장착되거나, 그대로 바닥에 버려지거나 둘중 하나임
      // 2. 플레이어 idx 및 정보를 구함
      //log('2. 정보구하기');
      var idx = plIdxs[type]; // 플레이어 배열내 장비 위치. type이 무기면 4, 외투면 6, ... 이런식으로 구해줌
      var curr = pl[idx]; // 현재 플레이어측 장비 idx
      var aftr = targetIdx; // 구할 장비의 idx
      
      // 3-1. 플레이어 장비 없었던경우면 4로 넘어감.
      if (curr == 'x') {
        //log("3-1. 현재 장비없음. 당연히 바ㅏ꿔야지");
        var effective = '바꿔낌';
      } else {
        
        // 3-2. 장비별 가치 계산
        //log('3-2 장비의 가치 계산: '+curr+'번아이템('+item[curr]+') vs ' + aftr + '번아이템('+item[aftr]+')');
        
        // 플레이어의 장비의 가치. 탈것이 아니라면 점수는 아이템 자체의 효력이며, 특수무기면 점수 가산됨
        var scorePl = item[curr][3];
        if (curr == 63) scorePl += 0.5; // 후라이팬이면 가치+0.5. 즉 모든 후라이팬이 모든 1렙무기 중에서 가장 중요함 (물론 2렙무기보단 덜하고)
        if (curr == 86) scorePl += 0.5; // 오징어탈이면 가치+0.5. 즉 모든 1렙헤드 중에서 가장 중요함 (물론 2렙헤드보단 덜하고)
        
        // 입수 검토대상 장비의 가치. 탈것이 아니라면 점수는 아이템 자체의 효력이며, 특수무기면 점수 가산됨
        var scoreLi = item[aftr][3]; 
        if (aftr == 63) scoreLi += 0.5; // 후라이팬이면 가치+0.5. 즉 모든 후라이팬이 모든 1렙무기 중에서 가장 중요함 (물론 2렙무기보단 덜하고)
        if (aftr == 86) scoreLi += 0.5; // 오징어탈이면 가치+0.5. 즉 모든 1렙헤드 중에서 가장 중요함 (물론 2렙헤드보단 덜하고)
        
        if (type == '탈것') { // 탈것이라면 남은 사용횟수를 곱해서 장비자체의이동력x잔여이동횟수 = 총이동가능거리 이렇게 점수를 만들어줌
          scorePl *= pl[18];
          scoreLi *= list[i][1]; // 효과수치
          //log("새로운 탈것("+item[aftr][2]+scoreLi+"점) vs 플레이어("+item[curr][2]+scorePl+"점)");
        }
        
        // 3-3. 현 장비화 새 장비 가치 비교하기
        //log('3-3 효능비교하기');
        var effective = ((scoreLi > scorePl) ? '바꿔낌' : '안바꿔낌');
        //log("3-3 " + i+"번 장비("+item[aftr][2]+scoreLi+"점) vs 플레이어("+item[curr][2]+scorePl+"점) => " + effective);        
      }
      
      // 5. 없는 장비가 새로 들어오는 거든가 혹은 기존에 장비가 있고 효력이 그 이상인 경우에만 얻은걸로 바꿔낌.
      if (effective == '바꿔낌') { 
        // 5-2
        //log('5-2. 바꿔낌 ok 바꿔낌 처리');

        if (type == '탈것') {
          //log("새로운 탈것정보: list=[i][" + list[i] + "], list[i][0]=[" + list[i][0] + "], list[i][1]=[" + list[i][1] + "]");
          pl[3] = list[i][0]; // 🅾️ 플레이어가 탈것을 바꿔끼는 그순간임
          pl[18] = list[i][1];// 🅾️ 탈것내구도도 적용해준다.
          // 2-1.3 유리한 정보로 바꿔낀걸 로그로 남기기 위해 appliedList에 추가함
          appliedlist[3] = item[list[i][0]][2]; // 지정된 배열의 아이콘 대치시킬 목적. 장비를 여러번 바꿔꼈을경우 생길 중복을 막기위함
        } else {
          pl[idx] = list[i]; // 🅾️ 플레이어가 장비를 바꿔끼는 그순간임
          // 2-1.3 유리한 정보로 바꿔낀걸 로그로 남기기 위해 appliedList에 추가함
          switch(type) { // 지정된 배열의 아이콘 대치시킬 목적. 장비를 여러번 바꿔꼈을경우 생길 중복을 막기위함
            case '탈것' : var applyNo = 3; break;
            case '무기' : var applyNo = 4; break;
            case '헤드' : var applyNo = 5; break;
            case '외투' : var applyNo = 6; break;
            case '상의' : var applyNo = 7; break;
            case '신발' : var applyNo = 8; break;
            case '하의' : var applyNo = 9; break;
            case '가방' : var applyNo = 12; break;
          }
          // 바꿔낀 장비목록을 아이콘화해서 텍스트로 저장해 로그 보낼 용도로 쓰는 문자열이다.
          appliedlist[applyNo] = item[list[i]][2]; 
        }
      }
    } else { // 그외 모든 장비 (회복, 기타)
      // 2-2. 장비가 아니니까, 여기서 판단할 물건이 아니므로 다음 단계로 보내기 위해 살림 (newlist 배열에 등록만 하고, 다음 단계 함수로 넘길거임)
      //log('장비가 아니므니다');
      nextlist.push(list[i]);
    }
  }
  
  // ✅ 장착이 끝난 상태라면 업그레이드 문자열 모아서 리턴해준다.
  var logtxt = [];
  
  // 업그레이드한 뭔가가 있는지 점검하여 로그텍스트에 추가함.
  //   var b4attdef = getAttDef(pl); // 기존 공방력 정보
  if (appliedlist.length > 0) { 
    var aftraffdef = getAttDef(pl); // 변경후 공격력
    var logs = pl[1] + pl[2] + ": 장비 (" + appliedlist.join('') + ") 장착";
    if(aftraffdef[0] > b4attdef[0]) logs += " [⚔️" + b4attdef[0] + " → " + aftraffdef[0] + "]";
    if(aftraffdef[1] > b4attdef[1]) logs += " [🛡️" + b4attdef[1] + " → " + aftraffdef[1] + "]";
    logtxt.push(logs);
  }

  // 위의 두 로그정리 과정을 거치고 나서 아무 메세지 변화가 없다면, '없음'으로 리턴하기 위해 변수를 바꿔준다.
  if(logtxt.length == 0) logtxt = '없음';
  
/*  debugConsoleLog("로그텍스트내용:"+logtxt);
  debugConsoleLog("로그텍스트길이:"+logtxt.length);
  debugConsoleLog("로그텍스트[0]="+logtxt[0]);
  debugConsoleLog("로그텍스트[1]="+logtxt[1]);*/
  //debugConsoleLog(logtxt);
  
  return [nextlist, logtxt, pl]; // 이번 단계에서 적용여부 판단하지 못한 잔여아이템 리스트와, 전체 로그와, 변경된 플레이어변수 리턴
}

//////////////////// 2 - 회복 PHASE ////////////////////
function healUse(list, pl) {
  
  var logtxt = '';
  
  // 내용물 공개(debug)
  //log("소루틴2. 회복 들어옴");

  // (2) 짐을 다 늘어놓은 상황에서 회복아이템을 추려봄
  var healtemlist = []; // 요 변수안에 힐템idx만 추려내서 모을거임
  for(var i in list) {
    // 물품의 장비 idx 및 타입을 구함
    if (typeof list[i] == 'object' && list[i].length >= 2) var targetIdx = list[i][0]; // 배열 두개짜리면 탈것은 아까 버렸으니까 이건 특수아이템일것이므로 효과수치도 같이 들어있는것임
    else var targetIdx = list[i]; // 배열 한개짜리면 단순템임
    var type = item[targetIdx][1]; // 해당 아이템의 타입명 구함('무기','외투', ...)
    if (type == '회복') healtemlist.push(list[i]); // 회복아이템은 무조건 배열 한개짜리라고 생각하자.. 업데이트는 나중에 하자..
  }

  // 리스트 내용물 공개 (debug)
  //log('소루틴2. 회복 들어온시점 바구니 내용물: ' + basketInfo(list));
  // 힐템리스트 공개 (debug)
  //log('   ㄴ 그중에 힐템: '+ basketInfo(healtemlist));
  
  // (3) 회복템이 있으면 다음 단계로. 아니면 heal부 전체를 건너뜀.
  if(!isEmpty(healtemlist)) {
    
    // 1 관련변수 준비
    var hpLack = pl[10] - pl[11]; // 모자란 hp량
    var heal1list = [], heal2list = []; // 힐 1짜리 리스트랑 힐 2짜리 리스트 목록을 각각 만듬
    var hplimitup = false; // 최대HP 늘어났는지 여부
    for(var j in healtemlist) { // 아까 추린 전체 힐템리스트에 있는 idx들 중에서
      if(item[healtemlist[j]][3] == 1) heal1list.push(healtemlist[j]); // 힐량이 1이면 heal 1 list에 넣고
      else if(item[healtemlist[j]][3] == 2) heal2list.push(healtemlist[j]); // 힐량이 2이면 heal 2 list에 넣는다.
    }
//log('[3]회복템을 추렸다. 힐1짜리템목록:'+heal1list +' / 힐2짜리템목록:'+heal2list);
    var choice = 'none'; // 먹기로 선택할 템 idx, 기본적으로 미선택하자는 말임.

    // 2 체력에 따라 회복약 사용여부를 결정하고, 사용한다 했을 시 베스트 회복아이템을 선택한다.
    if (hpLack == 1) { 
      // 1. 체력 1부족시 (경우의 수 1/2, 2/3)
      // 1짜리템 우선 선택 > 없으면 2짜리템 선택
      if(!isEmpty(heal1list)) choice = randomItem(heal1list);
      else if(!isEmpty(heal2list)) choice = randomItem(heal2list);
    } else if (hpLack == 2) {
      // 2. else 체력 2부족시 (경우의 수 1/3)
      // 2짜리템 우선 선택 > 없으면 1짜리템 선택
      if(!isEmpty(heal2list)) choice = randomItem(heal2list);
      else if(!isEmpty(heal1list)) choice = randomItem(heal1list);      
    } else if (pl[10] == pl[11] && (pl[10] == 1 || pl[10] == 2)) {
      // 3. else 체력이 꽉찬상태고 그렇게 찬 최대체력이 1 혹은 2 일 시 (경우의 수 1/1, 2/2)
      // 1짜리템 우선 선택 > 없으면 2짜리템 선택
      if(!isEmpty(heal1list)) choice = randomItem(heal1list);
      else if(!isEmpty(heal2list)) choice = randomItem(heal2list);
    } // 세 경우가 아닌 경우는 3/3밖에 없으므로, 자연스럽게 choice는 none이 되어, 아무 약도 선택하지 않게 되고, 3을 건너뛴다.

    // 3 고른 아이템이 있긴 있으면 - 즉 아이템을 쓰기로 했으면 - 아이템을 쓰고 바구니에서 지운다.
    if(choice != 'none') {
      // 3-1 회복아이템 사용 > 효과적용(HP회복)
      var healpower = item[choice][3]; // 힐파워 측정
      var healMinus = 0; // 과다회복시 마이너스해야되는 회복량
      if (hpLack > 0) { // 1) 체력 부족시 (경우의 수 1/2, 2/3), (경우의 수 1/3)
        pl[11] += healpower; // 힐파워만큼 현체력 더하기 (체력 회복)
        if(pl[11] > pl[10]) {
          pl[11]--; // but HP가 오버회복 됐으면 최대체력으로 낮춰준다.
          healMinus = -1; // 나중에 로그텍스트에서 힐마이너스 해줘야됨
        }
      } else { // 2) 최대체력 1 or 2 상태에서 체력 만땅일때 사용시 (경우의 수 1/1, 2/2)
        hplimitup = true;
        pl[10]++; // 최대체력만 늘려주는거임. 현재HP는 나중에 다른 물약으로 회복하시고~
      }
      pl[23]++; // 냠수+1
      // 3-2 효과 반영 완료됐으면 바구니에 있는 해당 회복템 배열에서 제거 → 플레이어가 특정idx의 를 먹는거기때문에 무작정 배열 splice하면 안됨!
      // idx찾아서 idx가 같은놈을 지워줘야됨. 0idx 10최대HP 11현재HP 13가방보관물1 14가방보관물2    
      var deleteTarget = false;
      for(var i in list) {
        if(typeof list[i] == 'object' && list[i].length >= 2) var targetIdx = list[i][0]; // 배열 두개짜리면 탈것은 아까 버렸으니까 이건 특수아이템일것이므로 효과수치도 같이 들어있는것임
        else var targetIdx = list[i]; // 배열 한개짜리면 단순템임
        if(targetIdx == choice) deleteTarget = i; // list의 i번째 놈의 idx가 내가 먹은 힐약의 idx와 같다면, 배열의 몇번째인지 기억해둔다.
      }
      // ✅ 로그 쓰기
      logtxt += pl[1]+pl[2]+': 회복(' + item[choice][2] + item[choice][4] + ") 냠냠... ";
      if(hplimitup == true) logtxt += "HP + 💖 / 최대 HP가 1 늘어났다!";
      else {
        var healed = healpower + healMinus;
        logtxt += "HP + "+ (healed==2? '❤️️❤️️' : '❤️️');
      }
      //var txts = '전체리스트 <';
      // for(var j in list) txts += item[list[j]][2] + list[j] ;
      //txts += '>의 상황에서 ' + item[list[deleteTarget]][2] + list[deleteTarget] + '의 약을 먹엇다. 지우겟다. 지운결과 ';
      // 힐약 썼으면 바구니 행렬에서 뺴낸다
      list.splice(deleteTarget, 1); 
      // for(var k in list) txts += item[list[k]][2] + list[k] ;
      //txts += '가 됏다.';
      //log(txts);
      //log("소루틴2 - 회복 끝, 로그 예상메세지: " + logtxt);
    }
  }
  // 장바구니 list와, 텍스트로그와, 플레이어 배열정보 pl을 리턴.
  // 1* 만약 회복템이 없으면 회복약 사용 루트인 (3)을 통째로 생략하게 되고, choice='none'으로 회복약 안쓴다.
  // 2* 혹은 회복템이 가방내에 있는데 체력이 3/3인 경우에도 choice='none'으로 회복약 안쓴다.
  // 이 두가지 경우는 물건을 list바구니에 옮겨담기만 하고 return 하는 꼴이 된다.
  // 그러나 힐팩을 쓴 경우에는 거기서 list에서 자기가 쓴 힐템이 하나 삭제된채로 리턴하게 된다.
//log("[2] 정비부-회복부 최종 로그> ");
//log(logtxt);
  return [list, logtxt, pl];
}

//////////////////// 3 - 아이템 사용 PHASE ////////////////////
function itemUse(list, pl) {
  var logtxt = [];
  //log('소루틴3. 아이템사용 들어옴. 일단 바구니 내용물' + basketInfo(list));// 리스트 내용물 공개  
  
  for(var i = 0;i < list.length; i++) {
    //log(i);
    //log(doubleArrayToText(list));
    //log(i+"번째 아이템 "+doubleArrayToText(list[i])+"검사");
    if(list[i][0] == 89) { // i번째 리스트가 연료통이면
      if(pl[3] >= 0) { // 플레이어가 탈것을 갖고 있다면
        //log(i+"번째 아이템 " +doubleArrayToText(list[i]) + "를 제거합니다.");
        var plus = 4; // 석유통에 설정된 탈것내구도 증분
        logtxt.push(pl[1] + pl[2] + ": " + item[pl[3]][2] + item[pl[3]][4] + "에 연료(🛢)를 콸콸 부었다! / 잔여횟수: " + pl[18] + " → " + (Number(Number(pl[18])+plus)));
        pl[18] += plus; // 탈것내구도 +4
        list.splice(i, 1); // 썼으면 리스트에서 추출함
      }
    }
    

  }
  
  //debugConsoleLog(logtxt);
  //log('소루틴3. 아이템사용 결과 바구니 내용물' + basketInfo(list));// 리스트 내용물 공개  
  return [list, logtxt, pl];
}

//////////////////// 9 - 가방에 아이템 넣기 PHASE ////////////////////
function adjust(list, pl) {
  // 가방 안의 물건과 list의 소모품을 모두 내놓고, 우선순위에 따라 가방에 물건을 다시 넣고 나머지 다 버림

  // 이시점에서 장비는 다버렸고, 필요한 힐팩은 한개는 먹었을 것이다. 아무튼 바구니 안에 소모품과 특수템만이 남는다.
  // 이 중에서 두 개의 아이템만 가져갈 수 있으며, 나머지는 모두 버림.
  // 아이템 챙기기 우선순위별로 아이템을 담아가면서, 가방 개수가 꽉차면 나머지 전부를 포기한다.
  //log('가방phase옴. 바구니 내용물' + basketInfo(list));// 리스트 내용물 공개  
  
  var virtualBag = new Array(); // 가상의 쇼핑백임.  
  var rooms = getBagRooms(pl); // 빈공간 개수다. 지금은 가방이 다 비워져있을테니 무조건 가방공간만큼 나온다.
  //log('소루틴9 가방phase옴. 현재 데이터상 가방: '+((pl[12] != 'x' )?+item[pl[12]][3]+'칸짜리':'없음') + ' / 내용물: ' + pl[13] + ', ' + pl[14] + "가방여유공간:" + rooms);
  
  // 1. 힐팩부터 잡아넣기 (2레벨 > 아무레벨 순)
  if(virtualBag.length < rooms) { // 0 < 가방공간임. 즉 가방공간이 1개나 2개면 이 if문은 실행된다.
    //log('가상백 크기:'+ virtualBag.length + " vs 내 가방공간크기: "+ rooms + "에서 힐부터 찾아볼까요?");
    var heal = findObj(list, '회복', 2); // 1) 2레벨 치료제를 찾아본다.
    //log("   ㄴ 2레벨 치료제 찾아본 결과:" + heal + "(" + heal[0] + ", " + heal[1] +")");
    if(heal[0] == 'none') { // 2) 2레벨에서 안나오면 레벨 상관말고 찾아본다.
      heal = findObj(list, '회복'); 
      //log("   ㄴ 2레벨 치료제 안나와서 아무 치료제나 찾아본 결과:" + heal + "(" + heal[0] + ", " + heal[1] +")");
    }
    if(heal[0] != 'none') { // 2레벨을 찾았던가 못찾아서 1레벨이라도 찾았던가 아무튼 힐팩하나찾기 성공하면
      virtualBag.push(heal[1]); // heal[0] ⇒ list 내의 순서 몇번째인지, heal[1] ⇒ 그 idx가 먼지 정보를 담음. heal[1] 이니까 idx가 들어가는거겠지
      //log("템찾아넣기 1. 첫힐팩 "+heal[1]+" 찾아서 잡아넣음. 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1]);
      list.splice(heal[0], 1); // 힐약 썼으면 바구니에서 빼내서 버린다
    }
  }
  
  // 2. 성장아이템 잡아넣기 (💟💟 향후 업뎃필요)
  
  // 3. 버프아이템 잡아넣기 (💟 현재 풍선만 될거같다) 
  if(virtualBag.length < rooms) { // 가상쇼핑백 개수 < 가방공간 개수 조건임. 즉 가방공간이 더크게 남으면 이 if문은 실행된다.
   //log('가상백 크기:'+ virtualBag.length + " vs 내 가방공간크기: "+ rooms + "에서 기타아이템을 찾아볼까요?");
    var buff = findObj(list, '기타'); // 1) 기타류를 찾아본다.
    if(buff[0] != 'none') { // 버프를 하나라도 찾으면
      virtualBag.push(buff[1]); // 쇼핑백에 idx 써넣는다
      //log("ㄴ찾았음 찾아넣기 3. 첫버프아이템 "+buff[1]+" 찾아서 잡아넣음. 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1]);
      list.splice(buff[0], 1); // 쓴 idx는 바구니에서 빼내서 버린다
    }
  }
  
  // 4. 힐팩부터 잡아넣기 (2레벨 > 아무레벨 순)
  if(virtualBag.length < rooms) { // 0 < 가방공간임. 즉 가방공간이 1개나 2개면 이 if문은 실행된다.
    //log('가상백 크기:'+ virtualBag.length + " vs 내 가방공간크기: "+ rooms + "에서 힐팩을 다시 찾아볼까요?");
    var heal = findObj(list, '회복', 2); // 1) 2레벨 치료제를 찾아본다.
    //log("   ㄴ 2레벨 치료제 찾아본 결과:" + heal + "(" + heal[0] + ", " + heal[1] +")");
    if(heal[0] == 'none') { // 2) 2레벨에서 안나오면 레벨 상관말고 찾아본다.
      heal = findObj(list, '회복'); 
      //log("   ㄴ 2레벨 치료제 안나와서 아무 치료제나 찾아본 결과:" + heal + "(" + heal[0] + ", " + heal[1] +")");
    }
    if(heal[0] != 'none') { // 2레벨을 찾았던가 못찾아서 1레벨이라도 찾았던가 아무튼 힐팩하나찾기 성공하면
      virtualBag.push(heal[1]); // heal[0] ⇒ list 내의 순서 몇번째인지, heal[1] ⇒ 그 idx가 먼지 정보를 담음. heal[1] 이니까 idx가 들어가는거겠지
      //log("   ㄴ 찾았음 찾아넣기 4. 두번째힐팩 찾아서 잡아넣음. 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1]);
      list.splice(heal[0], 1); // 힐약 썼으면 바구니에서 빼내서 버린다
    }
  }
  
  // 5. 그래도 안나오면 아무거나 계속 잡아넣어라
  //log('가상백 크기:'+ virtualBag.length + " vs 내 가방공간크기: "+ rooms + "에서 이제 아무거나 넣어볼까요?");
  var baku = 0;
  while(virtualBag.length < rooms && list.length > 0) {
    //log("   ㄴ " + baku++ + '번째 템집어넣기. 바구니 내용물: ' + basketInfo(list)  + ' / 바구니 물건수: ' + list.length + '개');
    //log("   ㄴ 템찾아넣기 무한. 아무거나 찾아서 "+list[0]+"를 추가로 잡아넣음. 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1]);
    virtualBag.push(list[0]);
    list.splice(0, 1); // 쓴 번째의 물건은 바구니에서 빼내서 버린다.
    //log("   ㄴ 템찾아넣은 뒤의 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1] + ' , 바구니 내용물: ' + basketInfo(list)  + ' / 바구니 물건수: ' + list.length + '개');
  }
  
  // 이렇게까지 했는데 아이템 다 못줏어담으면 곤란하겠지 그렇겠지
  
  // ✅로그 및 🅾️변수조작부
  // 이시점에선 가방에 넣을물건이 선정되어있다. 가방에 물건을 넣는 부분이다
  //log("물건 선정 끝. 가방 쑤셔넣기 시작 >>");
  if(rooms == 0) { // 1. 가방이 없으면
    //log("   ㄴ 가방이 없어서 짐정리 불요.")
    //var logtxt = pl[1] + pl[2] + ": 짐정리 불요 (소지품을 넣을 가방이 없음)";
    return ['없음', pl];
  } else { // 2. 가방이 있다면
    //log("   ㄴ 가방 있고, 쇼핑백 개수 "+virtualBag.length + ": 내용물 " + virtualBag[0]+", "+virtualBag[1]);
    if(!isEmpty(virtualBag)) { // 2-1. 가방에 넣을 만한 아이템도 있다면
      var logtxt = pl[1] + pl[2] + ": 가방에 ";
      for(var i in virtualBag) {
        pl[Number(13)+Number(i)] = virtualBag[i]; // 🅾️ 버추얼백에서 순서대로 pl에 반영
        logtxt += item[virtualBag[i]][2]; // 로그메세지 추가
        //log('   ㄴ쇼핑백'+i+'번을 플레이어 '+(Number(13)+Number(i) == 13? 1:2)+'번째 가방에 내용물 넣은 결과, 조회하면 \''+pl[Number(13)+Number(i)] +"' 이렇게 나올것임.");
      }
      logtxt += " 보유";
    } else { // 2-2 가방에 넣을 템이 없다면
      //var logtxt = pl[1] + pl[2] + ": 짐정리 불요 (정리할 소지품이 없음)";
      return ['없음', pl];
    }
  }
  
  return [logtxt, pl]; // 남는 아이템은 다 버리는 거라서 리턴 안하고 휘발시키도록함.
}

////////// 아이템 바구니([idx, eff]로 이루어진 2차원 배열)을 들려주면 아이템의 정보를 문자열 형태로 돌려줌 /////////
function basketInfo(list) {
  var txt = '';
  if(typeof list != 'object') return;
  for(var i in list) {
    // 물품의 장비 idx 및 옵션을 구함
    // 배열 두개짜리면 효과수치도 같이 들어있는것임 (탈것등) / 배열 한개짜리면 단순템임
    if (list[i].length >= 2) { var idx = list[i][0]; var eff = list[i][1]; }
    else { var idx = list[i]; var eff = 'no'; }
    
    txt += item[idx][2] + idx + '-' + item[idx][3];
    if(eff != 'no') txt += "x" + eff;
    txt += ' ';
  }
  return txt;
}
////////// 아이템 바구니([idx,eff]들로만 이루어진 배열)랑, 찾는 아이템 종류, 위력을 정해주면 아이템 DB에서 이게 몇 번째 요소인지랑 해당 idx 리턴해줌. ////////////
function findObj(list, objectType, targetPower){
  var foundIdx = 'none';
  var order = 'none';
  if(typeof list != 'object') return;
  for(var i in list) {
    // 1. 타입명 맞춰보기
    if(list[i].length >= 2) var targetIdx = list[i][0]; // 배열 두개짜리면 탈것은 아까 버렸으니까 이건 특수아이템일것이므로 효과수치도 같이 들어있는것임
    else var targetIdx = list[i]; // 배열 한개짜리면 단순템임
    var type = item[targetIdx][1]; // 타입명 따옴
    if(type == objectType){ // 2. 타입이 맞는다면 위력 맞춰보기
      if(targetPower === undefined) { order = i; foundIdx = targetIdx; } // 찾는 위력 지정 안돼있다면 바로 idx 설정
      else if(item[targetIdx][3] == targetPower) { order = i; foundIdx = targetIdx; }// 찾는 위력 지정 돼있다면 위력에 맞을때만 idx 설정
    }
  }
  return [order, foundIdx];
}

////////// 플레이어 배열을 넘겨주면 가방 빈공간 수를 돌려줌 ////////
function getBagRooms(pl) {
  if (pl[12] == 'x') {
    var space = 0; // 가방이 없으면 당연히 빈공간은 0이다  
    //log('가방:' + pl[12]);
  } else { // 가방이 있을때, 가방과 보관함의 크기에 따라서 빈공간 검사
    var rooms = item[pl[12]][3]; // 가방이 가진 칸수    
    //log('가방이 가진 칸수:'+rooms);
    if (rooms == 1) { // 가방 한칸짜리일때
      //log('가방 한칸짜리임');
      if(pl[13] != 'x') var space = 0; // 보관함1에 뭐 있으면 space 0
      else var space = 1; // 보관함1에 뭐 없으면 space 1      
    } else if (rooms == 2) { // 가방 두칸짜리일때
      //log('가방 두칸짜리임');
      if(pl[13] == 'x' && pl[14] == 'x') var space = 2; // 보관함 1, 2 둘다 비었으면 space 2
      else if(pl[13] != 'x' && pl[14] == 'x') var space = 1; // 보관함 1 뭐 있는데 2가 비었으면 space 1
      else if(pl[13] != 'x' && pl[14] != 'x') var space = 0; // 보관함 1, 2 둘다 뭐 있으면 space 0
    }
  }
  //log("가방 여유공간:" + space);
  return space; // 계산된 빈공간의 수 리턴
}

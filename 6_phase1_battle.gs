//////////////////// 실제 전투를 하고 HP 반영 후, 로그 및 플레이어함수 돌려줌 ////////////////////
function battle(atkIdx, player, currTurn) {
  // 기본 변수 준비
  var logs = [];
  
  // 전투 상대를 고름
  //  log(player[atkIdx][1]+player[atkIdx][2]+': 배틀에 들어갔다. 전투 상대를 고르기 시작했다..');
  var revIdx = getAttTarget(atkIdx, player);
  
  // 1. 타겟을 찾지 못했으면(주변에 공격할 사람이 없으면) 로그 없이 바로 리턴
  if(revIdx == 'noone') {
    //log('주변에 공격할 사람 없음');
    return [logs, player];
  }

  // 2. 주변에 타겟이 있으나 공격을 못한다면 공격 못한다는 로그 추가하고 리턴
  if(revIdx == 'didnt') {
    logs.push( [player[atkIdx][1] + player[atkIdx][2] + ": 눈에 띄지 않도록 소리 없이 움직입니다."] );
    return [logs, player];
  }
  
  // 3. 상황 정상일 떄 공격 준비
  //log(player[revIdx][1] + player[revIdx][2] + ": 전투 상대 발견 및 전투결정.");
  var attacker = player[atkIdx];
  var revenger = player[revIdx];
  
  // 기타. 상대방 오징어가면 썼을 시 5% 확률로 공격 포기
  if(revenger[5] == 86 && randomPercent(5) == true) {
    logs.push([attacker[1] + attacker[2] + ": " + revenger[1] + revenger[2] + "를 공격하려다 말았다! 오징어 탈을 쓴 모습이 너무 못생겼다.."]);
    return [logs, player];
  }

  // 4-1. 공격자 턴
  player[atkIdx][21]++; // 🅾️ 공격자 짤수(전투수) +1
  var resultAcc1 = battleAcc(attacker, revenger, 'adv'); // 공격자 명중률 계산
  var ifHit1 = randomPercent(resultAcc1); // 구한 명중률로 명중 성공여부를 계산
  //log("공격명중률: " + resultAcc1 + '%, 명중여부: ' + ifHit1 + ', ' + attacker[1] + attacker[2] + "HP " + revenger[11] + '→' + (revenger[11]-1));

  // 4-2. 맞았을 시 체력 제거 처리 및 체력없을시 사망처리, 그리고 공격로그(한줄) 제작하여 추가
  var log1 = attacker[1] + attacker[2] + ": 공격! (";
  if(attacker[4] >= 0) { // 아이템에 따른 특수효과 표현부
    if(attacker[4] == 83) { // 비올라 전용 소리처리
      if(randomPercent(33) == true) log1 += "즐겨🎻🎶~";
      else if(randomPercent(50) == true) log1 += "연주🎻🎵!";
      else log1 += "🎻";
    } else log1 += item[attacker[4]][2];
  } else log1 += "🤾🏻👊🏻";
  log1 += " @ " + Math.round(resultAcc1) + "%) → ";
  
  // 4-3. 공격성공시
  if(ifHit1 == true) {
    
    // 최종 명중률 변수를 0 ~ 100까지 준비하여, 이것을 확률체력이라 한다.
    // 다음, 플레이어가 가진 변수별 회피율을 계산하며 이 확률체력을 점차적으로 깎아나간다.
    // 매 단계마다 0이 되는지 보고, 0이하로 떨어지면 마지막에 계산된 회피율 덕에 해당 단계에서 회피한 것으로 처리한다.
    // 변수준비
    var hitDice1 = Math.random() * 100; // 0 ~ 100 ⇒ 중간에 음수가 되면 회피성공이며, 확률체력 깎기가 끝나고 양수로 남아있으면 피격판정이다 조심.
    var missed1 = false; // 데미지 감소를 무시했는지의 여부를 스위치로.. 이것은 확률체력을 다른 것과 연계하여 다중으로 깎을때 쓰일것임.
    var txts = "hitDice1(" + hitDice1 + ")"; // 출력할 로그메세지

    // 4-3-1. 초시생 실드 : 피가 1 이상일 때, 실드가 유효한 턴구간에서 실드구현확률 있음
    if(player[revIdx][11] == 1 && currTurn < shieldFinalTurn) // 피가 1 상태에서 맞았을 때, 초시생 실드가 없어지는 시점이 아니라면
      var shield1 = 100 * (shieldFinalTurn - currTurn) / shieldFinalTurn; // 현재 턴의 실드발동확률점수 구함
    else shield1 = 0; // 그게 아니면 실드회피확률점수 = 0
    hitDice1 -= shield1; // 확률체력(0 ~ 100)에서 실드를 빼본다.
    if( hitDice1 <= 0 ) { // 확률체력이 초시생 실드로 모두 깎여나갔을 때 회피이벤트 처리
      log1 += "💥" + revenger[1] + revenger[2] + " 치명타를 맞았으나 초시생의 열정으로 극복했다!🔥"; // 공격 성공했으나 초시생 실드 작동으로 방어함
      missed1 = true; // 피함 OK 처리 (즉 이후의 확률체력 깎기 이벤트는 이미 회피했으므로 모두 필요없는것이되어 무시처리하게된다). 또한 이시점에서 히트다이스가 0미만이라 맞는처리도 안된다.
    }
    txts += " - shield2(" + shield1 + ") = hitDice1(" + hitDice1 + ")"; // 디버그용 로그처리

    // 4-3-2. 후라이팬 실드 : 히트다이스 -10% (즉 회피확률 +10%)
    if(missed1 == false && revenger[4] == 63) { // 아직 확률체력이 다 깎이지 않은 상태에서 && 반격자(당하는놈)이 무기로 후라이팬을 가지고 있으면
      hitDice1 -= 10; // 히트다이스 -10% 처리 (즉 회피율 +10%)
      if( hitDice1 <= 0 ) { // 이걸로 확률체력을 다 깎았을 때 회피이벤트 처리
        log1 += "💥" + revenger[1] + revenger[2] + "의 🍳후라이팬이 데미지를 흡수해 버렸다!"; // 공격 성공했으나 후라이팬으로 막음
        missed1 = true; // 피함 OK 처리 (즉 이후의 확률체력 깎기 이벤트는 이미 회피했으므로 모두 필요없는것이되어 무시처리하게된다). 또한 이시점에서 히트다이스가 0미만이라 맞는처리도 안된다.
      }
    }
    
    // 4-3-3. 위 단계를 모두 거친 이후에도 히트다이스가 0 초과면 피격처리한다!
    if (hitDice1 > 0) {
      player[atkIdx][20]++; // 🅾️ 공격자 딜수 +1
      player[revIdx][11]--; // 🅾️ 반격자 체력 -1
      if(player[revIdx][11] <= 0) { // 4-4-1. 반격자 사망시
        player[atkIdx][19]++; // 🅾️ 공격자 킬수 +1
        log1 += "💥💥💥" + '☠️' + revenger[2] + " " +revenger[1] + "치명타!!! 꼴까닥...⚰️️️😇️️⚰️️️😇️️⚰️️️😇️️"; // 4-2-1-1. 체력 0이하 되었을 시 사망멘트
        player[revIdx][25] = currTurn; // 🅾️ 메인화면 통계용으로 킬시점의 턴수 기록하기
        player[revIdx][26] = atkIdx; // 🅾️ 반격자 시체를 나중에 공격자가 줍도록 수거예약
      } else { // 4-2-1-2-2. 체력 0 아닐 시 피격멘트
      log1 += "💥💥💥" + revenger[1] + revenger[2] + " 명중! 데미지!! (❤️️-1)"; 
      }
    }
    
  }
  // 4-3. 공격 실패시
  else log1 += revenger[1] + revenger[2] + "🎶〰️ 빗나감"; 
  
  logs.push(log1); // 로그 정리

//log(b++);  
  // 5. 상대방 체력이 남아있을 경우 반격함
  if(player[revIdx][11] > 0) {
    // 5-1. 반격자 턴
    player[revIdx][21]++; // 🅾️ 반격자 짤수(전투수) +1
    var resultAcc2 = battleAcc(revenger, attacker, 'rev'); // 반격자 명중률 계산
    var ifHit2 = randomPercent(resultAcc2); // 구한 명중률로 반격 성공여부를 계산
    //log("반격명중률: " + resultAcc2 + '%, 명중여부: ' + ifHit2 + ', ' + revenger[1] + revenger[2] + "HP " + attacker[11] + '→' + (attacker[11]-1));
    
    // 5-2. 반격에 맞았을 시 체력 제거 처리 및 체력없을시 사망처리, 그리고 반격로그(한줄) 제작하여 추가
    var log2 = "   ┏" + revenger[1] + "💢💢" + revenger[2] + "의 반격! (";
    if(revenger[4] >= 0) { // 아이템에 따른 특수효과 표현부
      if(revenger[4] == 83) { // 비올라 전용 소리처리
        if(randomPercent(33) == true) log2 += "즐겨🎻🎶~";
        else if(randomPercent(50) == true) log2 += "연주🎻🎵!";
        else log2 += "🎻";
      } else log2 += item[revenger[4]][2];
    } else log2 += "🤾🏻👊🏻";
    log2 += " @ " + Math.round(resultAcc2) + "%) → ";
    
    if(ifHit2 == true) { // 5-2-1. 반격성공시
      
      // 최종 명중률 변수를 0 ~ 100까지 준비하여, 이것을 확률체력이라 한다.
      // 다음, 플레이어가 가진 변수별 회피율을 계산하며 이 확률체력을 점차적으로 깎아나간다.
      // 매 단계마다 0이 되는지 보고, 0이하로 떨어지면 마지막에 계산된 회피율 덕에 해당 단계에서 회피한 것으로 처리한다.
      // 변수준비
      var hitDice2 = Math.random() * 100; // 0 ~ 100 ⇒ 중간에 음수가 되면 회피성공이며, 확률체력 깎기가 끝나고 양수로 남아있으면 피격판정이다 조심.
      var missed2 = false; // 데미지 감소를 무시했는지의 여부를 스위치로.. 이것은 확률체력을 다른 것과 연계하여 다중으로 깎을때 쓰일것임.
      var txts = " hitDice2(" + hitDice2 + ")"; // 출력할 로그메세지
      
      // 5-3-1. 초시생 실드 : 피가 1 이상일 때, 실드가 유효한 턴구간에서 실드구현확률 있음
      if(player[atkIdx][11] == 1 && currTurn < shieldFinalTurn) // 피가 1 상태에서 맞았을 때, 초시생 실드가 없어지는 시점이 아니라면
        var shield2 = 100 * (shieldFinalTurn - currTurn) / shieldFinalTurn; // 현재 턴의 실드발동확률점수 구함
      else shield2 = 0; // 그게 아니면 실드회피확률점수 = 0
      hitDice2 -= shield2; // 확률체력(0 ~ 100)에서 실드를 빼본다.
      if( hitDice2 <= 0 ) { // 확률체력이 초시생 실드로 모두 깎여나갔을 때 회피이벤트 처리
        log2 += "💥" + attacker[1] + attacker[2] + " 치명타를 맞았으나 초시생의 열정으로 극복했다!🔥"; // 반격 성공했으나 초시생 실드 작동으로 방어함
        missed2 = true; // 피함 OK 처리 (즉 이후의 확률체력 깎기 이벤트는 이미 회피했으므로 모두 필요없는것이되어 무시처리하게된다). 또한 이시점에서 히트다이스가 0미만이라 맞는처리도 안된다.
      }
      txts += " - shield2(" + shield2 + ") = hitDice2(" + hitDice2 + ")"; // 디버그용 로그처리

      // 5-3-2. 후라이팬 실드 : 히트다이스 -10% (즉 회피확률 +10%)
      if(missed2 == false && attacker[4] == 63) { // 아직 확률체력이 다 깎이지 않은 상태에서 && 공격자(당하는놈)이 무기로 후라이팬을 가지고 있으면
        hitDice2 -= 10; // 히트다이스 -10% 처리 (즉 회피율 +10%)
        if( hitDice2 <= 0 ) { // 이걸로 확률체력을 다 깎았을 때 회피이벤트 처리
          log2 += "💥" + attacker[1] + attacker[2] + "의 🍳후라이팬이 데미지를 흡수해 버렸다!"; // 공격 성공했으나 후라이팬으로 막음
          missed2 = true; // 피함 OK 처리 (즉 이후의 확률체력 깎기 이벤트는 이미 회피했으므로 모두 필요없는것이되어 무시처리하게된다). 또한 이시점에서 히트다이스가 0미만이라 맞는처리도 안된다.
        }
      }
      
      // 5-4. 위 단계를 모두 거친 이후에도 히트다이스가 0 초과면 피격처리한다!
      if(hitDice2 > 0) {
        player[revIdx][20]++; // 🅾️ 반격자 딜수 +1
        player[atkIdx][11]--; // 🅾️ 공격자 체력 -1
        if(player[atkIdx][11] <= 0) { // 5-4-1. 공격자 사망시
          player[revIdx][19]++; // 🅾️ 반격자 킬수 +1
          log2 += "💥💥💥" + '☠️' + attacker[2] + " " +attacker[1] + "치명타!!! 오옴마! 기절!!!⚰️️️😇️⚰️️️😇️️⚰️️️😇️️"; // 5-2-1-1. 체력 0이하 되었을 시 사망멘트
          player[atkIdx][25] = currTurn; // 🅾️ 메인화면 통계용으로 킬시점의 턴수 기록하기
          player[atkIdx][26] = revIdx; // 🅾️ 공격자 시체를 나중에 반격자가 줍도록 수거예약
        } else { // 5-4-2. 체력 0 아닐 시 피격멘트
          log2 += "💥💥💥" + attacker[1] + attacker[2] + " 명중! 데미지!! (❤️️-1)";
        }
      }
      
    }
    // 5-2-2. 반격 실패시
    else log2 += attacker[1] + attacker[2] + "🎶〰️ 빗나감"; 
    
    logs.push(log2); // 로그 정리
  }

//log(b++);  
//  log(attacker[1]+attacker[2]+': 배틀을 끝냈다.');
  return [logs, player];
}
//////////////////// 플레이어의 idx를 얻어와서, 체력등에 따라 전투확률을 에 따라 주변 8칸을 고려 전투할 대상이 있는지 확인하고, 있으면 전투대상 idx를 돌려줌 ////////////////////
// false → 공격할 상대 없음 / 'didnt' → 공격 안하고 숨음 / idx → 공격할 대상이라는뜻
function getAttTarget(idx, player, debug) {
  var pl = player[idx];
  var nearList = []; 

  // 1. 일단 주변 8칸 내의, 플레이어가 아닌, 살아있는 플레이어 idx 리스트들을 neatList에 담는다. 없으면 리턴.
  for(var i in player) {
   // log("p"+i);
    if (Math.abs(pl[15]-player[i][15]) <= 1 && Math.abs(pl[16]-player[i][16]) <= 1 && i != idx && player[i][11] > 0 && (pl[2]+"_") != (player[i][2]+"_")) {
//      log("각가운상대를찾앗다"+player[i][1]+player[i][2]);
      nearList.push(player[i][0]);
    }
  }  
//  log("모든 상대점검을 끝냇다");
  if(nearList.length == 0) { /*log("각가운대전상대는 없었다.");*/ return 'noone';} // > 기존 빈행렬체크 = [] 식
  else {
    var txt = '';
    for(var i in nearList) {
      txt += player[nearList[i]][1] + player[nearList[i]][2] + " ";
    }
    //log(pl[1]+pl[2]+"의 인접상대 리스트: " + txt);
  }
  
  // 2. 공격을 확정할 한명을 정하기 위해 nearList 리스트에 담긴 주변 인원별 공격어그로점수를 계산함. fightScore = [근접자 idx, 근접자 어그로점수]들의 목록
  //log("주변 공격대상이 "+ nearList.length +"명 있습니다. 누구를 공격할 지 검토합니다.");
  var fightScore = []; // 사람별 공격어그로점수를 정리한 배열임. 사람idx - 공격점수 순
  if(debug !== undefined) var aggroScore = []; // 사람별 아이콘, 공격어그로점수, 스코어1, 스코어2, 스코어3 담길 변수임
  for(var j in nearList) { // 사람별로 실행
    var defer = player[nearList[j]]; // 방어자 플레이어정보 배열
    
    var score1 = 0, score2 = 0, score3 = 0, score4 = 0; // 초기어그로점수 0%
    var attPerc = battleAcc(pl, defer,'adv'); // 내 공격명중률
    var revPerc = battleAcc(defer, pl, 'rev'); // 상대방 반격성공률
    // 1) 공격명중률에 따른 스코어
    if(attPerc >= 70) score1 = 3;                 // 공격명중률 70% 이상일 때 3점
    if(attPerc < 70 && attPerc >= 40) score1 = 2; // 공격명중률 70% 미만 40% 이상일 때 2점
    if(attPerc < 40) score1 = 1;                  // 공격명중률 40% 미만일 때 1점
    // 2) 반격명중률에 따른 스코어
    if(revPerc <= 20) score2 = 4;                 // 반격명중률 20% 미만일 때 4점
    if(revPerc > 20 && revPerc <= 50) score2 = 2; // 반격명중률 20% 이상 50% 미만일 때 2점
    if(revPerc > 50) score2 = 1;                  // 반격명중률 50% 이상일 때 1점
    // 3) 상대방 잔여체력에 따른 스코어
    if(defer[11] == 1) score3 = 2 ; // 체력이 1만 남은 상대일 때 2점
    else score3 = 1;                // 그외 디폴트 1점
    // 4) 상대가 자기장으로부터 벗어나는 길을 막고 있을 경우의 스코어
    // (즉, (1)자기는 자기장 영향하에 있고 (2)자기장들+캐릭들만으로 둘러싸여움직이지 못하는데 (3)상대방은 자기장 바깥구역이라면)
    // 어그로 최우선 + 100% (어그로 +30 = 1순위 공격대상)
    if(getIfInMag(pl[15], pl[16]) == true && getIfInMag(defer[15], defer[16]) == false && ifHeIsStucked(pl, player) == true) score4 = 30;
    else score4 = 0;
    // 총 공격어그로점수 산출
    var totalScore = score1 * score2 * score3 + score4;
    
    // 해당 상대와 선정될 경우 싸우게 될 확률
    if(score4 == 30) var fightPerc = 100; // 자기장 막고 있는 상대와의 싸움확률 = 100%
    else var fightPerc = pl[11] * fightPerHP; // 자기장 블로커가 아닌 사람과의 싸움확률 = 자기체력 * 체력당확률 (기본값: 자기체력*10%)

    // 계산 다끝났으면 fightScore 배열에 줄 하나 추가. [근접자 idx, 근접자 어그로점수]
    fightScore.push([nearList[j], totalScore, fightPerc]);
    
    // 디버그 시 - [어그로총점, "사람아이콘 스코어1 스코어2 스코어3 공격어그로점수"] 담아 변수화
    if(debug !== undefined) aggroScore.push([totalScore, [nearList[j] + ". " + player[nearList[j]][1] + player[nearList[j]][2] + ": " + score1 + " × " + score2 + " × " + score3 + " + " + score4 + " = " + totalScore + '점(공격대상으로 선정시 공격확률=' +fightPerc+'%)']]);

    //log("주변 공격대상 " + j + "번 " + defer[1] + defer[2] + " → 어그로 점수 공격명중률("+score1+")+반격명중률("+score2+")+잔여체력("+score3+")+자기장 길막확률("+score3+")=총점("+totalScore+")");
  }

//  log("쏘팅전"+doubleArrayToText(fightScore));
  // 3. for문 다 빠져나왔으면 근접자 공격어그로 순위를 점수 내림차순으로 정렬 ([0] = 공격어그로가 가장 높은놈)
  fightScore.sort( function(a, b) { return b[1] - a[1]; } );
//  log("쏘팅후"+doubleArrayToText(fightScore));

  // 4. 대상이 전투를 할 확률을 구해서 확률돌림을 함
  var resultPerc = randomPercent(fightScore[0][2]);
  //log(pl[1]+pl[2]+"가 " + defer[1]+defer[2]+"와 싸울 확률 = "+fightScore[0][2]+"%, 룰렛결과는 " + ((resultPerc == true )? "'공격 결정'" : "'공격 안하기로 결정'"));
  // 퍼센트가 안나오면 공격하지 않은 = 마주치지 않은, 즉 숨은걸로 한다.
  // 단, 디버그 때는 얄짤없다.
  if(resultPerc === false && debug === undefined) return 'didnt';

  // 4. 어그로 순위가 가장 높은놈의 idx 리턴
  //log("어그로 가장 높은 대상: " + player[fightScore[0][0]][1] + player[fightScore[0][0]][2] + "(" + fightScore[0][1] + "점)");
  if(debug !== undefined) return aggroScore; // 디버그시 이거 리턴함
  else {
//log("리턴직전임. fightScore.length=");
//log(fightScore.length + " / fightScore[0]=");
//log(fightScore.length + " / fightScore[0][0].length=");
//log(fightScore[0][0].length + " / fightScore[0][0]=");
//log(fightScore[0][0]);
    return fightScore[0][0];
    }
}

//////////////////// 공격 타겟과 방어 타겟의 명중률을 구함 ////////////////////
function battleAcc(atker, defer, situation, debug) {

  // 1. 공격자측 결정력: 공격력 × 10
  if(atker[4] >= 0) var atkpwr = Number(item[atker[4]][3]) * 10; else var atkpwr = 0; 

  // 2. 분위기 점수: 선빵(adv) 시 70, 반격(rev) 시 50
  var sit = (situation == 'adv') ? 70 : 50;

  // 3. 방어자측 방어력: 방어력³÷ 10
  var head = (defer[5]>=0) ? Number(item[defer[5]][3]) : 0; // 헤드
  var outer = (defer[6]>=0) ? Number(item[defer[6]][3]) : 0; // 외투
  var upper = (defer[7]>=0) ? Number(item[defer[7]][3]) : 0; // 상의
  var shoes = (defer[8]>=0) ? Number(item[defer[8]][3]) : 0; // 신발
  var lower = (defer[9]>=0) ? Number(item[defer[9]][3]) : 0; // 하의
  var defpwr = head + outer + upper + shoes + lower;
  defpwr = Math.pow(defpwr, 3)/10 ;
  
  // 4. 버프너프 점수: 
  var buffnerf = (defer[15] == 84) ? -10 : 0; // '방어자가' 풍선 지닐 시 -10%
  var buffnerf = (atker[14] == 85) ? 10 : 0; // '공격자가' 효지니570 기출문제집 지닐 시 +10%
  var buffnerf = (atker[14] == 88) ? 10 : 0; // '공격자가' 정찰드론 지닐 시 +10%
  
  // 5. 명중률 총계산
  var accuracy = (atkpwr - defpwr) + sit + buffnerf;
  if(accuracy > 100) accuracy = 100;
  if(accuracy < 0) accuracy = 0;

  // 6. 명중률 return
  if (debug === undefined) return accuracy;
  else {
    var txt = new Array();
    txt[0] = atker[1]+atker[2]+' '+ ((situation=='adv')?"선제공격시":"반격시")+': 공격력 = ' + ((atker[4] >= 0) ? (item[atker[4]][2]+'(' + item[atker[4]][3] + ') ') : '👊🏻(0) ');
    txt[0] +=  'vs ' + defer[1]+defer[2]+': 방어력 = ' + (head + outer + upper + shoes + lower) + '(' ;
    txt[0] += ((head>0)? item[defer[5]][2]+head : '') ;
    txt[0] += ((outer>0)? " " + item[defer[6]][2]+outer : '') ;
    txt[0] += ((upper>0)? " " + item[defer[7]][2]+upper : '') ;
    txt[0] += ((shoes>0)? " " + item[defer[8]][2]+shoes : '') ;
    txt[0] += ((lower>0)? " " + item[defer[9]][2]+lower : '') + ')';
    txt[1] = '   ㄴ 명중률 ' + accuracy + '% ((결정력' + atkpwr + ' - 방어력' + defpwr + ') + 상황' + sit + ' + 버프너프'+ buffnerf + ')';
    return txt;
  }
}

//////////////////// 특정 플레이어에 대한 공/방어력을 구함 ////////////////////
function getAttDef(pl) {

  var att = ((pl[4] >= 0) ? item[pl[4]][3] : 0); // 공격력
  
  var head = (pl[5]>=0) ? Number(item[pl[5]][3]) : 0; // 헤드
  var outer = (pl[6]>=0) ? Number(item[pl[6]][3]) : 0; // 외투
  var upper = (pl[7]>=0) ? Number(item[pl[7]][3]) : 0; // 상의
  var shoes = (pl[8]>=0) ? Number(item[pl[8]][3]) : 0; // 신발
  var lower = (pl[9]>=0) ? Number(item[pl[9]][3]) : 0; // 하의
  var def = head + outer + upper + shoes + lower; // 방어력
  
  return [att, def];
}

//////////////////// 자기가 자기장 및 캐릭터에 완전히 둘러싸여 완전히 꼼짝 못하는지 구해서 리턴해줌 ////////////////////
////////// 레드존 및 건물은 고려하지 않고, 자기장과 타캐릭 즉 이동할수 없거나 이동해봤자 피가 닳아버리는 이동시 확실한 손해구역만 따짐. ///////
function ifHeIsStucked(pl, player) {

  // 기본 변수
  var r = pl[15]; // row
  var c = pl[16]; // col
  
  for(var d = 0; d < 8; d++) { // 방향 (0 ~ 7)
    
    // 스위치변수로 아래 조건에 따라 true가 되면 함수결과를 '기동가능(true)'으로 return해주는 변수
    var movable = false;
    
    // 해당 좌표를 구함
    var shifted = shiftedLoc(r, c, d); // return [row, col];
    var rS = shifted[0], rC = shifted[1];
    
    // 자기장이 없고 동시에 다른 캐릭터도 없는 좌표라면, 손해를 감수하고 들어갈 수 있는 빈 레드존 지역이거나, 밟고 넘을 수 있는 건물지역임.
    // 이 경우 즉시 true로 리턴
    if(getIfInMag(rS, rC) == false && isTherePlayer(rS, rC, player) == '없음') return false;
    
  }
  
  // 여기까지 왔다면 for문을 다 돌릴 동안 '자기장도 없고 타 캐릭터도 없는' 지역은 없었다는 소리임. (있었으면 진즉 함수를 빠져나갔어야했음)
  return true;
  
}

///////////// 건네주는 좌표에 플레이어가 있는지 구해서 리턴해줌
///////// 있을 경우: 처음으로 검색되는 idx
///////// 없을 경우: '없음'
function isTherePlayer(r, c, player) {

  // 모든 플레이어에 대해 그 좌표가 함수에 전달된 r,c,가 일치하는지 찾는 for문을 돌린다.
  // 한번이라도 일치하면 해당 캐릭터의 idx를 회신
  for(var i in player) if(player[i][15] == r && player[i][16] == c) return player[i][0];
  
  // 아니면 none을 회신
  return '없음';
}
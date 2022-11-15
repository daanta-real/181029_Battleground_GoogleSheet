/* 시트선언부 시작 */
var mg_main = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("마그"); // 게임화면
var mg_log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_log"); // 메인화면에 표기될 배틀메세지 저장소
var mg_player = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_player"); // 플레이어 목록
var mg_matzip = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_matzip"); // 파밍장소 목록
var mg_roundlog = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_roundlog"); // 회차정보 목록
var mg_item = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_item"); // 아이템 목록
var mg_icon = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_icon"); // 아이콘 목록
var mg_record = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mg_record"); // 배틀기록 저장소 
var mg_inf = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("계기판"); // 계기판

/* 시트선언부 끝 */
/*-----------------------------------------------------------------------------------------------------*/
/* 고정변수 선언부 시작 */

// 게임 세팅 관련
var routineHour = 0.25; // 루틴 반복 주기 (단위: 시간) ***** 이거 구글시트 서버랑 동기화 해야됨 유일하게 해줘야하는부분임
var nextGameStartHour = 10; // 라운드 종료후 다음 라운드가 시작되는 "시각" (10시, 4시, xxx시...)
var parachuteTurn = 3; // 낙하산 접는 턴
var maxlives = 30; // 게임 즐기는 총인원
var magStart = 4; // 자기장 시작턴?
var redStart = 5; // 레드존 시작턴?
var redFreq = 3; // 레드존 반복 주기? (턴/1회)
var redPerc = 5; // 레드존 폭격확률?  (%)
var redDiffLimit = 6; // 자기장이 몇칸 이하로 쪼그라들 때부터 레드존이 안생길까?
var presentDiffLimit = 7; // 자기장이 몇칸 이하로 쪼그라들 때부터 선물상자가 안생길까?
var redGoPerc = 50; // 레드존인데도 불구하고 파밍하러 들어갈 확률
var fightPerHP = 10; // 피 1 있을때마다 전투 시도할 확률 (%)
var giftFreq = 5; // 공중보급 출현 확률 (%)
var vehicleTimes = 3; // 차량 새로 얻었을 때 이동가능 횟수
var shieldFinalTurn = 30; // 초반 실드 끝나는 턴 (실드 발동확률은 초반 확률에서부터 지속 턴이 다할 때까지 1차원 직선으로 선형 하강하며, 나중에 0이 됨.)
//var shieldPerc = shieldPercent * (shieldFinalTurn - currTurn) / shieldFinalTurn;

// 스테이터스 관련
var playerDisplayLocation = [
  [33, 2], [33, 9], [33, 16], [33, 23], [33, 30],
  [38, 2], [38, 9], [38, 16], [38, 23], [38, 30],
  [43, 2], [43, 9], [43, 16], [43, 23], [43, 30],
  [48, 2], [48, 9], [48, 16], [48, 23], [48, 30],
  [53, 2], [53, 9], [53, 16], [53, 23], [53, 30],
  [58, 2], [58, 9], [58, 16], [58, 23], [58, 30]
];

// 데이터베이스 관련
var icon = mg_icon.getRange(3, 2, mg_icon.getLastRow()-2, mg_icon.getLastColumn()).getValues();
var item = mg_item.getRange(3, 1, mg_item.getLastRow()-2, mg_item.getLastColumn()).getValues();

// 아이템 리스트 관련
var itemList_head = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 86]; // 헤드
var itemList_outer = [16, 17, 18, 19, 20]; // 외투
var itemList_upper = [10, 11, 12, 13]; // 상의
var itemList_shoes = [21, 22, 23, 24, 25, 26, 27]; // 신발
var itemList_lower = [14, 15]; // 하의
var itemList_weapon = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83]; // 무기
var itemList_talgut = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 87]; // 탈것
var itemList_heal = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]; // 회복
var itemList_bag = [28, 29, 30, 31, 32]; // 가방
var itemList_guitar = [84, 85, 88, 89]; // 기타

/* 고정변수 선언부 끝 */
/*-----------------------------------------------------------------------------------------------------*/

// 기본 함수 선언부
// 2차원 배열을 풀어서 한 줄로 보여줌. 서브항목은 배열일 경우에만 대괄호에 넣는다.
function doubleArrayToText(arr) {
  var tts = '';
  for(var r in arr) {
    if(r > 0) tts += ",";
    if( typeof arr[r] == 'object' && arr[r].length >= 2 )  {
      for(var s in arr[r]) {
        if(s > 0) tts += "/";
        tts += arr[r][s];
      }
    } else tts += arr[r];
  }
  return tts;
}

// mg_log DB에 로그 추가함
//
// loop_pl의 입력배열 : [logtxt[k], currTurn, plNum]
// loop_sys의 입력배열: [logtxt[i], currTurn] → 그외 다른 입력배열도 동일함.
// 그외 간헐적 입력배열: logtxt
//
// 출력 목표 배열: [현재시각, 현재라운드, 현재턴, 플레이어넘버, 텍스트]
function log(txt) {
  var currRound = mg_main.getRange(6,5).getValue();
  
  if (typeof txt == 'object' && txt.length >= 2) { // 배열형태로 입력받았을 때
    var texts = [];
    for(var i in txt) if (txt[i].length == 3) texts.push([new Date(), currRound, txt[i][1], txt[i][2], txt[i][0]]);
    else texts.push([new Date(), currRound, txt[i][1], -1, txt[i][0]]);
    mg_log.getRange(mg_log.getLastRow()+1, 1, texts.length, 5).setValues(texts);
  } else { // 한 개의 메세지를 입력받았을 때
    var currTurn = -1, plNum = -1;
    var inputMsg = [[new Date(), currRound, currTurn, plNum, txt]];
    mg_log.getRange(mg_log.getLastRow()+1, 1, 1, 5).setValues(inputMsg);
  }
}

// 배열의 요소 중 랜덤한 하나를 리턴
function randomItem(a) { return a[Math.floor(Math.random() * a.length)]; }

// 입력한 퍼센트의 확률로 true를 반환함
function randomPercent(percentage) { return ((Math.random()*100) <= percentage) ? true : false; }

// 넘어온 값이 빈값인지 체크합니다. !value 하면 생기는 논리적 오류를 제거하기 위해 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
var isEmpty = function(value){
  if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ) return true;
  else return false; 
};

// 디버그: 콘솔창에 로그 표시
function debugConsoleLog(txt) {
  var currLogNo = mg_inf.getRange(4, 71).getValue();
  if (typeof txt == 'object' && txt.length >= 2) {
    var texts = [];
    for(var i in txt) {
      texts.push([txt[i]]);
    } 
    mg_inf.getRange(4 + currLogNo, 70, texts.length, 1).setValues(texts);
    mg_inf.getRange(4, 71).setValue((Number(currLogNo)+texts.length));
  } else {
    mg_inf.getRange(4 + currLogNo, 70).setValue(txt);
    mg_inf.getRange(4, 71).setValue((Number(currLogNo)+1));
  }
}

// 디버그: 콘솔창 클리어
function debugConsoleClear() {
  mg_inf.getRange(4, 70, mg_inf.getLastRow()-3, 2).clear().setBackground("#d0cbb7").setFontFamily("Poor Story");
}

//////////////////// 좌표와 방향번호를 받아 그 방향으로 한칸 이동한 곳의 좌표를 리턴함 ////////////////////
function shiftedLoc(row, col, direction) {
  row = Number(row), col = Number(col), direction = Number(direction);
  var sh = [row, col];
  switch(direction) {
      case 0: sh[0]--;   break;
      case 1: sh[0]--; sh[1]++; break;
      case 2: sh[1]++; break;
      case 3: sh[0]++; sh[1]++; break;
      case 4: sh[0]++; ;   break;
      case 5: sh[0]++; sh[1]--; break;
      case 6: sh[1]--; break;
      case 7: sh[0]--, sh[1]--; break; 
  }
  return sh;
}

//////////////////// 방향번호를 받으면 그 방향에 맞는 화살표를 리턴함 ////////////////////
function dirArrow(direction) {
  var arrows = ['⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️'];
  return arrows[direction];
}

//////////////////////// 목표 DB를 주어진 변수로 다시 쓴다. /////////////////////////
function db_rewrite(targetDb, arr) {
  targetDb.getRange(3,1, arr.length, arr[0].length).setValues(arr);
}


//////////////////// 주어진 시드를 이용하여 의사난수를 생성 /////////////////////
//////////////////// 단, seed에 0을 입력하는것만큼은 피하자.. /////////////////
function randomBySeed(seed) {
    var x = Math.sin(seed++) * 10000;
    return (x - Math.floor(x));
}

//////////////////// 지정된 자릿수만큼 숫자의 빈부분에 0을 채워서 리턴하는 함수 /////////////////////
//////////////////// 예: pad(2,3) = 002 /////////////////////
function pad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}
/*
var student = [
    { name : "재석", age : 21},
    { name : "광희", age : 25},
    { name : "형돈", age : 13},
    { name : "명수", age : 44}
]

// 이름순으로 정렬 
student.sort(function(a, b) { // 오름차순
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    // 광희, 명수, 재석, 형돈
});

student.sort(function(a, b) { // 내림차순
    return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
    // 형돈, 재석, 명수, 광희
});

// 나이순으로 정렬 
var sortingField = "age";

student.sort(function(a, b) { // 오름차순
    return a[sortingField] - b[sortingField];
    // 13, 21, 25, 44
});

student.sort(function(a, b) { // 내림차순
    return b[sortingField] - a[sortingField];
    // 44, 25, 21, 13
});
*/
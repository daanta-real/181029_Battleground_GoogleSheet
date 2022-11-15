/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
// 시트 대변수 가져오기 시작
var sh_study = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("스터디시트");
var sh_engWord = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("영어단어집");
var sh_statistics = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("통계");
var sh_weekend = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("주말작업"); // 주말 작업용 시트
var sh_coloringbook = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("컬러링북"); // 색상테스트용 시트
// 시트 대변수 가져오기 끝

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
// 초기 변수선언부 시작
var maxPeople = 30; // 시트최대수용인원
var colorRainbow = ["#C2795F", "#CCC166", "#5CC75C", "#5A6CBA", "#B461BA"]; // 레인보우 색상표(간소화)
// var colorRainbow = ["#B85656", "#C2795F", "#CCC166", "#8CB85A", "#5CC75C", "#58BA86", "#609ABF", "#5A6CBA", "#7858B3", "#B461BA", "#BA5D0E", "#B55D0C"]; // 레인보우 색상표(원본)
// for (var i=0; i<colorRainbow.length; i++) sh_study.getRange("A"+(i+1)).setBackground(colorRainbow[i]); // 레인보우 전체색상표 A열 1행부터 쭈루룩 출력하는 기능 (DEBUG용)
var memoPastePosR = 16; // 메모) 메모붙이기위치 좌상단것의 셀번호 row
var memoPastePosC = 33; // 메모) 메모붙이기위치 좌상단것의 셀번호 col
var fontsColor = "#444444"; // 전 스터디원 폰트 기본색상
var normalCellBgColor = "#d4ddbc"; // 일반 스터디원 셀 배경색상
var top3CellBgColor = "#ebf5d0"; // 베스트 스터디원 셀 배경색상
// 초기 변수선언부 끝

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */

function ssdd() {
  // 시트 날짜입력란에 오늘자 날짜 입력
  var date_raw = new Date(new Date().getTime());
  var shtDate = date_raw.getYear() + "-" + pad(date_raw.getMonth()+1,2) + "-" + pad(date_raw.getDate(),2); // 7일전 날짜 기준으로, "180716" 이런식의 문자열을 만듬
  sh_study.getRange("E5").setValue(shtDate);
}

// 월요일마다 수행하는 주간작업
function sheetRoutine_weeklyWork_mondayMorning() {

  var spreadsheet = SpreadsheetApp.getActive();

  // 통계추가
  var newRow = sh_statistics.getLastRow()+1;
  sh_statistics.getRange(newRow, 1).setValue("");
  sh_weekend.getRange('H7:AI36').copyTo(sh_statistics.getRange(newRow,1), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  sh_weekend.getRange('H7:S36').copyTo(sh_statistics.getRange(newRow,1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
  
  // 통계 필터 재설정
  sh_statistics.getFilter().removeColumnFilterCriteria(28);
  var criteria = SpreadsheetApp.newFilterCriteria()
  .whenCellEmpty()
  .build();
  sh_statistics.getFilter().setColumnFilterCriteria(28, criteria);
  
  // 현 시트 통째로 사본 떠서 락 걸고 숨기기
  var date_raw = new Date(new Date().getTime() - 1000*60*60*24*7); // 7일전
  var shtName = (date_raw.getYear()-2000) + "" + pad(date_raw.getMonth()+1,2) + "" + pad(date_raw.getDate(),2) + ""; // 7일전 날짜 기준으로, "180716" 이런식의 문자열을 만듬
  spreadsheet.setActiveSheet(sh_study, true);
  spreadsheet.duplicateActiveSheet();
  spreadsheet.getActiveSheet().setName(shtName).protect();
  spreadsheet.getActiveSheet().hideSheet();
  
  // 새 시트 서식 본시트에 적용 전 본시트 내의 조건부 서식 삭제
  sh_study.getRange('B8').activate();
  var conditionalFormatRules = sh_study.getConditionalFormatRules();
  conditionalFormatRules.splice(0, 1);
  sh_study.setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = sh_study.getConditionalFormatRules();
  conditionalFormatRules.splice(0, 1);
  sh_study.setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = sh_study.getConditionalFormatRules();
  conditionalFormatRules.splice(0, 1);
  sh_study.setConditionalFormatRules(conditionalFormatRules);
  
  // 새 시트 서식 적용 from 컬러링북
  spreadsheet.setActiveSheet(sh_study, true);
  sh_study.getRange(1, 1).activate();
  sh_coloringbook.getRange(1, 1, 8 + maxPeople, 47).copyTo(sh_study.getRange(1, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  
  // 시트 날짜입력란에 오늘자 날짜 입력
  var date_raw = new Date(new Date().getTime());
  var shtDate = date_raw.getYear() + "-" + pad(date_raw.getMonth()+1,2) + "-" + pad(date_raw.getDate(),2); // 7일전 날짜 기준으로, "180716" 이런식의 문자열을 만듬
  sh_study.getRange("E5").setValue(shtDate);
  
  // 시트 입력란 초기화후 서식을 주말작업용 시트에 백업
  sh_study.getRange('F8:L37').clearContent(); // 시트 시간입력부 초기화
  sh_study.getRange('\'스터디시트\'!B8:L37').copyTo(sh_weekend.getRange("AK5"), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false); // 서식을 주말작업용 시트에 백업

}

// 매시간마다 수행하는 작업
function sheetRoutine_hour() {
  sheetCleaning(); // 시트청소
  studyRainbow(); // 무지개 반짝이
  engWord(); // 매시간 영단어
}

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
// 남김말 - 메모로 남긴 할말 순위표로 자동삽입 시작 <5분마다 실행>
function top10memo () {
  var personalId="", memo="";
  for (var j = 0; j < 10; j++) {
    var r = 18 + ((j >= 5) ? 12 : 0);
    var c = 33 + (j % 5) * 3;
    personalId = sh_study.getRange(r, c).getValue(); // Best 10 개인의 ID넘버 따기
    memo = sh_study.getRange("D"+(7+personalId)).getNote(); // ID로 셀주소 구해서 메모 따오기
    //memo = memo.replace("\n", " 엔터");
    //memo = memo.replace("\n", " 엔터");
    r = 16 + ((j >= 5) ? 12 : 0);
    c = 33 + (j % 5) * 3;
    sh_study.getRange(r, c).setValue(memo != "" ? "\"" + memo + "\"" : ""); // 각자 셀에 써놓은 메모 지정된 셀에 출력
  }
}

// 시트 청소기 - 흐트러진 서식 청소, 빈자리 찾아서 내용 비우기 시작 <매시간 실행>
function sheetCleaning() {
  // 시트 서식 초기화 (주말작업용 시트에 있는 깨끗한 서식을 붙여넣기 적용)
  sh_weekend.getRange('AK5:AU34').copyTo(sh_study.getRange("b8"), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  
  // 빈자리 셀 내용 초기화
  var sheetNames = sh_study.getRange(8, 4, maxPeople-10, 1).getValues();
  for(var i = 0; i < maxPeople-10; i++) if(sheetNames[i] == "" || sheetNames == " ") sh_study.getRange(8 + i, 4, 1, 9).setValues([["(빈자리)", "", "", "", "", "", "", "", ""]]);
}

// 반짝이 - 효과 적용 <매시간 실행>
function studyRainbow() { // 강조셀 칼라변경 처리
  sh_study.getRange("B8:D37").setFontColor(null);
  for(var i = 0; i < 3; i++) {
    var color = Math.floor(Math.random() * colorRainbow.length);
    var bestCellIdx = sh_study.getRange(18, (33+i*3)).getValue();
    sh_study.getRange(7+bestCellIdx, 2, 1, 3).setFontColor(colorRainbow[color]);
  }
}

// xx시의 영단어
function engWord() {
  var rand = Math.floor(Math.random() * (sh_engWord.getLastRow() - 1)) + 2;
  var words = sh_engWord.getRange(rand, 2, 1, 2).getValues();
  var txt = "●이시각 영단어!● [" + new Date().getHours() + "시: " + words[0][0] + " ▶ " + words[0][1] + "]";
  sh_study.getRange("B3").setValue(txt);
}

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
// 스케치북

function shtColorAll() {
  var spreadsheet = SpreadsheetApp.getActive();
  var color1 = "#" + sh_coloringbook.getRange(5, 40).getValue();
  var color2 = "#" + sh_coloringbook.getRange(6, 40).getValue();
  var color3 = "#" + sh_coloringbook.getRange(7, 40).getValue();
  var color4 = "#" + sh_coloringbook.getRange(8, 40).getValue();
  var color5 = "#" + sh_coloringbook.getRange(9, 40).getValue();
  var color6 = "#" + sh_coloringbook.getRange(10, 40).getValue();
  var color7 = "#" + sh_coloringbook.getRange(11, 40).getValue();

  // 칼라1
  sh_coloringbook.getRangeList(['B2:AE2', 'AQ2:AT13']).activate()
  .setBorder(null, true, null, null, null, null, color1, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
  .setBorder(null, null, null, true, null, null, color1, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh_coloringbook.getRangeList(['B2:AE2', 'AQ2:AT13', 'AG16:AH17', 'AJ16:AK17', 'AM16:AN17', 'AP16:AQ17', 'AS16:AT17', 'AG28:AH29', 'AJ28:AK29', 'AM28:AN29', 'AP28:AQ29', 'AS28:AT29']).activate()
  .setBackground(color1);
  sh_coloringbook.getRange('B4:AE37').activate();
  sh_coloringbook.getActiveRangeList().setBorder(true, true, true, true, null, null, color1, SpreadsheetApp.BorderStyle.SOLID);
  sh_coloringbook.getRange('AD7:AD37').activate();
  sh_coloringbook.getActiveRangeList().setBorder(null, null, null, true, null, null, color1, SpreadsheetApp.BorderStyle.SOLID);
  sh_coloringbook.getRangeList(['B2:AE2', 'AQ2:AT13', 'AS16:AT17', 'AP16:AQ17', 'AM16:AN17', 'AJ16:AK17', 'AG16:AH17', 'AG28:AH29', 'AJ28:AK29', 'AM28:AN29', 'AP28:AQ29', 'AS28:AT29']).activate()
  .setBackground(color1);
  sh_coloringbook.getRange('F8:L37').setBorder(null, true, null, true, null, null, color1, SpreadsheetApp.BorderStyle.SOLID);

  // 칼라2
  sh_coloringbook.getRange('B4:AE7').activate();
  sh_coloringbook.getActiveRangeList().setBackground(color2)
  .setFontColor(color7);

  // 칼라3
  sh_coloringbook.getRange('AC8:AD37').activate();
  sh_coloringbook.getActiveRangeList().setBackground(color3)
  .setFontColor(color6);
  
  // 칼라4
  sh_coloringbook.getRange('E8:L37').activate();
  sh_coloringbook.getActiveRangeList().setBackground(color4)
  .setFontColor(color6);
  
  // 조건부서식 어두운칼라준비
  var colorStr3 = [color3.substr(1,2), color3.substr(3,2), color3.substr(5,2)];
  colorStr3 = [parseInt(colorStr3[0], 16)-30, parseInt(colorStr3[1], 16)-30, parseInt(colorStr3[2], 16)-30];
  colorStr3 = [Math.abs(colorStr3[0]), Math.abs(colorStr3[1]), Math.abs(colorStr3[2])];
  colorStr3 = [colorStr3[0].toString(16), colorStr3[1].toString(16), colorStr3[2].toString(16)];
  colorStr3 = "#" + colorStr3.join("");
  
  // 칼라5
  sh_coloringbook.getRangeList(['AF1:AP14', 'AP1:AU1', 'AP14:AU14', 'AU1:AU38', 'AI14:AI38', 'AL13:AL38', 'AO14:AO38', 'AR14:AR38', 'AF14:AF38', 'AF30:AU38', 'AF18:AU26', 'A1:AF1', 'A1:A38', 'A3:AF3', 'A38:AF38'])
  .setBackground(color5)
  .setBorder(null, null, null, null, true, true, color5, SpreadsheetApp.BorderStyle.SOLID);
  sh_coloringbook.getRangeList(['AH19:AH26', 'AK19:AK26', 'AN19:AN26', 'AQ19:AQ26', 'AT19:AT26', 'AT31:AT38', 'AQ31:AQ38', 'AN31:AN38', 'AK31:AK38', 'AH31:AH38', 'AJ30', 'AM30', 'AP30', 'AS30', 'AS18', 'AP18', 'AM18', 'AJ18', 'AG18', 'AG30'])
  .setFontColor(color5);
  sh_coloringbook.getRangeList(['AH18', 'AK18', 'AN18', 'AQ18', 'AT18', 'AT30', 'AQ30', 'AN30', 'AK30', 'AH30', 'AG19:AG26', 'AJ19:AJ26', 'AM19:AM26', 'AP19:AP26', 'AS19:AS26', 'AS31:AS38', 'AP31:AP38', 'AG31:AG38', 'AJ31:AJ38', 'AM31:AM38'])
  .setFontColor(color6);
  
  // 조건부서식 적용
  spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('B8:D37').activate();
  var conditionalFormatRules = spreadsheet.getActiveSheet().getConditionalFormatRules();
  conditionalFormatRules.splice(0, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([spreadsheet.getRange('B8:D37')])
  .whenFormulaSatisfied('=or(($D8=$AH$15),($D8=$AK$15),($D8=$AN$15))')
  .setBackground(colorStr3)
  .setFontColor(color6)
  .build());
  spreadsheet.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = spreadsheet.getActiveSheet().getConditionalFormatRules();
  conditionalFormatRules.splice(1, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([spreadsheet.getRange('B8:D37')])
  .whenFormulaSatisfied('=and($D8<>"(빈자리)",$D8<>"",$D8<>" ")')
  .setBackground(color3)
  .setFontColor(color6)
  .build());
  spreadsheet.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = spreadsheet.getActiveSheet().getConditionalFormatRules();
  conditionalFormatRules.splice(2, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([spreadsheet.getRange('B8:D37')])
  .whenFormulaSatisfied('=or($D8="(빈자리)",$D8="",$D8=" ")')
  .setBackground(color4)
  .setFontColor(color6)
  .build());
  spreadsheet.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);

  sh_coloringbook.getRange(5, 40).activate();
}

// 시트의 권한을 유지한 채로 사본을 생성
/*function duplicateSheetWithProtections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  sheet = ss.getSheetByName('스터디시트');
  sheet2 = sheet.copyTo(ss).setName('My Copy'); 
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var p = protections[i];
    var rangeNotation = p.getRange().getA1Notation();
    var p2 = sheet2.getRange(rangeNotation).protect();
    p2.setDescription(p.getDescription());
    p2.setWarningOnly(p.isWarningOnly());
    if (!p.isWarningOnly()) {
      p2.removeEditors(p2.getEditors());
      p2.addEditors(p.getEditors());
      // p2.setDomainEdit(p.canDomainEdit()); //  only if using an Apps domain 
   }
  }
} */

// 필터링 단어 생성기
function filters() {
  var midChars = "~`!1@2#3$4%5^6&7*8(9)0_-+=qwertyuiop{[}]|\asdfghjkl:;\"'zxcvbnm<>.?/─│┌┐┘└├┬┤┴│━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂┒┑┚┙┖┕┎┍┞┟┡┢┦┧┩┪┭┮┱┲┵┶┹┺┽┾╀╁╃╄╅╆╇╈╉╊＃＆＊＠§※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞¶†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡?ªº！＇，．／：；？＾＿｀｜￣、、。·‥…¨〃­―∥＼∼´～ˇ˘˝˚˙¸˛¡¿ː＋－＜＝＞±×÷≠≤≥∞∴♂♀∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬∈∋⊆⊇⊂⊃∪∩∧∨￢⇒⇔∀∃∮∑∏ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωÆÐĦĲĿŁØŒÞŦŊæđðħıĳĸŀłøœßþŧŋŉАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюяⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈊㈋㈌㈍㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛＂（）［］｛｝‘’“”〔〕〈〉《》「」『』【】ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂＄％￦Ｆ′″℃Å￠￡￥¤℉‰?㎕㎖㎗ℓ㎘㏄㎣㎤㎥㎥㎦㎙㎚㎛㎜㎝㎞㎟㎠㎡㎢㏊㎍㎎㎏㏏㎈㎉㏈㎧㎨㎰㎱㎲㎳㎴㎵㎶㎷㎸㎹㎀㎁㎂㎃㎄㎺㎻㎼㎽㎾㎿㎐㎑㎒㎓㎔Ω㏀㏁㎊㎋㎌㏖㏅㎭㎮㎯㏛㎩㎪㎫㎬㏝㏐㏓㏃㏉㏜㏆ㅥㅦㅧㅨㅩㅪㅫㅬㅭㅮㅯㅰㅱㅲㅳㅴㅵㅶㅷㅸㅹㅺㅻㅼㅽㅾㅿㆀㆁㆂㆃㆄㆅㆆㆇㆈㆉㆊㆋㆌㆍㆎ½⅓⅔¼¾⅛⅜⅝⅞¹²³⁴ⁿ₁₂₃₄ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡㅃㅉㄸㄲㅆㅒㅖㅙㅘㅚㅟㅝㅞㅢ";
  var inputWords = ["일본", 	"궐기", 	"제국", 	"日本", 	"帝国", 	"니뽄", 	"무띠", 	"운지", 	"무현", 	"부엉", 	"무쿤"];
  
  var txt = '';
  
  // 1레벨
  for(var k = 0; k < midChars.length; k++) {
    if(k>0) txt += ",";
    for(var i = 0; i < inputWords.length; i++) {
      if(i>0) txt += ",";
      var inputWord = inputWords[i];
      for(var j = 0; j < inputWord.length; j++) {
        //Browser.msgBox(inputWord[j]);
        txt += inputWord[j];
        if(j < inputWord.length-1) txt += midChars[k];
      }
      var sht = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("시트542");
      //sht.getRange(sht.getLastRow()+1, 1).setValue(txt);
    }
  }
  
  // 2레벨
  for(var k = 0; k < midChars.length; k++) {
    if(k>0) txt += ",";
    for(var i = 0; i < inputWords.length; i++) {
      if(i>0) txt += ",";
      var inputWord = inputWords[i];
      for(var l = 0; l < midChars.length; l++) {
      if(l>0) txt += ",";
        for(var j = 0; j < inputWord.length; j++) {
          //Browser.msgBox(inputWord[j]);
          txt += inputWord[j];
          if(j == 0) txt += midChars[k] + midChars[l];
        }
      }
      var sht = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("시트542");
      //sht.getRange(sht.getLastRow()+1, 1).setValue(txt);
    }
  }
  
  sht.getRange(sht.getLastRow()+1, 1).setValue(txt);
}
//複数扱うやつの一括定義
const sh = SpreadsheetApp.getActive();
const propaties = PropertiesService.getScriptProperties();
const cache = CacheService.getScriptCache();

//シート書き込みの設定
const config = {
  uplane:1,
  leftlane:2,
  datalane:4
}

function doGet(e) {
  if(e.parameter.lane){
    const lane = e.parameter.lane;
    const group = String(lane).slice(0,lane.length -1);

    if(e.parameter.data){
      const data = e.parameter.data;
      SaveData(lane,group,data);
      return ContentService.createTextOutput("success");
    }
    else{
      //データ更新時間との比較
      if(cache.get(`temporally_time${group}`)<=new Date().getTime()){
        return ContentService.createTextOutput(propaties.getProperty(`${lane}`));
      }
      else{
        //何も返さない
        return;
      }
    }
  }
  else if(e.parameter.page == "index"){
    const template = HtmlService.createTemplateFromFile("index").evaluate();
    template.setTitle('ID共有');
    template.setFaviconUrl(`https://drive.google.com/uc?id=1WI5tEPSNAw6oRuOL9EwFNGpNFh_b6DX-&.png`)
    return template;
  }
  else{
    return ContentService.createTextOutput("not acctual param");
  }
}

function SaveData(lane,group,data){
  propaties.setProperties({
    [lane]:data
  })
  SetDataSheet(lane,data);
  //データ更新時間の入力 時間に2000を加算(2秒)
  cache.put(`temporally_time${group}`,new Date().getTime() + 900);
  //レーンキャッシュを作成
  //cache.put("temporally_lane",String(lane).slice(0,lane.length -1));
  return;
}

function GetData(num) {
  const data = propaties.getProperty(`${String(num)}`);
  return data;
}

function GetGroupData(num){
  //時間比較
  if(cache.get(`temporally_time${num}`) >= new Date().getTime()){
    return GetPropertyDatas(num);
  }
  return null;
}

function GetPropertyDatas(num){
    //0(トップページなら)
    if(num == 0) return null;
    let data = [];
    for(let i = 1; i < 10; i++){
      data[i] = propaties.getProperty(`${String(num)}${String(i)}`)
    }
    return data;
}

//表示用シートに書き込み
function SetDataSheet(lane,data){
  let position = [
    String(lane).slice(0,lane.length -1),
    String(lane).slice(lane.length - 1, lane.length)
  ];
  console.log(position);
  const ss = sh.getSheetByName(`グループ${position[0]}`);
  ss.getRange(
      Number(position[1]) + config.uplane,
      config.leftlane
    ).setValue(data);
  return;
}

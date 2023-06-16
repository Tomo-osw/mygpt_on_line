const GPT_APIKEY = '***'; //ChatGPTのAPIキー
const LINEAPI_APIKEY = '***';    // LINEのAPIキー
const LINE_ENDPOINT_URL = "https://api.line.me/v2/bot/message/reply";
const OPENAI_ENDPOINT_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';
const MODEL_TEMP = 0.5; // 返信の多様性の設定(MIN:0,MAX:1)
const MAX_TOKENS = 1000; // 返信トークンの最大値の設定(MAX:4096)

// ニューロールの設定を正規表現で指定
const botSetRole = new RegExp(/^ニューロール/)

function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];
  const replyToken = event.replyToken;
  let lastMessage = event.message.text;

  // アカウント追加・スタンプ・画像などは終了
  if (lastMessage === undefined) {
    return ContentService.createTextOutput(JSON.stringify({'content': 'NOT INCLUDE MESSAGE'})).setMimeType(ContentService.MimeType.JSON);
  }

  // ニューロールのウェイクワード取得時は新規でロールを設定・それ以外の場合は各種APIの処理を行う
  if (lastMessage.match(botSetRole)) {
    //スクリプトプロパティのうち、role_bot_contentにロールを設定、line_bot_memoryの中身を初期化して終了
    lastMessage = lastMessage.replace(botSetRole, "");
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('role_bot_content', JSON.stringify(lastMessage));
    scriptProperties.setProperty('line_bot_memory', JSON.stringify([]));
    return ContentService.createTextOutput(JSON.stringify({'content': 'SETROLE OK'})).setMimeType(ContentService.MimeType.JSON);
  } else {
    // スクリプトプロパティからbotの会話内容と　役割をそれぞれ取得
    const scriptProperties = PropertiesService.getScriptProperties();
    const currentLogContent = JSON.parse(scriptProperties.getProperty('line_bot_memory'));
    const botRoleContent = JSON.parse(scriptProperties.getProperty('role_bot_content'));

    const memorySize = 3; //会話履歴のセット数を指定
    //取得する会話のセット数に従って履歴を取得する
    var slicedLogContent;
    if(currentLogContent.length > memorySize){
      slicedLogContent = currentLogContent.slice(0, memorySize)
    } else {
      slicedLogContent = currentLogContent.slice()
    }

    // GPTにロールの会話情報をsystemで指定する
    let conversations = [
      {"role": "system", "content": botRoleContent } 
    ]    

    // GPTに過去の会話情報をそれぞれuser,assistantで指定する
    slicedLogContent.slice().reverse().forEach(element => {
      conversations.push({"role": "user", "content": element.userMessage})
      conversations.push({"role": "assistant", "content": element.botMessage})  
    })
    
    // GPTに今回の会話情報をuserで指定する
    conversations.push({"role": "user", "content": lastMessage})

    // GPTに送信するOptionsを生成
    const Options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+ GPT_APIKEY
      },
      "payload": JSON.stringify({
        "model": MODEL_NAME,
        'max_tokens': MAX_TOKENS,   // 返信トークンの最大値の設定(MAX:4096)
        'temperature': MODEL_TEMP,  // 返信の多様性の設定(MIN:0,MAX:1)
        "messages": conversations
      })
    }

    // GPTのAPIを呼び出す
    const response = UrlFetchApp.fetch(OPENAI_ENDPOINT_URL, Options);

    // OK(code = 200)の時
    if(response.getResponseCode() == 200){
      // GPTのAPIからの応答処理
      const responseText = response.getContentText();
      const json = JSON.parse(responseText);
      const botReply = json['choices'][0]['message']['content'].trim();

      // LINEのAPIに応答内容を送信
      UrlFetchApp.fetch(LINE_ENDPOINT_URL, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + LINEAPI_APIKEY,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'replyToken': replyToken,
          'messages': [{
            'type': 'text',
            'text': botReply,
          }]
        })
      });

      // 最新の会話履歴をスクリプトプロパティへ保存
      // 会話履歴はmemorySizeを保存
      newLogContent = currentLogContent;
      newLogContent.unshift({
        userMessage: lastMessage,
        botMessage: botReply
      })
      newLogContent = newLogContent.slice(0, memorySize)
      scriptProperties.setProperty('line_bot_memory', JSON.stringify(newLogContent));

      return ContentService.createTextOutput(JSON.stringify({'content': 'POST OK'})).setMimeType(ContentService.MimeType.JSON);
    } else { //OK以外の時
      // 何らかの理由でAPIの応答取得ができなかった時、LINEのAPIにエラーを送信
      UrlFetchApp.fetch(LINE_ENDPOINT_URL, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'replyToken': replyToken,
          'messages': [{
            'type': 'text',
            'text': "TRY AGAIN, OR CHECK GAS,OPENAI",
          }]
        })
      });
      return ContentService.createTextOutput(JSON.stringify({'content': 'POST NG'})).setMimeType(ContentService.MimeType.JSON);
    }
  }
}

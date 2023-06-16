# mygpt_on_line
コピー&ペーストと少しの設定だけで使える自分だけのchatgptをlineで動かすことができます
Run your own chatgpt on line that you can use with just copy and paste and a few settings.

1. Line Developer に自身のアカウントで登録し、新しくチャネルを作成する
2. Google Apps Scriptで新規ファイルを作成する
3. main.js とinitialize-set.jsをGAS内にコピペもしくは新規作成する
4. GPT_APIKEY, LINEAPI_APIKEYをそれぞれ取得し、GASの該当部分にコピー&ペーストする
5. GAS内でスクリプトプロパティを新規設定する
6. GASでデプロイし、LINE Developer内のWebhookにコピペする

- register with Line Developer with your own account and create a new channel
- Create a new file with Google Apps Script
- copy and paste main.js and initialize-set.js into GAS or create a new file. 4.
- get GPT_APIKEY and LINEAPI_APIKEY respectively, and copy and paste them into the corresponding parts of GAS. 5.
- set new script properties in GAS
- Deploy the script in GAS and copy and paste it into the Webhook in LINE Developer.

使い方：
・基本的には書き込んだら会話ができ、3往復まで履歴が残っている状態となっている
・「ニューロール」と書き込んだ場合、その後の入力内容はどういったロールプレイを行ってほしいかを記入する
※それ以降再度ニューロールと入力するまで、そのロールプレイが行われる

How to use:
・Basically, you can have a conversation after writing a message, and up to 3 round-trips are kept in the history.
・If you write "New Role", you will be able to enter what kind of role-play you would like to see.
※After that, the role-play will continue until you enter "new role" again.

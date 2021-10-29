# Assignment-Management-CP

未提出（再提出）の課題をトップページで簡単に確認できるようにする Chrome用拡張機能です。 
  
DOM操作(データ取得)は講義ページに手動でアクセスした時のみなので、サーバーに大きな負荷をかけることなく課題管理が可能です。

## インストール方法
Releasesにあるzipファイルをダウンロード&展開後  
https://reviews.f-tools.net/Add-On/Jisaku-Tuika.html  
を参照しながらやってみてください。  
  
## 使用方法
講義ページを開くと、以下のように未提出または未回答の課題が表示されます。  
この時、課題の情報がブラウザ内のデータベース(IndexedDB)に保存されます。  
![lecture page](images/photo_00.png)
  
そして、そのデータベースの情報をもとに、LMSのトップページで課題一覧が表示されます。  
また、DEADLINEのリンクにアクセスすると、
![toppage](images/photo_01.png)
以下のようにGoogle カレンダーへの追加もできます
![googlecalendar](images/photo_02.png)

### 課題の消し方
データベース上のデータを消す機能はまだ未実装なので、F12→Application→IndexedDB→HomeworkDB→hw_store から手動で削除してください。もっと楽にできるようにしたい。
![remove](images/photo_03.png)

## サーバー負荷について
DOM操作(データ取得)はあくまで**講義ページを手動で開いたときのみ**なので、サーバー負荷は一般の利用時と変わらないと推測されます。

## ビルド方法
以下を実行

```
npm i
npm run release
```
  
完成物はreleaseフォルダの中にできます


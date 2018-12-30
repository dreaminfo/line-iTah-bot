'use strict';

const help = require('./help.json');
const bitch = require('./bitch.json');
const call = require('./callMe.json');
const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');

// create LINE SDK client
const client = new line.Client(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});


function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }
    case 'join':
      return replyText(event.replyToken, `ไงเพื่อน iTah-Bot 01 มาแล้วจ้าา ลองพิมพ์ iTah help ดูจิ`);
    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, event) {

  switch (message.text) {
    case 'iTah' :
      const result = randomText(call.item);
      return client.replyMessage(event.replyToken, { type: 'text', text: result });
    case 'iTah help' :
      return client.replyMessage(event.replyToken, { type: 'text', text: help.item });
    case 'iTah ออกไปได้และ' :
      if (event.source.userId === 'Udd4a0bd8ef71b0d4a516c9c6d8b13ded' && event.source.type === 'room') {
        return client.leaveRoom(event.source.roomId).then(doneCallbacks, failCallbacks);
      } else if (event.source.userId === 'Udd4a0bd8ef71b0d4a516c9c6d8b13ded' && event.source.type === 'group') {
        return client.leaveGroup(event.source.groupId);
      } else { throw new Error(`Unknown message: ${JSON.stringify(texts)}`); }
    default:
      return replyStyle(event.replyToken, message.text);
  }
}

const replyStyle = (token, texts) => {
  if (texts.indexOf('ด่า') !== -1 && texts.indexOf('iTah') !== -1 && texts.indexOf('ให้หน่อย') !== -1) {
    const txt1 = texts.indexOf("ด่า");
    const txt2 = texts.indexOf("ให้หน่อย");
    const name = texts.slice(txt1 + 3, txt2 - 1);
    const result = `${name.trim()} ${randomText(bitch.item)}`;
    if (name.trim().length === 0) {
      return client.replyMessage(token, { type: 'text', text: "จาฝากด่าก็ใส่ชื่อหน่อย ด้ายป๊ะะ" });
    } else {
      return client.replyMessage(token, { type: 'text', text: result });
    }
  } else {
    throw new Error(`Unknown message: ${JSON.stringify(texts)}`);
  }
};

const randomText = (textArr) => {
  const idx = Math.floor((Math.random() * textArr.length));
  return `${textArr[idx]}`;
}



// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent_(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText_(message, replyToken) {
  return replyText(replyToken, message.text);
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

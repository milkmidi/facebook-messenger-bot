const request = require('request');
const express = require('express');

const app = express();

const bodyParser = require('body-parser');
const chalk = require('chalk');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('client')));


app.listen(process.env.PORT, process.env.IP, () => {
  console.log(`server started at https://fb-messenger-webhook-milkmidi.c9users.io:${process.env.PORT}`);
});

// https://developers.facebook.com/tools/explorer/?method=GET&path=1459012337477173_1459014130810327%2Fcomments&version=v2.10


app.get('/webhook', (req, res) => {
  console.log(req.query['hub.mode'], req.query['hub.verify_token']);
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'milkmidi') {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});
app.post('/webhook', (req, res) => {
  console.log(chalk.bgGreen('---------------------------  post'));
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      const pageID = entry.id;
      const timeOfEvent = entry.time;
      console.log(chalk.bgYellow(`pageID:${pageID}`, `time:${timeOfEvent}`));
      if (entry.messaging) {
        // Iterate over each messaging event
        entry.messaging.forEach((event) => {
          // console.log(event)
          if (event.message && event.message.text) {
            const sender = event.sender.id;
            // console.log('senderID:'+sender)
            getUserData(sender).then((res) => {
              console.log(res);
              sendTextMessage(sender, `${res.first_name + res.last_name}剛剛傳了${event.message.text}`);
              const messageData = {
                attachment: {
                  type: 'image',
                  payload: { url: res.profile_pic },
                },
              };
              postToMessages(sender, messageData);
              sendGenericMessage(sender);
            });
          } else if (event.delivery) {
            receivedDeliveryConfirmation(event);
          } else if (event.postback) {
            // receivedPostback(event);   
          } else {
            console.log('Webhook received unknown event: ', event);
          }
          // console.log(event);
        });
      } else if (entry.changes) { // fans feed
        // console.log(entry)
        const senderID = entry.id;

        // const time = entry.time;
        const value = entry.changes[0].value;
        // console.log(entry);
        console.log(value);
        sendPrivateReplies(value.comment_id, `${value.sender_name}-${value.message}`);
        // console.log('粉絲團牆上留言',value.sender_name, value.message);
        // test(value.sender_id)
        // sendTextMessage(value.sender_id, value.sender_name +'剛剛留言了'+ value.message);
        // (sender, "你是：" + res.first_name + res.last_name);
      } else {
        // console.log(entry)
      }
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
  // res.sendStatus(200);
});


function sendPrivateReplies(commentID, text) {
  console.log('sendPrivateReplies', commentID);
  request({
    url: `https://graph.facebook.com/v2.10/${commentID}/private_replies`,
    qs: { access_token: token },
    method: 'POST',
    formData: {
      message: text,
    },
  },
  (response) => {
    console.log(response);
  },
  );
}

function receivedDeliveryConfirmation(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const delivery = event.delivery;
  const messageIDs = delivery.mids;
  const watermark = delivery.watermark;
  const sequenceNumber = delivery.seq;
  if (messageIDs) {
    messageIDs.forEach((messageID) => {
      console.log('Received delivery confirmation for message ID: %s', messageID);
    });
  }
  console.log('All message before %d were delivered.', watermark);
}

app.post('/webhookOldVersionCdoe-backup', (req, res) => {
  console.log('---------------------------  post');

  const body = req.body;
  const messaging = body.entry[0].messaging[0];
  const sender = messaging.sender.id;
  console.log(`sender.id:${sender}`);
  // console.log(messaging.message);

  switch (true) {
    case messaging.message != undefined:

      var text = messaging.message.text;
      console.log('post 接到使用者傳文字進來:', text);
      text = text.toString().toLocaleLowerCase();
      if (text == 'c') {
        sendGenericMessage(sender);
      } else if (text == 'd') {
        getUserData(sender, (res) => {
          sendTextMessage(sender, `你是：${res.first_name}${res.last_name}`);
          const messageData = {
            // text:"你是："+ res.first_name+res.last_name,
            attachment: {
              type: 'image',
              payload: {
                url: res.profile_pic,
              },
            },
          };
          postToMessages(sender, messageData);
        });
      } else {
        const r = ai.parseString(text);
        sendTextMessage(sender, r);
      }
      break;

    case messaging.delivery != undefined:
      console.log('使用者看到剛剛傳的訊息了 ');
      break;

    case messaging.postback != undefined:
      console.log('postback', messaging.postback.payload);
      console.log('使用者按了第一個商品，買了');
      sendTextMessage(sender, '使用者按了第一個商品，買了');
      break;

    default:
      console.log("使用者按了第一次的'發送至Messenger'");
      console.log(messaging);
      getUserData(sender, (res) => {
        const r = ai.parseString('');
        sendTextMessage(sender, `hi:${res.first_name}${res.last_name}\n${r}`);
      });
      break;
  }


  /* var messaging_events = req.body.entry[0].messaging;
   
   for (var i = 0; i < messaging_events.length; i++) {
       event = req.body.entry[0].messaging[i];
       var sender = event.sender.id;
       
       if( event.message && event.message.attachments){
           console.log( event.message.attachments );
       }
       if (event.message && event.message.text) {
           var text = event.message.text;
           
       }
   } */
  res.sendStatus(200);
});


function getUserData(senderID, callback) {
  const url = `https://graph.facebook.com/v2.6/${senderID}?fields=first_name,last_name,profile_pic,gender&access_token=${token}`;
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => (error ? reject(error) : resolve(JSON.parse(body))));
  });
}

function sendGenericMessage(sender) {
  console.log('回傳樣版給使用者');
  const messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{
          title: 'Test 商品',
          subtitle: 'Text 商品Subtitle',
          image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
          buttons: [{
            type: 'web_url',
            url: 'https://www.messenger.com/',
            title: 'Text url',
          },
          {
            type: 'postback',
            title: 'Text 買了',
            payload: 'Payload for first element in a generic bubble',
          },
          ],
        },
        {
          title: '第二個商品',
          subtitle: '第二個商品Subtitle',
          image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
          buttons: [{
            type: 'postback',
            title: 'Postback',
            payload: 'Payload for second element in a generic bubble',
          }],
        },
        ], // elements
      }, // payload
    }, // attachment
  }; // obj
  postToMessages(sender, messageData);
}

function sendTextMessage(senderID, text) {
  console.log('sendTextMessage 傳文字回去給使用者', senderID, text);
  const messageData = {
    text,
  };
  postToMessages(senderID, messageData);
}

function postToMessages(senderID, messageData) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: {
        id: senderID,
      },
      message: messageData,
    },
  },
  (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;
      console.log('Successfully sent generic message with id %s to recipient %s', messageId, recipientId);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.error('Unable to send message.');
      // console.error(response);
      console.error(error);
    }
  },
  );
}

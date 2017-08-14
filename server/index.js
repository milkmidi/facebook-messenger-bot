const express = require('express');

const app = express();

const bodyParser = require('body-parser');
const chalk = require('chalk');
const path = require('path');
const {
  subscribedApps,
  sendPrivateReplies,
  getUserData,
  receivedPostback,
  parseString } = require('./util');
const { verifyToken } = require('../env.config');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('client')));

const PORT = process.env.PORT || 8080;
const IP = process.env.IP || 'localhost';


// https://developers.facebook.com/tools/explorer/?method=GET&path=1459012337477173_1459014130810327%2Fcomments&version=v2.10


app.use((req, res, next) => {
  console.log(chalk.bgGreen(req.method, req.originalUrl));
  next();
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});


app.post('/webhook', (req, res) => {
  const data = req.body;
  // console.log(data);
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      const pageID = entry.id;
      const timeOfEvent = entry.time;
      console.log(chalk.bgYellow(`pageID:${pageID}`, `time:${timeOfEvent}`));
      if (entry.messaging) {
        entry.messaging.forEach((event) => {
          if (event.message && event.message.text) {
            const sender = event.sender.id;
            const message = event.message.text;
            getUserData(sender).then(userResponse => parseString(sender, message, userResponse));
          } else if (event.delivery) {
            console.log('使用者看到剛剛傳的訊息了 ');
            // receivedDeliveryConfirmation(event);
          } else if (event.postback) {
            receivedPostback(event);
          } else if (event.read) {
            console.log('使用者看到剛剛傳的訊息了 ');
          } else {
            console.log('Webhook received unknown event: ', event);
          }
        });
      } else if (entry.changes) {
        const value = entry.changes[0].value;
        // console.log(value);
        sendPrivateReplies(value.comment_id, `${value.sender_name}-${value.message}`);
      }
    });
    res.sendStatus(200);
  }
});


subscribedApps();
app.listen(PORT, IP, () => {
  console.log(`server started at https://fb-messenger-webhook-milkmidi.c9users.io:${PORT}`);
});

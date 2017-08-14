

const axios = require('axios');
const { token } = require('../env.config');
const chalk = require('chalk');


const errorHandler = (error) => {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error', error.message);
  }
  console.log(error.config);
};

function getUserData(senderID) {
  return axios({
    method: 'get',
    url: `https://graph.facebook.com/v2.6/${senderID}?fields=first_name,last_name,profile_pic,gender&access_token=${token}`,
  }).then(({ data }) => data).catch(errorHandler);
}

function subscribedApps() {
  console.log('subscribedApps');
  axios({
    method: 'post',
    url: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `access_token=${token}`,
  }).then(({ data }) => {
    console.log(data);
  }).catch(errorHandler);
}

/**
 * https://developers.facebook.com/docs/graph-api/reference/v2.10/object/private_replies
 * @param {string} commentID 
 * @param {string} message 
 */
function sendPrivateReplies(commentID, message) {
  console.log('sendPrivateReplies', commentID);
  return axios({
    method: 'post',
    url: `https://graph.facebook.com/v2.10/${commentID}/private_replies?access_token=${token}`,
    data: `message=${message}`,
  }).then((response) => {
    const { data, status } = response;
    console.log('sendPrivateReplies response', status, data);
  }).catch(errorHandler);
}


function postToMessages(senderID, messageData) {
  return axios({
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
    method: 'post',
    data: {
      recipient: {
        id: senderID,
      },
      message: messageData,
    },
  });
}

function sendTextMessage(senderID, text) {
  console.log(chalk.green('sendTextMessage', senderID, text));
  const messageData = { text };
  postToMessages(senderID, messageData);
}

function sendGenericMessage(sender) {
  console.log('回傳樣版給使用者');
  const messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{
          title: '拍拍的美照',
          subtitle: '我是拍拍Subtitle',
          image_url: 'http://www.medialand.com.tw/demo/milkmidi/images/pipi.jpg',
          buttons: [{
            type: 'web_url',
            url: 'http://milkmidi.blogspot.com/',
            title: '可以自定文字的超連結',
          },
          {
            type: 'postback',
            title: '可以自定文字：買了',
            // payload: 'Payload for first element in a generic bubble',
            payload: JSON.stringify({ id: 0, message: '拍拍餅干一年份' }),
          },
          ],
        },
        {
          title: '第二個商品也是拍拍',
          subtitle: '第二個商品Subtitle',
          image_url: 'http://www.medialand.com.tw/demo/milkmidi/images/pipi.jpg',
          buttons: [{
            type: 'postback',
            title: '買，林北超有錢',
            payload: JSON.stringify({ id: 1, message: '拍拍餅干十年份' }),
          }],
        },
        ], // elements
      }, // payload
    }, // attachment
  }; // obj
  postToMessages(sender, messageData);
}

function receivedPostback(event) {
  console.log(chalk.bgYellow('receivedPostback'));
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;
  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  const payload = event.postback.payload;
  console.log("Received postback for user %d and page %d with payload '%s' " +
    'at %d', senderID, recipientID, payload, timeOfPostback);
  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  const payloadObj = JSON.parse(payload);
  sendTextMessage(senderID, `感謝讚助${payloadObj.message}`);
}

function parseString(sender, value, userResponse) {
  console.log('parseString', value);
  let str = '';
  switch (true) {
    default:
    case value === 'help':
      str = '請問有什麼可以為您服務的地方？\n'
            + 'a 查詢奶綠的體重\n'
            + 'b 客製化訊息\n'
            + 'c 你是誰';
      sendTextMessage(sender, str);
      break;
    case value === 'a':
      sendTextMessage(sender, '不能跟你說');
      break;
    case value === 'b':
      sendGenericMessage(sender);
      break;
    case value === 'c': {
      sendTextMessage(sender, `${userResponse.first_name + userResponse.last_name}`);
      const messageData = {
        attachment: {
          type: 'image',
          payload: { url: userResponse.profile_pic },
        },
      };
      postToMessages(sender, messageData);
    }
  }
}

module.exports = {
  subscribedApps,
  getUserData,
  sendPrivateReplies,
  sendTextMessage,
  postToMessages,
  parseString,
  receivedPostback,
};

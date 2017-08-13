

const axios = require('axios');
const { token } = require('./config');

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
  /* return new Promise((resolve, reject) => {
    request(url, (error, response, body) => (error ? reject(error) : resolve(JSON.parse(body))));
  }); */
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
/*   request.post({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
    body: `access_token=${config.token}`,
  },
  (error, response, body) => {
    console.log('subscribed_apps res:', body);
  }); */
}

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


module.exports = {
  subscribedApps,
  getUserData,
  sendPrivateReplies,
};

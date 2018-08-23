'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()),
    {WebhookClient} = require('dialogflow-fulfillment'),
    {Card, Suggestion, Payload, Text} = require('dialogflow-fulfillment'),
    twilio = require('twilio'),
    config = require('./config.js');

// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log('webhook is listening'));

app.get('/webhook', (request, response) => {
    console.log('WEBHOOK_VERIFIED');
    response.sendStatus(200);
});

app.post('/webhook', (request, response) => {
  const agent = new WebhookClient({ request, response });
  //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function purchasing(agent) {
    let body = request.body;
    //console.log('STRINGIFY :'+JSON.stringify(body.queryResult));
    if(body.queryResult.parameters.insurance_type == 'health insurance'){
        console.log('HEALTH');
        agent.add('Are you buying insurance for Australian resident?');
        //agent.setContext({ name: 'insurance_purchasing', lifespan: 2, parameters: { custormer_status: 'TEST' }});
    } else {
        console.log('OTHERS');
        agent.add("This is the information about purchasing "+body.queryResult.parameters.insurance_type);
        
    }
}

function claim(agent) {
    agent.add('This is from webhook.');
}

function guidedInquiry(agent) {
    agent.add('This is from webhook.');
}

// This is to offer different types of hospital cover based on residency
function hospitalCover(agent){
    let param = agent.getContext('insurance_purchasing').parameters;
    if(param.resident && param.resident == 'true'){
        agent.add('What hospital coverage do you want? Cover options are. \nBasic cover. \nBudget cover. \nStandard cover. \nTop cover.');
    } else {
        agent.add('What hospital coverage do you want? Cover options are. \n Essential cover. Gold cover.');
    }
}

function sendSMS(agent){
    let param = agent.getContext('insurance_purchasing').parameters;
    console.log('INFO :: '+ JSON.stringify(param));
    // create links here!
    let text = 'Link on ';
    if(param.student && param.student == 'true'){
      // student insurance
      text += 'OSHC ';
      text += (param.extra_services)? 'with extra insurance':'insurance';
    } else {
      // others
      text += param.hospital_cover_type[0]+' health insurance ';
      if(param.extra_level || param.extra_services){
        text+='with '+param.extra_level + ' extras';
      }
    }
    twilioSMS(text, null);  // if any, extract num from user_info context
}

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('support_inquiry_purchasing', purchasing);
  intentMap.set('support_inquiry_claim', claim);
  intentMap.set('insurance_inquiry', guidedInquiry);
  intentMap.set('hospital_with_extra', sendSMS);
  intentMap.set('hospital_only', sendSMS);
  intentMap.set('OSHC', sendSMS);
  intentMap.set('OSHC Extra', sendSMS);
  intentMap.set('OSHC - Maybe', sendSMS);
  intentMap.set('support_inquiry_purchasing_extras_only', sendSMS);
  intentMap.set('support_inquiry_purchasing_health_followup1', hospitalCover);
  agent.handleRequest(intentMap);
});

function twilioSMS(text, num){
  var accountSid = config.TWILIO_SID; // Your Account SID from www.twilio.com/console
  var authToken = config.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

  var twilio = require('twilio');
  var client = new twilio(accountSid, authToken);
  var targetNum = (num)? num:config.TARGET_NUM;
  console.log('Sending '+text +' to '+targetNum+' from '+ config.TWILIO_NUM);
  client.messages.create({
      body: text,
      to: targetNum,  // Text this number
      from: config.TWILIO_NUM// From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
}

/*// Local test
app.post('/webhook/:id/:msg', (req, res) => {
    var msg = req.params.msg;
    var id = req.params.id;
    console.log(msg + "/" + id)
    var messageObj = {
        "mid": "mid.$cAAYrcDBCMEtm673LY1gunh83nkLH",
        "seq": 31918,
        "text": msg
    }
    message.handleMessage(id, messageObj, function(err, responseText) {
        res.write(JSON.stringify(responseText.text), 'utf8', function(err) {
            res.status(200).end();
        });
    });
});*/
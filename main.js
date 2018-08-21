'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()),
    {WebhookClient} = require('dialogflow-fulfillment'),
    {Card, Suggestion, Payload, Text} = require('dialogflow-fulfillment');

// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log('webhook is listening'));

app.get('/webhook', (request, response) => {
    console.log('WEBHOOK_VERIFIED');
    response.sendStatus(200);
});

app.post('/webhook', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
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

function purchasingOS(agent){
    agent.add('This is overseas student insurance information.')
}

function purchasingOV(agent){
    agent.add('This is overseas visitor insurance information.')
}

function testRich(agent){
    if(agent.requestSource == 'GOOGLE_TELEPHONY'){
        agent.add('This is for test RICH.');
    } else {
        /*
        agent.add(new Card({
           title: `Title: this is a card title(DEFAULT)`,
           imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
           text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
           buttonText: 'This is a button',
            buttonUrl: 'https://assistant.google.com/'
            })
        );
        */
        agent.add(new Suggestion('Quick Reply'));
        agent.add(new Suggestion('Suggestion'));
    }
    console.log('AGENT SOURCE:: '+agent.requestSource);
}
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('support_inquiry_purchasing', purchasing);
  intentMap.set('support_inquiry_claim', claim);
  intentMap.set('insurance_inquiry', guidedInquiry);
  intentMap.set('support_inquiry_purchasing - no - yes (overseas student)', purchasingOS);
  intentMap.set('support_inquiry_purchasing - no - no (overseas visitor)', purchasingOV);
  intentMap.set('Test Rich', testRich);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});



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
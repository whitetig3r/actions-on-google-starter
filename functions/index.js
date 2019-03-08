'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const { 
    dialogflow,
    Permission,
    Suggestions,
    BasicCard
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

const ratingMap = {
    'great': {
      text: 'Glad you\'re enjoying the workshop! You will learn a lot',
      title: 'That\'s fantastic',
      subtitle: 'Yayy!'
    },
    'average': {
      text: 'The workshop has a lot improve. eh?',
      title: 'Just average?',
      subtitle: 'Hmmm...'
    },
    'bad': {
      text: 'Definitely need to work on my workshop skills',
      title: 'Really? That bad?',
      subtitle: 'Oops!'
    }
  };
  

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('rate session', (conv, { session_rating }) => {
    let response = 'Error in processing your request!';
    if(conv.user.storage.userName){
        if (session_rating === 'great') {
            response = `Yay, I hope you will continue to enjoy this workshop on Actions on Google, ${conv.user.storage.userName}! Would you like to know about FN plus?`;
        } else if (session_rating === 'average') {
            response = `Hmm, I hope the rest of the workshop turns out to be fruitful, ${conv.user.storage.userName}! Would you like to know about FN plus?`;
        } else {
            response = `Oops! I should work on making my workshops better, ${conv.user.storage.userName}! Would you like to know about FN plus?`;
        }
    } else {
        if (session_rating === 'great') {
          response = 'Yay, I hope you will continue to enjoy this workshop on Actions on Google! Would you like to know about FN plus?';
        } else if (session_rating === "average") {
          response =
            'Hmm, I hope the rest of the workshop turns out to be fruitful! Would you like to know about FN plus?';
        } else {
          response =
            'Oops! I should work on making my workshops better! Would you like to know about FN plus?';
        }
    }
    conv.ask(response,new BasicCard(ratingMap[session_rating]));
});

app.intent('rate session - yes', (conv) => {
    let response = "A community which believes in improving & enhancing the quality of life by co-creating with the help of technology. We connect tech geeks and new perspectives to promote passion, diversity and innovation.";
    const FNPlus = {
        text: "A community which believes in improving & enhancing the quality of life by co-creating with the help of technology. We connect tech geeks and new perspectives to promote passion, diversity and innovation.",
        title: "fn+ Community",
        subtitle: "About",
        buttons: [
            {
                title: "Link to fn+ website",
                openUrlAction: {
                    url: 'https://www.fnplus.tech/'
                }
            }
        ]
    }
    conv.close(response,new BasicCard(FNPlus));
});

app.intent('actions_intent_PERMISSION', ( conv,params,permissionGranted ) => {
    if(!permissionGranted){
        conv.ask("That's okay. How is the session on Actions on Google going?");
        conv.add(new Suggestions(['good','average','bad']));
    }else{
        conv.user.storage.userName = conv.user.name.display;
        conv.ask(`Hi ${conv.user.storage.userName}. How is the session on Actions on Google going?`);
        conv.add(new Suggestions(['good', 'average', 'bad']));
    }
});

app.intent('actions_intent_NO_INPUT', (conv) => {
    const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
    if (repromptCount === 0) {
        conv.ask('How is the session going?');
    } else if (repromptCount === 1) {
        conv.ask(`Please tell me how the session on Actions on Google is going!`);
    } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
        conv.close(`Sorry we're having trouble. Let's ` +
            `try this again later. Goodbye.`);
    }
});

app.intent('Default Welcome Intent', (conv) => {
    const name = conv.user.storage.userName;
    if(name){
        conv.ask('How is the session on Actions on Google going?');
        conv.add(new Suggestions(['great','average','bad']));
    } else {
        conv.ask(
          new Permission({
            context: "Hi, to get to know you better",
            permissions: "NAME"
          })
        );
    }
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

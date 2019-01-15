//Required files/documents/libraries to function
const Alexa = require('ask-sdk');
const AlexaCore = require('ask-sdk-core');
const AWS = require('aws-sdk');
const request = require('request');
const parseString = require('xml2js').parseString;
var data_MagicTerms = undefined;

//DynamoDB information:
var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
//require('dotenv').config();
AWS.config.update({ region: 'us-east-1' });

//variables to keep on hand:
const ALEXA_RESPONSES = {
    skillName: 'Magic the Gathering Battle Master',
    openMessage: 'Welcome to Magic Battle Master, your fun source for Magic The Gathering game variations.  How would you like' +
        'to get started?  You can say Main Menu if you want a summary of options or jump directly to what you want.',
    reprompt: 'If you\'re not sure what to ask for, just say Main Menu for availble options.',
    stopMessageSpeak: 'Thank you for using Magic Battle Master, please return for Magic The Gathering variations and terminology information. Goodbye!',

};

//Handler builder & Intents:
const skillBuilder = AlexaCore.SkillBuilders.custom();

//Initial Launch Request:
const GreetingIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest'
    },
    handle(handlerInput) {
        var speechOutput = ALEXA_RESPONSES.openMessage;
        var reprompt = ALEXA_RESPONSES.reprompt;

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const WhatIsIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'WhatIs';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "What Is information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const HowToIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'HowTo';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "How To information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const MainMenuIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'MainMenu';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "Main Menu information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

async function GetMagicTerm(term){
    data_MagicTerms = undefined;
    
    if (data_MagicTerms == undefined){
        console.log("Load magic terms");
        let params = {
            TableName: 'MBM_MagicTerms' //the DB table name that is being used.
        };
    
        data_MagicTerms = await docClient.scan(params).promise();
        data_MagicTerms = data_MagicTerms.Items;
    }

    console.log("Length: " + data_MagicTerms.length);

    for(let i = 0; i < data_MagicTerms.length; i++){
        if (data_MagicTerms[i].Name.toLowerCase() == term.toLowerCase()){
            return data_MagicTerms[i].Description;
        }
    }
    return undefined;
}

const TermsIntentHandler = { //pick from the terms that the user has asked abou
    canHandle(handlerInput) { // NOTE: Will need to come back to this to restructor with Drew. - Separate Whatis from Terms???
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'Terms';
    },
    async handle(handlerInput) {
        request = handlerInput.requestEnvelope.request;
        const userTerm = request.intent.slots.Terminologies.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        var speechOutput = "";
<<<<<<< HEAD

        String(userTerm);
        console.log(userTerm);

        let params = {
            TableName: 'MBM_MagicTerms', //the DB table name that is being used.
            Key: { "Name": userTerm } //the item name that we're looking to grab
        };

        console.log("The handler output is: ");
        console.log(params);

        let dbQuery = await docClient.get(params).promise();

        var descriptionOutput = dbQuery.Item.Description; //capture the table info and push into variable.
        var reprompt = ALEXA_RESPONSES.reprompt;
        speechOutput = "Main Menu information is pending..." + descriptionOutput;
=======
        const userInput = handlerInput.requestEnvelope.request.intent.slots.term.value;
        console.log(userInput);

        //var descriptionOutput = dbQuery.Item.Description; //capture the table info and push into variable.
        var descriptionOutput = GetMagicTerm(userInput);
        console.log(descriptionOutput);
        
        var reprompt = ALEXA_RESPONSES.reprompt;
        speechOutput = descriptionOutput;
>>>>>>> e6160f2751fd4342e7e53e114dce73bcf7afa7a9

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

//The following are the built-in Amazon Intent Handlers:
const FallbackIntentHandler = { //fall back event if the user say something that is not understood.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "Fallback information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const CancelIntentHandler = { //allow the user to cancel the currnt command and select something new
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "Cancel information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const HelpIntentHandler = { //allow the user to get help with how to navigate the application.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        var speechOutput = "";

        speechOutput = "Help information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const StopIntentHandler = { //allow the use to stop the current skill entirely and close the application.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        var speechOutput = ALEXA_RESPONSES.stopMessageSpeak;

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const NavigateHomeIntentHandler = { //navigate back to the main menu from anything - this may not be required.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.NavigateHomeIntent';
    },
    handle(handlerInput) {
        var speechOutput = "";


        speechOutput = "Navigate Home information is pending...";

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(ALEXA_RESPONSES.reprompt) //give the user another chance to say something.
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
<<<<<<< HEAD
        return handleUnknown(handlerInput);
    },
};

=======

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.')
            .reprompt('Sorry, an error occurred.')
            .getResponse();
    }
};


>>>>>>> e6160f2751fd4342e7e53e114dce73bcf7afa7a9
//this is the information it's sending out to the Lambda to be used.
exports.handler = skillBuilder
    .addRequestHandlers(
        GreetingIntentHandler,
        WhatIsIntentHandler,
        HowToIntentHandler,
        MainMenuIntentHandler,
        TermsIntentHandler,
        FallbackIntentHandler,
        CancelIntentHandler,
        HelpIntentHandler,
        StopIntentHandler,
        NavigateHomeIntentHandler
    )

.addErrorHandlers(ErrorHandler)
    .lambda();

//Base functions which are simple generic functions
function toLowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function appendSpaceWithPlus(string) {
    return string = (string).split(' ').join('+');
}

function replaceAmpersand(mString) {
    var regExpr = /(&amp;|&)/g;
    return mString.replace(regExpr, "and");
}

//extra functions & items to be used:
function doRequest(url) {
    return new Promise(function(resolve, reject) {
        request(url, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function bodyTemplateMaker(mBodyTemplateType, mHandlerInput, mImg, mTitle, mText1, mText2, mText3, mOutputSpeech, mReprompt, mBackgroundIMG, mEndSession) {
    const response = mHandlerInput.responseBuilder;
    const image = imageMaker('', mImg);
    const richText = richTextMaker(mText1, mText2, mText3);
    const backgroundImage = imageMaker('', mBackgroundIMG);
    const title = mTitle;

    response.addRenderTemplateDirective({
        type: mBodyTemplateType,
        backButton: 'HIDDEN', //This handles showing a button "<" on display units.  To activate this use VISIBLE.
        image,
        backgroundImage,
        title,
        textContent: richText
    });

    if (mOutputSpeech)
        response.speak(mOutputSpeech);

    if (mReprompt)
        response.reprompt(mReprompt);

    if (mEndSession)
        response.withShouldEndSession(mEndSession);

    console.log('response built, sending back to be used...');
    return response.getResponse();
}

function imageMaker(mDesc, mSource) {
    const myImage = new Alexa.ImageHelper()
        .withDescription(mDesc)
        .addImageInstance(mSource)
        .getImage();

    return myImage;
}

function richTextMaker(mPrimaryText, mSecondaryText, mTertiaryText) {
    const myTextContent = new Alexa.RichTextContentHelper();

    if (mPrimaryText)
        myTextContent.withPrimaryText(mPrimaryText);

    if (mSecondaryText)
        myTextContent.withSecondaryText(mSecondaryText);

    if (mTertiaryText)
        myTextContent.withTertiaryText(mTertiaryText);

    return myTextContent.getTextContent();
}

//helper function to check if the requesting device has a display screen
function supportsDisplay(handlerInput) {
    var hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    return hasDisplay;
}

function handleUnknown(pHandlerInput) {
    //For when Alexa doesn't understand the user
    var speechOutput = 'Sorry, I didn\'t get that. Could you try again?';
    var reprompt = 'Could you try again?';
    const response = pHandlerInput.responseBuilder;

    return response
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
}
//Required files/documents/libraries to function
const Alexa = require('ask-sdk');
const AlexaCore = require('ask-sdk-core');
const AWS = require('aws-sdk');
const request = require('request');
const parseString = require('xml2js').parseString;

//DynamoDB information:
var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
require('dotenv').config();
AWS.config.update({ region: 'us-east-1' });

//variables to keep on hand:
const ALEXA_RESPONSES = {
    skillName: 'Magic the Gathering Battle Master'
};

//Handler builder & Intents:
const skillBuilder = AlexaCore.SkillBuilders.custom();

//Initial Launch Request:
const WhatIsIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'WhatIs';
    },
    async handle(handlerInput) {


    }
};

const HowToIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'HowTo';
    },
    async handle(handlerInput) {

    }
};

const MainMenuIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'MainMenu';
    },
    handle(handlerInput) {

    }
};

const TermsIntentHandler = { //pick from the terms that the user has asked abou
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'Terms';
    },
    async handle(handlerInput) {
        const userInput = handlerInput.requestEnvelope.request.intent.name;
        String(userInput);
        console.log(userInput);

        let params = {
            TableName: 'MBM_MagicTerms', //the DB table name that is being used.
            Key: { "Name": userInput } //the item name that we're looking to grab
        };

        console.log("The handler output is: ");
        console.log(params);

        let dbQuery = await docClient.get(params).promise();
        var speechOutput = dbQuery.Item;
    }
};

const WhatIsIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {

    }
};

//The following are the built-in Amazon Intent Handlers:
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {

    }
};

const CancelIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {

    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {

    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {

    }
};

const NavigateHomeIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.NavigateHomeIntent';
    },
    handle(handlerInput) {

    }
};

//this is the information it's sending out to the Lambda to be used.
exports.handler = skillBuilder
    .addRequestHandlers(
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
    var speechOutput = '';
    var reprompt = 'Could you try again?';
    const response = pHandlerInput.responseBuilder;

    return response
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
}
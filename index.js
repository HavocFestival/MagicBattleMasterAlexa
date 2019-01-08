//Required files/documents/libraries to functoin
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
    skillName: 'Magic the Gathering Battle Mater'
};

//Handler builder & Intents:
const skillBuilder = AlexaCore.SkillBuilders.custom();

//Initial Launch Request:
const GetGreetingIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest'
    },
    handle(handlerInput) {
        var speechOutput = ALEXA_RESPONSES.welcomeMessage;
        var reprompt = ALEXA_RESPONSES.convoCont;

        return skillIntroInfo(speechOutput, reprompt, handlerInput);
    },
};

const GetChargeIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const charge = request.intent.name;

        if (request.type === 'IntentRequest' && charge.indexOf("DUI") > -1) {
            return true;
        } else if (request.type === 'IntentRequest' && charge.indexOf("BUI") > -1) {
            return true;
        } else if (request.type === 'IntentRequest' && charge.indexOf("Criminal") > -1) {
            return true;
        } else return false;
    },
    async handle(handlerInput) {
        const userInput = handlerInput.requestEnvelope.request.intent.name;
        String(userInput); //convert the information above to a string so that it can be used below.
        console.log(userInput);

        let params = {
            TableName: 'FindCharge',
            Key: { "IntentChargeID": userInput }
        };

        console.log("Entering handler");
        console.log(params);

        let dbQuery = await docClient.get(params).promise();
        var speechOutput = dbQuery.Item.SegmentAnswer;
        var displayOutput = dbQuery.Item.SegmentDisplay;
        var reprompt = ALEXA_RESPONSES.convoCont;
        var image;

        if (userInput === 'DUIEightyFour' || userInput === 'DUIEightyFive' ||
            userInput === 'DUIEightySix' || userInput === 'DUIEightySeven' || userInput === 'DUITrafficStopOne' ||
            userInput === 'DUITrafficStopTwo') {
            image = imageS3Store.DrugCrime.url_Lrg;
            return intentInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else if (userInput === 'DUITwo') {
            image = imageS3Store.DrugCrime.url_Lrg;
            return intentInfoBuilder(speechOutput, displayOutput, image, reprompt, handlerInput);
        } else if (userInput.indexOf("BUI") > -1) {
            image = imageS3Store.BUIImage.url_Lrg;
            return intentInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else if (userInput.indexOf("Criminal") > -1) {
            image = imageS3Store.CriminalLaw.url_Lrg;
            return intentInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else {
            image = imageS3Store.DUIStop.url_Lrg;
            return intentInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        }
    }
};

const GetDrunkDrivingInfoIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'FindDrunkDrivingInfoIntent';
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        var reprompt = ALEXA_RESPONSES.convoCont;
        var image;

        console.log("starting info handler");

        const userState = request.intent.slots.State.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const userElement = request.intent.slots.Element.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        let params = {
            TableName: 'FindDrunkDrivingInfo',
            Key: { "IDStateName": userState }
        };

        let output = await docClient.get(params).promise();

        if (userElement === "Other_Penalties") {
            speechOutput = output.Item.Other_Penalties;
            image = imageS3Store.CriminalLaw.url_Lrg;
            return getDDInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else if (userElement === 'BAC_Legal_Limit') {
            speechOutput = output.Item.BAC_Legal_Limit;
            image = imageS3Store.DrunkDrive.url;
            return getDDInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else if (userElement === 'Rehabilitation_Required') {
            speechOutput = output.Item.Rehabilitation_Required;
            image = imageS3Store.CriminalLaw.url_Lrg;
            return getDDInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        } else if (userElement === 'Drivers_License_Suspension_Ignition_Interlock_Device') {
            speechOutput = output.Item.Drivers_License_Suspension_Ignition_Interlock_Device;
            image = imageS3Store.DrunkDrive.url;
            return getDDInfoBuilder(speechOutput, speechOutput, image, reprompt, handlerInput);
        };
    }
};

const FindLawyerIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'FindALawyer';
    },
    handle(handlerInput) {
        agencyList.length = 0;
        return getAttorneyCall(handlerInput);
    }
};

const MainMenuIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'MainMenu';
    },
    handle(handlerInput) {
        var speechOutput = "Here are the available options to select from. <break time='.25s'/> To access any of the listed items you can say" +
            " DUI questions <break time='.25s'/> or say Driving Under the Influence questions.";
        var optionOne = "DUI or DWI Questions";
        var optionTwo = "BUI Questions";
        var optionThree = "Criminal Law Questions";
        var optionFour = "Traffic Stop Questions";
        var optionFive = "Attorney Lookup Questions";
        var optionSix = "State Specific DUI Questions";
        var reprompt = "Please say one of the shown options or you can say exit find law to stop.";

        return mainMenuBuilder(speechOutput, optionOne, optionTwo, optionThree, optionFour, optionFive, optionSix, reprompt, handlerInput);
    }
};

const MenuHelperIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'MenuHelper') ||
            request.type === 'Display.MainMenu'; //this part is intend to grab the selectable items of the prior menu.
    },
    handle(handlerInput) {
        console.log('Inside Menu');
        const request = handlerInput.requestEnvelope.request;
        let userHelp = request.intent.slots.menuSelector.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        let currentToken = handlerInput.requestEnvelope.request.token;
        console.log("slot is: " + userHelp);
        console.log("token is: " + currentToken); //this should populate once the tokens are added - persistent data.

        var question1 = "";
        var question2 = "";
        var question3 = "";
        var question4 = "";
        var question5 = "";
        var question6 = "";
        var question7 = "";
        var reprompt = ALEXA_RESPONSES.convoCont;
        var speechOutput = "I have over 150 different possible legal answers centered around topics such as DUI, traffic stops and more." +
            "Please feel free to ask me any of these to get an idea of how I may help you.";

        if (currentToken === 'dui_dwi_token' || userHelp === 'dwi' || userHelp === 'dui') {
            console.log("showing DUI DWI info");
            question1 = "What does driving under the influence mean in Minnesota"; //DUIOne
            question2 = "In Minnesota what is the limit for aggravated driving under the influence?"; //DUIThree
            question3 = "In Minnesota can my truck be confiscated after a dui?"; //DUIEight
            question4 = "Driving while intoxicate with minors in car?"; //DUITwentyFour
            question5 = "What is the penalty for driving while intoxicated with minors in the car?";
            question6 = "What is an unlawful blood alcohol level attorney?";
            question7 = "What does wrongful death from DWI mean?"; //DUINinety
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else if (currentToken === 'bui_token' || userHelp === 'bui') {
            console.log("showing BUI info");
            question1 = "What is boating under the influence?";
            question2 = "Can law enforcement pull me over in my boat just like in a boating while drunk case?";
            question3 = "Can my boating license be suspended for boating tipsy?";
            question4 = "Do a lot of people get boating while intoxicated convictions?";
            question5 = "Will I have to go to jail for a boating under the influence conviction?";
            question6 = "Can I refuse a breath test while boating?";
            question7 = "Can I be subjected to a field sobriety test while boating?";
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else if (currentToken === 'criminal_law_token' || userHelp === 'ciminal_law') {
            console.log("showing Ciminal Law info");
            question1 = "What does presumed innocence mean?"; //CriminalProcedureOne
            question2 = "What does beyond a reasonable doubt mean?"; //CriminalProcedureTwo
            question3 = "Am I guaranteed a trial by jury?"; //CriminalProcedureThree
            question4 = "What does taking the fifth mean?"; //CriminalProcedureFour
            question5 = "What's the difference between a felony and a misdemeanor?"; //CriminalProcedureFive
            question6 = "what does it mean to be declared incompetent to stand trial?"; //CriminalProcedureSix
            question7 = "What is a criminal statute?"; //CriminalProcedureSeven
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else if (currentToken === 'traffic_stop_token' || userHelp === 'traffic_stop') {
            console.log("showing Traffic Stop info");
            question1 = "What is the legal limit for blood toxicity?"; //DUITrafficStopOne
            question2 = "How do the cops tell if I'm driving drunk?"; //DUITrafficStopTwo
            question3 = "Do I have to take a field test?"; //DUITrafficStopThree
            question4 = "Consult a attorney before taking a chemical test?"; //DUITrafficStopFour
            question5 = "Do I have to answer the cops questions when I get pulled over?"; //DUITrafficStopFive
            question6 = "Are drunk driving stops legal?"; //DUITrafficStopSix
            question7 = "Should I get a lawyer if I have been charged with drunk driving?"; //DUITrafficStopSeven
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else if (currentToken === 'attorney_lookup_token' || userHelp === 'attorney_lookup') {
            console.log("showing Attorney Lookup info");
            question1 = "Divorce Isanti county"; // Works - FindALawyer (The API seems to time out and should be considered for repeat questions)
            question2 = "What Car Accident lawyers are in cottonwood county?"; // Works - FindALawyer
            question3 = "Get an Traffic Ticket attorney in Hennepin county."; // Works - FindALawyer
            question4 = "Get me a lawyer that handles Foreclosure in cook county."; // Works - FindALawyer
            question5 = "Collections lawyer in stevens county."; // Works - FindALawyer
            question6 = "Are there drug crime attorneys in marshall county?"; // Works - FindALawyer
            question7 = "Show me a Driving While Intoxicated lawyer for Ramsey county."; // Works - FindALawyer
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else if (currentToken === 'state_specific_token' || userHelp === 'state_specific') {
            console.log("showing State Specific info");
            question1 = "What are the rehabilitation requirements for dui in New Hampshire?";
            question2 = "What are the other penalties for dui in Connecticut?";
            question3 = "What is the punitive action limit for a dwi in Minnesota?";
            question4 = "What is the blood alcohol limit for a dui in California?";
            question5 = "What is the Blood Alcohol Content limit for a dui in Colorado?";
            question6 = "What is the bac limit for a driving under the influence in Maine?";
            question7 = "What is the bac limit for driving while intoxicated in Florida?";
            return mHelperInfoBuilder(speechOutput, question1, question2, question3, question4, question5, question6, question7, reprompt, handlerInput);
        } else return false;
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        var speechOutput = 'I do not show that a list has been created yet, please say get legal help to start locating an attorney';
        var dispalyOutput = 'Please say \"get legal help\" to the locating an attorney';

        if (agencyList === undefined || agencyList.length === 0) {
            return noHandlerBuilder(speechOutput, dispalyOutput, handlerInput);
        } else {
            console.log("loaded count into agency list equals: " + agencyList.length);
            return getNewAttorney(handlerInput, agencyList); //agency list should be populated and loaded into this...
        }
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        agencyList = [];
        var speechOutput = 'Okay! Would you like further legal help?  You can ask me a question about Driving or Boating ' +
            'While Intoxicated, Criminal Procedures or just say \"get legal help\" to access my attorney listing.  ' +
            'If you\'re finished you can also say \"exit find law\" to end.';

        var dispalyOutput = '<br/>Ask me a question about: <br/> DUI\'s, BUI\'s, Criminal Procedures. <br/> or <br/> say \"get legal help\"';
        return noHandlerBuilder(speechOutput, dispalyOutput, handlerInput); //agency list should be populated and loaded into this...
    }
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {

        var speechOutput = 'I have a great source of attorneys to offer legal aid. ' +
            'To get started I just need your issue <break time=".25s"/> such as bankruptcy, child support, or driving while intoxicated. <break time=".25s"/>' +
            'As well as County <break time=".25s"/> and State. For instance you could say ' +
            '\"bankruptcy, hennepin county\" or \"bankruptcy, minneapolis\". ' +
            '<break time=".25s"/> You can also say \"Show me a lawyer for bankruptcy in Hennepin County\"';

        return skillIntroInfo(speechOutput, ALEXA_RESPONSES.helpMessage, handlerInput);
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' ||
                request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(ALEXA_RESPONSES.stopMessageSpeak)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const RepeatHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .reprompt();
    }
}

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder
            .getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handleUnknown(handlerInput);
    },
};

const FallBackHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(FALLBACK_MESSAGE)
            .reprompt(ALEXA_RESPONSES.fallbackReprompt)
            .getResponse();
    }
};

//this is the information it's sending out to the Lambda to be used.
exports.handler = skillBuilder
    .addRequestHandlers(
        GetGreetingIntent,
        GetDrunkDrivingInfoIntent,
        GetChargeIntent,
        FindLawyerIntent,
        MainMenuIntent,
        MenuHelperIntent,
        YesIntentHandler,
        NoIntentHandler,
        HelpHandler,
        ExitHandler,
        FallBackHandler,
        SessionEndedRequestHandler
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
async function getAttorneyCall(handlerInput) {
    console.log("starting handler");
    const request = handlerInput.requestEnvelope.request;
    let userIssue = request.intent.slots.issue.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    let userCountyCity = request.intent.slots.location.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    let userState = "Minnesota";
    var reprompt = ALEXA_RESPONSES.convoCont;

    console.log("Variables confirmed as - Issue: " + userIssue + ", County is: " + userCountyCity + ", State is: " + userState + ".");
    userIssue = appendSpaceWithPlus(userIssue);
    userCountyCity = appendSpaceWithPlus(userCountyCity);
    console.log(userIssue + " " + userCountyCity);

    console.log('starting call to api...');
    var res = await doRequest('https://lawyers.findlaw.com/ld-solr/c1/lds-browse?kw=' + userIssue + '&lc=' + userCountyCity + '%2C' + userState + '&rd=25&sort_by=distance&qt=%2Flds-browse&wt=xml&version=2.2');

    parseString(res, function(err, result) {
        console.log("parsing xml infomation from api call...")
        var responseNode;
        var profileNode;
        var node;
        //shouldn't assume that location will be in the same spot.
        var locationType;
        var cityCompare;

        for (let i = 0; i < result.response.lst.length; i++) {
            try {
                responseNode = result.response.lst[i].$.name;

                if (responseNode === 'location') {
                    let locationType = result.response.lst[i].str.$.name
                }

                if (responseNode === 'profile') { //once confirmed step down into results...Will come back for validation later.                      

                    let numResults = result.response.lst[i].lst[0].arr[0].lst.length;
                    console.log("# of results found = " + numResults);

                    for (let j = 0; j < numResults; j++) {
                        try {
                            node = result.response.lst[i].lst[0].arr[0].lst[j].str;
                            agencyList.push(new AgencyObj(node));
                        } catch (err) {
                            profileNode = "";
                            console.log("Error! Line 100 did not work " + profileNode + ' ' + err);
                        };
                    }

                    console.log(agencyList[0]); //returns all required data for card.
                    oName = replaceAmpersand(agencyList[0].office_name);
                    oAdres = agencyList[0].office_address;
                    oCity = agencyList[0].office_city;
                    oState = agencyList[0].office_state;
                    oPhone = agencyList[0].phone;

                    console.log('testing info transform...');
                    console.log(oName);

                    speechOutput = ('I have found you ' + numResults + ' attorneys that match your search, the first is: ' +
                        oName + ', ' + oAdres + ', ' + oCity + ', ' + oState + '. Their phone number is: ' +
                        oPhone + '.  Would you like another?');
                }
            } catch (err) {
                responseNode = "";
                console.log("Error! Line 94 did not work " + responseNode + ' ' + err);
            };
        }
    })

    var AGENCY_OFFICE_NAME = oName;
    var AGENCY_ADDY = oAdres;
    var AGENCY_CITY = oCity;
    var AGENCY_STATE = oState;
    var AGENCY_PHONE = oPhone;

    return findAttorneyBuilder(speechOutput, AGENCY_OFFICE_NAME, AGENCY_ADDY, AGENCY_CITY, AGENCY_STATE, AGENCY_PHONE, reprompt, handlerInput);
}

function getNewAttorney(mHandlerInput, mParams) {
    var params = mParams;
    var reprompt = ALEXA_RESPONSES.convoCont;

    if (indexer >= 0 && indexer < params.length - 1) {
        params = params[indexer + 1];
        indexer += 1;

        var oName = replaceAmpersand(params.office_name);
        var oAdres = params.office_address;
        var oCity = params.office_city;
        var oState = params.office_state;
        var oPhone = params.phone;

        console.log(oName + " " + oAdres + " " + oCity);

        var speechOutput = ('How about: ' + oName + ', ' + oAdres + ', ' + oCity + ', ' +
            oState + '. Their phone number is: ' + oPhone + '.  Would you like another listing?');
    } else if (indexer >= params.length - 1) {
        speechOutput = ('I\'m sorry, but we have come to the end of the listing, if you would like to review ' +
            'the list again, please supply the issue and location that you would like an attorney for.');
        return findAttorneyBuilder(speechOutput, null, null, null, null, null, reprompt, mHandlerInput);
    }

    var nAGENCY_OFFICE_NAME = oName;
    var nAGENCY_ADDY = oAdres;
    var nAGENCY_CITY = oCity;
    var nAGENCY_STATE = oState;
    var nAGENCY_PHONE = oPhone;

    return findAttorneyBuilder(speechOutput, nAGENCY_OFFICE_NAME, nAGENCY_ADDY, nAGENCY_CITY, nAGENCY_STATE, nAGENCY_PHONE, reprompt, mHandlerInput);
}

function skillIntroInfo(mSpeechOutput, mReprompt, mHandlerInput) { //cover template BT1
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;

        var text = (ALEXA_RESPONSES.welcomeMessageDisplay);
        return bodyTemplateMaker('BodyTemplate1', mHandlerInput, null, cardTitle, text, null, null, speechOutput, reprompt, imageS3Store.DiverseGroup.url, false);
    } else {
        const response = mHandlerInput.responseBuilder;

        return response
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}

function intentInfoBuilder(mSpeechOutput, mCardInfo, mBkImage, mReprompt, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;
    var text = mCardInfo;
    var image = mBkImage;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;
        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, text, null, null, speechOutput, reprompt, image, false);
    } else {
        const response = mHandlerInput.responseBuilder;
        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    };
}

function getDDInfoBuilder(mSpeechOutput, mCardInfo, mBkImage, mReprompt, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;
    var text = mCardInfo;
    var image = mBkImage;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;

        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, text, null, null, speechOutput, reprompt, image, false);
    } else {
        const response = mHandlerInput.responseBuilder;

        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    };
}

function findAttorneyBuilder(mSpeechOutput, mCardOffice, mCardAddy, mCardCity, mCardState, mCardPhone, mReprompt, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;
    var Office_Name = '<u>' + mCardOffice + '</u><br/>';
    var text2 = mCardAddy + '<br/>' + mCardCity + ', ' + mCardState;
    var text3 = 'Phone# : ' + mCardPhone;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;
        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, Office_Name, text2, text3, speechOutput, reprompt, imageS3Store.FindLawyerHelp.url_Lrg, false);
    } else {
        const response = mHandlerInput.responseBuilder;
        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    };
}

function noHandlerBuilder(mSpeechOutput, mDispalyOutput, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = ALEXA_RESPONSES.convoCont;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;

        var text = mDispalyOutput;
        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, text, null, null, speechOutput, reprompt, imageS3Store.DiverseGroup.url, false);
    } else {
        const response = mHandlerInput.responseBuilder;
        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    }
}

function mainMenuBuilder(mSpeechOutput, mOptionOne, mOptionTwo, mOptionThree, mOptionFour, mOptionFive, mOptionSix, mReprompt, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;

    var actionText1 = '<i><b>' + mOptionOne + '</b></i>'; //<action value="dui_dwi_token"></action>
    var actionText2 = '<i><b>' + mOptionTwo + '</b></i>'; //<action value="bui_token">
    var actionText3 = '<i><b>' + mOptionThree + '</b></i>'; //<action value="criminal_law_token">
    var actionText4 = '<i><b>' + mOptionFour + '</b></i>'; //<action value="traffic_stop_token">
    var actionText5 = '<i><b>' + mOptionFive + '</b></i>'; //<action value="attorney_lookup_token">
    var actionText6 = '<i><b>' + mOptionSix + '</b></i>'; //<action value="state_specific_token">

    var text = actionText1 + '<br/><br/>' + actionText2 + '<br/><br/>' + actionText3 + '<br/><br/>' + actionText4 + '<br/><br/>' +
        actionText5 + '<br/><br/>' + actionText6;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;
        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, text, null, null, speechOutput, reprompt, imageS3Store.DiverseGroup.url, false);
    } else {
        const response = mHandlerInput.responseBuilder;
        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    };
}

function mHelperInfoBuilder(mSpeechOutput, mQuestion1, mQuestion2, mQuestion3, mQuestion4, mQuestion5, mQuestion6, mQuestion7, mReprompt, mHandlerInput) {
    var speechOutput = mSpeechOutput;
    var reprompt = mReprompt;
    var cardTitle = ALEXA_RESPONSES.skillNameDisplay;

    var guideText1 = mQuestion1; //was originally adjusted then moved this back to a simple format.
    var guideText2 = mQuestion2;
    var guideText3 = mQuestion3;
    var guideText4 = mQuestion4;
    var guideText5 = mQuestion5;
    var guideText6 = mQuestion6;
    var guideText7 = mQuestion7;

    var text = '<br/><br/>' + guideText1 + '<br/><br/>' + guideText2 + '<br/><br/>' + guideText3 + '<br/><br/>' + guideText4 + '<br/><br/>' +
        guideText5 + '<br/><br/>' + guideText6 + '<br/><br/>' + guideText7;

    if (supportsDisplay(mHandlerInput) && !testingOnSim) {
        speechOutput;
        return bodyTemplateMaker('BodyTemplate3', mHandlerInput, imageS3Store.FindLawLogo.url, cardTitle, text, null, null, speechOutput, reprompt, imageS3Store.DiverseGroup.url, false);
    } else {
        const response = mHandlerInput.responseBuilder;
        return response.speak(speechOutput).reprompt(reprompt).getResponse();
    };
}

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

function AgencyObj(node) {
    this.office_name = findValue(node, "office_name");
    this.office_address = findValue(node, "office_address");
    this.office_city = findValue(node, "city");
    this.office_state = findValue(node, "state");
    this.zip_code = findValue(node, "zipcode");
    this.phone = findValue(node, "phone");
    this.office_image = findValue(node, "image_path");
}

function findValue(node, name) {
    for (var i = 0; i < node.length; i++) {
        if (node[i].$.name === name) {
            return node[i]._;
        }
    }
    return "";
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
    var speechOutput = 'I am sorry. I did not quite get that. Could you try again? You can also try \"Main Menu\"';
    var reprompt = 'Could you try again?';
    const response = pHandlerInput.responseBuilder;

    return response
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
}
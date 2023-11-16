const fs = require('node:fs');

function xmlToString(filePath) {
    const xml = fs.readFileSync(filePath, "utf8");
    return xml;
}

function speechSynthesis(text) {
    return new Promise((resolve, reject) => {

        "use strict";

        var sdk = require("microsoft-cognitiveservices-speech-sdk");
    
        var audioFile = "./audio/speech.wav";
        // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
        const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
    
        // The language of the voice that speaks.
        speechConfig.speechSynthesisVoiceName = "sv-SE-MattiasNeural"; 
        
        // Create the speech synthesizer.
        var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        var ssml = xmlToString('./speech.xml');
        ssml = ssml.replace("sample text", text);
        ssml = ssml.replaceAll("<@" + process.env.BEST_BUY_ID + ">", "");
        synthesizer.speakSsmlAsync(ssml,
            function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("synthesis finished.");
            resolve();
        } else {
            console.error("Speech synthesis canceled, " + result.errorDetails +
                "\nDid you set the speech resource key and region values?");
            reject();
        }
        synthesizer.close();
        synthesizer = null;
        },
            function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        synthesizer = null;
        });
        console.log("Now synthesizing to: " + audioFile);
    });
}
  
  // Export the function as a module
  module.exports = speechSynthesis;
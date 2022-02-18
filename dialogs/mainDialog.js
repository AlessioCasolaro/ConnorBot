const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { COMPLETEMIXTUREDIALOG, CompleteMixtureDialog } = require('./completeMixtureDialog');
const { SUGGESTDIALOG, SuggestDialog } = require('./suggestDialog');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        // Define the main dialog and its related components.
        this.addDialog(new TextPrompt('TextPrompt'));
        this.addDialog(new SuggestDialog());
        this.addDialog(new CompleteMixtureDialog());
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.introStep.bind(this),
            this.actStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;

        this.qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
            endpointKey: process.env.QnAEndpointKey,
            host: `https://${ process.env.QnAEndpointHostName }`
        });
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

     // First step in the waterfall dialog. 
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : `Come posso esserti di aiuto?`;
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }

     // Second step in the waterfall.
    async actStep(stepContext) {

        if (!this.luisRecognizer.isConfigured) {
            throw new Error("Luis non è configurato");
        }

        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);

        switch (LuisRecognizer.topIntent(luisResult)) {
            case 'SuggerisciMiscela': {

                return await stepContext.beginDialog('suggestDialog', SUGGESTDIALOG);
            }

            case 'CompletaMiscela': {

                return await stepContext.beginDialog('completeMixtureDialog', COMPLETEMIXTUREDIALOG);
            }

            case 'Help': {
                if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                    const unconfiguredQnaMessage = 'NOTE: \r\n' +
                        'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                        'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.';
                    await context.sendActivity(unconfiguredQnaMessage);
                } else {
                    console.log("Calling Qna");
                    const qnaResults = await this.qnaMaker.getAnswers(stepContext.context);
                    if (qnaResults[0]) {
                        await stepContext.context.sendActivity(qnaResults[0].answer);
                        return await stepContext.next();
                    } else
                        return await stepContext.next();
                }
            }
            case 'None': {
                if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                    const unconfiguredQnaMessage = 'NOTE: \r\n' +
                        'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                        'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.';
                    await context.sendActivity(unconfiguredQnaMessage);
                } else {
                    console.log("Calling Qna");
                    const qnaResults = await this.qnaMaker.getAnswers(stepContext.context);
                    if (qnaResults[0]) {
                        await stepContext.context.sendActivity(qnaResults[0].answer);
                        return await stepContext.next();
                    } else
                        return await stepContext.next();
                }
            }
            default: {
                // Catch all for unhandled intents
                const didntUnderstandMessageText = `Non ho capito, prova a chiederlo diversamente (intent was ${LuisRecognizer.topIntent(luisResult)})`;
                await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
            }
        }

        return await stepContext.next();
    }


    // This is the final step in the main waterfall dialog.
    async finalStep(stepContext) {

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'Cosa posso fare ora per te?' });
    }
}

module.exports.MainDialog = MainDialog;
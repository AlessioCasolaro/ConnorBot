const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog.js');
const Product = require('../models/products');
const WATERFALL_DIALOG = 'waterfallDialog';

var mixture = [];
var phrases = ["Ti consiglio questo miscela, dovrebbe piacerti",
"Assaggia questa miscela, credo ti piacerà",
"Hmm, questa miscela dovrebbe andare bene",
"Spero che questa miscela possa essere di tuo gradimento",
"Non sono sicuro, ma credo questa ti possa piacere",
"Prova questa miscela, al momento è molto popolare"];

Product.find((err, result)=>{
    result.forEach(function(result){   
        mixture.push((result.title.toString()));
    });
});


class SuggestDialog extends CancelAndHelpDialog {
    constructor() {
        super('suggestDialog');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.suggestStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    
    

    async run(turnContext, accessor) {

        const dialogSet = new dialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async suggestStep(stepContext) {

        var random = Math.floor(Math.random() * phrases.length);
        var random2 = Math.floor(Math.random() * mixture.length);

        const messageText = '' + phrases[random] + ': ' + mixture[random2]+".";

        return await stepContext.context.sendActivities([
            { type: 'message', text: messageText }]);
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            return await stepContext.endDialog();
        }
        return await stepContext.endDialog();
    }

}

module.exports.SuggestDialog = SuggestDialog;
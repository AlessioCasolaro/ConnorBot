const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog.js');
const Extra = require('../models/extra');
const WATERFALL_DIALOG = 'waterfallDialog';

var ingredients = [];
var phrases = ["Sembra già un ottimo drink, ma potresti metterci questo",
"Prova a mettere questo ingrediente di solito piace",
"Potresti aggiungere questo ingrediente",
"Questa aggiunta potrebbe piacerti"];

Extra.find((err, result)=>{
    result.forEach(function(result){   
        ingredients.push((result.extraName.toString()));
    });
});

class CompleteMixtureDialog extends CancelAndHelpDialog {
    constructor() {
        super('completeMixtureDialog');

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
        var random2 = Math.floor(Math.random() * ingredients.length);

        const messageText = phrases[random] + ': ' + ingredients[random2] + ".";

        return await stepContext.context.sendActivities([
            { type: 'message', text: messageText }]);
    }


    async finalStep(stepContext) {
        if (stepContext.result === true) {
            return await stepContext.endDialog();
        }
        return await stepContext.endDialog();
    }

}

module.exports.CompleteMixtureDialog = CompleteMixtureDialog;
const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog.js');

const WATERFALL_DIALOG = 'waterfallDialog';

class CompleteMixtureDialog extends CancelAndHelpDialog {
    constructor() {
        super('completeMixtureDialog');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.suggestStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    phrases = ["Sembra già un ottimo drink, ma potresti metterci questo",
        "Prova a mettere questo ingrediente di solito piace",
        "Potrei aggiungere questo ingrediente",
        "Questa aggiunta potrebbe piacerti"];

    ingredients = ["zenzero",
        "cardamomo",
        "coriandolo",
        "curcuma radice",
        "chiodi di garofano",
        "noce moscata",
        "mela",
        "cannella bastoncini",
        "ibisco",
        "foglie di mora",
        "melissa",
        "liquirizia",
        "arancia scorza",
        "finocchio",
        "camomilla",
        "pepe nero",
        "cardamomo",
        "iperico",
        "fiori di luppolo",
        "menta verde",
        "pepe rosa",
        "anice",
        "fiordaliso",
        "coriandolo macinato",
        "curcuma radice a pezzi",
        "zenzero pezzi",
        "cacao",
        "cannella pezzi",
        "mela in pezzi",
        "rosa canina scorza",
        "rooibos",
        "mandorla in giocchi",
        "mandorla in pezzi",
        "vaniglia bourbon pezzi",
        "cardamomo verde",
        "angelica radice",
        "tarassaco radice",
        "pepe",
        "bacche di ginepro",
        "verbena",
        "melissa",
        "aroma di arancia",
        "erba tulsi",
        "calendula",
        "olio di mandorla",
        "olio di mandarino",
        "luppolo fiori",
        "alchemilla",
        "valeriana",
        "santoreggia",
        "ortica foglie",
        "menta piperita",
        "cintronella",
        "rosa e malva fiori",
        "fragola in pezzi",
        "aroma naturale di pompelmo"];


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

        var random = Math.floor(Math.random() * this.phrases.length);
        var random2 = Math.floor(Math.random() * this.ingredients.length);

        const messageText = '' + this.phrases[random] + ' ' + this.ingredients[random2];

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
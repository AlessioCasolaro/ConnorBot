const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog.js');

const WATERFALL_DIALOG = 'waterfallDialog';

class SuggestDialog extends CancelAndHelpDialog {
    constructor() {
        super('suggestDialog');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.suggestStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    phrases = ["Ti consiglio questo miscela, dovrebbe piacerti.",
        "Assaggia questa miscela, credo ti piacerà.",
        "Hmm, questo miscela dovrebbe andare bene.",
        "Spero che questa miscela possa essere di tuo gradimento.",
        "Non sono sicuro, ma credo questa ti possa piacere",
        "Prova questa miscela, al momento è molto popolare"];

    mixture = ["Dosha Kpaha",
        "Dosha Vata",
        "Curcuma e Coccole",
        "Fresco zenzero",
        "Rilassante piacere",
        "Dosha Pitta",
        "Abbraccio vellutato",
        "Pace interiore",
        "Energia vitale",
        "Tonico Detox",
        "Piacere piccante",
        "Chai piccante",
        "Chai cacao speziato",
        "Chai tè nero",
        "Mirtillo rosso",
        "Vitaminica",
        "Sere d'inverno",
        "Cioccolato e fragole",
        "Lampone e lime",
        "Esplosione di frutta",
        "Tisana benessere e relax",
        "Tisana zenzero e citronella",
        "Tisana rilassante",
        "Piacevole benessere",
        "Armonia suprema",
        "Diuretica No Cist",
        "Detox Anti-Age",
        "Tisana ulivo e zenzero",
        "Nuova primavera",
        "Tè dimagrante Bio",
        "Tisana allo zenzero",
        "Tisana depurativa",
        "Tisana del buongiorno",
        "Tisana buon riposo",
        "Dresco piacere",
        "Dolce crepuscolo"];

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
        var random2 = Math.floor(Math.random() * this.mixture.length);

        const messageText = '' + this.phrases[random] + ' ' + this.mixture[random2];

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
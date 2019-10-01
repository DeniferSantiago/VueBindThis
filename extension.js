const vscode = require('vscode');
class PropCompletion{
	/**
	 * @param {vscode.CompletionItem} compItem 
	 * @param {String} type 
	 */
	constructor(compItem, type){
		this.itemCompletion = compItem;
		this.type = type;
		/**
		 * @type{Array<PropCompletion>} 
		 */
		this.childs = [];
	}
	/**
	 * @param {vscode.CompletionItem} compItem 
	 * @param {String} type 
	 */
	addChild(compItem, type){
		let length = this.childs.push(new PropCompletion(compItem, type));
		return this.childs[length];
	}
}
class VueIntellisense{
	/**
     * @param {vscode.TextDocument} document String of vue instance 
     */
	constructor(document){
		this.document = document;
		this.vueString = "";
		this.dataString = "";
		this.methodsString = "";
		this.computedString = "";
	}
	/**
	 * @param{vscode.TextDocument} newValue
	 */
	set document(newValue){
		this.document = newValue;
		this.getVueString();
	}
	getVueString(){
		let doc = this.document;
	}
}
/**
 * @type{VueIntellisense}
 */
var vueIntellisense = null;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let watch = vscode.workspace.createFileSystemWatcher("**/*.js", true,false,false);
	watch.onDidChange(uri => {
		if(vueIntellisense !== null && vueIntellisense.document.uri === uri){
			vscode.workspace.openTextDocument(uri).then(doc => {
				createVueIntellisense(doc, true);
			});
		}
	})
	let provider1 = vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems(document, position, token, context) {
			const thisCompletion = new vscode.CompletionItem('this');
			thisCompletion.commitCharacters = ['.'];
			thisCompletion.documentation = new vscode.MarkdownString('Press `.` to get `this.`');
			return [
				thisCompletion
			];
		}
	});
	const provider2 = vscode.languages.registerCompletionItemProvider(
		'javascript',
		{
			provideCompletionItems(document, position) {
				createVueIntellisense(document);
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('this.')) {
					return undefined;
				}
				/**@type{vscode.Position} */
				var iniPos = null;
				/**@type{vscode.Position} */
				var finPos = null;
				var llaves = -1;
				var iniData = false;
				for (let i = 0; i < document.lineCount; i++) {
					const line = document.lineAt(i);
					if(finPos !== null)
						break;
					else if(iniPos === null){
						let posData = line.text.search(/\bdata *:/);
						iniPos = posData !== -1? new vscode.Position(i, posData) : null;
					}
					if(iniPos !== null){//no podemos usar else ya que posiblemente haya tomado el valor en la anterior pregunta.
						line.text.split("").forEach((char, j) => {
							if(j < iniPos.character || finPos !== null)
								return;
							if(char === "{"){
								llaves++;
								iniData = true;
							}
							else if(char === "}"){
								llaves--;
								if(iniData && llaves === -1)
									finPos = new vscode.Position(i, j + 1);
								else if(llaves < -1)
									throw new Error("Error de sintaxis de la propiedad 'data'. Está cerrando la llave sin haberla abierto.");
							}
						});
					}
				}
				
				var dataRange = new vscode.Range(iniPos, finPos);
				var dataText = document.getText(dataRange);
				var textData = formatedText(dataText);
				var objData = JSON.parse(`{${textData}}`);
				var data = objData.data;
				var completionItems = [];
				for (const key in data) {
					if (data.hasOwnProperty(key)) {
						const element = data[key];
						let icon = vscode.CompletionItemKind.Property;
						let item = new vscode.CompletionItem(key, icon);
						item.preselect = true;
						completionItems.push(item);
					}
				}
				return completionItems;
			}
		},
		'.'
	);
	context.subscriptions.push(provider1, provider2);
}
function formatedText(unFormatedText) {
	var textData = '';
	var historyString = '';
	for (let i = 0; i < unFormatedText.length; i++) {
		const char = unFormatedText[i];
		if(i === 0){
			textData += '"' + char;
		}
		else if(char === "'" || char === "`" || char === '"'){
			if(historyString[historyString.length - 1] === char)
				historyString = historyString.slice(0, -1);
			else
				historyString += char;
			textData += char;
		}
		else if(char === " " || char === "	" || char === "\n" || char === "\r"){
			if(historyString === "")
				continue;
			else
				textData += char;
		}
		else if(char === ":" && historyString === "")
			textData += '"' + char;
		else if((char === "," || char === "{") && historyString === "")
			textData += char + '"';
		else if(char === "["){
			historyString += char;
			textData += char;
		}
		else if(char === "]"){
			textData += char;
			if(historyString[historyString.length - 1] === "[")
				historyString = historyString.slice(0, -1);
		}
		else
			textData += char;
	}
	return textData;
}
/**
 * 
 * @param {vscode.TextDocument} document 
 */
function createVueIntellisense(document, isUpdate = false) {
	if(vueIntellisense === null || isUpdate){
		vueIntellisense = new VueIntellisense(document);
	}
}
exports.activate = activate;
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

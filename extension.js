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
		/**
	 * 
	 * @param {Object} obj 
	 */
	static getPropCompletion(obj){
		/**
		 * @type{Array<PropCompletion>}
		 */
		var completionItems = [];
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const element = obj[key];
				let icon = vscode.CompletionItemKind.Property;
				let item = new vscode.CompletionItem(key, icon);
				let itemCompletion = new PropCompletion(item,typeof element);
				if(typeof element === "object"){
					if(!Array.isArray(element)){
						itemCompletion.childs = PropCompletion.getPropCompletion(element);
						itemCompletion.itemCompletion.commitCharacters = [".", ";", "="];
					}
				}
				else if(typeof element === "number"){
					itemCompletion.itemCompletion.commitCharacters = ["=", ";", "+", "-", "*", "/"];
				}
				else if(typeof element === "undefined" || typeof element === "boolean"){
					itemCompletion.itemCompletion.commitCharacters = [";", "="];
				}
				else if(typeof element === "string"){
					itemCompletion.itemCompletion.commitCharacters = ["=", ";", "+"];
				}
				completionItems.push(itemCompletion);
			}
		}
		return completionItems;
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
		/**@type{vscode.Range} */
		this.vueRange = null;
		this.getVueString();
		this.getDataString();
		this.getMethodsString();
		this.getComputedString();
		this.dataObj = this.dataString === null? null : JSON.parse(`{${formatedText(this.dataString)}}`);
	}
	getCompletionItems(){
		let regex = new RegExp(/((?<!: *)(?<=( |\t)*)(\b[A-z]+)(?=(\(\)|:( |\t*)function *))(?!((\(\)\r?\n))|(\(\);)))/, "gs");
		let methodsName = this.methodsString.match(regex);
		let computedName = this.computedString.match(regex);
		let data = this.dataObj.data || {};
		/**
		 * @type{Array<PropCompletion>}
		 */
		var completionItems = PropCompletion.getPropCompletion(data);
		methodsName.forEach(name => {
			let item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Method);
			let itemCompletion = new PropCompletion(item, "function");
			completionItems.push(itemCompletion);
		});
		computedName.forEach(name => {
			let item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
			let itemCompletion = new PropCompletion(item, "function");
			completionItems.push(itemCompletion);
		});
		return completionItems;
	}
	getVueString(){
		let doc = this.document;
		this.vueRange = getRangeText(doc.getText(), /((?<=\=( |	*))\bnew( ) *Vue)\b/);
		if(this.vueRange === null)
			this.vueString = null;
		else
			this.vueString = doc.getText(this.vueRange);
	}
	getDataString(){
		let doc = this.document;
		let dataRange = getRangeText(this.vueString, /\bdata *:/);
		if(dataRange === null)
			this.dataString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + dataRange.start.line, dataRange.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + dataRange.end.line, dataRange.end.character);
			var dataText = doc.getText(new vscode.Range(posIni, posFin));
			this.dataString = dataText;
		}
	}
	getMethodsString(){
		let doc = this.document;
		let methodsRange = getRangeText(this.vueString, /\bmethods *:/);
		if(methodsRange === null)
			this.methodsString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + methodsRange.start.line, methodsRange.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + methodsRange.end.line, methodsRange.end.character);
			var methodsText = doc.getText(new vscode.Range(posIni, posFin));
			this.methodsString = methodsText;
		}
	}
	getComputedString(){
		let doc = this.document;
		let computedRange = getRangeText(this.vueString, /\bcomputed *:/);
		if(computedRange === null)
			this.computedString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + computedRange.start.line, computedRange.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + computedRange.end.line, computedRange.end.character);
			var computedText = doc.getText(new vscode.Range(posIni, posFin));
			this.computedString = computedText;
		}
	}
}
/**
 * @type{Array<PropCompletion>}
 */
var completions = [];
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
				if(linePrefix[linePrefix.length -1] !== "."){
					return undefined;
				}
				if (!linePrefix.endsWith('this.')) {
					let objs = completions.filter(x => x.childs.length > 0);
					for (let i = 0; i < objs.length; i++) {
						const element = objs[i];
						if(linePrefix.endsWith(element.itemCompletion.label + ".")){
							let items = [];
							element.childs.forEach(compItem => {
								items.push(compItem.itemCompletion);
							});
							return items;
						}
					}
					return undefined;
				}
				/**
				 * @type {Array<vscode.CompletionItem>}
				 */
				var items = []; 
				completions.forEach(compItem => {
					items.push(compItem.itemCompletion);
				});
				return items;
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
 * @param {vscode.TextDocument} document 
 */
function createVueIntellisense(document, isUpdate = false) {
	if(vueIntellisense === null || isUpdate){
		vueIntellisense = new VueIntellisense(document);
		completions = vueIntellisense.getCompletionItems();
	}
}
/**
 * 
 * @param {String} doc 
 * @param {RegExp} regex
 */
function getRangeText(doc, regex) {
	/**@type{vscode.Position} */
	var iniPos = null;
	/**@type{vscode.Position} */
	var finPos = null;
	var llaves = -1;
	var iniData = false;
	var textLines = doc.split(/\r?\n/);
	textLines.forEach((line, i) => {
		if(finPos !== null)
			return;
		else if(iniPos === null){
			let posData = line.search(regex);
			iniPos = posData !== -1? new vscode.Position(i, posData) : null;
		}
		if(iniPos !== null){//no podemos usar else ya que posiblemente haya tomado el valor en la anterior pregunta.
			line.split("").forEach((char, j) => {
				if((j < iniPos.character  && i === iniPos.line) || finPos !== null)
					return;
				if(char === "{" || char === "("){
					llaves++;
					iniData = true;
				}
				else if(char === "}" || char === ")"){
					llaves--;
					if(iniData && llaves === -1)
						finPos = new vscode.Position(i, j + 1);
					else if(llaves < -1)
						throw new Error("Error de sintaxis de la instancia 'Vue'. Está cerrando la llave sin haberla abierto.");
				}
			});
		}
	});
	return new vscode.Range(iniPos, finPos);
}
exports.activate = activate;
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
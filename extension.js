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
						let commitCharacters = [".", ";", "="];
						itemCompletion.itemCompletion.commitCharacters = commitCharacters;
						itemCompletion.itemCompletion.documentation = new vscode.MarkdownString("Press `"+commitCharacters.join(" or ")+"` to get `"+itemCompletion.itemCompletion.label +"`");
					}
					else{
						itemCompletion.type = "array";
						let commitCharacters = ["[", "="];
						itemCompletion.itemCompletion.commitCharacters = commitCharacters;
						itemCompletion.itemCompletion.documentation = new vscode.MarkdownString("Press `"+commitCharacters.join(" or ")+"` to get `"+itemCompletion.itemCompletion.label +"`");
					}
				}
				else if(typeof element === "number"){
					let commitCharacters = ["=", ";", "+", "-", "*", "/"]
					itemCompletion.itemCompletion.commitCharacters = commitCharacters;
					itemCompletion.itemCompletion.documentation = new vscode.MarkdownString("Press `"+commitCharacters.join(" or ")+"` to get `"+itemCompletion.itemCompletion.label +"`");
				}
				else if(typeof element === "undefined" || typeof element === "boolean"){
					let commitCharacters = [";", "="];
					itemCompletion.itemCompletion.commitCharacters = commitCharacters;
					itemCompletion.itemCompletion.documentation = new vscode.MarkdownString("Press `"+commitCharacters.join(" or ")+"` to get `"+itemCompletion.itemCompletion.label +"`");
				}
				else if(typeof element === "string"){
					let commitCharacters = ["=", ";", "+"];
					itemCompletion.itemCompletion.commitCharacters = commitCharacters;
					itemCompletion.itemCompletion.documentation = new vscode.MarkdownString("Press `"+commitCharacters.join(" or ")+"` to get `"+itemCompletion.itemCompletion.label +"`");
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
		/**@type{vscode.Range} */
		this.dataRange = null;
		/**@type{vscode.Range} */
		this.methodsRange = null;
		/**@type{vscode.Range} */
		this.computedRange = null;
		this.getVueString();
		this.getDataString();
		this.getMethodsString();
		this.getComputedString();
		this.dataObj = this.dataString === null? null : JSON.parse(`{${formatedText(this.dataString)}}`);
	}
	getCompletionItems(){
		let regex = new RegExp(/((?<!: *)(?<=( |\t)*)(\b[A-z]+)(?=(\(\)|:( |\t*)function *))(?!((\(\)\r?\n))|(\(\);)))/, "gs");
		let methodsName = this.methodsString === null? [] : this.methodsString.match(regex);
		let computedName = this.computedString === null? [] : this.computedString.match(regex);
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
		let range = getRangeText(this.vueString, /\bdata *:/);
		if(range === null)
			this.dataString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + range.start.line, range.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + range.end.line, range.end.character);
			this.dataRange = new vscode.Range(posIni, posFin);
			var dataText = doc.getText(this.dataRange);
			this.dataString = dataText;
		}
	}
	getMethodsString(){
		let doc = this.document;
		let range = getRangeText(this.vueString, /\bmethods *:/);
		if(range === null)
			this.methodsString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + range.start.line, range.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + range.end.line, range.end.character);
			this.methodsRange = new vscode.Range(posIni, posFin);
			var methodsText = doc.getText(this.methodsRange);
			this.methodsString = methodsText;
		}
	}
	getComputedString(){
		let doc = this.document;
		let range = getRangeText(this.vueString, /\bcomputed *:/);
		if(range === null)
			this.computedString = null;
		else{
			let posIni = new vscode.Position(this.vueRange.start.line + range.start.line, range.start.character);
			let posFin = new vscode.Position(this.vueRange.start.line + range.end.line, range.end.character);
			this.computedRange = new vscode.Range(posIni, posFin);
			var computedText = doc.getText(this.computedRange);
			this.computedString = computedText;
		}
	}
}
/**
 * @type{Array<PropCompletion>}
 */
var completions = [];
/**
 * @type{Array<VueIntellisense>}
 */
var vueIntellisense = [];
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let watch = vscode.workspace.createFileSystemWatcher("**/*.js", true,false,false);
	watch.onDidChange(uri => {
		if(vueIntellisense !== null && vueIntellisense.document.uri.path === uri.path){
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
				let prefixArray = linePrefix.split(/[;.\t ]/).reverse()
				let prefix = linePrefix[linePrefix.length-1] === "."? prefixArray[1] : prefixArray[0];
				if(prefix === "this"){
					/**
					 * @type {Array<vscode.CompletionItem>}
					 */
					var items = []; 
					completions.forEach(compItem => {
						items.push(compItem.itemCompletion);
					});
					return items;
				}
				else{
					/**
					 * @param {PropCompletion} compItem 
					 * @param {String} prefix
					 */
					let findItem = (compItem, prefix) => {
						for (let i = 0; i < compItem.childs.length; i++) {
							const item = compItem.childs[i];
							if(item.itemCompletion.label === prefix){
								if(compItem.childs.length === 0)
									return undefined;
								else{
									/**
					 				* @type {Array<vscode.CompletionItem>}
									*/
									var items = []; 
									item.childs.forEach(cItem => {
										items.push(cItem.itemCompletion);
									});
									return items; 
								}
							}
							else{
								let result = findItem(item, prefix);
								if(result)
									return result;
								else
									continue;
							}
						}
						return undefined;
					}
					for (let i = 0; i < completions.length; i++) {
						const compItem = completions[i];
						if(compItem.itemCompletion.label === prefix){
							if(linePrefix[linePrefix.length - 1] === "."){
								if(compItem.childs.length === 0)
									return undefined;
								else{
									/**
					 				* @type {Array<vscode.CompletionItem>}
									*/
									var items = []; 
									compItem.childs.forEach(item => {
										items.push(item.itemCompletion);
									});
									return items; 
								}
							}
							return undefined;
						}
						else if(compItem.itemCompletion.label.startsWith(prefix)){
							return [compItem.itemCompletion];
						}
						else{
							let result = findItem(compItem, prefix);
							if(result)
								return result;
							else
								continue;
						}
					}

				}
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
 * @param {vscode.Position} position
 */
function getIntellisense(document, isUpdate = false, position = null) {
	let intellisense = null;
	if(position !== null){
		let i = vueIntellisense.findIndex(x => x.vueRange.contains(position));
		intellisense = vueIntellisense[i];
	}
	else{
		
	}
	if(isUpdate){
		let i = vueIntellisense.findIndex(x => x.document.uri.path == document.uri.path);
		if(i !== -1){
			vueIntellisense = vueIntellisense.filter((v, index) => index !== i);
			create(document);
		}
	}
	
}
function create(document) {
	if(vueIntellisense === null || vueIntellisense === []){
		let intellisense = new VueIntellisense(document);
		vueIntellisense.push(intellisense);
		completions = intellisense.getCompletionItems();
	}
}
/**
 * 
 * @param {String} doc 
 * @param {RegExp} regex
 */
function getRangeText(doc, regex) {
	if(!doc){
		return null;
	}
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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
class Intellisense  {
	/**
	 * 
	 * @param {vscode.TextDocument} document 
	 * @param {vscode.Position} position 
	 */
	provideCompletionItems(document, position) {

		// get all text until the `position` and check if it reads `console.`
		// and if so then complete if `log`, `warn`, and `error`
		const simpleCompletion = new vscode.CompletionItem('Hello World!');
		let linePrefix = document.lineAt(position).text.substr(0, position.character);
		/*if (!linePrefix.endsWith('console.')) {
			return undefined;
		}*/
		return [
			simpleCompletion,
			new vscode.CompletionItem('perro', vscode.CompletionItemKind.Method),
			new vscode.CompletionItem('gato', vscode.CompletionItemKind.Method),
			new vscode.CompletionItem('liebre', vscode.CompletionItemKind.Method),
		];
	}
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
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
					let linePrefix = document.lineAt(position).text.substr(0, position.character);
					if (!linePrefix.endsWith('this.')) {
						return undefined;
					}
					let posInictial = new vscode.Position(0, 0);
					let range = new vscode.Range(posInictial,position);
					let docText = document.getText(range);
					let lines = docText.split(/\r?\n/g);
					var iniPos = {line: -1, pos:-1};
					var llaves = -1;
					var iniData = false;
					var finPos = {line: -1, pos:-1};
					lines.forEach((textLine, i) => {
						if(finPos.pos !== -1)
							return;
						if(iniPos.pos === -1){
							iniPos.pos = textLine.search(/\bdata *:/);
							iniPos.line = i;
						}
						if(iniPos.pos > -1){
							textLine.split("").forEach((char, j) => {
								if(j < iniPos.pos || iniData && llaves === -1){
									return;
								}
								if(char === "{"){
									llaves++;
									iniData = true;
								}
								else if(char === "}"){
									llaves--;
									if(iniData && llaves === -1){
										finPos.line = i;
										finPos.pos = j;
									}
									else if(llaves < -1){
										throw new Error("Error de sintaxis de la propiedad 'data'. Está cerrando la llave sin haberla abierto.");
									}
								}
							});
						}
					});
					var textUnformatted = getTextUnformated(lines, iniPos, finPos);
					var textData = formatedText(textUnformatted);
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
function getTextUnformated(textLines, iniPos, finPos) {
	var textUnformatted = "";
	for (let i = iniPos.line; i <= finPos.line; i++) {
		let line = textLines[i];
		if(i === iniPos.line){
			if(i === finPos.line)
				textUnformatted += line.substring(iniPos.pos,finPos.pos + 1);
			else
				textUnformatted += line.substring(iniPos.pos,line.length);
		}
		else if(i === finPos.line){
			textUnformatted += line.substring(0,finPos.pos + 1);
		}
		else
			textUnformatted += line;
	}
	return textUnformatted;
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
exports.activate = activate;
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

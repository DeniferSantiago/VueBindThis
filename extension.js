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
					var textUnformatted = "";
					for (let i = iniPos.line; i <= finPos.line; i++) {
						let line = lines[i];
						if(i === iniPos.line){
							if(i === finPos.line)
								textUnformatted += line.substring(iniPos.pos,finPos.pos + 1);
							else
								textUnformatted += line.substring(iniPos.pos,line.length);
						}
						else if(i === finPos.line){
							textUnformatted += line.substring(0,finPos.pos);
						}
						else
							textUnformatted += line;
					}
					var textData = '';
					var historyString = '';
					for (let i = 0; i < textUnformatted.length; i++) {
						const char = textUnformatted[i];
						if(i === 0){
							textData += '"' + char;
						}
						else if(char === "'" || char === "`" || char === '"'){
							if(historyString[historyString.length - 1] === char)
								historyString = historyString.slice(0, -1);
							else
								historyString += char;
						}
						else if(char === " " || char === "	"){
							if(historyString === "")
								return;
							else
								textData += char;
						}
						else if(char === ":" && historyString === "")
							textData += '"' + char;
						else if(char === "," && historyString === "")
							textData += '"' + char;
					}
					var objData = JSON.parse(textData);
					console.log(objData);
					return [
						new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
					];
				}
			},
			'.'
		);
	context.subscriptions.push(provider1, provider2);
}
exports.activate = activate;
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

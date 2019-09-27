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
	
				// a completion item that can be accepted by a commit character,
				// the `commitCharacters`-property is set which means that the completion will
				// be inserted and then the character will be typed.
				const thisCompletion = new vscode.CompletionItem('this');
				thisCompletion.commitCharacters = ['.'];
				thisCompletion.documentation = new vscode.MarkdownString('Press `.` to get `this.`');
	
				// return all completion items as array
				return [
					thisCompletion
				];
			}
		});
	
		const provider2 = vscode.languages.registerCompletionItemProvider(
			'javascript',
			{
				provideCompletionItems(document, position) {
	
					// get all text until the `position` and check if it reads `console.`
					// and if so then complete if `log`, `warn`, and `error`
					let linePrefix = document.lineAt(position).text.substr(0, position.character);
					let posInictial = new vscode.Position(0, 0);
					let range = new vscode.Range(posInictial,position);
					let text = document.getText(range);
					if (!linePrefix.endsWith('this.')) {
						return undefined;
					}
	
					return [
						new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
					];
				}
			},
			'.' // triggered whenever a '.' is being typed
		);
	
	context.subscriptions.push(provider1, provider2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

const vscode = require('vscode');
export default class VueIntellisense{
	uri;
	vueString;
	dataString;
	methodsString;
	computedString;
    /**
     * @param {vscode.Uri} uri Uri of file
     * @param {String} vueString String of vue instance 
     */
	constructor(uri, vueString){
		this.uri = uri;
		this.vueString = vueString;
		this.dataString = "";
		this.methodsString = "";
		this.computedString = "";
	}
}
const vscode = require('vscode');
export default class PropCompletion{
	itemCompletion;
	type;
	childs;
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
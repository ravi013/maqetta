/**
 * @class davinci.html.HTMLImport
 * @constructor
 * @extends davinci.html.HTMLImport
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLElement",
	"davinci/model/Path",
	"davinci/html/HTMLFile"
], function(declare, HTMLElement, Path, HTMLFile) {

return declare("davinci.html.HTMLImport", HTMLElement, {

	constructor: function() {
		this.elementType = "HTMLImport";
		
	},

	getHTMLFile: function() {
		return this.parent;
	},

	setUrl: function(url) {
		this.url = url;
	},

	visit: function(visitor) {
		if (!visitor.visit(this)) {
			for ( var i = 0; i < this.children.length; i++ ) {
				//this.children[i].visit(visitor);
			}
			if (this.htmlFile) {
				this.htmlFile.visit(visitor);
			}
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	},
	
	getText: function(context,mode) {
		var s ="";
		//mode=2;
		if(mode && mode==2){		
		s=this.htmlFile?this.htmlFile.getChildElement("html",true).getChildElement("body",true).getText(context):"";// "<div>InnerHTML</div>";
		}
		console.debug("get text "+s);
		return s;
	},
	getSrcElement: function() {
		var s ="";
		s=this.htmlFile?this.htmlFile:"";// "<div>InnerHTML</div>";
		console.debug("getSrcElement "+s);
		return s;
	},
	close: function(includeImports) {
		// the return of the JTMLFile model needs to happen in the import instead of the HTMLFile
		// if we return it in the HTMLFile close we end up returning it twice due of the visit logic
		if(this.htmlFile)
		require("davinci/model/Factory").closeModel(this.htmlFile); 
		if (this.connection) {
			dojo.disconnect(this.connection);
		}
		delete this.connection;
	},

	load: function(includeImports) {
		if(this.isLoaded){
			return;
		}

		var myUrl = this.url;
		console.debug("Loading inner Html file "+myUrl);
       	// have to use the require or we get a circular dependency 
		this.htmlFile = require("davinci/model/Factory").getModel({
			url : myUrl,
			//loader : this.parent.loader,
			includeImports : true
		});
		this.htmlFile.relativeURL = this.url;
		var deffered=this.htmlFile.load();
		this.addChild(this.htmlFile, undefined, true);
	//	this.connection = dojo.connect(this.htmlFile, 'onChange', this.parent, 'onChange');
		this.isLoaded=true;
		return deffered;
	}

});
});






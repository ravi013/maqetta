define([
	"require",
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/promise/all",
	"../ui/ModelEditor",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	"dojo/dnd/Moveable",
	"../Runtime",
	"../commands/CommandStack",
	"../html/ui/HTMLEditor",
	"../model/Path",
	"./VisualEditor",
	"./VisualEditorOutline",
	"./widget",
	"./States",
	"../XPathUtils",
	"../html/HtmlFileXPathAdapter",
	"./utils/GeomUtils",
	"dojo/i18n!./nls/ve",
	"dojox/widget/Toaster",
	"dojo/_base/xhr",
	"davinci/ui/TextEditor",
	"davinci/js/ui/JavaScriptEditor",
	"davinci/html/ui/CSSEditor",
	
], function(require, declare,Deferred,all, ModelEditor, BorderContainer,TabContainer, ContentPane, Runtime, Moveable, CommandStack, HTMLEditor, Path, VisualEditor, VisualEditorOutline, widgetUtils, States, XPathUtils, HtmlFileXPathAdapter, GeomUtils, veNls, Toaster,xhr,TextEditor,JavaScriptEditor,CSSEditor){

return declare("davinci.ve.WidgetEditor", ModelEditor, {

	_latestSourceMode: "source",
	_latestLayoutMode: "flow",

    constructor: function (element, fileName) {
    	
    	
    	this.testfileName=fileName.replace(".widget","_test.html");
    	this.jsfileName=fileName.replace(".widget",".js");
    	this.htmlfileName=fileName.replace(".widget",".html");
    	this.oamfileName=fileName.replace(".widget","_oam.json");
    	this.cssfileName=fileName.replace(".widget",".css");
    	var params={};
    	if(element.id){
    		params.id="bc"+element.id;
    	}
        this._bc = new BorderContainer(params, element);
     
        this.domNode = this._bc.domNode;

       
        this.savePoint=0;

        this._designCP = new ContentPane({'class':'designCP', region:'center'});
        this._bc.addChild(this._designCP);

        this.visualEditor = new VisualEditor(this._designCP.domNode, this);
        this.currentEditor = this.visualEditor;
        this._commandStack = new CommandStack(this);
        this.currentEditor._commandStack = this._commandStack;

        try {
	        this._srcCP = new TabContainer({
	            style: " width: 50%;",splitter: true,nested:true
	        }, "");

	
	        // hack to get the source content page to resize itself
	        var oldResize = this._srcCP.resize;
	        this._srcCP.resize = function(changeSize, resultSize) {
	            dojo.marginBox(this.domNode, resultSize);
	            oldResize.apply(this, arguments);
				if(htmlEditor.editor && htmlEditor.editor.getTextView()) {
					htmlEditor.editor.getTextView().resize();
				}
	        };
	        this._srcCP.watch("selectedChildWidget", function(name, oval, nval){
	            console.log("selected child changed from ", oval, " to ", nval);
	        });
	        
	        this._testHtmlPane = new ContentPane({
	             title: "Unit Test",
	             content: "Unable to find Test Script"
	        });
	        this._widgetScriptPane = new ContentPane({
	             title: "Widget Script",
	             content: "Unable to find Widget Script"
	        });
	        this._cssPane = new ContentPane({
	             title: "Style",
	             content: "Unable to find Style Script"
	        });
	        this._htmlFragmentPane = new ContentPane({
	             title: "Html Fragment",
	             content: "Unable to find Html Fragment",
	             refreshOnShow:true
	        });
	        
	        this._metadataPane = new ContentPane({
	             title: "Metadata",
	             content: "Unable to load Metadata"
	        });
	        
	        
	        
	        
	        this._srcCP.addChild(this._widgetScriptPane);
	        this._srcCP.addChild(this._htmlFragmentPane);
	        this._srcCP.addChild(this._cssPane);
	        this._srcCP.addChild(this._metadataPane);
	        this._srcCP.addChild(this._testHtmlPane);

		     
		     
	        var htmlEditor = this.htmlEditor = new HTMLEditor(this._testHtmlPane.domNode, this.testfileName, true);
	         this.model = htmlEditor.model;
	        
	        var htmlFragmentEditor = this.htmlFragmentEditor = new HTMLEditor(this._htmlFragmentPane.domNode, this.htmlfileName, true);
	        var jsEditor = this.jsEditor = new JavaScriptEditor(this._widgetScriptPane.domNode, this.jsfileName, true);
	        var metadataEditor = this.metadataEditor = new JavaScriptEditor(this._metadataPane.domNode, this.oamfileName, true);
	        var cssEditor = this.cssEditor = new CSSEditor(this._htmlFragmentPane.domNode, this.cssfileName, true);
			      
	        this._metadataPane.connect(this._metadataPane, 'onShow', function(){
	            console.log("selected child _metadataPane");
	            htmlFragmentEditor.setVisible(true);
	        });
	        
	        
	        this._displayMode = "splitVertical";
	        this._designCP.domNode.style.width = "50%";
	        this._srcCP.set("region", "left");
	        this._srcCP.domNode.style.width = "50%";
	        this._bc.set("design", "sidebar");
	        this._bc.addChild(this._srcCP);
	       
	       
	        
	      
	        
	        this._bc.startup();
	        this._bc.resize(); // kludge: forces primary tab to display	
	
	        this._connect(this.visualEditor,"onContentChange", "_visualChanged");
	        this.subscribe("/davinci/ui/styleValuesChange",   this._stylePropertiesChange);
	        this.subscribe("/davinci/ui/widgetSelected",   this._widgetSelectionChange);
	        this.subscribe("/davinci/ui/selectionChanged",  this._modelSelectionChange);
	//      this._connect(this.visualEditor.context, "onSelectionChange","_widgetSelectionChange");
			this.subscribe("/davinci/ui/editorSelected", this._editorSelected.bind(this));
			this.subscribe("/davinci/ui/context/loaded", this._contextLoaded.bind(this));
			this.subscribe("/davinci/ui/deviceChanged", this._deviceChanged.bind(this));
        } catch(e) {
        	this.visualEditor._connectCallback(e);
        }
    },
	
	setRootElement: function(rootElement){
    	this._rootElement = rootElement;
	},

	supports: function (something){
		// Note: the propsect_* values need to match the keys in SwitchingStyleView.js
		var regex = /^palette|properties|style|states|inline-style|MultiPropTarget|propsect_common|propsect_widgetSpecific|propsect_events|propsect_layout|propsect_paddingMargins|propsect_background|propsect_border|propsect_fontsAndText|propsect_shapesSVG$/;
		return something.match(regex);
	},

	focus: function() {
//		if(this.currentEditor==this.visualEditor)
//			this.visualEditor.onContentChange();
	},
	
	_editorSelected: function(event){
		var context = this.getContext();
		if(this == event.oldEditor){
			context.hideFocusAll();
		}
		if(event.editor && event.editor.editorContainer && 
				(event.editor.declaredClass == 'davinci.ve.WidgetEditor' ||
				event.editor.declaredClass == 'davinci.ve.themeEditor.ThemeEditor')){
			if(this == event.editor){
				var flowLayout = context.getFlowLayout();
				var layout = flowLayout ? 'flow' : 'absolute';
				this._updateLayoutDropDownButton(layout);
				context.clearCachedWidgetBounds();
				if (this.editorContainer){
					this.editorContainer.updateToolbars();
				}
			}
		}
	},
	
	_contextLoaded: function(){
		if(Runtime.currentEditor == this && this.editorContainer){
			this.editorContainer.updateToolbars();
		}
	},
	
	_deviceChanged: function(){
		if(Runtime.currentEditor == this && this.editorContainer){
			var context = this.getContext();
			if(context && context.updateFocusAll){
				// setTimeout is fine to use for updateFocusAll
				// Need to insert a delay because new geometry
				// isn't ready right away.
				// FIXME: Should figure out how to use deferreds or whatever
				// to know for sure that everything is all set and we
				// can successfully redraw focus chrome
				setTimeout(function(){
					context.updateFocusAll();					
				},1000);
			}
		}
	},

	_updateLayoutDropDownButton: function(newLayout){
		var layoutDropDownButtonNode = dojo.query('.maqLayoutDropDownButton');
		if(layoutDropDownButtonNode && layoutDropDownButtonNode[0]){
			var layoutDropDownButton = dijit.byNode(layoutDropDownButtonNode[0]);
			if(layoutDropDownButton){
				layoutDropDownButton.set('label', veNls['LayoutDropDownButton-'+newLayout]);
			}
		}

	},
	
	_selectLayout: function(layout){
		this._latestLayoutMode = layout;
		require(["davinci/actions/SelectLayoutAction"], function(ActionClass){
			var SelectLayoutAction = new ActionClass();
			SelectLayoutAction._changeLayoutCommand(layout);
		});
		this._updateLayoutDropDownButton(layout);
	},
	selectLayoutFlow: function(){
		this._selectLayout('flow');
	},
	selectLayoutAbsolute: function(){
		this._selectLayout('absolute');
	},

	getDisplayMode: function(){
		return this._displayMode;
	},
	getSourceDisplayMode: function(){
		return this._latestSourceMode;
	},
	_switchDisplayModeSource: function (newMode) {
		this._latestSourceMode = newMode;
		this.switchDisplayMode(newMode);
	},
	switchDisplayModeSource: function () {
		this._switchDisplayModeSource("source");
	},
	switchDisplayModeSplitVertical: function () {
		this._switchDisplayModeSource("splitVertical");
	},
	switchDisplayModeSplitHorizontal: function () {
		this._switchDisplayModeSource("splitHorizontal");
	},
	switchDisplayModeSourceLatest: function () {
		this.switchDisplayMode(this._latestSourceMode);
	},
	switchDisplayModeDesign: function () {
		this.switchDisplayMode("design");
	},
	switchDisplayMode: function (newMode) {
		var context = this.getContext();
		if (this._displayMode!="design") {
			this._bc.removeChild(this._srcCP);
			this.htmlEditor.setVisible(false);
		}

		// reset any settings we have used
		this._designCP.set("region", "center");
		delete this._designCP.domNode.style.width;
		delete this._srcCP.domNode.style.width;

		switch (newMode) {
			case "design":
				break;
			case "source":
				// we want to hide the design mode.  So we set the region to left
				// and manually set the width to 0.
				this._designCP.set("region", "left");
				this._designCP.domNode.style.width = 0;
				this._srcCP.set("region", "center");
				break;
			case "splitVertical":
				this._designCP.domNode.style.width = "50%";
				this._srcCP.set("region", "right");
				this._srcCP.domNode.style.width = "50%";
				this._bc.set("design", "sidebar");
				break;
			case "splitHorizontal":
				this._designCP.domNode.style.height = "50%";
	
				this._srcCP.set("region", "bottom");
				this._srcCP.domNode.style.height = "50%";
	
				this._bc.set("design", "headline");
		}

		if (newMode!="design") {
			this._bc.addChild(this._srcCP);
			this.htmlEditor.setVisible(true);
		}

		this._displayMode=newMode;

		// now lets relayout the bordercontainer
		this._bc.layout();

		if (this.editorContainer){
			this.editorContainer.updateToolbars();
		}

		dojo.publish('/davinci/ui/repositionFocusContainer', []);

		if (newMode == "source") {
			context.hideFocusAll();			
		}else{
			context.clearCachedWidgetBounds();
			context.updateFocusAll();
		}
	},

	_modelSelectionChange: function (selection) {
	    /*
	     * we do not want to drive selection on the view editor unless:
	     *     - we are in an editor mode which has a view editor (not source mode)
	     *     - we are the current editor
	     */
		if(this._displayMode == "source" || require("davinci/Runtime").currentEditor !== this) { //FIXME: require("davinci/Runtime")!=Runtime.  Why??
			return;
		}
		
		this._selectionCssRules = null;
		if (selection.length) {
			var htmlElement = selection[0].model;
			if (htmlElement && htmlElement.elementType == "HTMLElement") {
				var id = htmlElement.getAttribute("id");
				if (id && this._displayMode!="source") {
					var widget = widgetUtils.byId(id, this.visualEditor.context.getDocument());
					var box = GeomUtils.getMarginBoxPageCoords(widget.domNode);
					this.getContext().getGlobal().scroll(box.l, box.t);
					this.visualEditor.context.select(widget);
				}
			}
		}
	},
	
	_widgetSelectionChange: function (selection) {
		if(!this.visualEditor.context ||
				(selection && selection.length && selection[0]._edit_context != this.visualEditor.context)){
			return;
		}
		var selection = this.visualEditor.context.getSelection();
		if (selection && selection.length){
			if (this._displayMode != "design"){
				this.htmlEditor.selectModel([{model:selection[0]._srcElement}]);
			}
		}
	},

	_stylePropertiesChange: function (value) {
		this.visualEditor._stylePropertiesChange(value);
//		this._srcChanged();
	},
	
	_setDirty: function() {
		this.setDirty(true);
	},
	
	setDirty: function(isDirty){
		this.isDirty=isDirty;
		if (isDirty){
			this.lastModifiedTime=Date.now();
		}
		if (this.editorContainer){
			this.editorContainer.setDirty(isDirty);
		}
	},
	
	_visualChanged: function(skipDirty) {
		if (!skipDirty) {
			this._setDirty();
		}
		this.htmlEditor.setValue(this.model.getText(),true);
	},
	
	_srcChanged: function() {
		// Because this can be called from SourceChangeCommand, make sure dojo.doc is bound to the Workbench
		dojo.withDoc(window.document, function(){
			var wasTyping = this.htmlEditor.isTyping;
			if(wasTyping) {
				this.visualEditor.skipSave = true;
			}
			var context = this.visualEditor.context,
				statesScenes = context && this._getStatesScenes(context);
			this.visualEditor.setContent(this.fileName, this.htmlEditor.model);
			this.editorContainer.updateToolbars();
			dojo.publish('/davinci/ui/context/pagerebuilt', [context]);
			if(statesScenes){
				this._setStatesScenes(context, statesScenes);
			}
			delete this.visualEditor.skipSave;
			this._setDirty();
		}, this);
	},

	/**
	 * Returns an object holding the set of currently selected application states and (mobile) scenes
	 * @return {object}  { statesInfo:statesInfo, scenesInfo:scenesInfo }
	 */
	_getStatesScenes: function(context) {
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus){
			statesFocus = {stateContainerNode: context.rootNode};
		}
		if(typeof statesFocus.state != 'string'){
			statesFocus.state = States.NORMAL;
		}
		var statesInfo = States.getAllStateContainers(context.rootNode).map(function(stateContainer) {			
			var currentState = States.getState(stateContainer);
			var currentStateString = typeof currentState == 'string' ? currentState : States.NORMAL;
			var xpath = XPathUtils.getXPath(
					stateContainer._dvWidget._srcElement,
					HtmlFileXPathAdapter);
			var focus = statesFocus.stateContainerNode == stateContainer &&
						statesFocus.state == currentStateString;
			return { currentStateXPath:xpath, state:currentState, focus:focus };
		});
		scenesInfo = {};
		var sceneManagers = context.sceneManagers;
		for(var smIndex in sceneManagers){
			var sm = sceneManagers[smIndex];
			scenesInfo[smIndex] = { sm: sm };
			scenesInfo[smIndex].sceneContainers = sm.getAllSceneContainers().map(function(sceneContainer) {
				var currentScene = sm.getCurrentScene(sceneContainer);
				var sceneContainerXPath = XPathUtils.getXPath(
						sceneContainer._dvWidget._srcElement,
						HtmlFileXPathAdapter);
				var currentSceneXPath = XPathUtils.getXPath(
						currentScene._dvWidget._srcElement,
						HtmlFileXPathAdapter);
				return {
					sceneContainerXPath: sceneContainerXPath,
					currentSceneXPath: currentSceneXPath
				};
			});
		}
		return { statesInfo:statesInfo, scenesInfo:scenesInfo };
	},
	
	/**
	 * Sets the current scene(s) and/or current application state
	 * @param {object}  object of form { statesInfo:statesInfo, scenesInfo:scenesInfo }
	 */
	_setStatesScenes: function(context, statesScenes) {
		var statesInfo = statesScenes.statesInfo;
		if(statesInfo){
			for(var i=0; i<statesInfo.length; i++){
				var info = statesInfo[i],
					xpath = info.currentStateXPath,
					element = context.model.evaluate(xpath);
				if (!element) { continue; }
				var widget = widgetUtils.byId(element.getAttribute('id'), context.getDocument());
				States.setState(info.state, widget.domNode, {focus: info.focus});
			}
		}

		var scenesInfo = statesScenes.scenesInfo;
		for(var smIndex in scenesInfo){
			var sm = scenesInfo[smIndex].sm,
				allSceneContainers = scenesInfo[smIndex].sceneContainers;
			for(i=0; i<allSceneContainers.length; i++){
				var sceneContainer = allSceneContainers[i],
					xpath = sceneContainer.sceneContainerXPath,
					element = context.model.evaluate(xpath);
				if (!element) { continue; }
				var widget = widgetUtils.byId(element.getAttribute('id'), context.getDocument()),
					sceneContainerNode = widget.domNode;

				xpath = sceneContainer.currentSceneXPath;
				element = context.model.evaluate(xpath);
				if (!element) { continue; }
				sm.selectScene({ sceneContainerNode: sceneContainerNode, sceneId: element.getAttribute('id') });
			}
		}
	},

	getContext: function() {
		return this.visualEditor.context;
	},
	
	getOutline: function() {
		if (!this.outline) {
			this.outline = new VisualEditorOutline(this);
		}
		return this.outline;
	},
	
	getPropertiesView: function() {
		return this.currentEditor.getPropertiesView();
	},
	
	
	setContent: function (filename, content, newHtmlParams,keyArgs) {
		
		/*// clear the singletons in the Factory
		this.htmlEditor.htmlFile.visit({visit:function(node) {
			if (node.elementType == "CSSImport") {
				node.close();
			}
		}});*/
		 var deferred = new Deferred();
		 this.fileName = filename;
		 this.newHtmlParams = newHtmlParams;
		 this.keyArgs = keyArgs;
		 var testfileName=filename.replace(".widget","_test.html");	
		 console.debug("filename "+testfileName);
		 this.resourceFile= this.htmltestResource=system.resource.findResource(this.testfileName);
		 this.jsResource=system.resource.findResource(this.jsfileName);
		 this.htmlResource=system.resource.findResource(this.htmlfileName);
		 this.oamResource=system.resource.findResource(this.oamfileName);
		 this.cssResource=system.resource.findResource(this.cssfileName);
		 
		 var currentEditor=this;
		 currentEditor.htmlEditor.resourceFile=this.htmltestResource;
		 currentEditor.jsEditor.resourceFile=this.jsResource;
		 currentEditor.htmlFragmentEditor.resourceFile=this.htmlResource;
		 currentEditor.metadataEditor.resourceFile=this.oamResource;
		 currentEditor.cssEditor.resourceFile=this.cssResource;
		 
		console.debug("type "+keyArgs.type);
				
		var testResPromise,jsResPromise,htmlResPromise,oamResPromise,cssResPromise;
		var requestArray={};
    	 if(this.htmltestResource)
    		{testResPromise=this.htmltestResource.getContent().promise;
    		}
	 	 if(testResPromise){
	 		requestArray.testResPromise=testResPromise;
	 	 }    	 
    	 if(this.jsResource)
    		 jsResPromise=this.jsResource.getContent().promise;
	    	 if(jsResPromise){
	 	 		requestArray.jsResPromise=jsResPromise;
	 	 	} 
    	 if(this.htmlResource)
    		 htmlResPromise=this.htmlResource.getContent().promise;
	    	 if(htmlResPromise){
	 	 		requestArray.htmlResPromise=htmlResPromise;
	 	 	}     		
    	 if(this.oamResource)
    		 oamResPromise=this.oamResource.getContent().promise;
	    	 if(oamResPromise){
	 	 		requestArray.oamResPromise=oamResPromise;
	 	 	}
    	 if(this.cssResource)
    		 cssResPromise=this.cssResource.getContent().promise;
	    	 if(cssResPromise){
	 	 		requestArray.cssResPromise=cssResPromise;
	 	 	}
	    	
    	   all(requestArray).then(function(results){
    		
    		 if(results.testResPromise){
			     currentEditor.htmlEditor.setContent(testfileName,results.testResPromise);
		    	 currentEditor.visualEditor.setContent(testfileName, currentEditor.htmlEditor.model, newHtmlParams);
		    	 currentEditor._connect(currentEditor.htmlEditor.model,"onChange", "_themeChange");
		 		 currentEditor.htmlEditor.setValue(currentEditor.model.getText(), true);
		 		 currentEditor.htmlEditor.setVisible(true);
    		 }
    		 if(results.jsResPromise){
		 		 currentEditor.jsEditor.setContent(currentEditor.jsfileName,results.jsResPromise);
			     currentEditor.jsEditor.setVisible(true);
	    		 }
    		 if(results.htmlResPromise){
			     currentEditor.htmlFragmentEditor.setContent(currentEditor.htmlfileName,results.htmlResPromise);	
			     currentEditor.htmlFragmentEditor.setVisible(true);

    		 }
    		 if(results.oamResPromise){
				 currentEditor.metadataEditor.setContent(currentEditor.oamfileName,results.oamResPromise);
				 currentEditor.metadataEditor.setVisible(true);
    		 }
    		 if(results.cssResPromise){
				 currentEditor.cssEditor.setContent(currentEditor.cssfileName,results.cssResPromise);
				 currentEditor.cssEditor.setVisible(true);
    		 }
    		 deferred.resolve();
    		 console.debug("Widget Editor done loading files");
    		    });
    	   console.debug("Widget Editor return promise");
    	   return deferred.promise;
	},
	
	_themeChange: function(e) {
		if (e && e.elementType === 'CSSRule') {
			this.setDirty(true); // a rule change so the CSS files are dirty. we need to save on exit
			this.visualEditor.context.hotModifyCssRule(e);
		}
	}, 
	
	getDefaultContent: function() {
		this._isNewFile=true;
		return this.visualEditor.getDefaultContent();
	},

	selectModel: function (selection, editor) {
		if (this.publishingSelect || (editor && this != editor)) {
			return;
		}
		var selectionItem= selection && selection[0];
		if (!selectionItem) {
			return;
		}
		if (selectionItem.elementType) {
			this.htmlEditor.selectModel(selection);
		} else if (selectionItem.model && selectionItem.model.isWidget) {
			this.visualEditor.context.select(selectionItem.model,selectionItem.add);
		}
	},
	
	save: function (isAutoSave) {
	//	this.inherited(arguments);
		 var deferred = new Deferred();
		if (isAutoSave) {
			if (system.resource.findResource(this.fileName).readOnly()) {
				// disable autosaving for readonly files
				return;
			}
		}
		if (typeof hasToaster == "undefined") {
			new Toaster({
				position: "br-left",
				duration: 4000,
				messageTopic: "/davinci/resource/saveError"
			});
			hasToaster = true;
		}
		
		this.savePoint=this._commandStack.getUndoCount();
		var promises =  [];
		promises.push(this.visualEditor.save(isAutoSave));		
		 if(this.jsResource) promises.push(this.jsEditor.save(isAutoSave));
		 if(this.oamResource) promises.push(this.metadataEditor.save(isAutoSave));
		 if(this.htmlResource) promises.push(this.htmlFragmentEditor.save(isAutoSave));
		 if(this.cssResource) promises.push(this.cssEditor.save(isAutoSave));

		if (promises && promises.then){
			all(promises).then(
				function(results){
					this.isDirty = isAutoSave;
					if (this.editorContainer && this.editorContainer.domNode) {
						this.editorContainer.setDirty(isAutoSave);
					}
					deferred.resolve();
				}.bind(this),
				function(error){
					var message = veNls.vteErrorSavingResourceMessage + error;
					dojo.publish("/davinci/resource/saveError", [{message:message, type:"error"}]);
		 			console.error(message);
		 			deferred.resolve();
				}
			);
		}
		
		return deferred.promise;
	},
	
	removeWorkingCopy: function(){ //wdr
		//this.visualEditor.removeWorkingCopy();
	},

	previewInBrowser: function () {
		this.visualEditor.previewInBrowser();
	},
	refresh: function () {

		var me=this;
		
		var reset =function() {
			me.visualEditor.destroy();
			me.htmlEditor.destroy();	
			me._designCP.destroyDescendants();
			me.htmlEditor = new HTMLEditor(me._testHtmlPane.domNode, me.testfileName, true);
			me.visualEditor = new VisualEditor(me._designCP.domNode, me);
			me.currentEditor = me.visualEditor;
			me._commandStack = new CommandStack(me);       
	        me.currentEditor._commandStack = me._commandStack;
	        me.setContent(me.fileName, "", me.newHtmlParams,me.keyArgs);console.debug("in reset ");
		};
		    this.save().then(function(){console.debug("in reset ");reset();});
		    reset();
	},
	saveFiles : function () {
		 this.htmltestResource.save();
		 this.jsResource.save();
		 this.htmlResource.save();
		 this.oamResource.save();
		 this.cssResource.save();
		
	},
	destroy: function () {
		this.inherited(arguments);
		this.visualEditor.destroy();
		this.htmlEditor.destroy();
	},
	
	getText: function () {
		return this.htmlEditor.getText();
	},
	
	onResize: function() {
		var context = this.getContext();
		var selections = context.getSelection();
		for (var i = 0; i < selections.length; i++) {
			var add = (i != 0);
			context.select(selections[i], add); 
		}
	},

	// dummy handler
	handleKeyEvent: function(e) {
	},
	
	getDisplayMode: function(){
		return this._displayMode;
	},
	
	/**
	 * Return clipping bounds for focusContainer node, whose main purpose is to
	 * clip the selection chrome so it doesn't impinge on other parts of the UI
	 */
	getFocusContainerBounds: function(){
		if(this._displayMode == 'source'){
			return {l:0, t:0, w:0, h:0};
		}else{
			var clipTo = this._designCP.domNode;
			var box = GeomUtils.getBorderBoxPageCoords(clipTo);
/*FIXME: See #2951. This isn't working in all cases yet, so commenting out.
  When a silhouette is active, need to check for an active scroll bar on this._designCP.domNode
  but when no silhouette, need to check the HTML node on the user's document within iframe.
  Code below only deals with this._designCP.domNode.
			// Back off selection chrome in case this._designCP has scrollbar(s)
			if(clipTo.scrollWidth > clipTo.clientWidth && (clipTo.clientWidth - scrollbarWidth) < box.w){
				box.w = clipTo.clientWidth - scrollbarWidth;
			}
			if(clipTo.scrollHeight > clipTo.clientHeight && (clipTo.clientHeight - scrollbarWidth) < box.h){
				box.h = clipTo.clientHeight - scrollbarWidth;
			}
*/
			// Make the clip area 8px bigger in all directions to make room
			// for selection chrome, which is placed just outside bounds of widget
			box.l -= 8;
			box.t -= 8;
			var device = (this.visualEditor && this.visualEditor.getDevice) ? this.visualEditor.getDevice() : 'none';
			if(device == 'none'){
				box.w += (this._displayMode == 'splitVertical' ? 8 : 16);
				box.h += (this._displayMode == 'splitHorizontal' ? 8 : 16);
			}else{
				box.w += 8;
				box.h += 8;
			}
			return box;
		}
	},
	
	getCommandStack: function(){
		var context = this.getContext();
		return context.getCommandStack();
	}
});
}); 

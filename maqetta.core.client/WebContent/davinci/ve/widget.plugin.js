define([
	'require'
//	'../Workbench'
], function(require) {

return {
	id: "davinci.widget",
	"davinci.editor":  {
        id: "HTMLWidgetEditor",
        name: "HTML Widget Editor",
        extensions: ["widget"],
        isDefault: true,
        // TODO implement icon : "",
        editorClass: "davinci/ve/WidgetEditor",
        palettePerspective: "davinci.ve.pageDesign",
        expandPalettes: ["left"]
    },
	"davinci.actionSets": [{
            id: "cutCopyPaste",
            visible: true,
            actions: [
                {
                    label: "Cut",
                    keySequence: "M1+X",
                    iconClass: "editActionIcon editCutIconSmall",
                    action: "davinci/ve/actions/CutAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    label: "Copy",
                    keySequence: "M1+C",
                    iconClass: "editActionIcon editCopyIconSmall",
                    action: "davinci/ve/actions/CopyAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    keySequence: "M1+V",
                    iconClass: "editActionIcon editPasteIconSmall",
                    label: "Paste",
                    action: "davinci/ve/actions/PasteAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    keySequence: "DEL",
                    iconClass: "editActionIcon editDeleteIconSmall",
                    label: "Delete",
                    action: "davinci/ve/actions/DeleteAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon selectParentIconSmall",
                    label: "Select parent",
                    action: "davinci/ve/actions/SelectParentAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon selectAncestorIconSmall",
                    label: "Select ancestor...",
                    action: "davinci/ve/actions/SelectAncestorAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon unselectAllIconSmall",
                    label: "Unselect all",
                    action: "davinci/ve/actions/UnselectAllAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;A&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    surroundWithTagName:'a',
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;DIV&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    surroundWithTagName:'div',
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon",
                    label: "Surround with &lt;SPAN&gt;",
                    action: "davinci/ve/actions/SurroundAction",
                    surroundWithTagName:'span',
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon moveToFrontIconSmall",
                    label: "Move to front",
                    action: "davinci/ve/actions/MoveToFrontAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon moveForwardIconSmall",
                    label: "Move forward",
                    action: "davinci/ve/actions/MoveForwardAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon moveBackwardIconSmall",
                    label: "Move backward",
                    action: "davinci/ve/actions/MoveBackwardAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                    iconClass: "editActionIcon moveToBackIconSmall",
                    label: "Move to back",
                    action: "davinci/ve/actions/MoveToBackAction",
                    menubarPath: "davinci.edit/cut"
                },
                {
                iconClass: "editActionIcon",
                label: "Manage States...",
                action: "davinci/ve/actions/ManageStates",
                menubarPath: "davinci.edit/cut"
            	}/*,
                {
                    iconClass: "editActionIcon",
                    label: "Application States...",
                    action: "davinci/ve/actions/EnableApplicationStates",
                    menubarPath: "davinci.edit/cut"
                }*/
            ]
        }
		
	],
	"davinci.actionSetPartAssociations": [
		
	],
	"davinci.editorActions": {
		editorContribution: {
			targetID: "davinci.widget.HTMLWidgetEditor",
			actions: [
		              {
		                  id: "savecombo",
		                  className: "maqLabelButton",
		                  showLabel: true,
		                  label: "Save0",
		                  toolbarPath: "save",
		                  type:'ComboButton',
		                  run: function() {
		                        require(['../Workbench'], function(workbench) {
		                            var editor = workbench.getOpenEditor();
		                            if (editor && editor) {
		                                editor.save();
		                            } else {
		                                console.error("ERROR. Cannot save files. No editor info.");
		                            }
		                        });
		                    },
		                  isEnabled: function(context) {
		                      return require('../Workbench').getOpenEditor();
		                  },
		                  menu:[
		                     {
		                          iconClass: 'saveIcon',
		                          run: function() {
		                          		require("../ui/Resource").save();
		                          },
		                          isEnabled: function(context) {
		                              return require('../Workbench').getOpenEditor();
		                          },
		                          label: "Save",
		                  		keyBinding: {accel: true, charOrCode: "s", allowGlobal: true}
		                      },
		                      {
		                          iconClass: 'saveAsIcon',
		                          run: function() {
		                              require("../ui/Resource").saveAs('html');
		                          },
		                          isEnabled: function(context) {
		                              return require('../Workbench').getOpenEditor();
		                          },
		                          label: "Save As",
		                  		keyBinding: {accel: true, shift: true, charOrCode: "s", allowGlobal: true}
		                      }
		                  ]
		              },
		              {
		                	id: "undo",
		                    iconClass: 'editActionIcon undoIcon',
		                    action: "davinci/actions/UndoAction",
		                    label: "Undo",
		                    //showLabel: true,
		                    toolbarPath: "undoredo",
		                    keyBinding: {accel: true, charOrCode: "z"}
		                },
		                {
		                    id: "redo",
		                    iconClass: 'editActionIcon redoIcon',
		                    action: "davinci/actions/RedoAction",
		                    //showLabel: true,
		                    label: "Redo",
		                    toolbarPath: "undoredo",
		                    keyBinding: {accel: true, shift: true, charOrCode: "z"}
		                },
						{
						    id: "cut",
						    label: "Cut",
						    iconClass: "editActionIcon editCutIcon",
						    action: "davinci/ve/actions/CutAction",
						    toolbarPath: "cutcopypaste",
						    keyBinding: {accel: true, charOrCode: "x"}
						
						},
						{
						    id: "copy",
						    label: "Copy",
						    iconClass: "editActionIcon editCopyIcon",
						    action: "davinci/ve/actions/CopyAction",
						    toolbarPath: "cutcopypaste",
						    keyBinding: {accel: true, charOrCode: "c"}
						},
		                {
		                    label: "Paste",
		                    iconClass: "editActionIcon editPasteIcon",
		                    action: "davinci/ve/actions/PasteAction",
		                    toolbarPath: "cutcopypaste",
		                    keyBinding: {accel: true, charOrCode: "v"}
		                },
						{
		                    id: "delete",
		                    iconClass: "editActionIcon editDeleteIcon",
		                    label: "Delete",
		                    action: "davinci/ve/actions/DeleteAction",
		                    toolbarPath: "delete",
		                    keyBinding: {charOrCode: [dojo.keys.DELETE, dojo.keys.BACKSPACE]}
		                },
		                {
		                    id: "openBrowser",
		                    iconClass: 'openBrowserIcon',
		                    className: 'davinciFloatRight openBrowser',
		                    run: function() {
		                        require(['../Workbench'], function(workbench) {
		                            var editor = workbench.getOpenEditor();
		                            if (editor) {
		                                editor.previewInBrowser();
		                            } else {
		                                console.error("ERROR. Cannot launch browser window. No editor info.");
		                            }
		                        });
		                    },
		                    label: "Preview in Browser",
		                    toolbarPath: "undoredo",
		                    keyBinding: {accel: true, charOrCode: "0", allowGlobal: true}
		                },
		                {
		                    id: "refreshBrowser",
		                    iconClass: 'refreshIcon',
		                    className: 'davinciFloatRight documentSettings',
		                    run: function() {
		                        require(['../Workbench'], function(workbench) {
		                            var editor = workbench.getOpenEditor();
		                            if (editor && editor) {
		                                editor.refresh();
		                            } else {
		                                console.error("ERROR. Cannot refresh files. No editor info.");
		                            }
		                        });
		                    },
		                    label: "Refresh",
		                    toolbarPath: "refresh",
		                    keyBinding: {accel: true, charOrCode: "R", allowGlobal: true}
		                }

			]
		}
	},
	"davinci.commands": [
		{
			id: "cut",
			run: function() {
				console.log('cut:', this, arguments);
				console.trace();
			}

		},
		{
			id: "add",
			run: function() {
				console.log('add:', this, arguments);
				console.trace();
			}

		},
		{
			id: "delete",
			run: function() {
				console.log('delete:', this, arguments);
				console.trace();
			}

		}
	],
	//  win32:  M1=CTRL,    M2=SHIFT, M3=ALT, M4=-
	//	   carbon: M1=COMMAND, M2=SHIFT, M3=ALT, M4=CTRL 
	"davinci.keyBindings": [
		{ /*???*/
			platform: "win",
			sequence: "M1+C",
			commandID: "davinci.js.copy",
			contextID: "davinci.ve.WidgetEditor"
		}
	],
	"davinci.preferences": [

	],
	"davinci.fileType": [
		{
			extension: "widget",
			iconClass: "jsFileIcon",
			type: "text"
		}
		
	]
};

});
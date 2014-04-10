define([
	"dojo/_base/declare",
    "dojo/ready",
    "dojo/parser",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/Navbar.html",
	"dojo/dom-style",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/mouse",
	"require" ,
    "dojo/domReady!"// context-sensitive require to get URLs to resources from relative paths


], function(declare,parser, ready, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang, on, mouse, require){
         declare("weblab.widget.navbar.Navbar",[_WidgetBase, _TemplatedMixin], {
            // Some default values for our author
			// These typically map to whatever you're handing into the constructor
			name: "No Name",
			// Using require.toUrl, we can get a URL to our default avatar image
			bio: "",

			// Our template - important!
			templateString: template,

			// A class to be applied to the root node in our template
			baseClass: "navbar-fixed-top",

			// A reference to our background animation
			mouseAnim: null,

			// Colors for our background animation
			baseBackgroundColor: "#fff",
			mouseBackgroundColor: "#def",

			// postCreate is called once our widget's DOM is ready,
			// but BEFORE it's been inserted into the page!
			// This is far and away the best point to put in any special work.
			postCreate: function(){
				// Get a DOM node reference for the root of our widget
				var domNode = this.domNode;

				// Run any parent postCreate processes - can be done at any point
				this.inherited(arguments);

			}
		});
    });
sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";var i="view1";e.createPageObjects({onTheAppPage:{actions:{},assertions:{iShouldSeeTheApp:function(){return this.waitFor({id:"app",viewName:i,success:function(){e.assert.ok(true,"The view1 view is displayed")},errorMessage:"Did not find the view1 view"})}}}})});
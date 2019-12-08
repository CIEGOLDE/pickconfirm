sap.ui.define([
	"cie/pickConfirm/controller/BaseController"
], function(Controller) {
	"use strict";
	return Controller.extend("cie.pickConfirm.controller.App", {

		onInit: function() {
			this.getView().addStyleClass(this.getContentDensityClass());
		},

		onBeforeRendering: function() {}
	});

});
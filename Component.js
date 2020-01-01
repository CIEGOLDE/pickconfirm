sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cie/pickConfirm/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("cie.pickConfirm.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(models.initGlobalPropertiesModel(), "globalProperties");

			this.setModel(models.initDeviceModel(), "device");


			this.getRouter().initialize();
		}
	});
});
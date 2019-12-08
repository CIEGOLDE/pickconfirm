sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		initDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		initGlobalPropertiesModel: function () {

			var oGlobalProperties = {
				eTag: "",
				DeliveryDocument: "",
				OutbDeliveryItem: [],
				YY1_Batch_and_Serial: [],
				A_MaterialStock: [],
				YY1_ZSDFIFO002:[],

				Batch1: "",
				Batch2: "",
				MatlWrhsStkQtyInMatlBaseUnit: "",
				MaterialByCustomer: "",
				CustmerBatch: "",

			};

			var oModel = new JSONModel();
			oModel.setDefaultBindingMode("TwoWay");
			oModel.setData(oGlobalProperties);
			return oModel;
		}
	};

});
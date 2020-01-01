sap.ui.define([
	"cie/pickConfirm/controller/BaseController",
	"cie/pickConfirm/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/Filter",
], function (Controller, formatter, MessagePopover, MessagePopoverItem, Filter) {
	"use strict";

	return Controller.extend("cie.pickConfirm.controller.scan", {
		onInit: function () {

			this.oRouter = this.getRouter(this);

			this.oRouter.getRoute("scan").attachPatternMatched(this.onObjectMatched, this);

		},

		onObjectMatched: function (oEvent) {
			jQuery.sap.delayedCall(1000, this, function () {
				this.getView().byId("id_DeliveryDocument").getFocusDomRef().focus();
			});
		},

		onChangeSearch: function () {

			this.setGlobalProperty("/OutbDeliveryItem", []);

			var allFilters = [];
			var allSort = [];
			var LV_DeliveryDocument = this.getGlobalProperty("/DeliveryDocument");
			if (LV_DeliveryDocument.length < 8) {
				return;
			}

			this.globalBusyOn();
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, LV_DeliveryDocument));
			allSort.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem", true));
			allSort.push(new sap.ui.model.Sorter("DeliveryDocumentItem", false));
			var mParameters = {
				filters: allFilters,
				// sorters: allSort,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/OutbDeliveryItem", this.onSort(oData.results));
						// this.setGlobalProperty("/eTag", oData.results[0].__metadata.etag);
						this._length = oData.results.length;
						this.onReadTable();

						// this.oRouter.navTo("list", {
						// 	DeliveryDocument: LV_DeliveryDocument
						// });
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);
		},

		onReadTable: function () {
			this.globalBusyOn();
			var afilters;
			var andFilter = [];
			var andFilters;
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			for (var i = 0; i < this._length; i++) {
				var afilter = [];
				afilter.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + i +
					"/Plant")));
				afilter.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + i +
					"/Material")));
				afilter.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + i +
					"/Batch")));
				afilters = new Filter(afilter, true);
				andFilter.push(afilters);
			}
			andFilters = new sap.ui.model.Filter(andFilter, false);
			var mParameters = {
				filters: [andFilters],
				success: function (oData, response) {
					if (oData.results.length > 0) {
						var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
						for (var j = 0; j < OutbDeliveryItem.length; j++) {
							for (var k = 0; k < oData.results.length; k++) {
								if (OutbDeliveryItem[j].Plant == oData.results[k].Plant && OutbDeliveryItem[j].Material == oData.results[k].Material &&
									OutbDeliveryItem[j].Batch == oData.results[k].Batch) {
									this.setGlobalProperty("/OutbDeliveryItem/" + j +
										"/CustmerBatch", oData.results[k].CustmerBatch);
								}
							}

						}

					}
					this.globalBusyOff();
					var LV_DeliveryDocument = this.getGlobalProperty("/DeliveryDocument");
					this.oRouter.navTo("list", {
						DeliveryDocument: LV_DeliveryDocument
					});
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this)
			};

			var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH";
			oDataModel.read(sUrl, mParameters);

			// if (this._length > -1) {

			// 	var allFilters = [];

			// } else {

			// }
		},

		onSort: function (OutbDeliveryItem) {

			// var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			OutbDeliveryItem.sort(function (a, b) {
				var a_DeliveryDocumentItem = a.DeliveryDocumentItem;
				var a_HigherLvlItmOfBatSpltItm = a.HigherLvlItmOfBatSpltItm;
				var b_DeliveryDocumentItem = b.DeliveryDocumentItem;
				var b_HigherLvlItmOfBatSpltItm = b.HigherLvlItmOfBatSpltItm;
				// debugger
				if (a_HigherLvlItmOfBatSpltItm != "000000" && b_HigherLvlItmOfBatSpltItm != "000000") {
					if (a_HigherLvlItmOfBatSpltItm == b_HigherLvlItmOfBatSpltItm) {
						if (a_DeliveryDocumentItem > b_DeliveryDocumentItem) {
							return 1;
						} else {
							return -1;
						}
					} else {
						if (a_HigherLvlItmOfBatSpltItm > b_HigherLvlItmOfBatSpltItm) {
							return 1;
						} else {
							return -1;
						}
					}

				}
				if (a_HigherLvlItmOfBatSpltItm == "000000" && b_HigherLvlItmOfBatSpltItm == "000000") {
					if (a_DeliveryDocumentItem > b_DeliveryDocumentItem) {
						return 1;
					} else {
						return -1;
					}
				}
				if (a_HigherLvlItmOfBatSpltItm == "000000" && b_HigherLvlItmOfBatSpltItm != "000000") {
					if (a_DeliveryDocumentItem == b_HigherLvlItmOfBatSpltItm) {
						if (a_DeliveryDocumentItem > b_HigherLvlItmOfBatSpltItm) {
							return 1;
						} else {
							return -1;
						}
					} else {
						if (a_DeliveryDocumentItem > b_HigherLvlItmOfBatSpltItm) {
							return 1;
						} else {
							return -1;
						}
					}

				}
				if (a_HigherLvlItmOfBatSpltItm != "000000" && b_HigherLvlItmOfBatSpltItm == "000000") {
					if (a_HigherLvlItmOfBatSpltItm == b_DeliveryDocumentItem) {
						if (a_DeliveryDocumentItem > b_DeliveryDocumentItem) {
							return 1;
						} else {
							return -1;
						}
					} else {
						if (a_HigherLvlItmOfBatSpltItm > b_DeliveryDocumentItem) {
							return 1;
						} else {
							return -1;
						}
					}

				}

			});
			return OutbDeliveryItem;
		},
	});
});
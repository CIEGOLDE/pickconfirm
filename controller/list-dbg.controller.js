sap.ui.define([
	"cie/pickConfirm/controller/BaseController",
	"cie/pickConfirm/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/Filter",
], function (Controller, formatter, MessagePopover, MessagePopoverItem, Filter) {
	"use strict";
	return Controller.extend("cie.pickConfirm.controller.list", {

		formatter: formatter,

		onInit: function () {

			this.oRouter = this.getRouter(this);

			this.oRouter.getRoute("list").attachPatternMatched(this.onObjectMatched, this);

		},

		onObjectMatched: function (oEvent) {

			// this.setGlobalProperty("/OutbDeliveryItemDetail", {});
			this.setGlobalProperty("/Batch1", "");
			this.setGlobalProperty("/Batch2", "");
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			this.setGlobalProperty("/MaterialByCustomer", "");
			this.setGlobalProperty("/CustmerBatch", "");
			// this.setGlobalProperty("/OutbDeliveryItem/" + this._Select + "/Batch", "");

			this._DeliveryDocument = oEvent.getParameter("arguments").DeliveryDocument;
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			if (OutbDeliveryItem.length == 0) {
				this.setGlobalProperty("/OutbDeliveryItem", []);
				this.onChangeSearch();
			} else {
				jQuery.sap.delayedCall(1000, this, function () {
					this.getView().byId("id_Batch").getFocusDomRef().focus();
				});
			}

		},

		onPressCancel: function () {
			this.oRouter.navTo("scan");
		},

		onChangeSearch: function () {
			this.globalBusyOn();
			var allFilters = [];
			var allSort = [];
			if (this._DeliveryDocument.length < 8) {
				return;
			}
			this.globalBusyOn();
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			// allSort.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem", true));
			allSort.push(new sap.ui.model.Sorter("DeliveryDocumentItem", false));
			// allSort.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem", true));
			// allSort.push(new sap.ui.model.Sorter("DeliveryDocumentItem", false));
			var mParameters = {
				filters: allFilters,
				// sorters: allSort,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/OutbDeliveryItem", this.onSort(oData.results));
						this._length = oData.results.length;
						this.onReadTable();
					} else {
						this.showWarning("No Data");
						this.globalBusyOff();
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
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
					var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
					var flag = true;
					OutbDeliveryItem.forEach((item, index, arr) => {
						// if (item.DeliveryDocumentItem == this._DeliveryDocumentItem) {
						if (item.HigherLvlItmOfBatSpltItm == "000000" && item.ActualDeliveryQuantity != "0.000") {
							flag = false;
						}
						// }
					});
					if (flag == true) {
						this.showInformation("Picking Completed!");
					}

					this.setGlobalProperty("/Batch1", "");
					this.setGlobalProperty("/Batch2", "");
					this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
					this.setGlobalProperty("/MaterialByCustomer", "");
					this.setGlobalProperty("/CustmerBatch", "");
					jQuery.sap.delayedCall(1000, this, function () {
						this.getView().byId("id_Batch").getFocusDomRef().focus();
					});
					this.globalBusyOff();

				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this)
			};

			var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH";
			oDataModel.read(sUrl, mParameters);

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

		onPressClick: function (oEvent) {
			var ItemTable = this.getView().byId("id_table");
			var sPath = ItemTable.getSelectedContexts()[0].sPath;
			var x = sPath.split("/")[2];
			// var x = oEvent.getParameters().id.split("-")[4];
			this._Select = parseInt(x);
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			this._DeliveryDocument = OutbDeliveryItem[parseInt(x)].DeliveryDocument;
			this._DeliveryDocumentItem = OutbDeliveryItem[parseInt(x)].DeliveryDocumentItem;

		},

		onPressDelete: function () {

			var ItemTable = this.getView().byId("id_table");
			if (ItemTable.getSelectedContexts().length == 0) {
				this.showWarning("Have Not Selet");
				return;
			}
			var ItemTable = this.getView().byId("id_table");
			var sPath = ItemTable.getSelectedContexts()[0].sPath;
			var x = sPath.split("/")[2]
			this._Select = x;
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			this._DeliveryDocument = OutbDeliveryItem[parseInt(x)].DeliveryDocument;
			this._DeliveryDocumentItem = OutbDeliveryItem[parseInt(x)].DeliveryDocumentItem;

			if (this._Select === undefined) {
				this.showWarning("Have Not Selet");
				return;
			}
			// var x = this._Select;
			var item = this.getGlobalProperty("/OutbDeliveryItem/" + x);
			if (item.HigherLvlItmOfBatSpltItm == "000000") {
				this.showWarning("Can Not Be Deleted");
				return;
			}
			// this._OP = "DELETE";
			this.onSearchItem();
		},

		onSearchItem: function () {
			this.globalBusyOn();
			var allFilters = [];
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			allFilters.push(new Filter('DeliveryDocumentItem', sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this._eTag = oData.results[0].__metadata.etag;
						if (oData.results[0].HigherLvlItmOfBatSpltItm == "000000") {
							this.showWarning("Can Not Be Deleted");
							this.globalBusyOff();
							return;
						}
						this.onDelete();

					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {}.bind(this),
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onSearchItem2: function () {
			this.globalBusyOn();
			// this.globalBusyOn();
			var allFilters = [];
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			allFilters.push(new Filter('DeliveryDocumentItem', sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						// debugger
						this._eTag = oData.results[0].__metadata.etag;
						this.onPatch();
					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onSearchItem3: function () {
			debugger
			this.globalBusyOn();
			var allFilters = [];
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			var lv_DeliveryDocumentItem = "900000";
			for (var i = 0; i < OutbDeliveryItem.length; i++) {
				if (parseInt(OutbDeliveryItem[i].DeliveryDocumentItem) > parseInt(lv_DeliveryDocumentItem)) {
					lv_DeliveryDocumentItem = OutbDeliveryItem[i].DeliveryDocumentItem;
				}
			}
			lv_DeliveryDocumentItem = parseInt(lv_DeliveryDocumentItem) + 1;
			this._lv_DeliveryDocumentItem = lv_DeliveryDocumentItem.toString();

			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			allFilters.push(new Filter('DeliveryDocumentItem', sap.ui.model.FilterOperator.EQ, this._lv_DeliveryDocumentItem));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					debugger
					if (oData.results.length != 0) {
						this._eTag = oData.results[0].__metadata.etag;
						this.onSaveStorageLocation();
					} else {
						// this.onGeterialNumber();
						this.DeleteAllSerialNumbersFromDeliveryItem();
					}
				}.bind(this),
				error: function (oError) {}.bind(this),
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onDelete: function () {
			this.globalBusyOn();
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				success: function (oData, response) {
					this.globalBusyOff();
					this.showInformation("Delete Success");
					this.onChangeSearch();
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);

				}.bind(this),
				eTag: this._eTag
			};
			var sUrl = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" +
				this._DeliveryDocumentItem +
				"')";
			oDataModel.remove(sUrl, mParameters);
		},

		css_Color: function (v1, v2) {

			if (v2 == "000000") {
				if (v1 == "0.000") {
					return "Success";
				} else {
					return "Warning";
				}
			} else {
				return "None";
			}

		},

		//########################################
		// READ PATCH

		onSearchBatch: function () {

			this.globalBusyOn();

			this.setGlobalProperty("/Batch2", "");
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			this.setGlobalProperty("/MaterialByCustomer", "");
			this.setGlobalProperty("/CustmerBatch", "");
			this.setGlobalProperty("/A_MaterialStock", []);
			this.setGlobalProperty("/YY1_Batch_and_Serial", []);
			this.setGlobalProperty("/YY1_ZSDFIFO002", []);

			this._A_ManufactureDate = "";
			this._B_ManufactureDate = "";
			this._MatlWrhsStkQtyInMatlBaseUnit = 0;
			this._StorageLocation = "";

			var allFilters = [];

			// allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch1")));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.globalBusyOff();
						var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
						this._A_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
						for (var i = 0; i < OutbDeliveryItem.length; i++) {
							if (OutbDeliveryItem[i].Material == oData.results[0].Material && OutbDeliveryItem[i].HigherLvlItmOfBatSpltItm == "000000") {
								this._Material = OutbDeliveryItem[i].Material;
								this._Batch = oData.results[0].Batch;
								this._DeliveryDocumentItem = OutbDeliveryItem[i].DeliveryDocumentItem;
								this._Plant = OutbDeliveryItem[i].Plant;
							}
						}
						if (this._Material != "" && this._Batch != "" && this._DeliveryDocumentItem != "") {
							this.YY1_ZSDFIFO001_CDS();
							// this.onPressSearch();
						}
					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
					this.globalBusyOff();
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/Batch";
			oDataModel.read(sUrl, mParameters);
		},

		YY1_ZSDFIFO001_CDS: function () {

			this.globalBusyOn();

			var allFilters = [];
			allFilters.push(new Filter('UserID', sap.ui.model.FilterOperator.EQ, this.getView().getModel("currentUser").getProperty("/name")));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO001_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						if (oData.results[0].RightToRelease == "N") {
							this.YY1_ZSDFIFO002_CDS(oData.results[0].OperationArea);
						}
					} else {
						this.onPressSearch();
					}
					this.globalBusyOff();
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/YY1_ZSDFIFO001";
			oDataModel.read(sUrl, mParameters);

		},

		YY1_ZSDFIFO002_CDS: function (v) {

			this.globalBusyOn();

			var allFilters = [];
			allFilters.push(new Filter('Operationarea', sap.ui.model.FilterOperator.EQ, v));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO002_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/YY1_ZSDFIFO002", oData.results);
					}
					this.globalBusyOff();
					this.onPressSearch();
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/YY1_ZSDFIFO002";
			oDataModel.read(sUrl, mParameters);

		},

		onPressSearch: function () {
			this.globalBusyOn();
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			var allFilters = [];
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this._Plant));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch1")));
			allFilters.push(new Filter('MatlWrhsStkQtyInMatlBaseUnit', sap.ui.model.FilterOperator.GT, 0));
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.globalBusyOff();
						this._MatlWrhsStkQtyInMatlBaseUnit = oData.results[0].MatlWrhsStkQtyInMatlBaseUnit;
						this._StorageLocation = oData.results[0].StorageLocation;
						this.onCkeckDataA();
					} else {
						this.globalBusyOff();
						this.showWarning("No Batch");
					}

				}.bind(this),
				error: function (oError) {

				}.bind(this)
			};
			var sUrl = "/A_MatlStkInAcctMod?$expand=to_MaterialStock";
			oDataModel.read(sUrl, mParameters);
		},

		onCkeckDataA: function () {

			this.globalBusyOn();

			var allFilters = [];
			// var allSort = [];
			// allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this._Batch));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			debugger
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.globalBusyOff();
						this._A_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
						this.onCkeckDataB();
					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
					this.globalBusyOff();
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/Batch";
			oDataModel.read(sUrl, mParameters);
		},

		onCkeckDataB: function () {
			this.globalBusyOn();
			var allFilters = [];
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);

			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this._Plant));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('MatlWrhsStkQtyInMatlBaseUnit', sap.ui.model.FilterOperator.GT, "0"));
			// allFilters.push(new Filter('StorageLocation', sap.ui.model.FilterOperator.NE, "C1A1"));
			var YY1_ZSDFIFO002 = this.getGlobalProperty("/YY1_ZSDFIFO002");
			if (YY1_ZSDFIFO002 && YY1_ZSDFIFO002.length > 0) {
				for (var i = 0; i < YY1_ZSDFIFO002.length; i++) {
					allFilters.push(new Filter('StorageLocation', sap.ui.model.FilterOperator.NE, YY1_ZSDFIFO002[i].StorageLocation));
				}
			}

			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.globalBusyOff();
						this.setGlobalProperty("/A_MaterialStock", oData.results);
						this._length = oData.results.length;
						// this.globalBusyOn();
						this.deleteStoke();
						// this.onCkeckDataB2();
					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "A_MaterialStock('" + this._Material + "')/to_MatlStkInAcctMod";
			oDataModel.read(sUrl, mParameters);

		},

		deleteStoke: function () {
			this.globalBusyOn();
			var allFilters = [];
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			if (this._length > 0) {
				for (var i = this._length - 1; i >= 0; i--) {
					allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/A_MaterialStock/" + i +
						"/Batch")));
				}

				var mParameters = {
					filters: allFilters,
					success: function (oData, response) {
						this.globalBusyOff();
						if (oData.results.length != 0) {
							var A_MaterialStock = this.getGlobalProperty("/A_MaterialStock");
							for (var i = A_MaterialStock.length - 1; i >= 0; i--) {
								for (var j = 0; j < oData.results.length; j++) {
									if (A_MaterialStock[i].Batch == oData.results[j].Batch) {
										A_MaterialStock.splice(i, 1);
									}
								}
							}

							this.onCkeckDataB2();
						} else {
							this.onCkeckDataB2();
						}
					}.bind(this),
					error: function (oError) {
						this.globalBusyOff();
					}.bind(this)
				};
				var sUrl = "/A_OutbDeliveryItem";
				oDataModel.read(sUrl, mParameters);

			}

		},

		onCkeckDataB2: function () {
			var afilters;
			var andFilter = [];
			var andFilters;
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var A_MaterialStock = this.getGlobalProperty("/A_MaterialStock");
			if (A_MaterialStock.length > 0) {
				this.globalBusyOn();
				for (var i = 0; i < A_MaterialStock.length; i++) {
					var afilter = [];
					afilter.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, A_MaterialStock[i].Material));
					afilter.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, A_MaterialStock[i].Batch));
					var afilters = new Filter(afilter, true);
					andFilter.push(afilters);
				}
				var andFilters = new sap.ui.model.Filter(andFilter, false);
				debugger
				var mParameters = {
					filters: [andFilters],
					success: function (oData, response) {
						this.globalBusyOff();
						if (oData.results.length != 0) {
							for (var i = 0; i < oData.results.length; i++) {
								if (this._B_ManufactureDate == "" || this._B_ManufactureDate === undefined) {
									this._B_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
								} else {
									if (this._B_ManufactureDate > this.resolvingDate(oData.results[i].ManufactureDate)) {
										this._B_ManufactureDate = this.resolvingDate(oData.results[i].ManufactureDate);
									}
								}
							}
							if (this._B_ManufactureDate < this._A_ManufactureDate) {
								this.showWarning("Data ERROE!");
							} else {
								this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", this._MatlWrhsStkQtyInMatlBaseUnit);
								var Batch1 = this.getGlobalProperty("/Batch1");
								this.setGlobalProperty("/Batch2", Batch1);
								this.setGlobalProperty("/Batch1", "");

								this.onPressPatch();

							}
						} else {
							this.globalBusyOff();
						}
					}.bind(this),
					error: function (oError) {
						this.globalBusyOff();
					}.bind(this)
				};
				var sUrl = "/Batch";
				oDataModel.read(sUrl, mParameters);

			}
		},
		//########################################
		// SAVE
		onPressPatch: function () {

			var Batch2 = this.getGlobalProperty("/Batch2");
			var MatlWrhsStkQtyInMatlBaseUnit = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (Batch2 == "" || Batch2 === undefined) {
				this.showWarning("Batch No Data");
				return;
			}
			if (MatlWrhsStkQtyInMatlBaseUnit == "" || MatlWrhsStkQtyInMatlBaseUnit === undefined) {
				this.showWarning("Delivery Quantity No Data");
				return;
			}

			// this.onChangeSearchMaterialByCustomer();
			// var MaterialByCustomer1 = this.getGlobalProperty("/MaterialByCustomer");
			// var MaterialByCustomer2 = this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");
			// if (MaterialByCustomer1 != "" && MaterialByCustomer1 != MaterialByCustomer2) {
			// 	this.showWarning("Different From Customer Material");
			// 	return;
			// }
			this.onSearchItem2();
		},

		onPatch: function () {
			var lv_ActualDeliveryQuantity = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (lv_ActualDeliveryQuantity === undefined) {
				lv_ActualDeliveryQuantity = 0;
			}
			lv_ActualDeliveryQuantity = parseFloat(lv_ActualDeliveryQuantity).toFixed(3);
			debugger
			var body = {
				"ActualDeliveryQuantity": lv_ActualDeliveryQuantity,
				"Batch": this.getGlobalProperty("/Batch2"),
				"StorageLocation": this._StorageLocation
			};
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {

				success: function (oData, response) {
					if (response.statusCode == 204) {
						debugger
						this.onSearchItem3();
						// this.onGeterialNumber();
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this),
				eTag: this._eTag,
				merge: true
			};
			var sUrl = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" +
				this._DeliveryDocumentItem +
				"')";
			oDataModel.update(sUrl, body, mParameters);

		},

		onSaveStorageLocation: function () {
			// var lv_ActualDeliveryQuantity = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			// if (lv_ActualDeliveryQuantity === undefined) {
			// 	lv_ActualDeliveryQuantity = 0;
			// }
			// lv_ActualDeliveryQuantity = parseFloat(lv_ActualDeliveryQuantity).toFixed(3);
			debugger
			var body = {
				"StorageLocation": this._StorageLocation
			};
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {

				success: function (oData, response) {
					if (response.statusCode == 204) {
						this.onGeterialNumber();
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this),
				eTag: this._eTag,
				merge: true
			};

			var sUrl = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" +
				this._lv_DeliveryDocumentItem.toString() +
				"')";
			oDataModel.update(sUrl, body, mParameters);
		},

		DeleteAllSerialNumbersFromDeliveryItem: function () {
			debugger
			var allFilters = [];
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			allFilters.push(new Filter('DeliveryDocumentItem', sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						debugger
						this._eTag = oData.results[0].__metadata.etag;
						// this.onAddSerialNumber();

						var mParameters2 = {
							urlParameters: {
								"DeliveryDocument": "'" + oData.results[0].DeliveryDocument + "'",
								"DeliveryDocumentItem": "'" + oData.results[0].DeliveryDocumentItem + "'",
							},
							success: function (oData, response) {
								if (response.statusCode == 200) {
									this.onGeterialNumber();
								}
							}.bind(this),
							error: function (oError) {
								debugger
							}.bind(this),
						};
						oDataModel.setHeaders({
							"If-Match": this._eTag,
							"x-csrf-token": oDataModel.getSecurityToken()
						});

						var sUrl = "/DeleteAllSerialNumbersFromDeliveryItem";
						oDataModel.create(sUrl, {}, mParameters2);

					} else {
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {}.bind(this),
			};
			oDataModel.setHeaders({
				"X-CSRF-TOKEN": "FETCH"
			});
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onAddSerialNumber: function () {

			var YY1_Batch_and_Serial = this.getGlobalProperty("/YY1_Batch_and_Serial");
			// debugger
			if (YY1_Batch_and_Serial.length > 0) {

				var allFilters = [];
				allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
				allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this._Batch));
				var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
				var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
				var mParameters = {
					filters: allFilters,
					success: function (oData, response) {
						if (oData.results.length != 0) {
							// debugger
							this._eTag = oData.results[0].__metadata.etag;
							// this.onAddSerialNumber();

							var mParameters2 = {
								urlParameters: {
									"DeliveryDocument": "'" + oData.results[0].DeliveryDocument + "'",
									"DeliveryDocumentItem": "'" + oData.results[0].DeliveryDocumentItem + "'",
									"SerialNumber": "'" + this.getGlobalProperty("/YY1_Batch_and_Serial")[0].SerialNumber + "'"
								},
								success: function (oData, response) {
									if (response.statusCode == 200) {
										// this.showInformation("Save Success");
										// this.onChangeSearch();
										// var YY1_Batch_and_Serial = this.getGlobalProperty("/YY1_Batch_and_Serial");
										YY1_Batch_and_Serial.splice(0, 1);
										this.setGlobalProperty("/YY1_Batch_and_Serial", YY1_Batch_and_Serial);
										this.onAddSerialNumber();
									}
								}.bind(this),
								error: function (oError) {
									this.globalBusyOff();
									var message = $(oError.response.body).find('message').first().text();
									this.showWarning(message);
								}.bind(this),
							};
							oDataModel.setHeaders({
								"If-Match": this._eTag,
								"x-csrf-token": oDataModel.getSecurityToken()
							});

							var sUrl = "/AddSerialNumberToDeliveryItem";
							oDataModel.create(sUrl, {}, mParameters2);

						} else {
							this.showWarning("No Data");
						}
					}.bind(this),
					error: function (oError) {}.bind(this),
				};
				oDataModel.setHeaders({
					"X-CSRF-TOKEN": "FETCH"
				});
				var sUrl = "/A_OutbDeliveryItem";
				oDataModel.read(sUrl, mParameters);
			}

			if (YY1_Batch_and_Serial.length == 0) {
				// this.showInformation("Save Success");
				// this.onChangeSearch();
				this.onReadTableItem();
			}

		},

		onGeterialNumber: function () {

			var allFilters = [];
			// allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this._Batch));

			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_BATCH_AND_SERIAL_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						// debugger
						this.setGlobalProperty("/YY1_Batch_and_Serial", oData.results);
						this.onAddSerialNumber();
					} else {
						// this.showWarning("No Data");
						this.globalBusyOff();
						this.onReadTableItem();
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/YY1_Batch_and_Serial";
			oDataModel.read(sUrl, mParameters);

		},

		onSaveTable: function () {

			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var body = {
				"Material": this._Material,
				"Plant": this._Plant,
				"Batch": this._Batch,
				"CustmerBatch": this.getGlobalProperty("/CustmerBatch")
			};
			var mParameters = {
				success: function (oData, response) {
					if (response.statusCode == 201) {
						this.globalBusyOff();
						this.onChangeSearch();
						this.showText("Save Success");
						// this.showInformation("Save Success");
					} else {
						this.globalBusyOff();
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this)
			};
			var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH";
			oDataModel.create(sUrl, body, mParameters);
		},

		onReadTableItem: function () {
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var allFilters = [];
			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this._Plant));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this._Batch));
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length == 0) {
						this.onSaveTable();
					} else {
						this.SAP_UUID = oData.results[0].SAP_UUID;
						this.onDeleteTableItem();
					}

				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this)
			};
			var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH";
			oDataModel.read(sUrl, mParameters);
		},

		onDeleteTableItem: function () {

			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				success: function (oData, response) {
					if (response.statusCode == 204) {
						this.onSaveTable();
					} else {

					}

				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
					var message = $(oError.response.body).find('message').first().text();
					this.showWarning(message);
				}.bind(this)
			};
			var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH(guid'" + this.SAP_UUID + "')";
			oDataModel.remove(sUrl, mParameters);
		},

		onChangeSearchMaterialByCustomer: function () {

			var MaterialByCustomer1 = this.getGlobalProperty("/MaterialByCustomer");
			var MaterialByCustomer2 = this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");

			if (MaterialByCustomer1 == "") {
				return;
			}
			if (MaterialByCustomer1 != "" && MaterialByCustomer1 != MaterialByCustomer2) {
				this.showWarning("Different From Customer Material!");
				return;
			} else {
				this.showInformation("Material by customer is correct!");
			}
		},

		edit: function (v) {

			if (v != "") {
				return true;
			} else {
				return false;
			}
		}

	});
});
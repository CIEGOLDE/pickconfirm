sap.ui.define([
	"cie/pickConfirm/controller/BaseController",
	"cie/pickConfirm/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, formatter, MessagePopover, MessagePopoverItem, Filter,FilterOperator) {
	"use strict";
	var interval=0;
	return Controller.extend("cie.pickConfirm.controller.list", {

		formatter: formatter,

		onInit: function () {

			this.oRouter = this.getRouter(this);
			this.globalBusyOn();
			this.oRouter.getRoute("list").attachPatternMatched(this.onObjectMatched, this);
			var that = this;
			interval = setInterval(function(){//获取登录用户权限
				var userId=that.getView().getModel("currentUser").getProperty("/name");
				if(userId){
					that.YY1_ZSDFIFO001_CDS();//权限校验
					clearInterval(interval);
					interval = 0;
				}
			},1000);
			

		},
onAfterRendering: function() {
	// this.getView().byId("id_Batch").getFocusDomRef().focus();
},
		onSelect: function (oEvent) {
			

			var x = parseInt(oEvent.getParameters().id.split("-")[4]);
			var select = oEvent.getParameters().selected;

			if (select == true) {
				var ItemTable = this.getView().byId("id_table");
				var items = ItemTable.getItems();
				var flag = false;
				for (var i = 0; i < items.length; i++) {
					if (i != x) {
						// console.log(ItemTable.getItems()[i].getCells()[0].mProperties)
						ItemTable.getItems()[i].getCells()[0].setSelected(false);
						// if (ItemTable.getItems()[i].getCells()[0].mProperties.selected && ItemTable.getItems()[i].getCells()[0].mProperties.selected == true) {
						// 	ItemTable.getItems()[i].getCells()[0].mProperties.selected = false;
						// 	
						// 	flag = true;
						// 	var x = i;
						// }
					}
				}

				this._Select = parseInt(x);
				var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
				this._DeliveryDocument = OutbDeliveryItem[parseInt(x)].DeliveryDocument;
				this._DeliveryDocumentItem = OutbDeliveryItem[parseInt(x)].DeliveryDocumentItem;
				this._HigherLvlItmOfBatSpltItm = OutbDeliveryItem[parseInt(x)].HigherLvlItmOfBatSpltItm;
				

			}

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

			// this.globalBusyOn();
			var allFilters = [];
			var allSort = [];
			if (this._DeliveryDocument.length < 8) {
				return;
			}
			// this.globalBusyOn();
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
						this.showWarning(this.getI18nText("NoData"));
						this.globalBusyOff();
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);
		},

		onReadTable: function () {

			// this.globalBusyOn();
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

					var Pickvalue1 = "0.000";
					var Pickvalue2 = "0.000";

					OutbDeliveryItem.forEach((item, index, arr) => {

						Pickvalue1 = parseFloat(Pickvalue1) + parseFloat(item.ActualDeliveryQuantity);

						if (item.HigherLvlItmOfBatSpltItm == "000000") {
							if (item.ActualDeliveryQuantity == "0.000") {

							} else {
								if (item.Batch == "") {
									flag = false;
								}else{
									Pickvalue2 = parseFloat(Pickvalue2) + parseFloat(item.ActualDeliveryQuantity);
								}
							}
						}else{
							Pickvalue2 = parseFloat(Pickvalue2) + parseFloat(item.ActualDeliveryQuantity);
						}
						
					});
					this.setGlobalProperty("/Pickvalue1",Pickvalue1);
					this.setGlobalProperty("/Pickvalue2",Pickvalue2);
					
					if (flag == true) {
						this.showInformation(this.getI18nText("PickingCompleted"));
					}

					// this.setGlobalProperty("/Batch1", "");
					// this.setGlobalProperty("/Batch2", "");
					// this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
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
				// 
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

			// var ItemTable = this.getView().byId("id_table");
			// if (ItemTable.getSelectedContexts().length == 0) {
			// 	this.showWarning(this.getI18nText("HaveNotSelet"));
			// 	return;
			// }
			// var ItemTable = this.getView().byId("id_table");
			// var sPath = ItemTable.getSelectedContexts()[0].sPath;
			// var x = sPath.split("/")[2]

			var ItemTable = this.getView().byId("id_table");
			var items = ItemTable.getItems();
			var flag = false;
			for (var i = 0; i < items.length; i++) {
				// console.log(ItemTable.getItems()[i].getCells()[0].mProperties)
				if (ItemTable.getItems()[i].getCells()[0].mProperties.selected == true) {
					flag = true;
					var x = i;
				}
			}
			if (flag == false) {
				this.showWarning(this.getI18nText("HaveNotSelet"));
				return;
			}

			this._Select = x;
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			this._DeliveryDocument = OutbDeliveryItem[parseInt(x)].DeliveryDocument;
			this._DeliveryDocumentItem = OutbDeliveryItem[parseInt(x)].DeliveryDocumentItem;

			if (this._Select === undefined) {
				this.showWarning(this.getI18nText("HaveNotSelet"));
				return;
			}
			// var x = this._Select;
			var item = this.getGlobalProperty("/OutbDeliveryItem/" + x);
			if (item.HigherLvlItmOfBatSpltItm == "000000") {
				// this.showWarning(this.getI18nText("CanNotBeDeleted"));
				
				this._OP = "DELETE";
				this.DeleteAllSerialNumbersFromDeliveryItem2()
				return;
			}
			this._OP = "";
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
							this.showWarning(this.getI18nText("CanNotBeDeleted"));
							this.globalBusyOff();
							return;
						}
						this.onDelete();

					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {}.bind(this),
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onSearchItem2: function () {
			// this.globalBusyOn();
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
						// 
						this._eTag = oData.results[0].__metadata.etag;
						this.onPatch();
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onSearchItem3: function () {
			
			// this.globalBusyOn();
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
			// this.globalBusyOn();
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				success: function (oData, response) {
					this.globalBusyOff();
					this.showInformation(this.getI18nText("DeleteSuccess"));
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

		css_Color: function (v1, v2, v3) {

			if (v2 == "000000") {
				if (v3 != "") {
					return "Success";
				}
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

			var ItemTable = this.getView().byId("id_table");
			var items = ItemTable.getItems();
			var flag = false;
			for (var i = 0; i < items.length; i++) {
				ItemTable.getItems()[i].getCells()[0].setSelected(false);
			}
			this._OP = "";
			var Batch1 = this.getGlobalProperty("/Batch1");
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			if(OutbDeliveryItem.length > 0){
				for(var i = 0; i < OutbDeliveryItem.length; i++){
					if(OutbDeliveryItem[i].Batch === Batch1){
						this.showWarning(this.getI18nText("BatchRepeated"));
						 this.setGlobalProperty("/Batch1","");
						return;
					}
				}
			}

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
						var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
						this._A_ManufactureDate = oData.results[0].ManufactureDate;//this.resolvingDate(oData.results[0].ManufactureDate);
						for (var i = 0; i < OutbDeliveryItem.length; i++) {
							if (OutbDeliveryItem[i].Material == oData.results[0].Material && OutbDeliveryItem[i].HigherLvlItmOfBatSpltItm == "000000") {
								this._Material = OutbDeliveryItem[i].Material;
								this._Batch = oData.results[0].Batch;
								this._DeliveryDocumentItem = OutbDeliveryItem[i].DeliveryDocumentItem;
								this._Plant = OutbDeliveryItem[i].Plant;
								break;
							}
						}
						if (this._Material != "" && this._Batch != "" && this._DeliveryDocumentItem != "") {
							// if(this.RightCheck.RightToRelease === "N"){
								this.onPressSearch();
								
							// }else{
								
							// }
								// this.onPressSearch();
							// this.YY1_ZSDFIFO001_CDS();
							
						}
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/Batch";
			oDataModel.read(sUrl, mParameters);
		},

		YY1_ZSDFIFO001_CDS: function () {
			var allFilters = [];
			allFilters.push(new Filter('UserID', sap.ui.model.FilterOperator.EQ, this.getView().getModel("currentUser").getProperty("/name")));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO001_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						if (oData.results[0].RightToRelease == "N") {
							var operationArea = oData.results[0].OperationArea;
							this.RightCheck={
								RightToRelease:"N",
								OperationArea:operationArea
							}
							// this.RightToRelease = "N";              
							// this.YY1_ZSDFIFO002_CDS(oData.results[0].OperationArea);
							this.YY1_ZSDFIFO002_CDS(operationArea);
						}else{
								// this.RightToRelease = "Y";   
								this.RightCheck={
								RightToRelease:"Y",
								OperationArea:""
							}
						}
					} else {
							// this.RightToRelease = "Y";   
							this.RightCheck={
								RightToRelease:"Y",
								OperationArea:""
							}
						// this.onPressSearch();/
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

			// this.globalBusyOn();

			var allFilters = [];
			allFilters.push(new Filter('Operationarea', sap.ui.model.FilterOperator.EQ, v));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO002_CDS";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.YY1_ZSDFIFO002 = oData.results;
						// this.setGlobalProperty("/YY1_ZSDFIFO002", oData.results);
					}
						this.getView().byId("id_Batch").getFocusDomRef().focus();
					// this.onPressSearch();
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/YY1_ZSDFIFO002";
			oDataModel.read(sUrl, mParameters);

		},

		onPressSearch: function () {
			// this.globalBusyOn();
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
						this._MatlWrhsStkQtyInMatlBaseUnit = oData.results[0].MatlWrhsStkQtyInMatlBaseUnit;
						this._StorageLocation = oData.results[0].StorageLocation;
						if(this.RightCheck.RightToRelease ==="N"){
								var operationAreaStorageLocations=this.YY1_ZSDFIFO002;
								var length = operationAreaStorageLocations.length;
								var loopTime = Math.ceil(length/50);
								this.loopTime = loopTime;
								this.recordTime=[];
								this.EarliestManufactureDates = [];
									for(var i = 0; i < loopTime; i++){
										var flag = "";
										if(i === loopTime -1 ){
											flag = "X";
										}
										var allFilters = [];
										for(var j = i*50; j < (i+1)*50; j++){
											if(j < length){
												allFilters.push(new Filter({//排除已全部确认的工单状态
														path:"StorageLocation",
														operator: FilterOperator.EQ,
														value1: operationAreaStorageLocations[j].StorageLocation
												}));
												// sourceArr.push(dataSet[j]);
											}
										}
										this.getEarliestManufactureDate(this._Material,this._Plant,allFilters,i);
								
							}
						}else if(this.RightCheck.RightToRelease ==="Y"){
								this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", this._MatlWrhsStkQtyInMatlBaseUnit);
							var Batch1 = this.getGlobalProperty("/Batch1");
							this.setGlobalProperty("/Batch2", Batch1);
							this.setGlobalProperty("/Batch1", "");
		
							this.onPressPatch();
						}
								
								// this.YY1_ZSDFIFO002_CDS(this.RightCheck.OperationArea);
								// // this.getEarliestManufactureDate(this._Material,this._Plant,)
							
						// this.onCkeckDataA();
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoBatch"));
					}

				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/A_MatlStkInAcctMod?$expand=to_MaterialStock";
			oDataModel.read(sUrl, mParameters);
		},

		onCkeckDataA: function () {

			// this.globalBusyOn();

			var allFilters = [];
			// var allSort = [];
			// allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this._Material));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this._Batch));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this._A_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
						this.onCkeckDataB();
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "/Batch";
			oDataModel.read(sUrl, mParameters);
		},

		onCkeckDataB: function () {
			// this.globalBusyOn();
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
					allFilters.push(new Filter('StorageLocation', sap.ui.model.FilterOperator.EQ, YY1_ZSDFIFO002[i].StorageLocation));
				}
			}

			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/A_MaterialStock", oData.results);
						this._length = oData.results.length;
						this.deleteStoke();
						// this.onCkeckDataB2();
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (oError) {
					this.globalBusyOff();
				}.bind(this)
			};
			var sUrl = "A_MaterialStock('" + this._Material + "')/to_MatlStkInAcctMod";
			oDataModel.read(sUrl, mParameters);

		},

		deleteStoke: function () {
			// this.globalBusyOn();
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
						if (oData.results.length != 0) {
							var A_MaterialStock = this.getGlobalProperty("/A_MaterialStock");
							for (var i = A_MaterialStock.length - 1; i >= 0; i--) {
								for (var j = 0; j < oData.results.length; j++) {
									if (A_MaterialStock[i].Batch == oData.results[j].Batch) {
										A_MaterialStock.splice(i, 1);
										break;
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
				// this.globalBusyOn();
				for (var i = 0; i < A_MaterialStock.length; i++) {
					var afilter = [];
					afilter.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, A_MaterialStock[i].Material));
					afilter.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, A_MaterialStock[i].Batch));
					var afilters = new Filter(afilter, true);
					andFilter.push(afilters);
				}
				var andFilters = new sap.ui.model.Filter(andFilter, false);
				
				var mParameters = {
					filters: [andFilters],
					success: function (oData, response) {
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
								this.showWarning(this.getI18nText("DataError"));
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
				this.showWarning(this.getI18nText("BatchNoData"));
				return;
			}
			if (MatlWrhsStkQtyInMatlBaseUnit == "" || MatlWrhsStkQtyInMatlBaseUnit === undefined) {
				this.showWarning(this.getI18nText("DeliveryQuantityNoData"));
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

			// this.globalBusyOn();

			var lv_ActualDeliveryQuantity = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (lv_ActualDeliveryQuantity === undefined) {
				lv_ActualDeliveryQuantity = 0;
			}
			lv_ActualDeliveryQuantity = parseFloat(lv_ActualDeliveryQuantity).toFixed(3);
			
			if (this._OP == "DELETE") {
				var body = {
					"Batch": "",
				};
			} else {
				var body = {
					"ActualDeliveryQuantity": lv_ActualDeliveryQuantity,
					"Batch": this.getGlobalProperty("/Batch2"),
					"StorageLocation": this._StorageLocation
				};
			}
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {

				success: function (oData, response) {
					if (response.statusCode == 204) {
						
						if (this._HigherLvlItmOfBatSpltItm == "000000") {
							this.onChangeSearch();
						} else {
							this.onSearchItem3();
						}
						// this.globalBusyOff();
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
								
							}.bind(this),
						};
						oDataModel.setHeaders({
							"If-Match": this._eTag,
							"x-csrf-token": oDataModel.getSecurityToken()
						});

						var sUrl = "/DeleteAllSerialNumbersFromDeliveryItem";
						oDataModel.create(sUrl, {}, mParameters2);

					} else {
						this.showWarning(this.getI18nText("NoData"));
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

		DeleteAllSerialNumbersFromDeliveryItem2: function () {
			
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
						// this.onAddSerialNumber();

						var mParameters2 = {
							urlParameters: {
								"DeliveryDocument": "'" + oData.results[0].DeliveryDocument + "'",
								"DeliveryDocumentItem": "'" + oData.results[0].DeliveryDocumentItem + "'",
							},
							success: function (oData, response) {
								
								if (response.statusCode == 200) {
									this.onSearchItem2();
								}
							}.bind(this),
							error: function (oError) {
								
							}.bind(this),
						};
						oDataModel.setHeaders({
							"If-Match": this._eTag,
							"x-csrf-token": oDataModel.getSecurityToken()
						});

						var sUrl = "/DeleteAllSerialNumbersFromDeliveryItem";
						oDataModel.create(sUrl, {}, mParameters2);

					} else {
						this.showWarning(this.getI18nText("NoData"));
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
			// 
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
							// 
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
				this.globalBusyOff();
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
						// 
						this.setGlobalProperty("/YY1_Batch_and_Serial", oData.results);
						this.onAddSerialNumber();
						this.globalBusyOn();
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
						this.showText(this.getI18nText("SaveSuccess"))

						// this.showInformation("Save Success");
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
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
		},

		// 去后导零
		deleteRightZero: function (v) // 去后导零
			{
				if (v === null || v === undefined || v === 0 || v === "0") {
					v = 0;
				}
				return parseFloat(v);
			},

		// 去前导零
		deleteLeftZero: function (v) // 去前导零
			{
				if (v === null || v === undefined || v === 0 || v === "0") {
					v = "0";
				}
				return v.replace(/^0+/, "");
			},
		/**
		 *找到4中全部批次的生产日期并按照升序（从早到晚）排列，找到最早的日期
		 * allFilters默认传入的是库存地点的filter
		 */
		getEarliestManufactureDate:function(material,plant,allFilters,no){
			
		 	var that = this;
			var sUrl = "/YY1_BATCH_DATE1?$orderby=ManufactureDate";
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_BATCH_DATE1_CDS";
			var ODataModel = new sap.ui.model.odata.ODataModel(oDataUrl);				
			// var allFilters = [];
			
			allFilters.push(new Filter({
				path:"Material",
				operator: FilterOperator.EQ,
				value1: material
			}));			

			allFilters.push(new Filter({//
					path:"Plant",
					operator: FilterOperator.EQ,
					value1: plant
			}));
			allFilters.push(new Filter({//
					path:"OutboundDelivery",
					operator: FilterOperator.EQ,
					value1: null
			}));
			allFilters.push(new Filter('MatlWrhsStkQtyInMatlBaseUni', sap.ui.model.FilterOperator.GT, 0));
			var mParameters = {
				filters: allFilters,
				success: function (oData) {
					this.recordTime.push(no);
					that = this;
					var Arry = oData.results;
					if(this.EarliestManufactureDates === undefined){
						this.EarliestManufactureDates = Arry;
					}else{
						for(var i = 0; i < Arry.length; i++){
							this.EarliestManufactureDates.push(Arry[i]);
						}
					}
					if(no === this.loopTime - 1){
							interval = setInterval(function(){
								var recordTime = that.recordTime;
								for(var r = 0; r < that.loopTime; r++){
									if(recordTime.indexOf(r) === -1){
										break;
									}else{
										if(r === that.loopTime - 1){
											that.saveScandedBarcode();
											clearInterval(interval);
												// that.globalBusyOff();
											interval = 0;
										}
									}
								}
							},500);
						}
				}.bind(this),
				error: function (oError) {
						this.globalBusyOff();
					messages.responseSplitMessage(oError);
				}
			};
			ODataModel.read(sUrl, mParameters);		
		 
		},
		/**
		 * 最小全部批次的生产日期并按照升序（从早到晚）排列，找到最早的日期(A)，并在batchinformation中找
		 * 到扫描批次的生产日期（B）作比较，若B<A，报错：存在生产日期更早的批次，无权拣配；否则，执行写入操作
		 */
		 saveScandedBarcode:function(){
		 	if(this.EarliestManufactureDates.length > 0){
		 		var EarliestManufactureDates = this.EarliestManufactureDates;
		 		var item = null;
		 		for(var i = 0; i < EarliestManufactureDates.length; i++){
		 			if(item !== null){
		 				if(item.ManufactureDate > EarliestManufactureDates[i].ManufactureDate){
		 					item = EarliestManufactureDates[i];
		 				}
		 			}else{
		 				item = EarliestManufactureDates[i];
		 			}
		 		}
			 		if(item.ManufactureDate < this._A_ManufactureDate ){
			 			this.showWarning(this.getI18nText("DataError"));
			 			this.globalBusyOff();
			 			this.setGlobalProperty("/Batch1", "");
			 		}else{
			 			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", this._MatlWrhsStkQtyInMatlBaseUnit);
						var Batch1 = this.getGlobalProperty("/Batch1");
						this.setGlobalProperty("/Batch2", Batch1);
						this.setGlobalProperty("/Batch1", "");
	
						this.onPressPatch();
	
			 			// this.onSaveTable();
			 		}
		 	}
		 }
		
	});
});
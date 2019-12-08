sap.ui.define([
	"cie/pickConfirm/controller/BaseController",
	"cie/pickConfirm/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/Filter",
	'sap/ui/model/Context'
], function (Controller, formatter, MessagePopover, MessagePopoverItem, Filter, Context) {
	"use strict";
	return Controller.extend("cie.pickConfirm.controller.detail", {

		formatter: formatter,

		onInit: function () {

			this.oRouter = this.getRouter(this);

			this.oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);
		},

		onObjectMatched: function (oEvent) {
			this._DeliveryDocument = oEvent.getParameter("arguments").DeliveryDocument;
			this._DeliveryDocumentItem = oEvent.getParameter("arguments").DeliveryDocumentItem;
			this.setGlobalProperty("/OutbDeliveryItemDetail", {});
			this.setGlobalProperty("/Batch", "");
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			this.setGlobalProperty("/MaterialByCustomer", "");
			this.setGlobalProperty("/CustmerBatch", "");

			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			if (OutbDeliveryItem.length == 0) {
				this.onChangeSearch();
			} else {
				this.setDetail();
			}

			jQuery.sap.delayedCall(1000, this, function () {
				this.getView().byId("id_Batch").getFocusDomRef().focus();
			});

		},

		onPressCancel: function () {
			this.setGlobalProperty("/OutbDeliveryItemDetail", {});
			this.setGlobalProperty("/Batch", "");
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			this.setGlobalProperty("/MaterialByCustomer", "");
			this.setGlobalProperty("/CustmerBatch", "");
			this.oRouter.navTo("list", {
				DeliveryDocument: this._DeliveryDocument
			});
		},

		onChangeSearch: function () {
			var allFilters = [];
			var allSort = [];
			if (this._DeliveryDocument.length < 8) {
				return;
			}
			this.globalBusyOn();
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			allSort.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem", true));
			allSort.push(new sap.ui.model.Sorter("DeliveryDocumentItem", false));
			var mParameters = {
				filters: allFilters,
				// sorters: allSort,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/OutbDeliveryItem", this.onSort(oData.results));
						// this.setGlobalProperty("/eTag", oData.results[0].__metadata.etag);
						this._length = oData.results.length - 1;
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
			if (this._length > -1) {
				var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
				var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
				var allFilters = [];
				allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + this._length +
					"/Plant")));
				allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + this._length +
					"/Material")));
				allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + this._length +
					"/Batch")));
				var mParameters = {
					filters: allFilters,
					success: function (oData, response) {
						if (oData.results.length > 0) {
							this.setGlobalProperty("/OutbDeliveryItem/" + this._length +
								"/CustmerBatch", oData.results[0].CustmerBatch);
						}
						this._length = this._length - 1;
						this.onReadTable();
					}.bind(this),
					error: function (oError) {
						var message = $(oError.response.body).find('message').first().text();
						this.showWarning(message);
					}.bind(this)
				};
				var sUrl = "/YY1_MANAGE_CUSTOMER_BATCH";
				oDataModel.read(sUrl, mParameters);
			} else {
				this.setDetail();
				var OutbDeliveryItemDetail = this.getGlobalProperty("/OutbDeliveryItemDetail");
				if (OutbDeliveryItemDetail.ActualDeliveryQuantity == "0.000") {
					this.showInformation("Picking Completed!");
					this.oRouter.navTo("list", {
						DeliveryDocument: this._DeliveryDocument
					});
				} else {
					// this.showInformation("Save Success");
				}
				// this.setGlobalProperty("/OutbDeliveryItemDetail", {});

				this.setGlobalProperty("/MaterialByCustomer", "");
				this.setGlobalProperty("/CustmerBatch", "");
				this.setGlobalProperty("/Batch", "");
				this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
				this.globalBusyOff();
			}
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

		setDetail: function () {
			var OutbDeliveryItem = this.getGlobalProperty("/OutbDeliveryItem");
			for (var i = 0; i < OutbDeliveryItem.length; i++) {
				var item = OutbDeliveryItem[i];
				if ((item.DeliveryDocument == this._DeliveryDocument) && (item.DeliveryDocumentItem == this._DeliveryDocumentItem)) {
					this.setGlobalProperty("/OutbDeliveryItemDetail", item);
					return;
				}
			}
		},

		onCkeckDataA: function () {

			this.globalBusyOn();

			var allFilters = [];
			// var allSort = [];
			// allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch")));
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this._A_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
						this.onCkeckDataB();
					} else {
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

			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('MatlWrhsStkQtyInMatlBaseUnit', sap.ui.model.FilterOperator.GT, "0"));
			allFilters.push(new Filter('StorageLocation', sap.ui.model.FilterOperator.NE, "C1A1"));
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					if (oData.results.length != 0) {
						this.setGlobalProperty("/A_MaterialStock", oData.results);
						this._length = oData.results.length - 1;
						this.deleteStoke();
						// this.onCkeckDataB2();
					} else {
						this.showWarning("No Data");
					}
					this.globalBusyOff();
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "A_MaterialStock('" + this.getGlobalProperty("/OutbDeliveryItemDetail/Material") + "')/to_MatlStkInAcctMod";
			oDataModel.read(sUrl, mParameters);

		},

		deleteStoke: function () {
			this.globalBusyOn();
			if (this._length > -1) {

				var allFilters = [];
				var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
				var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
				allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/A_MaterialStock/" + this._length +
					"/Batch")));
				var mParameters = {
					filters: allFilters,
					// sorters: allSort,
					success: function (oData, response) {
						if (oData.results.length != 0) {
							this.setGlobalProperty("/A_MaterialStock/" + this._length + "/delete", "X");
							this._length = this._length - 1;
							this.deleteStoke();
						} else {
							this.setGlobalProperty("/A_MaterialStock/" + this._length + "/delete", "");
							this._length = this._length - 1;
							this.deleteStoke();
						}
					}.bind(this),
					error: function (oError) {
						this.globalBusyOff();
					}.bind(this)
				};
				var sUrl = "/A_OutbDeliveryItem";
				oDataModel.read(sUrl, mParameters);
			} else {
				var A_MaterialStock = this.getGlobalProperty("/A_MaterialStock");
				for (var i = A_MaterialStock.length - 1; i >= 0; i--) {
					if (A_MaterialStock[i].delete == "X") {
						A_MaterialStock.splice(i, 1);
					}
				}
				this.getGlobalProperty("/A_MaterialStock", A_MaterialStock);
				// for (var i = 0; i < A_MaterialStock.length; i++) {
				// 	console.log(A_MaterialStock[i].Batch)
				// }
				this.globalBusyOff();
				this._length = A_MaterialStock.length - 1;
				this.onCkeckDataB2();

			}
		},

		onCkeckDataB2: function () {
			this.globalBusyOn();
			if (this._length > -1) {
				var allFilters = [];
				allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/A_MaterialStock/" + this._length +
					"/Material")));
				allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/A_MaterialStock/" + this._length +
					"/Batch")));
				var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
				var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
				var mParameters = {
					filters: allFilters,
					success: function (oData, response) {
						if (oData.results.length != 0) {
							if (this._B_ManufactureDate == "" || this._B_ManufactureDate === undefined) {
								this._B_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
							} else {
								if (this._B_ManufactureDate > this.resolvingDate(oData.results[0].ManufactureDate)) {
									this._B_ManufactureDate = this.resolvingDate(oData.results[0].ManufactureDate);
								}
							}
							this._length = this._length - 1;
							this.onCkeckDataB2();

						} else {
							this.showWarning("No Data");
						}
					}.bind(this),
					error: function (oError) {}.bind(this)
				};
				var sUrl = "/Batch";
				oDataModel.read(sUrl, mParameters);
			} else {
				if (this._B_ManufactureDate < this._A_ManufactureDate) {
					this.showWarning("Data ERROE!");
				} else {
					this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", this._MatlWrhsStkQtyInMatlBaseUnit);
				}
				this.globalBusyOff();
			}

		},

		onPressSearch: function () {
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			var allFilters = [];
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch")));
			allFilters.push(new Filter('MatlWrhsStkQtyInMatlBaseUnit', sap.ui.model.FilterOperator.GT, 0));
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					debugger
					if (oData.results.length != 0) {
						this._MatlWrhsStkQtyInMatlBaseUnit = oData.results[0].MatlWrhsStkQtyInMatlBaseUnit;
						this.onCkeckDataA();
					} else {
						this.showWarning("No Batch");
					}

				}.bind(this),
				error: function (oError) {

				}.bind(this)
			};
			var sUrl = "/A_MatlStkInAcctMod?$expand=to_MaterialStock";
			oDataModel.read(sUrl, mParameters);
		},

		onPressPatch: function () {

			var Batch = this.getGlobalProperty("/Batch");
			var MatlWrhsStkQtyInMatlBaseUnit = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (Batch == "" || Batch === undefined) {
				this.showWarning("Batch No Data");
				return;
			}
			if (MatlWrhsStkQtyInMatlBaseUnit == "" || MatlWrhsStkQtyInMatlBaseUnit === undefined) {
				this.showWarning("Delivery Quantity No Data");
				return;
			}

			// this.onChangeSearchMaterialByCustomer();
			var MaterialByCustomer1 = this.getGlobalProperty("/MaterialByCustomer");
			var MaterialByCustomer2 = this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");
			if (MaterialByCustomer1 != "" && MaterialByCustomer1 != MaterialByCustomer2) {
				this.showWarning("Different From Customer Material");
				return;
			}
			this.onSearchItem();
		},

		onSearchItem: function () {
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
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			};
			var sUrl = "/A_OutbDeliveryItem";
			oDataModel.read(sUrl, mParameters);

		},

		onPatch: function () {
			var lv_ActualDeliveryQuantity = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (lv_ActualDeliveryQuantity === undefined) {
				lv_ActualDeliveryQuantity = 0;
			}
			lv_ActualDeliveryQuantity = parseFloat(lv_ActualDeliveryQuantity).toFixed(3);
			var body = {
				"ActualDeliveryQuantity": lv_ActualDeliveryQuantity,
				"Batch": this.getGlobalProperty("/Batch")
			};
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var oDataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {

				success: function (oData, response) {
					if (response.statusCode == 204) {
						// this.showInformation("Save Success");
						// this.onChangeSearch();
						this.onGeterialNumber();
					}
				}.bind(this),
				error: function (oError) {
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

		onAddSerialNumber: function () {

			var YY1_Batch_and_Serial = this.getGlobalProperty("/YY1_Batch_and_Serial");
			// debugger
			if (YY1_Batch_and_Serial.length > 0) {

				var allFilters = [];
				allFilters.push(new Filter('DeliveryDocument', sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
				allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch")));
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
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch")));

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
				"Material": this.getGlobalProperty("/OutbDeliveryItemDetail/Material"),
				"Plant": this.getGlobalProperty("/OutbDeliveryItemDetail/Plant"),
				"Batch": this.getGlobalProperty("/Batch"),
				"CustmerBatch": this.getGlobalProperty("/CustmerBatch")
			};
			var mParameters = {
				success: function (oData, response) {
					if (response.statusCode == 201) {
						this.onChangeSearch();
						this.showInformation("Save Success");
						// this.showInformation("Save Success");
					} else {
						this.showWarning("No Data");
					}
				}.bind(this),
				error: function (oError) {
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
			allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));
			allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));
			allFilters.push(new Filter('Batch', sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch")));
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
sap.ui.define(["cie/pickConfirm/controller/BaseController", "cie/pickConfirm/model/formatter", "sap/m/MessagePopover",
	"sap/m/MessagePopoverItem", "sap/ui/model/Filter"
], function (t, e, a, r, s) {
	"use strict";
	return t.extend("cie.pickConfirm.controller.list", {
		formatter: e,
		onInit: function () {
			this.oRouter = this.getRouter(this);
			this.oRouter.getRoute("list").attachPatternMatched(this.onObjectMatched, this)
		},
		onObjectMatched: function (t) {
			this.setGlobalProperty("/Batch1", "");
			this.setGlobalProperty("/Batch2", "");
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			this.setGlobalProperty("/MaterialByCustomer", "");
			this.setGlobalProperty("/CustmerBatch", "");
			this._DeliveryDocument = t.getParameter("arguments").DeliveryDocument;
			var e = this.getGlobalProperty("/OutbDeliveryItem");
			if (e.length == 0) {
				this.setGlobalProperty("/OutbDeliveryItem", []);
				this.onChangeSearch()
			} else {
				jQuery.sap.delayedCall(1e3, this, function () {
					this.getView().byId("id_Batch").getFocusDomRef().focus()
				})
			}
		},
		onPressCancel: function () {
			this.oRouter.navTo("scan")
		},
		onChangeSearch: function () {
			this.globalBusyOn();
			var t = [];
			var e = [];
			if (this._DeliveryDocument.length < 8) {
				return
			}
			this.globalBusyOn();
			var a = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var r = new sap.ui.model.odata.ODataModel(a);
			t.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			e.push(new sap.ui.model.Sorter("DeliveryDocumentItem", false));
			var i = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.setGlobalProperty("/OutbDeliveryItem", this.onSort(t.results));
						this._length = t.results.length;
						this.onReadTable()
					} else {
						this.showWarning(this.getI18nText("NoData"));
						this.globalBusyOff()
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var l = "/A_OutbDeliveryItem";
			r.read(l, i)
		},
		onReadTable: function () {
			this.globalBusyOn();
			var t;
			var e = [];
			var a;
			var r = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var i = new sap.ui.model.odata.ODataModel(r);
			for (var l = 0; l < this._length; l++) {
				var o = [];
				o.push(new s("Plant", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + l + "/Plant")));
				o.push(new s("Material", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + l + "/Material")));
				o.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/OutbDeliveryItem/" + l + "/Batch")));
				t = new s(o, true);
				e.push(t)
			}
			a = new sap.ui.model.Filter(e, false);
			var n = {
				filters: [a],
				success: function (t, e) {
					if (t.results.length > 0) {
						var a = this.getGlobalProperty("/OutbDeliveryItem");
						for (var r = 0; r < a.length; r++) {
							for (var s = 0; s < t.results.length; s++) {
								if (a[r].Plant == t.results[s].Plant && a[r].Material == t.results[s].Material && a[r].Batch == t.results[s].Batch) {
									this.setGlobalProperty("/OutbDeliveryItem/" + r + "/CustmerBatch", t.results[s].CustmerBatch)
								}
							}
						}
					}
					var a = this.getGlobalProperty("/OutbDeliveryItem");
					var i = true;
					a.forEach((t, e, a) => {
						if (t.HigherLvlItmOfBatSpltItm == "000000" && t.Batch != "") {
							i = true
						}
						if (t.HigherLvlItmOfBatSpltItm == "000000" && t.ActualDeliveryQuantity != "0.000" && t.Batch == "") {
							i = false
						}
					});
					if (i == true) {
						debugger
						this.showInformation(this.getI18nText("PickingCompleted"))
					}
					this.setGlobalProperty("/Batch1", "");
					this.setGlobalProperty("/Batch2", "");
					this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
					this.setGlobalProperty("/MaterialByCustomer", "");
					this.setGlobalProperty("/CustmerBatch", "");
					jQuery.sap.delayedCall(1e3, this, function () {
						this.getView().byId("id_Batch").getFocusDomRef().focus()
					});
					this.globalBusyOff()
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this)
			};
			var u = "/YY1_MANAGE_CUSTOMER_BATCH";
			i.read(u, n)
		},
		onSort: function (t) {
			t.sort(function (t, e) {
				var a = t.DeliveryDocumentItem;
				var r = t.HigherLvlItmOfBatSpltItm;
				var s = e.DeliveryDocumentItem;
				var i = e.HigherLvlItmOfBatSpltItm;
				if (r != "000000" && i != "000000") {
					if (r == i) {
						if (a > s) {
							return 1
						} else {
							return -1
						}
					} else {
						if (r > i) {
							return 1
						} else {
							return -1
						}
					}
				}
				if (r == "000000" && i == "000000") {
					if (a > s) {
						return 1
					} else {
						return -1
					}
				}
				if (r == "000000" && i != "000000") {
					if (a == i) {
						if (a > i) {
							return 1
						} else {
							return -1
						}
					} else {
						if (a > i) {
							return 1
						} else {
							return -1
						}
					}
				}
				if (r != "000000" && i == "000000") {
					if (r == s) {
						if (a > s) {
							return 1
						} else {
							return -1
						}
					} else {
						if (r > s) {
							return 1
						} else {
							return -1
						}
					}
				}
			});
			return t
		},
		onPressClick: function (t) {
			var e = this.getView().byId("id_table");
			var a = e.getSelectedContexts()[0].sPath;
			var r = a.split("/")[2];
			this._Select = parseInt(r);
			var s = this.getGlobalProperty("/OutbDeliveryItem");
			this._DeliveryDocument = s[parseInt(r)].DeliveryDocument;
			this._DeliveryDocumentItem = s[parseInt(r)].DeliveryDocumentItem
		},
		onPressDelete: function () {
			var t = this.getView().byId("id_table");
			if (t.getSelectedContexts().length == 0) {
				this.showWarning(this.getI18nText("HaveNotSelet"));
				return
			}
			var t = this.getView().byId("id_table");
			var e = t.getSelectedContexts()[0].sPath;
			var a = e.split("/")[2];
			this._Select = a;
			var r = this.getGlobalProperty("/OutbDeliveryItem");
			this._DeliveryDocument = r[parseInt(a)].DeliveryDocument;
			this._DeliveryDocumentItem = r[parseInt(a)].DeliveryDocumentItem;
			if (this._Select === undefined) {
				this.showWarning(this.getI18nText("HaveNotSelet"));
				return
			}
			var s = this.getGlobalProperty("/OutbDeliveryItem/" + a);
			if (s.HigherLvlItmOfBatSpltItm == "000000") {
				this.showWarning(this.getI18nText("CanNotBeDeleted"));
				return
			}
			this.onSearchItem()
		},
		onSearchItem: function () {
			this.globalBusyOn();
			var t = [];
			t.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			t.push(new s("DeliveryDocumentItem", sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var e = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this._eTag = t.results[0].__metadata.etag;
						if (t.results[0].HigherLvlItmOfBatSpltItm == "000000") {
							this.showWarning(this.getI18nText("CanNotBeDeleted"));
							this.globalBusyOff();
							return
						}
						this.onDelete()
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/A_OutbDeliveryItem";
			a.read(i, r)
		},
		onSearchItem2: function () {
			this.globalBusyOn();
			var t = [];
			t.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			t.push(new s("DeliveryDocumentItem", sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var e = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this._eTag = t.results[0].__metadata.etag;
						this.onPatch()
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/A_OutbDeliveryItem";
			a.read(i, r)
		},
		onSearchItem3: function () {
			debugger;
			this.globalBusyOn();
			var t = [];
			var e = this.getGlobalProperty("/OutbDeliveryItem");
			var a = "900000";
			for (var r = 0; r < e.length; r++) {
				if (parseInt(e[r].DeliveryDocumentItem) > parseInt(a)) {
					a = e[r].DeliveryDocumentItem
				}
			}
			a = parseInt(a) + 1;
			this._lv_DeliveryDocumentItem = a.toString();
			t.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			t.push(new s("DeliveryDocumentItem", sap.ui.model.FilterOperator.EQ, this._lv_DeliveryDocumentItem));
			var i = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var l = new sap.ui.model.odata.ODataModel(i);
			var o = {
				filters: t,
				success: function (t, e) {
					debugger;
					if (t.results.length != 0) {
						this._eTag = t.results[0].__metadata.etag;
						this.onSaveStorageLocation()
					} else {
						this.DeleteAllSerialNumbersFromDeliveryItem()
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var n = "/A_OutbDeliveryItem";
			l.read(n, o)
		},
		onDelete: function () {
			this.globalBusyOn();
			var t = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var e = new sap.ui.model.odata.ODataModel(t);
			var a = {
				success: function (t, e) {
					this.globalBusyOff();
					this.showInformation("DeleteSuccess");
					this.onChangeSearch()
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this),
				eTag: this._eTag
			};
			var r = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" + this._DeliveryDocumentItem +
				"')";
			e.remove(r, a)
		},
		css_Color: function (t, e, f) {
			if (e == "000000") {
				if (f != "") {
					return "Success";
				}
				if (t == "0.000") {
					return "Success";
				} else {
					return "Warning";
				}
			} else {
				return "None";
			}
		},
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
			var t = [];
			t.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch1")));
			var e = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.globalBusyOff();
						var a = this.getGlobalProperty("/OutbDeliveryItem");
						this._A_ManufactureDate = this.resolvingDate(t.results[0].ManufactureDate);
						for (var r = 0; r < a.length; r++) {
							if (a[r].Material == t.results[0].Material && a[r].HigherLvlItmOfBatSpltItm == "000000") {
								this._Material = a[r].Material;
								this._Batch = t.results[0].Batch;
								this._DeliveryDocumentItem = a[r].DeliveryDocumentItem;
								this._Plant = a[r].Plant
							}
						}
						if (this._Material != "" && this._Batch != "" && this._DeliveryDocumentItem != "") {
							this.YY1_ZSDFIFO001_CDS()
						}
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
					this.globalBusyOff()
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/Batch";
			a.read(i, r)
		},
		YY1_ZSDFIFO001_CDS: function () {
			this.globalBusyOn();
			var t = [];
			t.push(new s("UserID", sap.ui.model.FilterOperator.EQ, this.getView().getModel("currentUser").getProperty("/name")));
			var e = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO001_CDS";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						if (t.results[0].RightToRelease == "N") {
							this.YY1_ZSDFIFO002_CDS(t.results[0].OperationArea)
						}
					} else {
						this.onPressSearch()
					}
					this.globalBusyOff()
				}.bind(this),
				error: function (t) {
					this.globalBusyOff()
				}.bind(this)
			};
			var i = "/YY1_ZSDFIFO001";
			a.read(i, r)
		},
		YY1_ZSDFIFO002_CDS: function (t) {
			this.globalBusyOn();
			var e = [];
			e.push(new s("Operationarea", sap.ui.model.FilterOperator.EQ, t));
			var a = "/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO002_CDS";
			var r = new sap.ui.model.odata.ODataModel(a);
			var i = {
				filters: e,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.setGlobalProperty("/YY1_ZSDFIFO002", t.results)
					}
					this.globalBusyOff();
					this.onPressSearch()
				}.bind(this),
				error: function (t) {
					this.globalBusyOff()
				}.bind(this)
			};
			var l = "/YY1_ZSDFIFO002";
			r.read(l, i)
		},
		onPressSearch: function () {
			this.globalBusyOn();
			this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", "");
			var t = [];
			var e = "/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";
			var a = new sap.ui.model.odata.ODataModel(e);
			t.push(new s("Material", sap.ui.model.FilterOperator.EQ, this._Material));
			t.push(new s("Plant", sap.ui.model.FilterOperator.EQ, this._Plant));
			t.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/Batch1")));
			t.push(new s("MatlWrhsStkQtyInMatlBaseUnit", sap.ui.model.FilterOperator.GT, 0));
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.globalBusyOff();
						this._MatlWrhsStkQtyInMatlBaseUnit = t.results[0].MatlWrhsStkQtyInMatlBaseUnit;
						this._StorageLocation = t.results[0].StorageLocation;
						this.onCkeckDataA()
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoBatch"));
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/A_MatlStkInAcctMod?$expand=to_MaterialStock";
			a.read(i, r)
		},
		onCkeckDataA: function () {
			this.globalBusyOn();
			var t = [];
			t.push(new s("Material", sap.ui.model.FilterOperator.EQ, this._Material));
			t.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this._Batch));
			var e = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			debugger;
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.globalBusyOff();
						this._A_ManufactureDate = this.resolvingDate(t.results[0].ManufactureDate);
						this.onCkeckDataB()
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
					this.globalBusyOff()
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/Batch";
			a.read(i, r)
		},
		onCkeckDataB: function () {
			this.globalBusyOn();
			var t = [];
			var e = "/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";
			var a = new sap.ui.model.odata.ODataModel(e);
			t.push(new s("Plant", sap.ui.model.FilterOperator.EQ, this._Plant));
			t.push(new s("Material", sap.ui.model.FilterOperator.EQ, this._Material));
			t.push(new s("MatlWrhsStkQtyInMatlBaseUnit", sap.ui.model.FilterOperator.GT, "0"));
			var r = this.getGlobalProperty("/YY1_ZSDFIFO002");
			if (r && r.length > 0) {
				for (var i = 0; i < r.length; i++) {
					t.push(new s("StorageLocation", sap.ui.model.FilterOperator.NE, r[i].StorageLocation))
				}
			}
			var l = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.globalBusyOff();
						this.setGlobalProperty("/A_MaterialStock", t.results);
						this._length = t.results.length;
						this.deleteStoke()
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var o = "A_MaterialStock('" + this._Material + "')/to_MatlStkInAcctMod";
			a.read(o, l)
		},
		deleteStoke: function () {
			this.globalBusyOn();
			var t = [];
			var e = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var a = new sap.ui.model.odata.ODataModel(e);
			if (this._length > 0) {
				for (var r = this._length - 1; r >= 0; r--) {
					t.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this.getGlobalProperty("/A_MaterialStock/" + r + "/Batch")))
				}
				var i = {
					filters: t,
					success: function (t, e) {
						this.globalBusyOff();
						if (t.results.length != 0) {
							var a = this.getGlobalProperty("/A_MaterialStock");
							for (var r = a.length - 1; r >= 0; r--) {
								for (var s = 0; s < t.results.length; s++) {
									if (a[r].Batch == t.results[s].Batch) {
										a.splice(r, 1)
									}
								}
							}
							this.onCkeckDataB2()
						} else {
							this.onCkeckDataB2()
						}
					}.bind(this),
					error: function (t) {
						this.globalBusyOff()
					}.bind(this)
				};
				var l = "/A_OutbDeliveryItem";
				a.read(l, i)
			}
		},
		onCkeckDataB2: function () {
			var t;
			var e = [];
			var a;
			var r = "/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";
			var i = new sap.ui.model.odata.ODataModel(r);
			var l = this.getGlobalProperty("/A_MaterialStock");
			if (l.length > 0) {
				this.globalBusyOn();
				for (var o = 0; o < l.length; o++) {
					var n = [];
					n.push(new s("Material", sap.ui.model.FilterOperator.EQ, l[o].Material));
					n.push(new s("Batch", sap.ui.model.FilterOperator.EQ, l[o].Batch));
					var t = new s(n, true);
					e.push(t)
				}
				var a = new sap.ui.model.Filter(e, false);
				debugger;
				var u = {
					filters: [a],
					success: function (t, e) {
						this.globalBusyOff();
						if (t.results.length != 0) {
							for (var a = 0; a < t.results.length; a++) {
								if (this._B_ManufactureDate == "" || this._B_ManufactureDate === undefined) {
									this._B_ManufactureDate = this.resolvingDate(t.results[0].ManufactureDate)
								} else {
									if (this._B_ManufactureDate > this.resolvingDate(t.results[a].ManufactureDate)) {
										this._B_ManufactureDate = this.resolvingDate(t.results[a].ManufactureDate)
									}
								}
							}
							if (this._B_ManufactureDate < this._A_ManufactureDate) {
								this.showWarning(this.getI18nText("DataError"));
							} else {
								this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit", this._MatlWrhsStkQtyInMatlBaseUnit);
								var r = this.getGlobalProperty("/Batch1");
								this.setGlobalProperty("/Batch2", r);
								this.setGlobalProperty("/Batch1", "");
								this.onPressPatch()
							}
						} else {
							this.globalBusyOff()
						}
					}.bind(this),
					error: function (t) {
						this.globalBusyOff()
					}.bind(this)
				};
				var h = "/Batch";
				i.read(h, u)
			}
		},
		onPressPatch: function () {
			var t = this.getGlobalProperty("/Batch2");
			var e = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (t == "" || t === undefined) {
				this.showWarning(this.getI18nText("BatchNoData"));
				return
			}
			if (e == "" || e === undefined) {
				this.showWarning(this.getI18nText("DeliveryQuantityNoData"));
				return
			}
			this.onSearchItem2()
		},
		onPatch: function () {
			var t = this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");
			if (t === undefined) {
				t = 0
			}
			t = parseFloat(t).toFixed(3);
			debugger;
			var e = {
				ActualDeliveryQuantity: t,
				Batch: this.getGlobalProperty("/Batch2"),
				StorageLocation: this._StorageLocation
			};
			var a = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";
			var r = new sap.ui.model.odata.ODataModel(a);
			var s = {
				success: function (t, e) {
					if (e.statusCode == 204) {
						debugger;
						this.onSearchItem3()
					}
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this),
				eTag: this._eTag,
				merge: true
			};
			var i = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" + this._DeliveryDocumentItem +
				"')";
			r.update(i, e, s)
		},
		onSaveStorageLocation: function () {
			debugger;
			var t = {
				StorageLocation: this._StorageLocation
			};
			var e = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				success: function (t, e) {
					if (e.statusCode == 204) {
						this.onGeterialNumber()
					}
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this),
				eTag: this._eTag,
				merge: true
			};
			var s = "/A_OutbDeliveryItem(DeliveryDocument='" + this._DeliveryDocument + "',DeliveryDocumentItem='" + this._lv_DeliveryDocumentItem
				.toString() + "')";
			a.update(s, t, r)
		},
		DeleteAllSerialNumbersFromDeliveryItem: function () {
			debugger;
			var t = [];
			t.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
			t.push(new s("DeliveryDocumentItem", sap.ui.model.FilterOperator.EQ, this._DeliveryDocumentItem));
			var e = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						debugger;
						this._eTag = t.results[0].__metadata.etag;
						var r = {
							urlParameters: {
								DeliveryDocument: "'" + t.results[0].DeliveryDocument + "'",
								DeliveryDocumentItem: "'" + t.results[0].DeliveryDocumentItem + "'"
							},
							success: function (t, e) {
								if (e.statusCode == 200) {
									this.onGeterialNumber()
								}
							}.bind(this),
							error: function (t) {
								debugger
							}.bind(this)
						};
						a.setHeaders({
							"If-Match": this._eTag,
							"x-csrf-token": a.getSecurityToken()
						});
						var s = "/DeleteAllSerialNumbersFromDeliveryItem";
						a.create(s, {}, r)
					} else {
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			a.setHeaders({
				"X-CSRF-TOKEN": "FETCH"
			});
			var i = "/A_OutbDeliveryItem";
			a.read(i, r)
		},
		onAddSerialNumber: function () {
			var t = this.getGlobalProperty("/YY1_Batch_and_Serial");
			if (t.length > 0) {
				var e = [];
				e.push(new s("DeliveryDocument", sap.ui.model.FilterOperator.EQ, this._DeliveryDocument));
				e.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this._Batch));
				var a = "/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";
				var r = new sap.ui.model.odata.ODataModel(a);
				var i = {
					filters: e,
					success: function (e, a) {
						if (e.results.length != 0) {
							this._eTag = e.results[0].__metadata.etag;
							var s = {
								urlParameters: {
									DeliveryDocument: "'" + e.results[0].DeliveryDocument + "'",
									DeliveryDocumentItem: "'" + e.results[0].DeliveryDocumentItem + "'",
									SerialNumber: "'" + this.getGlobalProperty("/YY1_Batch_and_Serial")[0].SerialNumber + "'"
								},
								success: function (e, a) {
									if (a.statusCode == 200) {
										t.splice(0, 1);
										this.setGlobalProperty("/YY1_Batch_and_Serial", t);
										this.onAddSerialNumber()
									}
								}.bind(this),
								error: function (t) {
									this.globalBusyOff();
									var e = $(t.response.body).find("message").first().text();
									this.showWarning(e)
								}.bind(this)
							};
							r.setHeaders({
								"If-Match": this._eTag,
								"x-csrf-token": r.getSecurityToken()
							});
							var i = "/AddSerialNumberToDeliveryItem";
							r.create(i, {}, s)
						} else {
							this.showWarning(this.getI18nText("NoData"));
						}
					}.bind(this),
					error: function (t) {}.bind(this)
				};
				r.setHeaders({
					"X-CSRF-TOKEN": "FETCH"
				});
				var l = "/A_OutbDeliveryItem";
				r.read(l, i)
			}
			if (t.length == 0) {
				this.onReadTableItem()
			}
		},
		onGeterialNumber: function () {
			var t = [];
			t.push(new s("Material", sap.ui.model.FilterOperator.EQ, this._Material));
			t.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this._Batch));
			var e = "/destinations/S4HANACLOUD_BASIC/YY1_BATCH_AND_SERIAL_CDS";
			var a = new sap.ui.model.odata.ODataModel(e);
			var r = {
				filters: t,
				success: function (t, e) {
					if (t.results.length != 0) {
						this.setGlobalProperty("/YY1_Batch_and_Serial", t.results);
						this.onAddSerialNumber()
					} else {
						this.globalBusyOff();
						this.onReadTableItem()
					}
				}.bind(this),
				error: function (t) {}.bind(this)
			};
			var i = "/YY1_Batch_and_Serial";
			a.read(i, r)
		},
		onSaveTable: function () {
			var t = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var e = new sap.ui.model.odata.ODataModel(t);
			var a = {
				Material: this._Material,
				Plant: this._Plant,
				Batch: this._Batch,
				CustmerBatch: this.getGlobalProperty("/CustmerBatch")
			};
			var r = {
				success: function (t, e) {
					if (e.statusCode == 201) {
						this.globalBusyOff();
						this.onChangeSearch();
						this.showText(this.getI18nText("SaveSuccess"))
					} else {
						this.globalBusyOff();
						this.showWarning(this.getI18nText("NoData"));
					}
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this)
			};
			var s = "/YY1_MANAGE_CUSTOMER_BATCH";
			e.create(s, a, r)
		},
		onReadTableItem: function () {
			var t = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var e = new sap.ui.model.odata.ODataModel(t);
			var a = [];
			a.push(new s("Plant", sap.ui.model.FilterOperator.EQ, this._Plant));
			a.push(new s("Material", sap.ui.model.FilterOperator.EQ, this._Material));
			a.push(new s("Batch", sap.ui.model.FilterOperator.EQ, this._Batch));
			var r = {
				filters: a,
				success: function (t, e) {
					if (t.results.length == 0) {
						this.onSaveTable()
					} else {
						this.SAP_UUID = t.results[0].SAP_UUID;
						this.onDeleteTableItem()
					}
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this)
			};
			var i = "/YY1_MANAGE_CUSTOMER_BATCH";
			e.read(i, r)
		},
		onDeleteTableItem: function () {
			var t = "/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";
			var e = new sap.ui.model.odata.ODataModel(t);
			var a = {
				success: function (t, e) {
					if (e.statusCode == 204) {
						this.onSaveTable()
					} else {}
				}.bind(this),
				error: function (t) {
					this.globalBusyOff();
					var e = $(t.response.body).find("message").first().text();
					this.showWarning(e)
				}.bind(this)
			};
			var r = "/YY1_MANAGE_CUSTOMER_BATCH(guid'" + this.SAP_UUID + "')";
			e.remove(r, a)
		},
		onChangeSearchMaterialByCustomer: function () {
			var t = this.getGlobalProperty("/MaterialByCustomer");
			var e = this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");
			if (t == "") {
				return
			}
			if (t != "" && t != e) {
				this.showWarning("Different From Customer Material!");
				return
			} else {
				this.showInformation("Material by customer is correct!")
			}
		},
		edit: function (t) {
			if (t != "") {
				return true
			} else {
				return false
			}
		}
	})
});
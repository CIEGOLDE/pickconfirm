sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/m/MessageStrip", "sap/m/BusyDialog", "sap/m/MessageBox",
	"sap/m/MessageToast", "sap/m/MessagePopover", "sap/m/MessagePopoverItem"
], function (e, t, s, n, o, i, a, u) {
	"use strict";
	return e.extend("cie.pickConfirm.controller.BaseController", {
		globalBusyDialog: new n,
		onInit: function () {
			var e, t;
			e = this.getRouter()
		},
		getRouter: function (e) {
			return sap.ui.core.UIComponent.getRouterFor(e)
		},
		globalBusyOn: function () {
			if (!this.globalBusyDialog) {
				this.globalBusyDialog = new sap.m.BusyDialog
			}
			this.globalBusyDialog.open()
		},
		globalBusyOff: function () {
			this.globalBusyDialog.close()
		},
		getGlobalProperty: function (e) {
			return this.getOwnerComponent().getModel("globalProperties").getProperty(e)
		},
		setGlobalProperty: function (e, t) {
			this.getOwnerComponent().getModel("globalProperties").setProperty(e, t);
			return true
		},
		valuesCleanup: function (e) {
			for (var t = 0, s = e.length; t < s; t++) {
				this.getView().byId(e[t]).setValue("");
				this.getView().byId(e[t]).setValueState(sap.ui.core.ValueState.None)
			}
		},
		getI18nText: function (e) {
			var t = this.getView().getModel("i18n").getResourceBundle();
			if (t.hasText(e)) {
				return t.getText(e)
			} else {
				return ""
			}
		},
		setBusy: function (e, t) {
			var s = this;
			setTimeout(function () {
				s.getView().byId(e).setBusy(t)
			}, 0)
		},
		getInputValue: function (e) {
			return this.getView().byId(e).getValue()
		},
		setInputValue: function (e, t) {
			this.getView().byId(e).setValue(t);
			return true
		},
		getContentDensityClass: function () {
			if (!this.sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this.sContentDensityClass = "sapUiSizeCompact"
				} else {
					this.sContentDensityClass = "sapUiSizeCozy"
				}
			}
			return this.sContentDensityClass
		},
		showWarning: function (e) {
			o.warning(e, {
				styleClass: this.getContentDensityClass()
			})
		},
		showInformation: function (e) {
			o.information(e, {
				styleClass: this.getContentDensityClass()
			})
		},
		showText: function (e) {
			i.show(e, {
				width: "20em",
				my: sap.ui.core.Popup.Dock.Center,
				at: sap.ui.core.Popup.Dock.Center
			})
		},
		resolvingDate: function (e) {
			let t = new Date(e);
			let s = t.getMonth() + 1 < 10 ? "0" + (t.getMonth() + 1) : t.getMonth() + 1;
			let n = t.getDate() < 10 ? "0" + t.getDate() : t.getDate();
			let o = t.getHours() < 10 ? "0" + t.getHours() : t.getHours();
			let i = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes();
			let a = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
			let u = t.getFullYear() + "-" + s + "-" + n + " " + o + ":" + i + ":" + a;
			return u
		}
		
	})
});
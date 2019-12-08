jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"cie/pickConfirm/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","cie/pickConfirm/model/models"],function(e,i,t){"use strict";return e.extend("cie.pickConfirm.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.setModel(t.initGlobalPropertiesModel(),"globalProperties");this.setModel(t.initDeviceModel(),"device");this.getRouter().initialize()}})});
},
	"cie/pickConfirm/controller/App.controller.js":function(){sap.ui.define(["cie/pickConfirm/controller/BaseController"],function(e){"use strict";return e.extend("cie.pickConfirm.controller.App",{onInit:function(){this.getView().addStyleClass(this.getContentDensityClass())},onBeforeRendering:function(){}})});
},
	"cie/pickConfirm/controller/BaseController.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/m/MessageStrip","sap/m/BusyDialog","sap/m/MessageBox","sap/m/MessageToast","sap/m/MessagePopover","sap/m/MessagePopoverItem"],function(e,t,s,n,o,i,a,u){"use strict";return e.extend("cie.pickConfirm.controller.BaseController",{globalBusyDialog:new n,onInit:function(){var e,t;e=this.getRouter()},getRouter:function(e){return sap.ui.core.UIComponent.getRouterFor(e)},globalBusyOn:function(){if(!this.globalBusyDialog){this.globalBusyDialog=new sap.m.BusyDialog}this.globalBusyDialog.open()},globalBusyOff:function(){this.globalBusyDialog.close()},getGlobalProperty:function(e){return this.getOwnerComponent().getModel("globalProperties").getProperty(e)},setGlobalProperty:function(e,t){this.getOwnerComponent().getModel("globalProperties").setProperty(e,t);return true},valuesCleanup:function(e){for(var t=0,s=e.length;t<s;t++){this.getView().byId(e[t]).setValue("");this.getView().byId(e[t]).setValueState(sap.ui.core.ValueState.None)}},getI18nText:function(e){var t=this.getView().getModel("i18n").getResourceBundle();if(t.hasText(e)){return t.getText(e)}else{return""}},setBusy:function(e,t){var s=this;setTimeout(function(){s.getView().byId(e).setBusy(t)},0)},getInputValue:function(e){return this.getView().byId(e).getValue()},setInputValue:function(e,t){this.getView().byId(e).setValue(t);return true},getContentDensityClass:function(){if(!this.sContentDensityClass){if(!sap.ui.Device.support.touch){this.sContentDensityClass="sapUiSizeCompact"}else{this.sContentDensityClass="sapUiSizeCozy"}}return this.sContentDensityClass},showWarning:function(e){o.warning(e,{styleClass:this.getContentDensityClass()})},showInformation:function(e){o.information(e,{styleClass:this.getContentDensityClass()})},showText:function(e){i.show(e,{width:"20em",my:sap.ui.core.Popup.Dock.Center,at:sap.ui.core.Popup.Dock.Center})},resolvingDate:function(e){let t=new Date(e);let s=t.getMonth()+1<10?"0"+(t.getMonth()+1):t.getMonth()+1;let n=t.getDate()<10?"0"+t.getDate():t.getDate();let o=t.getHours()<10?"0"+t.getHours():t.getHours();let i=t.getMinutes()<10?"0"+t.getMinutes():t.getMinutes();let a=t.getSeconds()<10?"0"+t.getSeconds():t.getSeconds();let u=t.getFullYear()+"-"+s+"-"+n+" "+o+":"+i+":"+a;return u}})});
},
	"cie/pickConfirm/controller/list.controller.js":function(){sap.ui.define(["cie/pickConfirm/controller/BaseController","cie/pickConfirm/model/formatter","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/ui/model/Filter"],function(t,e,a,r,s){"use strict";return t.extend("cie.pickConfirm.controller.list",{formatter:e,onInit:function(){this.oRouter=this.getRouter(this);this.oRouter.getRoute("list").attachPatternMatched(this.onObjectMatched,this)},onObjectMatched:function(t){this.setGlobalProperty("/Batch1","");this.setGlobalProperty("/Batch2","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");this._DeliveryDocument=t.getParameter("arguments").DeliveryDocument;var e=this.getGlobalProperty("/OutbDeliveryItem");if(e.length==0){this.setGlobalProperty("/OutbDeliveryItem",[]);this.onChangeSearch()}else{jQuery.sap.delayedCall(1e3,this,function(){this.getView().byId("id_Batch").getFocusDomRef().focus()})}},onPressCancel:function(){this.oRouter.navTo("scan")},onChangeSearch:function(){this.globalBusyOn();var t=[];var e=[];if(this._DeliveryDocument.length<8){return}this.globalBusyOn();var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var r=new sap.ui.model.odata.ODataModel(a);t.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));e.push(new sap.ui.model.Sorter("DeliveryDocumentItem",false));var i={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/OutbDeliveryItem",this.onSort(t.results));this._length=t.results.length;this.onReadTable()}else{this.showWarning("No Data");this.globalBusyOff()}}.bind(this),error:function(t){}.bind(this)};var l="/A_OutbDeliveryItem";r.read(l,i)},onReadTable:function(){this.globalBusyOn();var t;var e=[];var a;var r="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var i=new sap.ui.model.odata.ODataModel(r);for(var l=0;l<this._length;l++){var o=[];o.push(new s("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+l+"/Plant")));o.push(new s("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+l+"/Material")));o.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+l+"/Batch")));t=new s(o,true);e.push(t)}a=new sap.ui.model.Filter(e,false);var n={filters:[a],success:function(t,e){if(t.results.length>0){var a=this.getGlobalProperty("/OutbDeliveryItem");for(var r=0;r<a.length;r++){for(var s=0;s<t.results.length;s++){if(a[r].Plant==t.results[s].Plant&&a[r].Material==t.results[s].Material&&a[r].Batch==t.results[s].Batch){this.setGlobalProperty("/OutbDeliveryItem/"+r+"/CustmerBatch",t.results[s].CustmerBatch)}}}}var a=this.getGlobalProperty("/OutbDeliveryItem");var i=true;a.forEach((t,e,a)=>{if(t.HigherLvlItmOfBatSpltItm=="000000"&&t.ActualDeliveryQuantity!="0.000"){i=false}});if(i==true){this.showInformation("Picking Completed!")}this.setGlobalProperty("/Batch1","");this.setGlobalProperty("/Batch2","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");jQuery.sap.delayedCall(1e3,this,function(){this.getView().byId("id_Batch").getFocusDomRef().focus()});this.globalBusyOff()}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var u="/YY1_MANAGE_CUSTOMER_BATCH";i.read(u,n)},onSort:function(t){t.sort(function(t,e){var a=t.DeliveryDocumentItem;var r=t.HigherLvlItmOfBatSpltItm;var s=e.DeliveryDocumentItem;var i=e.HigherLvlItmOfBatSpltItm;if(r!="000000"&&i!="000000"){if(r==i){if(a>s){return 1}else{return-1}}else{if(r>i){return 1}else{return-1}}}if(r=="000000"&&i=="000000"){if(a>s){return 1}else{return-1}}if(r=="000000"&&i!="000000"){if(a==i){if(a>i){return 1}else{return-1}}else{if(a>i){return 1}else{return-1}}}if(r!="000000"&&i=="000000"){if(r==s){if(a>s){return 1}else{return-1}}else{if(r>s){return 1}else{return-1}}}});return t},onPressClick:function(t){var e=this.getView().byId("id_table");var a=e.getSelectedContexts()[0].sPath;var r=a.split("/")[2];this._Select=parseInt(r);var s=this.getGlobalProperty("/OutbDeliveryItem");this._DeliveryDocument=s[parseInt(r)].DeliveryDocument;this._DeliveryDocumentItem=s[parseInt(r)].DeliveryDocumentItem},onPressDelete:function(){var t=this.getView().byId("id_table");if(t.getSelectedContexts().length==0){this.showWarning("Have Not Selet");return}var t=this.getView().byId("id_table");var e=t.getSelectedContexts()[0].sPath;var a=e.split("/")[2];this._Select=a;var r=this.getGlobalProperty("/OutbDeliveryItem");this._DeliveryDocument=r[parseInt(a)].DeliveryDocument;this._DeliveryDocumentItem=r[parseInt(a)].DeliveryDocumentItem;if(this._Select===undefined){this.showWarning("Have Not Selet");return}var s=this.getGlobalProperty("/OutbDeliveryItem/"+a);if(s.HigherLvlItmOfBatSpltItm=="000000"){this.showWarning("Can Not Be Deleted");return}this.onSearchItem()},onSearchItem:function(){this.globalBusyOn();var t=[];t.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));t.push(new s("DeliveryDocumentItem",sap.ui.model.FilterOperator.EQ,this._DeliveryDocumentItem));var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this._eTag=t.results[0].__metadata.etag;if(t.results[0].HigherLvlItmOfBatSpltItm=="000000"){this.showWarning("Can Not Be Deleted");this.globalBusyOff();return}this.onDelete()}else{this.globalBusyOff();this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};var i="/A_OutbDeliveryItem";a.read(i,r)},onSearchItem2:function(){this.globalBusyOn();var t=[];t.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));t.push(new s("DeliveryDocumentItem",sap.ui.model.FilterOperator.EQ,this._DeliveryDocumentItem));var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this._eTag=t.results[0].__metadata.etag;this.onPatch()}else{this.globalBusyOff();this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};var i="/A_OutbDeliveryItem";a.read(i,r)},onSearchItem3:function(){debugger;this.globalBusyOn();var t=[];var e=this.getGlobalProperty("/OutbDeliveryItem");var a="900000";for(var r=0;r<e.length;r++){if(parseInt(e[r].DeliveryDocumentItem)>parseInt(a)){a=e[r].DeliveryDocumentItem}}a=parseInt(a)+1;this._lv_DeliveryDocumentItem=a.toString();t.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));t.push(new s("DeliveryDocumentItem",sap.ui.model.FilterOperator.EQ,this._lv_DeliveryDocumentItem));var i="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var l=new sap.ui.model.odata.ODataModel(i);var o={filters:t,success:function(t,e){debugger;if(t.results.length!=0){this._eTag=t.results[0].__metadata.etag;this.onSaveStorageLocation()}else{this.DeleteAllSerialNumbersFromDeliveryItem()}}.bind(this),error:function(t){}.bind(this)};var n="/A_OutbDeliveryItem";l.read(n,o)},onDelete:function(){this.globalBusyOn();var t="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var e=new sap.ui.model.odata.ODataModel(t);var a={success:function(t,e){this.globalBusyOff();this.showInformation("Delete Success");this.onChangeSearch()}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this),eTag:this._eTag};var r="/A_OutbDeliveryItem(DeliveryDocument='"+this._DeliveryDocument+"',DeliveryDocumentItem='"+this._DeliveryDocumentItem+"')";e.remove(r,a)},css_Color:function(t,e){if(e=="000000"){if(t=="0.000"){return"Success"}else{return"Warning"}}else{return"None"}},onSearchBatch:function(){this.globalBusyOn();this.setGlobalProperty("/Batch2","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");this.setGlobalProperty("/A_MaterialStock",[]);this.setGlobalProperty("/YY1_Batch_and_Serial",[]);this.setGlobalProperty("/YY1_ZSDFIFO002",[]);this._A_ManufactureDate="";this._B_ManufactureDate="";this._MatlWrhsStkQtyInMatlBaseUnit=0;this._StorageLocation="";var t=[];t.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch1")));var e="/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this.globalBusyOff();var a=this.getGlobalProperty("/OutbDeliveryItem");this._A_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate);for(var r=0;r<a.length;r++){if(a[r].Material==t.results[0].Material&&a[r].HigherLvlItmOfBatSpltItm=="000000"){this._Material=a[r].Material;this._Batch=t.results[0].Batch;this._DeliveryDocumentItem=a[r].DeliveryDocumentItem;this._Plant=a[r].Plant}}if(this._Material!=""&&this._Batch!=""&&this._DeliveryDocumentItem!=""){this.YY1_ZSDFIFO001_CDS()}}else{this.globalBusyOff();this.showWarning("No Data")}this.globalBusyOff()}.bind(this),error:function(t){}.bind(this)};var i="/Batch";a.read(i,r)},YY1_ZSDFIFO001_CDS:function(){this.globalBusyOn();var t=[];t.push(new s("UserID",sap.ui.model.FilterOperator.EQ,this.getView().getModel("currentUser").getProperty("/name")));var e="/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO001_CDS";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){if(t.results[0].RightToRelease=="N"){this.YY1_ZSDFIFO002_CDS(t.results[0].OperationArea)}}else{this.onPressSearch()}this.globalBusyOff()}.bind(this),error:function(t){this.globalBusyOff()}.bind(this)};var i="/YY1_ZSDFIFO001";a.read(i,r)},YY1_ZSDFIFO002_CDS:function(t){this.globalBusyOn();var e=[];e.push(new s("Operationarea",sap.ui.model.FilterOperator.EQ,t));var a="/destinations/S4HANACLOUD_BASIC/YY1_ZSDFIFO002_CDS";var r=new sap.ui.model.odata.ODataModel(a);var i={filters:e,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/YY1_ZSDFIFO002",t.results)}this.globalBusyOff();this.onPressSearch()}.bind(this),error:function(t){this.globalBusyOff()}.bind(this)};var l="/YY1_ZSDFIFO002";r.read(l,i)},onPressSearch:function(){this.globalBusyOn();this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";var a=new sap.ui.model.odata.ODataModel(e);t.push(new s("Material",sap.ui.model.FilterOperator.EQ,this._Material));t.push(new s("Plant",sap.ui.model.FilterOperator.EQ,this._Plant));t.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch1")));t.push(new s("MatlWrhsStkQtyInMatlBaseUnit",sap.ui.model.FilterOperator.GT,0));var r={filters:t,success:function(t,e){if(t.results.length!=0){this.globalBusyOff();this._MatlWrhsStkQtyInMatlBaseUnit=t.results[0].MatlWrhsStkQtyInMatlBaseUnit;this._StorageLocation=t.results[0].StorageLocation;this.onCkeckDataA()}else{this.globalBusyOff();this.showWarning("No Batch")}}.bind(this),error:function(t){}.bind(this)};var i="/A_MatlStkInAcctMod?$expand=to_MaterialStock";a.read(i,r)},onCkeckDataA:function(){this.globalBusyOn();var t=[];t.push(new s("Material",sap.ui.model.FilterOperator.EQ,this._Material));t.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this._Batch));var e="/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";debugger;var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this.globalBusyOff();this._A_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate);this.onCkeckDataB()}else{this.globalBusyOff();this.showWarning("No Data")}this.globalBusyOff()}.bind(this),error:function(t){}.bind(this)};var i="/Batch";a.read(i,r)},onCkeckDataB:function(){this.globalBusyOn();var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";var a=new sap.ui.model.odata.ODataModel(e);t.push(new s("Plant",sap.ui.model.FilterOperator.EQ,this._Plant));t.push(new s("Material",sap.ui.model.FilterOperator.EQ,this._Material));t.push(new s("MatlWrhsStkQtyInMatlBaseUnit",sap.ui.model.FilterOperator.GT,"0"));var r=this.getGlobalProperty("/YY1_ZSDFIFO002");if(r&&r.length>0){for(var i=0;i<r.length;i++){t.push(new s("StorageLocation",sap.ui.model.FilterOperator.NE,r[i].StorageLocation))}}var l={filters:t,success:function(t,e){if(t.results.length!=0){this.globalBusyOff();this.setGlobalProperty("/A_MaterialStock",t.results);this._length=t.results.length;this.deleteStoke()}else{this.globalBusyOff();this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};var o="A_MaterialStock('"+this._Material+"')/to_MatlStkInAcctMod";a.read(o,l)},deleteStoke:function(){this.globalBusyOn();var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);if(this._length>0){for(var r=this._length-1;r>=0;r--){t.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/A_MaterialStock/"+r+"/Batch")))}var i={filters:t,success:function(t,e){this.globalBusyOff();if(t.results.length!=0){var a=this.getGlobalProperty("/A_MaterialStock");for(var r=a.length-1;r>=0;r--){for(var s=0;s<t.results.length;s++){if(a[r].Batch==t.results[s].Batch){a.splice(r,1)}}}this.onCkeckDataB2()}else{this.onCkeckDataB2()}}.bind(this),error:function(t){this.globalBusyOff()}.bind(this)};var l="/A_OutbDeliveryItem";a.read(l,i)}},onCkeckDataB2:function(){var t;var e=[];var a;var r="/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";var i=new sap.ui.model.odata.ODataModel(r);var l=this.getGlobalProperty("/A_MaterialStock");if(l.length>0){this.globalBusyOn();for(var o=0;o<l.length;o++){var n=[];n.push(new s("Material",sap.ui.model.FilterOperator.EQ,l[o].Material));n.push(new s("Batch",sap.ui.model.FilterOperator.EQ,l[o].Batch));var t=new s(n,true);e.push(t)}var a=new sap.ui.model.Filter(e,false);debugger;var u={filters:[a],success:function(t,e){this.globalBusyOff();if(t.results.length!=0){for(var a=0;a<t.results.length;a++){if(this._B_ManufactureDate==""||this._B_ManufactureDate===undefined){this._B_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate)}else{if(this._B_ManufactureDate>this.resolvingDate(t.results[a].ManufactureDate)){this._B_ManufactureDate=this.resolvingDate(t.results[a].ManufactureDate)}}}if(this._B_ManufactureDate<this._A_ManufactureDate){this.showWarning("Data ERROE!")}else{this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit",this._MatlWrhsStkQtyInMatlBaseUnit);var r=this.getGlobalProperty("/Batch1");this.setGlobalProperty("/Batch2",r);this.setGlobalProperty("/Batch1","");this.onPressPatch()}}else{this.globalBusyOff()}}.bind(this),error:function(t){this.globalBusyOff()}.bind(this)};var h="/Batch";i.read(h,u)}},onPressPatch:function(){var t=this.getGlobalProperty("/Batch2");var e=this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");if(t==""||t===undefined){this.showWarning("Batch No Data");return}if(e==""||e===undefined){this.showWarning("Delivery Quantity No Data");return}this.onSearchItem2()},onPatch:function(){var t=this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");if(t===undefined){t=0}t=parseFloat(t).toFixed(3);debugger;var e={ActualDeliveryQuantity:t,Batch:this.getGlobalProperty("/Batch2"),StorageLocation:this._StorageLocation};var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";var r=new sap.ui.model.odata.ODataModel(a);var s={success:function(t,e){if(e.statusCode==204){debugger;this.onSearchItem3()}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this),eTag:this._eTag,merge:true};var i="/A_OutbDeliveryItem(DeliveryDocument='"+this._DeliveryDocument+"',DeliveryDocumentItem='"+this._DeliveryDocumentItem+"')";r.update(i,e,s)},onSaveStorageLocation:function(){debugger;var t={StorageLocation:this._StorageLocation};var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV";var a=new sap.ui.model.odata.ODataModel(e);var r={success:function(t,e){if(e.statusCode==204){this.onGeterialNumber()}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this),eTag:this._eTag,merge:true};var s="/A_OutbDeliveryItem(DeliveryDocument='"+this._DeliveryDocument+"',DeliveryDocumentItem='"+this._lv_DeliveryDocumentItem.toString()+"')";a.update(s,t,r)},DeleteAllSerialNumbersFromDeliveryItem:function(){debugger;var t=[];t.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));t.push(new s("DeliveryDocumentItem",sap.ui.model.FilterOperator.EQ,this._DeliveryDocumentItem));var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){debugger;this._eTag=t.results[0].__metadata.etag;var r={urlParameters:{DeliveryDocument:"'"+t.results[0].DeliveryDocument+"'",DeliveryDocumentItem:"'"+t.results[0].DeliveryDocumentItem+"'"},success:function(t,e){if(e.statusCode==200){this.onGeterialNumber()}}.bind(this),error:function(t){debugger}.bind(this)};a.setHeaders({"If-Match":this._eTag,"x-csrf-token":a.getSecurityToken()});var s="/DeleteAllSerialNumbersFromDeliveryItem";a.create(s,{},r)}else{this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};a.setHeaders({"X-CSRF-TOKEN":"FETCH"});var i="/A_OutbDeliveryItem";a.read(i,r)},onAddSerialNumber:function(){var t=this.getGlobalProperty("/YY1_Batch_and_Serial");if(t.length>0){var e=[];e.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));e.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this._Batch));var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var r=new sap.ui.model.odata.ODataModel(a);var i={filters:e,success:function(e,a){if(e.results.length!=0){this._eTag=e.results[0].__metadata.etag;var s={urlParameters:{DeliveryDocument:"'"+e.results[0].DeliveryDocument+"'",DeliveryDocumentItem:"'"+e.results[0].DeliveryDocumentItem+"'",SerialNumber:"'"+this.getGlobalProperty("/YY1_Batch_and_Serial")[0].SerialNumber+"'"},success:function(e,a){if(a.statusCode==200){t.splice(0,1);this.setGlobalProperty("/YY1_Batch_and_Serial",t);this.onAddSerialNumber()}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};r.setHeaders({"If-Match":this._eTag,"x-csrf-token":r.getSecurityToken()});var i="/AddSerialNumberToDeliveryItem";r.create(i,{},s)}else{this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};r.setHeaders({"X-CSRF-TOKEN":"FETCH"});var l="/A_OutbDeliveryItem";r.read(l,i)}if(t.length==0){this.onReadTableItem()}},onGeterialNumber:function(){var t=[];t.push(new s("Material",sap.ui.model.FilterOperator.EQ,this._Material));t.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this._Batch));var e="/destinations/S4HANACLOUD_BASIC/YY1_BATCH_AND_SERIAL_CDS";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/YY1_Batch_and_Serial",t.results);this.onAddSerialNumber()}else{this.globalBusyOff();this.onReadTableItem()}}.bind(this),error:function(t){}.bind(this)};var i="/YY1_Batch_and_Serial";a.read(i,r)},onSaveTable:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a={Material:this._Material,Plant:this._Plant,Batch:this._Batch,CustmerBatch:this.getGlobalProperty("/CustmerBatch")};var r={success:function(t,e){if(e.statusCode==201){this.globalBusyOff();this.onChangeSearch();this.showText("Save Success")}else{this.globalBusyOff();this.showWarning("No Data")}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var s="/YY1_MANAGE_CUSTOMER_BATCH";e.create(s,a,r)},onReadTableItem:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a=[];a.push(new s("Plant",sap.ui.model.FilterOperator.EQ,this._Plant));a.push(new s("Material",sap.ui.model.FilterOperator.EQ,this._Material));a.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this._Batch));var r={filters:a,success:function(t,e){if(t.results.length==0){this.onSaveTable()}else{this.SAP_UUID=t.results[0].SAP_UUID;this.onDeleteTableItem()}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var i="/YY1_MANAGE_CUSTOMER_BATCH";e.read(i,r)},onDeleteTableItem:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a={success:function(t,e){if(e.statusCode==204){this.onSaveTable()}else{}}.bind(this),error:function(t){this.globalBusyOff();var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var r="/YY1_MANAGE_CUSTOMER_BATCH(guid'"+this.SAP_UUID+"')";e.remove(r,a)},onChangeSearchMaterialByCustomer:function(){var t=this.getGlobalProperty("/MaterialByCustomer");var e=this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");if(t==""){return}if(t!=""&&t!=e){this.showWarning("Different From Customer Material!");return}else{this.showInformation("Material by customer is correct!")}},edit:function(t){if(t!=""){return true}else{return false}}})});
},
	"cie/pickConfirm/controller/scan.controller.js":function(){sap.ui.define(["cie/pickConfirm/controller/BaseController","cie/pickConfirm/model/formatter","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/ui/model/Filter"],function(e,t,r,i,s){"use strict";return e.extend("cie.pickConfirm.controller.scan",{onInit:function(){this.oRouter=this.getRouter(this);this.oRouter.getRoute("scan").attachPatternMatched(this.onObjectMatched,this)},onObjectMatched:function(e){jQuery.sap.delayedCall(1e3,this,function(){this.getView().byId("id_DeliveryDocument").getFocusDomRef().focus()})},onChangeSearch:function(){this.setGlobalProperty("/OutbDeliveryItem",[]);var e=[];var t=[];var r=this.getGlobalProperty("/DeliveryDocument");if(r.length<8){return}this.globalBusyOn();var i="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var l=new sap.ui.model.odata.ODataModel(i);e.push(new s("DeliveryDocument",sap.ui.model.FilterOperator.EQ,r));t.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem",true));t.push(new sap.ui.model.Sorter("DeliveryDocumentItem",false));var a={filters:e,success:function(e,t){if(e.results.length!=0){this.setGlobalProperty("/OutbDeliveryItem",this.onSort(e.results));this._length=e.results.length;this.onReadTable()}else{this.globalBusyOff();this.showWarning("No Data")}}.bind(this),error:function(e){this.globalBusyOff()}.bind(this)};var o="/A_OutbDeliveryItem";l.read(o,a)},onReadTable:function(){this.globalBusyOn();var e;var t=[];var r;var i="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var l=new sap.ui.model.odata.ODataModel(i);for(var a=0;a<this._length;a++){var o=[];o.push(new s("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+a+"/Plant")));o.push(new s("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+a+"/Material")));o.push(new s("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+a+"/Batch")));e=new s(o,true);t.push(e)}r=new sap.ui.model.Filter(t,false);var n={filters:[r],success:function(e,t){if(e.results.length>0){var r=this.getGlobalProperty("/OutbDeliveryItem");for(var i=0;i<r.length;i++){for(var s=0;s<e.results.length;s++){if(r[i].Plant==e.results[s].Plant&&r[i].Material==e.results[s].Material&&r[i].Batch==e.results[s].Batch){this.setGlobalProperty("/OutbDeliveryItem/"+i+"/CustmerBatch",e.results[s].CustmerBatch)}}}}this.globalBusyOff();var l=this.getGlobalProperty("/DeliveryDocument");this.oRouter.navTo("list",{DeliveryDocument:l})}.bind(this),error:function(e){this.globalBusyOff();var t=$(e.response.body).find("message").first().text();this.showWarning(t)}.bind(this)};var u="/YY1_MANAGE_CUSTOMER_BATCH";l.read(u,n)},onSort:function(e){e.sort(function(e,t){var r=e.DeliveryDocumentItem;var i=e.HigherLvlItmOfBatSpltItm;var s=t.DeliveryDocumentItem;var l=t.HigherLvlItmOfBatSpltItm;if(i!="000000"&&l!="000000"){if(i==l){if(r>s){return 1}else{return-1}}else{if(i>l){return 1}else{return-1}}}if(i=="000000"&&l=="000000"){if(r>s){return 1}else{return-1}}if(i=="000000"&&l!="000000"){if(r==l){if(r>l){return 1}else{return-1}}else{if(r>l){return 1}else{return-1}}}if(i!="000000"&&l=="000000"){if(i==s){if(r>s){return 1}else{return-1}}else{if(i>s){return 1}else{return-1}}}});return e}})});
},
	"cie/pickConfirm/i18n/i18n.properties":'title=Title\nappTitle=pickConfirm\nappDescription=App Description',
	"cie/pickConfirm/i18n/i18n_en.properties":'',
	"cie/pickConfirm/i18n/i18n_zh.properties":'',
	"cie/pickConfirm/i18n/i18n_zh_CN.properties":'',
	"cie/pickConfirm/manifest.json":'{"_version":"1.12.0","sap.app":{"id":"cie.pickConfirm","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","sourceTemplate":{"id":"ui5template.basicSAPUI5ApplicationProject","version":"1.40.12"},"dataSources":{"API_OUTBOUND_DELIVERY_SRV":{"uri":"/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV/","type":"OData","settings":{"annotations":[]}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":false,"rootView":{"viewName":"cie.pickConfirm.view.App","type":"XML","async":true,"id":"app"},"dependencies":{"minUI5Version":"1.65.6","libs":{"sap.ui.layout":{},"sap.ui.core":{},"sap.m":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"cie.pickConfirm.i18n.i18n"}},"currentUser":{"type":"sap.ui.model.json.JSONModel","settings":{},"uri":"/services/userapi/currentUser"}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","viewPath":"cie.pickConfirm.view","controlId":"App","controlAggregation":"pages","async":true,"transition":"slide","bypassed":{"target":["scan"]}},"routes":[{"pattern":"","name":"scan","greedy":false,"titleTarget":"","target":["scan"]},{"pattern":"/{DeliveryDocument}","name":"list","greedy":false,"titleTarget":"","target":["list"]}],"targets":{"scan":{"viewName":"scan","viewLevel":1,"controlAggregation":"pages","clearControlAggregation":true},"list":{"viewName":"list","viewLevel":1,"controlAggregation":"pages","clearControlAggregation":true}}}},"sap.platform.hcp":{"uri":"webapp","_version":"1.1.0"}}',
	"cie/pickConfirm/model/formatter.js":function(){sap.ui.define([],function(){"use strict";return{deleteRightZero:function(e){if(e===null||e===undefined||e===0||e==="0"){e=0}return parseFloat(e)},deleteLeftZero:function(e){if(e===null||e===undefined||e===0||e==="0"){e="0"}return e.replace(/^0+/,"")},weightState:function(e,r){var n=1;var t=5;var i=parseFloat(e);if(isNaN(i)){return"None"}else{if(r==="G"){i=e/1e3}if(i<0){return"None"}else if(i<n){return"Success"}else if(i<t){return"Warning"}else{return"Error"}}}}});
},
	"cie/pickConfirm/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,t){"use strict";return{initDeviceModel:function(){var a=new e(t);a.setDefaultBindingMode("OneWay");return a},initGlobalPropertiesModel:function(){var t={eTag:"",DeliveryDocument:"",OutbDeliveryItem:[],YY1_Batch_and_Serial:[],A_MaterialStock:[],YY1_ZSDFIFO002:[],Batch1:"",Batch2:"",MatlWrhsStkQtyInMatlBaseUnit:"",MaterialByCustomer:"",CustmerBatch:""};var a=new e;a.setDefaultBindingMode("TwoWay");a.setData(t);return a}}});
},
	"cie/pickConfirm/view/App.view.xml":'<mvc:View controllerName="cie.pickConfirm.controller.App" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" height="100%"><App id="App"></App></mvc:View>',
	"cie/pickConfirm/view/list.view.xml":'<mvc:View controllerName="cie.pickConfirm.controller.list" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:mvc="sap.ui.core.mvc"\n\tdisplayBlock="true" xmlns="sap.m" xmlns:core="sap.ui.core" height="100%" xmlns:table="sap.ui.table" xmlns:l="sap.ui.layout"\n\txmlns:t="sap.ui.table"><Page title="{globalProperties>/OutbDeliveryItem/0/DeliveryDocument}" showHeader="false" showNavButton="true" showSubHeader="true"\n\t\tclass="sapUiContentPadding"><Bar><contentLeft><ToggleButton text="Cancel" type="Emphasized" press="onPressCancel"/></contentLeft><contentMiddle><Text text="{globalProperties>/OutbDeliveryItem/0/DeliveryDocument}" width="100%"></Text></contentMiddle><contentRight><ToggleButton text="Delete" type="Emphasized" press="onPressDelete"/></contentRight></Bar><SearchField width="100%" id="id_Batch" placeholder="Batch" search="onSearchBatch" value="{globalProperties>/Batch1}" suggest="onSearchBatch"/><FlexBox renderType="Div"><items><Text text="Batch:"><layoutData><FlexItemData alignSelf="Center" baseSize="50%"/></layoutData></Text><Input value="{globalProperties>/Batch2}" editable="false" textAlign="Begin" placeholder=""  submit="onPressSearch"><layoutData><FlexItemData alignSelf="End" baseSize="100%"/></layoutData></Input></items></FlexBox><FlexBox renderType="Div"><items><Text text="Delivery Quantity:"><layoutData><FlexItemData alignSelf="Center" baseSize="50%"/></layoutData></Text><Input value="{globalProperties>/MatlWrhsStkQtyInMatlBaseUnit}" editable="false" textAlign="Begin" placeholder=""><layoutData><FlexItemData alignSelf="End" baseSize="100%"/></layoutData></Input></items></FlexBox><Table id="id_table" items="{path: \'globalProperties>/OutbDeliveryItem\',sorter: {path: \'\'}}" selectionChange="onPressClick"\n\t\t\tincludeItemInSelection="false" mode="SingleSelect"><columns><Column width="25%" hAlign="Left"><Text text="Item"/></Column><Column width="28%" hAlign="Left"><Text text="Material"/></Column><Column width="30%" hAlign="Left"><Text text="Batch"/></Column></columns><items><ColumnListItem type="Active" press="onPressDetail"><cells><ObjectStatus text="{globalProperties>DeliveryDocumentItem}"\n\t\t\t\t\t\t\tstate="{parts:[{path:\'globalProperties>ActualDeliveryQuantity\'},{path:\'globalProperties>HigherLvlItmOfBatSpltItm\'}],formatter:\'.css_Color\'}"/><Text text="{globalProperties>Material}"/><ObjectIdentifier title="{globalProperties>Batch}" text="{globalProperties>CustmerBatch}"/></cells></ColumnListItem></items></Table><Label text="MaterialByCustomer" textAlign="Center" design="Bold"></Label><FlexBox justifyContent="Center" height="20px" wrap="Wrap" width="100%"><Input value="{globalProperties>/MaterialByCustomer}" submit="onChangeSearchMaterialByCustomer" width="100%"\n\t\t\t\teditable="{path:\'globalProperties>/OutbDeliveryItemDetail/MaterialByCustomer\',formatter:\'.edit\'}"></Input></FlexBox><Label text="CustmerBatch" textAlign="Center" design="Bold"></Label><FlexBox justifyContent="Center" height="20px" wrap="Wrap" width="100%"><Input value="{globalProperties>/CustmerBatch}" width="100%"></Input></FlexBox><footer><Bar><contentRight><Button width="8em" text="Save" type="Emphasized" press="onPressPatch"/></contentRight></Bar></footer></Page></mvc:View>',
	"cie/pickConfirm/view/scan.view.xml":'<mvc:View controllerName="cie.pickConfirm.controller.scan" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:mvc="sap.ui.core.mvc"\n\tdisplayBlock="true" xmlns="sap.m" xmlns:core="sap.ui.core" height="100%" xmlns:table="sap.ui.table" xmlns:l="sap.ui.layout"\n\txmlns:t="sap.ui.table"><Page title="" showHeader="false" showNavButton="true" showSubHeader="true"><content><Label text="Outbound Delivery" textAlign="Center" design="Bold"></Label><FlexBox justifyContent="Center" height="20px" wrap="Wrap" width="100%"><Input value="{globalProperties>/DeliveryDocument}" submit="onChangeSearch"  maxLength="8" width="100%" id="id_DeliveryDocument"></Input></FlexBox></content></Page></mvc:View>'
}});

sap.ui.define(["cie/pickConfirm/controller/BaseController","cie/pickConfirm/model/formatter","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/ui/model/Filter","sap/ui/model/Context"],function(t,e,a,r,i,s){"use strict";return t.extend("cie.pickConfirm.controller.detail",{formatter:e,onInit:function(){this.oRouter=this.getRouter(this);this.oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched,this)},onObjectMatched:function(t){this._DeliveryDocument=t.getParameter("arguments").DeliveryDocument;this._DeliveryDocumentItem=t.getParameter("arguments").DeliveryDocumentItem;this.setGlobalProperty("/OutbDeliveryItemDetail",{});this.setGlobalProperty("/Batch","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");var e=this.getGlobalProperty("/OutbDeliveryItem");if(e.length==0){this.onChangeSearch()}else{this.setDetail()}jQuery.sap.delayedCall(1e3,this,function(){this.getView().byId("id_Batch").getFocusDomRef().focus()})},onPressCancel:function(){this.setGlobalProperty("/OutbDeliveryItemDetail",{});this.setGlobalProperty("/Batch","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");this.oRouter.navTo("list",{DeliveryDocument:this._DeliveryDocument})},onChangeSearch:function(){var t=[];var e=[];if(this._DeliveryDocument.length<8){return}this.globalBusyOn();var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var r=new sap.ui.model.odata.ODataModel(a);t.push(new i("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));e.push(new sap.ui.model.Sorter("ReferenceSDDocumentItem",true));e.push(new sap.ui.model.Sorter("DeliveryDocumentItem",false));var s={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/OutbDeliveryItem",this.onSort(t.results));this._length=t.results.length-1;this.onReadTable()}else{this.showWarning("No Data");this.globalBusyOff()}}.bind(this),error:function(t){}.bind(this)};var l="/A_OutbDeliveryItem";r.read(l,s)},onReadTable:function(){if(this._length>-1){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a=[];a.push(new i("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+this._length+"/Plant")));a.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+this._length+"/Material")));a.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItem/"+this._length+"/Batch")));var r={filters:a,success:function(t,e){if(t.results.length>0){this.setGlobalProperty("/OutbDeliveryItem/"+this._length+"/CustmerBatch",t.results[0].CustmerBatch)}this._length=this._length-1;this.onReadTable()}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var s="/YY1_MANAGE_CUSTOMER_BATCH";e.read(s,r)}else{this.setDetail();var l=this.getGlobalProperty("/OutbDeliveryItemDetail");if(l.ActualDeliveryQuantity=="0.000"){this.showInformation("Picking Completed!");this.oRouter.navTo("list",{DeliveryDocument:this._DeliveryDocument})}else{}this.setGlobalProperty("/MaterialByCustomer","");this.setGlobalProperty("/CustmerBatch","");this.setGlobalProperty("/Batch","");this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");this.globalBusyOff()}},onSort:function(t){t.sort(function(t,e){var a=t.DeliveryDocumentItem;var r=t.HigherLvlItmOfBatSpltItm;var i=e.DeliveryDocumentItem;var s=e.HigherLvlItmOfBatSpltItm;if(r!="000000"&&s!="000000"){if(r==s){if(a>i){return 1}else{return-1}}else{if(r>s){return 1}else{return-1}}}if(r=="000000"&&s=="000000"){if(a>i){return 1}else{return-1}}if(r=="000000"&&s!="000000"){if(a==s){if(a>s){return 1}else{return-1}}else{if(a>s){return 1}else{return-1}}}if(r!="000000"&&s=="000000"){if(r==i){if(a>i){return 1}else{return-1}}else{if(r>i){return 1}else{return-1}}}});return t},setDetail:function(){var t=this.getGlobalProperty("/OutbDeliveryItem");for(var e=0;e<t.length;e++){var a=t[e];if(a.DeliveryDocument==this._DeliveryDocument&&a.DeliveryDocumentItem==this._DeliveryDocumentItem){this.setGlobalProperty("/OutbDeliveryItemDetail",a);return}}},onCkeckDataA:function(){this.globalBusyOn();var t=[];t.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));t.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch")));var e="/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this._A_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate);this.onCkeckDataB()}else{this.showWarning("No Data")}this.globalBusyOff()}.bind(this),error:function(t){}.bind(this)};var s="/Batch";a.read(s,r)},onCkeckDataB:function(){this.globalBusyOn();var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";var a=new sap.ui.model.odata.ODataModel(e);t.push(new i("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));t.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));t.push(new i("MatlWrhsStkQtyInMatlBaseUnit",sap.ui.model.FilterOperator.GT,"0"));t.push(new i("StorageLocation",sap.ui.model.FilterOperator.NE,"C1A1"));var r={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/A_MaterialStock",t.results);this._length=t.results.length-1;this.deleteStoke()}else{this.showWarning("No Data")}this.globalBusyOff()}.bind(this),error:function(t){}.bind(this)};var s="A_MaterialStock('"+this.getGlobalProperty("/OutbDeliveryItemDetail/Material")+"')/to_MatlStkInAcctMod";a.read(s,r)},deleteStoke:function(){this.globalBusyOn();if(this._length>-1){var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);t.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/A_MaterialStock/"+this._length+"/Batch")));var r={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/A_MaterialStock/"+this._length+"/delete","X");this._length=this._length-1;this.deleteStoke()}else{this.setGlobalProperty("/A_MaterialStock/"+this._length+"/delete","");this._length=this._length-1;this.deleteStoke()}}.bind(this),error:function(t){this.globalBusyOff()}.bind(this)};var s="/A_OutbDeliveryItem";a.read(s,r)}else{var l=this.getGlobalProperty("/A_MaterialStock");for(var o=l.length-1;o>=0;o--){if(l[o].delete=="X"){l.splice(o,1)}}this.getGlobalProperty("/A_MaterialStock",l);this.globalBusyOff();this._length=l.length-1;this.onCkeckDataB2()}},onCkeckDataB2:function(){this.globalBusyOn();if(this._length>-1){var t=[];t.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/A_MaterialStock/"+this._length+"/Material")));t.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/A_MaterialStock/"+this._length+"/Batch")));var e="/destinations/S4HANACLOUD_BASIC/API_BATCH_SRV";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){if(this._B_ManufactureDate==""||this._B_ManufactureDate===undefined){this._B_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate)}else{if(this._B_ManufactureDate>this.resolvingDate(t.results[0].ManufactureDate)){this._B_ManufactureDate=this.resolvingDate(t.results[0].ManufactureDate)}}this._length=this._length-1;this.onCkeckDataB2()}else{this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};var s="/Batch";a.read(s,r)}else{if(this._B_ManufactureDate<this._A_ManufactureDate){this.showWarning("Data ERROE!")}else{this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit",this._MatlWrhsStkQtyInMatlBaseUnit)}this.globalBusyOff()}},onPressSearch:function(){this.setGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit","");var t=[];var e="/destinations/S4HANACLOUD_BASIC/API_MATERIAL_STOCK_SRV";var a=new sap.ui.model.odata.ODataModel(e);t.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));t.push(new i("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));t.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch")));t.push(new i("MatlWrhsStkQtyInMatlBaseUnit",sap.ui.model.FilterOperator.GT,0));var r={filters:t,success:function(t,e){debugger;if(t.results.length!=0){this._MatlWrhsStkQtyInMatlBaseUnit=t.results[0].MatlWrhsStkQtyInMatlBaseUnit;this.onCkeckDataA()}else{this.showWarning("No Batch")}}.bind(this),error:function(t){}.bind(this)};var s="/A_MatlStkInAcctMod?$expand=to_MaterialStock";a.read(s,r)},onPressPatch:function(){var t=this.getGlobalProperty("/Batch");var e=this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");if(t==""||t===undefined){this.showWarning("Batch No Data");return}if(e==""||e===undefined){this.showWarning("Delivery Quantity No Data");return}var a=this.getGlobalProperty("/MaterialByCustomer");var r=this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");if(a!=""&&a!=r){this.showWarning("Different From Customer Material");return}this.onSearchItem()},onSearchItem:function(){var t=[];t.push(new i("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));t.push(new i("DeliveryDocumentItem",sap.ui.model.FilterOperator.EQ,this._DeliveryDocumentItem));var e="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this._eTag=t.results[0].__metadata.etag;this.onPatch()}else{this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};var s="/A_OutbDeliveryItem";a.read(s,r)},onPatch:function(){var t=this.getGlobalProperty("/MatlWrhsStkQtyInMatlBaseUnit");if(t===undefined){t=0}t=parseFloat(t).toFixed(3);var e={ActualDeliveryQuantity:t,Batch:this.getGlobalProperty("/Batch")};var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var r=new sap.ui.model.odata.ODataModel(a);var i={success:function(t,e){if(e.statusCode==204){this.onGeterialNumber()}}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this),eTag:this._eTag,merge:true};var s="/A_OutbDeliveryItem(DeliveryDocument='"+this._DeliveryDocument+"',DeliveryDocumentItem='"+this._DeliveryDocumentItem+"')";r.update(s,e,i)},onAddSerialNumber:function(){var t=this.getGlobalProperty("/YY1_Batch_and_Serial");if(t.length>0){var e=[];e.push(new i("DeliveryDocument",sap.ui.model.FilterOperator.EQ,this._DeliveryDocument));e.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch")));var a="/destinations/S4HANACLOUD_BASIC/API_OUTBOUND_DELIVERY_SRV;v=0002";var r=new sap.ui.model.odata.ODataModel(a);var s={filters:e,success:function(e,a){if(e.results.length!=0){this._eTag=e.results[0].__metadata.etag;var i={urlParameters:{DeliveryDocument:"'"+e.results[0].DeliveryDocument+"'",DeliveryDocumentItem:"'"+e.results[0].DeliveryDocumentItem+"'",SerialNumber:"'"+this.getGlobalProperty("/YY1_Batch_and_Serial")[0].SerialNumber+"'"},success:function(e,a){if(a.statusCode==200){t.splice(0,1);this.setGlobalProperty("/YY1_Batch_and_Serial",t);this.onAddSerialNumber()}}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};r.setHeaders({"If-Match":this._eTag,"x-csrf-token":r.getSecurityToken()});var s="/AddSerialNumberToDeliveryItem";r.create(s,{},i)}else{this.showWarning("No Data")}}.bind(this),error:function(t){}.bind(this)};r.setHeaders({"X-CSRF-TOKEN":"FETCH"});var l="/A_OutbDeliveryItem";r.read(l,s)}if(t.length==0){this.onReadTableItem()}},onGeterialNumber:function(){var t=[];t.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));t.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch")));var e="/destinations/S4HANACLOUD_BASIC/YY1_BATCH_AND_SERIAL_CDS";var a=new sap.ui.model.odata.ODataModel(e);var r={filters:t,success:function(t,e){if(t.results.length!=0){this.setGlobalProperty("/YY1_Batch_and_Serial",t.results);this.onAddSerialNumber()}else{this.onReadTableItem()}}.bind(this),error:function(t){}.bind(this)};var s="/YY1_Batch_and_Serial";a.read(s,r)},onSaveTable:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a={Material:this.getGlobalProperty("/OutbDeliveryItemDetail/Material"),Plant:this.getGlobalProperty("/OutbDeliveryItemDetail/Plant"),Batch:this.getGlobalProperty("/Batch"),CustmerBatch:this.getGlobalProperty("/CustmerBatch")};var r={success:function(t,e){if(e.statusCode==201){this.onChangeSearch();this.showInformation("Save Success")}else{this.showWarning("No Data")}}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var i="/YY1_MANAGE_CUSTOMER_BATCH";e.create(i,a,r)},onReadTableItem:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a=[];a.push(new i("Plant",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Plant")));a.push(new i("Material",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/OutbDeliveryItemDetail/Material")));a.push(new i("Batch",sap.ui.model.FilterOperator.EQ,this.getGlobalProperty("/Batch")));var r={filters:a,success:function(t,e){if(t.results.length==0){this.onSaveTable()}else{this.SAP_UUID=t.results[0].SAP_UUID;this.onDeleteTableItem()}}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var s="/YY1_MANAGE_CUSTOMER_BATCH";e.read(s,r)},onDeleteTableItem:function(){var t="/destinations/S4HANACLOUD_BASIC/YY1_MANAGE_CUSTOMER_BATCH_CDS";var e=new sap.ui.model.odata.ODataModel(t);var a={success:function(t,e){if(e.statusCode==204){this.onSaveTable()}else{}}.bind(this),error:function(t){var e=$(t.response.body).find("message").first().text();this.showWarning(e)}.bind(this)};var r="/YY1_MANAGE_CUSTOMER_BATCH(guid'"+this.SAP_UUID+"')";e.remove(r,a)},onChangeSearchMaterialByCustomer:function(){var t=this.getGlobalProperty("/MaterialByCustomer");var e=this.getGlobalProperty("/OutbDeliveryItemDetail/MaterialByCustomer");if(t==""){return}if(t!=""&&t!=e){this.showWarning("Different From Customer Material!");return}else{this.showInformation("Material by customer is correct!")}},edit:function(t){if(t!=""){return true}else{return false}}})});
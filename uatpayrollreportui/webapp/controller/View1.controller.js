sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "com/mgc/uatpayrollreportui/util/XLSX",
    "com/mgc/uatpayrollreportui/util/FullMin",
    "com/mgc/uatpayrollreportui/util/JsZip",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/mgc/uatpayrollreportui/model/formatter",
    "com/mgc/uatpayrollreportui/util/moment",
    'sap/ui/core/library',
    'sap/ui/export/Spreadsheet',
    "sap/m/Token",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, XLSXFile, FullMin, JsZip, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, formatter, momentjs, coreLibrary, Spreadsheet, Token) {
        "use strict";
        var ValueState = coreLibrary.ValueState;
        return Controller.extend("com.mgc.uatpayrollreportui.controller.View1", {
            formatter: formatter,
            onInit: function () {
                //Import Fragment Table Binding
                this.localModel = new JSONModel();
                this.getView().setModel(this.localModel, "localModel");
                this.getUser(); // get current loggedin user
                /// batch service call for employee, activities
                var batchPromise = jQuery.Deferred();
                var sfBatchPromise = jQuery.Deferred();
                var valueHelpModel = new JSONModel();
                valueHelpModel.setSizeLimit(100000);
                this.getView().setModel(valueHelpModel, "valueHelp");
                sap.ui.core.BusyIndicator.show(-1);
                var oModel = this.getOwnerComponent().getModel();
                var oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl);
                var batchOperation0 = oDataModel.createBatchOperation("/Employees_prd?$format=json", "GET");
                var batchOperation1 = oDataModel.createBatchOperation("/WorkOrder_prd?$format=json", "GET");
                var batchOperation2 = oDataModel.createBatchOperation("/Job_prd?$format=json", "GET");
                var batchOperation3 = oDataModel.createBatchOperation("/Activities_prd?$format=json", "GET");
                var batchArray = [batchOperation0, batchOperation1, batchOperation2, batchOperation3];
                oDataModel.addBatchReadOperations(batchArray);
                oDataModel.submitBatch(function (oResult) {
                    try {
                        this.getView().getModel("valueHelp").setProperty("/emp", oResult.__batchResponses[0].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/workOrder", oResult.__batchResponses[1].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/job", oResult.__batchResponses[2].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/activities", oResult.__batchResponses[3].data.results);
                    } catch (err) { }
                    this.getView().getModel("valueHelp").refresh();
                    batchPromise.resolve();
                    //sap.ui.core.BusyIndicator.hide();
                }.bind(this), function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(this.getResourceBundle().getText("errorBatch"));
                }.bind(this));
                /// sf costcenter f4 help ///
                var sfModel = this.getOwnerComponent().getModel("v2");
                var oSFDataModel = new sap.ui.model.odata.ODataModel(sfModel.sServiceUrl);
                // success factor batch call
                var batchOperation4 = oSFDataModel.createBatchOperation("/FOCostCenter?$format=json", "GET");
                var batchOperation5 = oSFDataModel.createBatchOperation("/FOCompany?$format=json", "GET");
                var batchOperation6 = oSFDataModel.createBatchOperation("/cust_paycode?$format=json", "GET");
                var batchOperation7 = oSFDataModel.createBatchOperation("/PayPeriod?$filter=PayCalendar_payGroup eq 'MGBWLY'&$format=JSON", "GET");
                var batchOperation8 = oSFDataModel.createBatchOperation("/cust_allowance?$format=json", "GET");
                var batchOperation9 = oSFDataModel.createBatchOperation("/cust_location?$format=json", "GET");
                var batchOperation10 = oSFDataModel.createBatchOperation("/FOLocation?$format=json", "GET");
                var sfBatchArray = [batchOperation4, batchOperation5, batchOperation6, batchOperation7, batchOperation8, batchOperation9, batchOperation10];
                oSFDataModel.addBatchReadOperations(sfBatchArray);
                oSFDataModel.submitBatch(function (oResult) {
                    //console.log(oResult)
                    try {
                        this.getView().getModel("valueHelp").setProperty("/costcenter", oResult.__batchResponses[0].data.results);
                    } catch (err) { }
                    try {
                        var company = [];
                        var companyRecords = oResult.__batchResponses[1].data.results;
                        for (var i = 0; i < companyRecords.length; i++) {
                            if (companyRecords[i].externalCode == "6002" || companyRecords[i].externalCode == "2006" || companyRecords[i].externalCode == "2002") {
                                company.push(companyRecords[i]);
                            }
                        }
                        this.getView().getModel("valueHelp").setProperty("/company", company);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/paycodeall", oResult.__batchResponses[2].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/payperiod", oResult.__batchResponses[3].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/cost_allowance", oResult.__batchResponses[4].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/location", oResult.__batchResponses[5].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/subarea", oResult.__batchResponses[6].data.results);
                    } catch (err) { }
                    sfBatchPromise.resolve();
                    //sap.ui.core.BusyIndicator.hide();
                }.bind(this), function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(this.getResourceBundle().getText("errorSFBatch"));
                }.bind(this));
                // hide busy indicator after batch callls by using promise
                $.when(batchPromise, sfBatchPromise).done(
                    function () {
                        sap.ui.core.BusyIndicator.hide();
                    });
            },
            getBaseURL: function () {
                return sap.ui.require.toUrl("com/mgc/uatpayrollreportui");
            },
            getUser: function () {
                var that = this;
                //get logged in user details
                const e = this.getBaseURL() + "/user-api/currentUser";
                $.ajax({
                    url: e,
                    type: "GET",
                    success: function (e) {
                        // that.loginName = e.firstname;
                        //that.logedinEmail = e.email;
                        that.getUserDetails(e.firstname);
                    },
                    error: function (e) {
                        //console.log(e);
                        MessageBox.error(that.getResourceBundle().getText("errorUser"));
                    }
                });
            },
            getUserDetails: function (empNo) {
                // get employee details from Employees table
                var oFilterValues = [];
                /// Filter for Service call
                var emp = new sap.ui.model.Filter({
                    path: "ID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: empNo,
                });
                oFilterValues.push(emp);
                this.getOwnerComponent().getModel().read("/Employees_prd", {
                    filters: oFilterValues,
                    success: function (odata) {
                        //console.log(odata);
                        try {
                            this.loginName = odata.results[0].FirstName + " " + odata.results[0].LastName;
                            this.logedinEmail = odata.results[0].Email;
                        } catch (err) {
                            this.loginName = "";
                            this.logedinEmail = "";
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getView().byId("listTab").setBusy(false);
                    }.bind(this)
                });
            },
            oSelectedFilters: function () {
                var sStartDate = this.getView().byId("idStartDate").getDateValue();
                var sFinishDate = this.getView().byId("idFinishDate").getDateValue();
                var sPayPeriod = this.getView().byId("idPayPeriodComboBox").getValue();
                if ((sStartDate == null || sFinishDate == null) && sPayPeriod == "") {
                    this.getView().byId("idPayPeriodComboBox").setValueState("Error");
                    this.getView().byId("idStartDate").setValueState("Error");
                    this.getView().byId("idStartDate").setValueStateText(this.getResourceBundle().getText("errorStartDateMandatory"));
                    this.getView().byId("idFinishDate").setValueStateText(this.getResourceBundle().getText("errorFinishDateMandatory"));
                    this.getView().byId("idFinishDate").setValueState("Error");
                    return;
                }
                else if (sStartDate > sFinishDate) {
                    this.getView().byId("idStartDate").setValueState("Error");
                    this.getView().byId("idStartDate").setValueStateText(this.getResourceBundle().getText("errorValidDate"));
                    this.getView().byId("idFinishDate").setValueStateText(this.getResourceBundle().getText("errorValidDate"));
                    this.getView().byId("idFinishDate").setValueState("Error");
                    return;
                }
                else {
                    this.getView().byId("idPayPeriodComboBox").setValueState("None");
                    this.getView().byId("idStartDate").setValueState("None");
                    this.getView().byId("idFinishDate").setValueState("None");
                    this.getView().byId("idStartDate").setValueStateText("");
                    this.getView().byId("idFinishDate").setValueStateText("");

                    // Timesheet details
                    var oFilterValues = [];
                    /// Filters for Service call
                    if (sPayPeriod != "") { // if pay period filter selected
                        var data = this.getView().getModel("valueHelp").getData().payperiod;
                        for (var i = 0; i < data.length; i++) {
                            if (sPayPeriod == data[i].processingRunId) {
                                if (data[i].payPeriodBeginDate == null || data[i].payPeriodEndDate == null) {
                                    MessageBox.error(this.getResourceBundle().getText("invalidDataForPayPeriod"));
                                    return;
                                }
                                var sBeginYear = data[i].payPeriodBeginDate.getFullYear();
                                var sBeginMonth = data[i].payPeriodBeginDate.getMonth() + 1;
                                var sBeginDate = data[i].payPeriodBeginDate.getDate();
                                sBeginMonth = sBeginMonth >= 10 ? sBeginMonth : "0" + sBeginMonth;
                                sBeginDate = sBeginDate >= 10 ? sBeginDate : "0" + sBeginDate;
                                var sEndYear = data[i].payPeriodEndDate.getFullYear();
                                var sEndMonth = data[i].payPeriodEndDate.getMonth() + 1;
                                var sEndDate = data[i].payPeriodEndDate.getDate();
                                sEndMonth = sEndMonth >= 10 ? sEndMonth : "0" + sEndMonth;
                                sEndDate = sEndDate >= 10 ? sEndDate : "0" + sEndDate;
                                var sBeginDateVal = sBeginYear + "-" + sBeginMonth + "-" + sBeginDate;
                                var sEndDateVal = sEndYear + "-" + sEndMonth + "-" + sEndDate;
                                // filter for payperiod selection
                                var PayPeriodBeginDate = new sap.ui.model.Filter({
                                    path: "PayPeriodBeginDate",
                                    operator: sap.ui.model.FilterOperator.EQ,
                                    value1: sBeginDateVal
                                });
                                oFilterValues.push(PayPeriodBeginDate);
                                var PayPeriodEndDate = new sap.ui.model.Filter({
                                    path: "PayPeriodEndDate",
                                    operator: sap.ui.model.FilterOperator.EQ,
                                    value1: sEndDateVal
                                });
                                oFilterValues.push(PayPeriodEndDate);
                                break;
                            }
                        }
                    }
                    else {
                        // filter for start date and end date
                        var sBeginDateVal = this.getView().byId("idStartDate").getValue();
                        var sEndDateVal = this.getView().byId("idFinishDate").getValue();
                        var DateRange = new sap.ui.model.Filter({
                            path: "Date",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: sBeginDateVal,
                            value2: sEndDateVal
                        });
                        oFilterValues.push(DateRange);
                    }
                    // filter for resource
                    var resourceValue = this.getView().byId("resourceInput").getValue();
                    resourceValue == "" ? (this.selectedRes = "") : this.selectedRes;
                    if (resourceValue != "" && this.selectedRes != undefined && this.selectedRes != "") {
                        var selectedResource = new sap.ui.model.Filter({
                            path: "EmployeeID",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.selectedRes
                        });
                        oFilterValues.push(selectedResource);
                    }
                    // filter for company code
                    var companyCodeValue = this.getView().byId("companyInput").getValue();
                    companyCodeValue == "" ? (this.CompanyCode = "") : this.CompanyCode;
                    if (companyCodeValue != "" && this.CompanyCode != undefined && this.CompanyCode != "") {
                        var selectedCompany = new sap.ui.model.Filter({
                            path: "CompanyID",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.CompanyCode
                        });
                        oFilterValues.push(selectedCompany);
                    }
                    // filter for timesheet status
                    var TimesheetStatusSelection = this.getView().byId("idTimesheetStatusSelection").getValue();
                    if (TimesheetStatusSelection != "") {
                        var Operator = "";
                        if (TimesheetStatusSelection == "Approved") {
                            Operator = sap.ui.model.FilterOperator.EQ;
                        }
                        else {
                            Operator = sap.ui.model.FilterOperator.NE;
                            TimesheetStatusSelection = "Approved";
                        }
                        var selectedTimeSheetStatus = new sap.ui.model.Filter({
                            path: "SaveSubmitStatus",
                            operator: Operator,
                            value1: TimesheetStatusSelection
                        });
                        oFilterValues.push(selectedTimeSheetStatus);
                    }
                    // filter for payroll status
                    var PayrollStatusSelection = this.getView().byId("idPayrollStatus").getValue();
                    if (PayrollStatusSelection != "") {
                        var Operator = "";
                        if (PayrollStatusSelection == "Executed") {
                            Operator = sap.ui.model.FilterOperator.EQ;
                        }
                        else {
                            Operator = sap.ui.model.FilterOperator.NE;
                            PayrollStatusSelection = "Executed";
                        }
                        var selectedTimeSheetStatus = new sap.ui.model.Filter({
                            path: "PayrollApprovalStatus",
                            operator: Operator,
                            value1: PayrollStatusSelection
                        });
                        oFilterValues.push(selectedTimeSheetStatus);
                    }
                    // subarea
                    var subareaInput = this.getView().byId("idSubarea").getTokens();
                    for (let i = 0; i < subareaInput.length; i++) {
                        var selectedSubArea = new sap.ui.model.Filter({
                            path: "PersonnelSubArea",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: subareaInput[i].getText()
                        });
                        oFilterValues.push(selectedSubArea);
                    }

                    var locInput = this.getView().byId("idLocation").getTokens();
                    // Location Selection
                    for (let i = 0; i < locInput.length; i++) {
                        var oLocaiton = new sap.ui.model.Filter({
                            path: "LocationCode",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: locInput[i].getText()
                        });
                        oFilterValues.push(oLocaiton);
                    }
                    return oFilterValues;
                }
            },
            onSearch: function () { // on press go button 
                var oFilterValues = this.oSelectedFilters(); // get selected filters
                if (oFilterValues == undefined) {
                    return;
                }
                var payrollModel = new JSONModel();
                this.getView().setModel(payrollModel, "payroll");
                this.getView().byId("listTab").setBusy(true);
                var timePeriodPromise = jQuery.Deferred();
                // get details with selected filters from TimeSheetDetails
                this.getOwnerComponent().getModel().read("/TimeSheetDetails_prd", {
                    filters: oFilterValues,
                    urlParameters: { "$select": "Date,EmployeeID,EmployeeName,PayPeriodBeginDate,PayPeriodEndDate,CompanyID,CompanyName,OverTime,RegularTime,TotalHours,TotalHoursPercentage,SaveSubmitStatus,PayrollApprovalStatus,PayrollApprovalName,PayCode,OtThreshold,AppName,CostCenter,Activity,WorkOrder,Job,Section,Phase" },
                    success: function (odata) {
                        this.completeResponse = odata.results;
                        timePeriodPromise.resolve(odata.results);
                    }.bind(this),
                    error: function (oError) {
                        this.getView().byId("listTab").setBusy(false);
                        MessageBox.error(this.getResourceBundle().getText("errorTimesheet"));
                    }.bind(this)
                });
                $.when(timePeriodPromise).done(
                    function (TimePeriodData) { // arrange cumulative data for payroll report
                        var finalArray = [];
                        TimePeriodData.forEach(oItem => {
                            // condition calculate date for employee ID, payperiod begin date, payperiod end date
                            let iIndex = finalArray.findIndex(oFindObj => { return oFindObj.EmployeeID == oItem.EmployeeID && oFindObj.PayPeriodBeginDate == oItem.PayPeriodBeginDate && oFindObj.PayPeriodEndDate == oItem.PayPeriodEndDate });
                            if (iIndex === -1) {
                                let obj = {};
                                let arrFilterObjs = TimePeriodData.filter(obj => { return obj.EmployeeID == oItem.EmployeeID && obj.PayPeriodBeginDate == oItem.PayPeriodBeginDate && obj.PayPeriodEndDate == oItem.PayPeriodEndDate });
                                arrFilterObjs.forEach((oArr, index) => {
                                    obj.EmployeeID = oArr.EmployeeID;
                                    obj.EmployeeName = oArr.EmployeeName;
                                    obj.PayPeriodBeginDate = oArr.PayPeriodBeginDate;
                                    obj.PayPeriodEndDate = oArr.PayPeriodEndDate;
                                    if (oArr.PayCode != '1095' && oArr.PayCode != '1225' && oArr.PayCode != 'BOA' && oArr.PayCode != 'BT' && oArr.PayCode != 'BSP' && oArr.PayCode != 'BN' && oArr.PayCode != '1230' && oArr.PayCode != '1070') {
                                        obj.TotalHoursPercentage = obj.TotalHoursPercentage == undefined ? 0 : obj.TotalHoursPercentage;
                                        obj.TotalHoursPercentage = (index == 0 ? Number(oArr.TotalHoursPercentage) : obj.TotalHoursPercentage + Number(oArr.TotalHoursPercentage));
                                    }
                                    obj.CompanyName = oArr.CompanyName;
                                    obj.OverTime = (index == 0 ? Number(oArr.OverTime) : obj.OverTime + Number(oArr.OverTime));
                                    obj.RegularTime = (index == 0 ? Number(oArr.RegularTime) : obj.RegularTime + Number(oArr.RegularTime));
                                    ////obj.TotalHoursPercentage = (index == 0 ? oArr.TotalHoursPercentage : (obj.TotalHoursPercentage + "#" + oArr.TotalHoursPercentage));
                                    obj.SaveSubmitStatus = (index == 0 ? oArr.SaveSubmitStatus : (obj.SaveSubmitStatus + "#" + oArr.SaveSubmitStatus));
                                    obj.PayrollApprovalStatus = (index == 0 ? oArr.PayrollApprovalStatus : (obj.PayrollApprovalStatus + "#" + oArr.PayrollApprovalStatus));
                                    //obj.PayrollApprovalStatus = (oArr.PayrollApprovalStatus !== "Executed" ? "Not Executed" : "Executed");
                                    obj.PayrollApprovalName = oArr.PayrollApprovalName;
                                    obj.PayCode = (index == 0 ? oArr.PayCode : (obj.PayCode + "#" + oArr.PayCode));
                                    obj.OtThreshold = oArr.OtThreshold;
                                    obj.EmployeeID = oArr.EmployeeID;
                                    /*if (obj.RegularTime > obj.OtThreshold && (obj.OtThreshold != null && obj.OtThreshold != "")) {
                                        obj.OverTime = obj.RegularTime - obj.OtThreshold;
                                        obj.RegularTime = obj.OtThreshold;
                                    }*/
                                });
                                // push objects if the employee id,emp name,payperiod being date is available
                                if (obj.EmployeeID !== "" && obj.EmployeeName !== null && obj.PayPeriodBeginDate !== null && obj.PayPeriodBeginDate !== "") {
                                    obj.SaveSubmitStatus = formatter.SaveSubmitStatusText(obj.SaveSubmitStatus);
                                    obj.PayrollApprovalStatus = formatter.PayrollApprovalStatusText(obj.PayrollApprovalStatus);
                                    obj.PayCode = formatter.PayCodeCount(obj.PayCode);
                                    finalArray.push(obj);
                                }
                            }
                        });
                        if (finalArray.length == 0) {
                            MessageBox.information(this.getResourceBundle().getText("infoNoata"));
                        }
                        this.getView().getModel("payroll").setProperty("/timesheetData", finalArray);
                        this.getView().getModel("payroll").refresh();
                        this.getView().byId("listTab").setBusy(false);
                    }.bind(this));
            },
            // Import holiday list
            onPressImportHoliday: function (oEvent) {
                if (!this._oImportHolidayDialog) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.ImportHoliday",
                        controller: this
                    }).then(function (oDialog) {
                        this._oImportHolidayDialog = oDialog;
                        this.getView().addDependent(oDialog);
                        this._oImportHolidayDialog.open();
                    }.bind(this));
                } else {
                    this._oImportHolidayDialog.open();
                    this.getView().getModel("localModel").getData().items = [];
                    this.getView().getModel("localModel").refresh();
                    sap.ui.getCore().byId("idFileUploader").setValue("");
                }
            },
            // upload file
            onUpload: function (oEvent) {
                this._import(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);
            },
            // arrange imported data into import holiday table
            _import: function (file) {
                var that = this;
                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Here is your object for every sheet in workbook
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        });
                        // Setting the data to the local model 
                        that.localModel.setData({
                            items: excelData
                        });
                        that.localModel.refresh(true);
                    };
                    reader.onerror = function (ex) {
                        MessageBox.error(ex);
                    };
                    reader.readAsBinaryString(file);
                }
            },
            // select resources only from F4 popups
            onChangeResource: function (oEvent) {
                oEvent.getSource().setValue("");
                MessageToast.show(this.getResourceBundle().getText("selectF4"));
                if (oEvent.getSource().getValue() == "") {
                    this.selectedRes = "";
                }
            },
            // filter employees
            onSearchEmployee: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var FirstName = new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, sQuery);
                var LastName = new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.Contains, sQuery);
                var EmployeeID = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([FirstName, LastName, EmployeeID]);
                var listassign = sap.ui.getCore().byId("idEmpTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // resource selection
            onSelectEmployee: function (oEvent) {
                var oSelectedPath = oEvent.getSource().getBindingContextPath();
                var oObj = this.getView().getModel("valueHelp").getProperty(oSelectedPath);
                this.selectedRes = oObj.ID;
                this.getView().byId("resourceInput").setValue(oObj.FirstName);
                this.oResourcesF4HelpCancel();
            },
            // filter company
            onSearchCompany: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var externalCode = new sap.ui.model.Filter("externalCode", sap.ui.model.FilterOperator.Contains, sQuery);
                var name = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                var country = new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([externalCode, name, country]);
                var listassign = sap.ui.getCore().byId("idCompanyTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // resource company
            onSelectCompany: function (oEvent) {
                var oSelectedPath = oEvent.getSource().getBindingContextPath();
                var oObj = this.getView().getModel("valueHelp").getProperty(oSelectedPath);
                this.CompanyCode = oObj.externalCode;
                this.getView().byId("companyInput").setValue(oObj.name);
                this.oCompanyF4HelpCancel();
            },
            // filter jobs
            onSearchJob: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var Name = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
                var ID = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sQuery);
                var Description = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([ID, Name, Description]);
                var listassign = sap.ui.getCore().byId("idJobTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // Job selection
            onSelectJob: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedJobPath);
                sSelectedValue.Job = sObj.ID;//sObj.Name;
                sSelectedValue.CostCenter = "";
                sSelectedValue.Activity = "";
                sSelectedValue.WorkOrder = "";
                sSelectedValue.JobValueState = "None";
                this.JobID = sObj.ID;
                this.getView().getModel("timePeriod").refresh();
                this.oJobF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedJobPath); // update indicator with X for approved objects
            },
            // filter work order
            onSearchWorkOrder: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var Name = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
                var Description = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery);
                var ID = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([Name, Description, ID]);
                var listassign = sap.ui.getCore().byId("idWorkOrderTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // Work Order selection
            onSelectWorkOrder: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedWorkOrderPath);
                sSelectedValue.WorkOrder = sObj.ID;//sObj.Name;
                sSelectedValue.CostCenter = "";
                sSelectedValue.Activity = "";
                sSelectedValue.Job = "";
                sSelectedValue.Section = "";
                sSelectedValue.Phase = "";
                this.getView().getModel("timePeriod").refresh();
                this.oWorkOrderF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedWorkOrderPath); // update indicator with X for approved objects
            },
            // filter section
            onSearchSection: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var Name = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
                var Description = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery);
                var Section = new sap.ui.model.Filter("Section", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([Name, Description, Section]);
                var listassign = sap.ui.getCore().byId("idSectionTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // Section selection
            onSelectSection: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedSectionPath);
                sSelectedValue.Section = sObj.ID;// sObj.Name;
                sSelectedValue.WorkOrder = "";
                sSelectedValue.CostCenter = "";
                sSelectedValue.Activity = "";
                sSelectedValue.SectionValueState = "None"
                this.SectionID = sObj.ID;
                this.getView().getModel("timePeriod").refresh();
                this.oSectionF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedSectionPath); // update indicator with X for approved objects
            },
            // filter phase code
            onSearchPhase: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var Name = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
                var Description = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([Name, Description]);
                var listassign = sap.ui.getCore().byId("idPhaseCodeTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // Section phase code
            onSelectPhase: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedPhaseCodePath);
                sSelectedValue.Phase = sObj.ID;//sObj.Name;
                sSelectedValue.CostCenter = "";
                sSelectedValue.Activity = "";
                sSelectedValue.WorkOrder = "";
                this.getView().getModel("timePeriod").refresh();
                this.oPhaseF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedPhaseCodePath); // update indicator with X for approved objects
            },
            // filter cost center
            onSearchCostCenter: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var ID = new sap.ui.model.Filter("costcenterExternalObjectID", sap.ui.model.FilterOperator.Contains, sQuery);
                var Name = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                var Description = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([ID, Name, Description]);
                var listassign = sap.ui.getCore().byId("idCostCenterTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // costcenter selection
            onSelectCostCenter: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedCostCenterPath);
                sSelectedValue.CostCenter = sObj.costcenterExternalObjectID;//sObj.name;
                sSelectedValue.WorkOrder = "";
                sSelectedValue.Job = "";
                sSelectedValue.Section = "";
                sSelectedValue.Phase = "";
                this.getView().getModel("timePeriod").refresh();
                this.oCostCenterF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedCostCenterPath); // update indicator with X for approved objects
            },
            // filter activity 
            onSearchActivity: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var ActivityID = new sap.ui.model.Filter("ActivityID", sap.ui.model.FilterOperator.Contains, sQuery);
                var ActivityName = new sap.ui.model.Filter("ActivityName", sap.ui.model.FilterOperator.Contains, sQuery);
                var filters = new sap.ui.model.Filter([ActivityID, ActivityName]);
                var listassign = sap.ui.getCore().byId("idActivityTable");
                listassign.getBinding("items").filter(filters, "Appliation");
            },
            // costcenter activity
            onSelectActivity: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                var sSelectedValue = this.getView().getModel("timePeriod").getProperty(this.oSelectedActivityPath);
                sSelectedValue.Activity = sObj.ActivityID;
                this.getView().getModel("timePeriod").refresh();
                this.oActivityF4HelpCancel();
                this.UpdateIndicatorValue(oEvent, this.oSelectedActivityPath); // update indicator with X for approved objects
            },
            // select payperiod
            onSelectPayPeriod: function (oEvent) {
                var sSelectedPath = oEvent.getSource().getBindingContextPath();
                var sObj = this.getView().getModel("valueHelp").getProperty(sSelectedPath);
                this.getView().byId("idPayPeriodComboBox").setValue(sObj.processingRunId);
                this.oPayPeriodF4HelpCancel();
                this.getView().byId("idStartDate").setDateValue();
                this.getView().byId("idFinishDate").setDateValue();
                this.getView().byId("idStartDate").setEnabled(false);
                this.getView().byId("idFinishDate").setEnabled(false);
            },
            //filter location
            onLocationSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var externalCode = new Filter(
                    "externalCode",
                    FilterOperator.Contains,
                    sValue
                );
                var defaultVal = new Filter(
                    "externalName_defaultValue",
                    FilterOperator.Contains,
                    sValue
                );
                var filters = new sap.ui.model.Filter([externalCode, defaultVal]);
                evt.getSource().getBinding("items").filter(filters, "Appliation");
            },
            //select location
            onConfirmLocation: function (evt) {
                var aSelectedItems = evt.getParameter("selectedItems"),
                    oMultiInput = this.getView().byId("idLocation"),
                    tokens = oMultiInput.getTokens();
                if (aSelectedItems && aSelectedItems.length > 0) {
                    aSelectedItems.forEach(function (oItem) {
                        for (var i = 0; i < tokens.length; i++) {
                            if (tokens[i].getText() == oItem.getTitle()) {
                                return;
                            }
                        }
                        oMultiInput.addToken(new Token({
                            text: oItem.getTitle()
                        }));
                    });
                }
            },
            //filter subarea
            onSubAreaSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var externalCode = new Filter(
                    "externalCode",
                    FilterOperator.Contains,
                    sValue
                );
                var sName = new Filter(
                    "name",
                    FilterOperator.Contains,
                    sValue
                );
                var filters = new sap.ui.model.Filter([externalCode, sName]);
                evt.getSource().getBinding("items").filter(filters, "Appliation");
            },
             //select subarea
             onConfirmSubArea: function (evt) {
                var aSelectedItems = evt.getParameter("selectedItems"),
                    oMultiInput = this.getView().byId("idSubarea"),
                    tokens = oMultiInput.getTokens();
                if (aSelectedItems && aSelectedItems.length > 0) {
                    aSelectedItems.forEach(function (oItem) {
                        for (var i = 0; i < tokens.length; i++) {
                            if (tokens[i].getText() == oItem.getTitle()) {
                                return;
                            }
                        }
                        oMultiInput.addToken(new Token({
                            text: oItem.getTitle()
                        }));
                    });
                }
            },
            oPayPeriodF4HelpCancel: function () {
                this.PayPeriodF4Help.close();
            },
            importDialogClose: function (OEvent) {
                this._oImportHolidayDialog.close();
            },
            // load resouce fragment
            onResourceF4: function () {
                if (!this.ResourcesF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.ResourcesF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.ResourcesF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.ResourcesF4Help.open();
                    }.bind(this));
                } else {
                    this.ResourcesF4Help.open();
                }
            },
            // load company fragment
            onCompanyF4: function () {
                if (!this.CompanyF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.CompanyF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.CompanyF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.CompanyF4Help.open();
                    }.bind(this));
                } else {
                    this.CompanyF4Help.open();
                }
            },
            // load payperiod fragment
            onPayPeriodF4: function () {
                if (!this.PayPeriodF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.PayPeriodF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.PayPeriodF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.PayPeriodF4Help.open();
                    }.bind(this));
                } else {
                    this.PayPeriodF4Help.open();
                }
            },
            //load subarea fragment
            onSubAreaF4: function () {
                if (!this.PersonalSubAreaF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.PersonalSubAreaF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.PersonalSubAreaF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.PersonalSubAreaF4Help.open();
                    }.bind(this));
                } else {
                    this.PersonalSubAreaF4Help.open();
                }
            },
            //load location fragment
            onLocationF4: function () {
                if (!this.LocationF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.LocationF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.LocationF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.LocationF4Help.open();
                    }.bind(this));
                } else {
                    this.LocationF4Help.open();
                }
            },
            // load job fragment
            onJobF4: function (oEvent) {
                this.oSelectedJobPath = oEvent.getSource().getParent().getBindingContextPath();
                if (!this.JobF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.JobsF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.JobF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.JobF4Help.open();
                    }.bind(this));
                } else {
                    this.JobF4Help.open();
                }
            },
            // load workorder fragment
            onWorkOrderF4: function (oEvent) {
                this.oSelectedWorkOrderPath = oEvent.getSource().getParent().getBindingContextPath();
                if (!this.WorkOrderF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.WorkOrderF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.WorkOrderF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.WorkOrderF4Help.open();
                    }.bind(this));
                } else {
                    this.WorkOrderF4Help.open();
                }
            },
            // load section fragment
            onSectionF4: function (oEvent) {
                this.oSelectedSectionPath = oEvent.getSource().getParent().getBindingContextPath();
                var oObj = this.getView().getModel("timePeriod").getProperty(this.oSelectedSectionPath);
                // Condition to check Job is available then make section sevice call 
                if (oObj.Job == "" || oObj.Job == null) {
                    MessageBox.error(this.getResourceBundle().getText("errorSelectJob"));
                    this.getView().getModel("timePeriod").getProperty(this.oSelectedSectionPath).JobValueState = "Error";
                    this.getView().getModel("timePeriod").refresh();
                    return;
                }
                else {
                    this.getView().getModel("timePeriod").getProperty(this.oSelectedSectionPath).JobValueState = "None";
                    this.getView().getModel("timePeriod").refresh();
                }
                var oFilterValues = [];
                // Filter for Service call
                var oJobId = new sap.ui.model.Filter({
                    path: "Jobs",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.JobID
                });
                oFilterValues.push(oJobId);
                // get data for section 
                this.getOwnerComponent().getModel().read("/Section_prd", {
                    filters: oFilterValues,
                    success: function (odata) {
                        this.getView().getModel("valueHelp").setProperty("/section", odata.results);
                        this.getView().getModel("valueHelp").refresh();
                        sap.ui.getCore().byId("idSectionTable").setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        sap.ui.getCore().byId("idSectionTable").setBusy(false);
                        MessageBox.error(this.getResourceBundle().getText("errorSection"));
                    }.bind(this)
                });
                // load Section fragment
                if (!this.SectionF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.SectionF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.SectionF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.SectionF4Help.open();
                        sap.ui.getCore().byId("idSectionTable").setBusy(true);
                    }.bind(this));
                } else {
                    this.SectionF4Help.open();
                }
            },
            // load costcenter fragment
            onCostCenterF4: function (oEvent) {
                this.oSelectedCostCenterPath = oEvent.getSource().getParent().getBindingContextPath();
                if (!this.CostCenterF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.CostCenterF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.CostCenterF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.CostCenterF4Help.open();
                    }.bind(this));
                } else {
                    this.CostCenterF4Help.open();
                }
            },
            // load activity fragment
            onActivityF4: function (oEvent) {
                this.oSelectedActivityPath = oEvent.getSource().getParent().getBindingContextPath();
                if (!this.ActivityF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.ActivityF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.ActivityF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.ActivityF4Help.open();
                    }.bind(this));
                } else {
                    this.ActivityF4Help.open();
                }
            },
            oActivityF4HelpCancel: function () {
                this.ActivityF4Help.close();
            },
            oCompanyF4HelpCancel: function () {
                this.CompanyF4Help.close();
            },
            // load phase fragment
            onPhaseCodeF4: function (oEvent) {
                this.oSelectedPhaseCodePath = oEvent.getSource().getParent().getBindingContextPath();
                var oObj = this.getView().getModel("timePeriod").getProperty(this.oSelectedPhaseCodePath);
                // check condition if Section is available then make a service call for Phase
                if (oObj.Section == "" || oObj.Section == null) {
                    MessageBox.error(this.getResourceBundle().getText("errorSelectSection"));
                    this.getView().getModel("timePeriod").getProperty(this.oSelectedPhaseCodePath).SectionValueState = "Error";
                    this.getView().getModel("timePeriod").refresh();
                    return;
                }
                else {
                    this.getView().getModel("timePeriod").getProperty(this.oSelectedPhaseCodePath).SectionValueState = "None";
                    this.getView().getModel("timePeriod").refresh();
                }
                var oFilterValues = [];
                // Filters for Service call
                var oSectionId = new sap.ui.model.Filter({
                    path: "Section",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.SectionID
                });
                oFilterValues.push(oSectionId);
                this.getOwnerComponent().getModel().read("/Phase_prd", {
                    filters: oFilterValues,
                    success: function (odata) {
                        this.getView().getModel("valueHelp").setProperty("/phase", odata.results);
                        this.getView().getModel("valueHelp").refresh();
                    }.bind(this),
                    error: function (oError) {
                        MessageBox.error(this.getResourceBundle().getText("errorPhase"));
                    }.bind(this)
                });
                //load phase fragment
                if (!this.PhaseCodeF4Help) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.PhaseCodeF4Help",
                        controller: this
                    }).then(function (oDialog) {
                        this.PhaseCodeF4Help = oDialog;
                        this.getView().addDependent(oDialog);
                        this.PhaseCodeF4Help.open();
                    }.bind(this));
                } else {
                    this.PhaseCodeF4Help.open();
                }
            },
            oLocationF4HelpCancel: function () {
                this.LocationF4Help.close();
            },
            oSubAreaF4HelpCancel: function () {
                this.PersonalSubAreaF4Help.close();
            },
            oPhaseF4HelpCancel: function () {
                this.PhaseCodeF4Help.close();
            },
            oCostCenterF4HelpCancel: function () {
                this.CostCenterF4Help.close();
            },
            oSectionF4HelpCancel: function () {
                this.SectionF4Help.close();
            },
            oWorkOrderF4HelpCancel: function () {
                this.WorkOrderF4Help.close();
            },
            oJobF4HelpCancel: function () {
                this.JobF4Help.close();
            },
            oResourcesF4HelpCancel: function () {
                this.ResourcesF4Help.close();
            },
            onTimePeriodListItemSelect: function (oEvent) {
                var oSelectedPath = oEvent.getSource().getBindingContextPath();
                var oSelectedData = this.getView().getModel("payroll").getProperty(oSelectedPath);
                // var TotalHoursForPopup = formatter.TotalHoursCalculation(oSelectedData.PayCode, oSelectedData.TotalHoursPercentage);
                var TotalHoursForPopup = oSelectedData.TotalHoursPercentage;
                if (oSelectedData.PayPeriodBeginDate == null || oSelectedData.PayPeriodEndDate == null) {
                    MessageBox.error(this.getResourceBundle().getText("errorInvalidData"));
                    return;
                }
                // get paycode for selected employee
                var empInfo = this.getView().getModel("valueHelp").getData().emp;
                var empSubarea = empInfo.filter(function (emp) {
                    if (oSelectedData.EmployeeID == emp.ID) {
                        return emp.PersonnelSubArea;
                    }
                });
                //load timeperiod fragment
                if (!this._oImportTimePeriodDialog) {
                    Fragment.load({
                        name: "com.mgc.uatpayrollreportui.fragment.TimePeriod",
                        controller: this
                    }).then(function (oDialog) {
                        this._oImportTimePeriodDialog = oDialog;
                        this.getView().addDependent(oDialog);
                        this._oImportTimePeriodDialog.open(); // once fragment is loaded then call required services
                        this.servicecallForTimesheet(empSubarea, oSelectedData, TotalHoursForPopup);
                    }.bind(this));
                } else {
                    this._oImportTimePeriodDialog.open();// once fragment is loaded then call required services
                    this.servicecallForTimesheet(empSubarea, oSelectedData, TotalHoursForPopup);
                }
            },
            // get timesheet details with selected filters from payroll report
            servicecallForTimesheet: function (empSubarea, oSelectedData, TotalHoursForPopup) {
                var oFiltersubarea = [];
                var paycodePromise = jQuery.Deferred();
                sap.ui.getCore().byId("idTimesheetDialog").setBusy(true);
                /// Filters for Service call
                if (empSubarea.length !== 0) {
                    var subarea = new sap.ui.model.Filter({
                        path: "cust_PSA_PersonnelSubareaID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: empSubarea[0].PersonnelSubArea
                    });
                    oFiltersubarea.push(subarea);
                }
                // below batch call is getting user sick,vacation limit and paycode
                var sfModel = this.getOwnerComponent().getModel("v2");
                var oSFDataModel = new sap.ui.model.odata.ODataModel(sfModel.sServiceUrl);
                var batchOperation1 = oSFDataModel.createBatchOperation("/EmpTimeAccountBalance?$filter=userId in '" + oSelectedData.EmployeeID + "' and timeAccountType in 'MG_VACATION_HOURLY'&$format=JSON", "GET");
                var batchOperation2 = oSFDataModel.createBatchOperation("/EmpTimeAccountBalance?$filter=userId in '" + oSelectedData.EmployeeID + "' and timeAccountType in 'MGC_HRLY_SICK'&$format=json", "GET");
                var batchOperation3 = oSFDataModel.createBatchOperation("/cust_paycode?$filter=cust_PSA_PersonnelSubareaID eq '" + empSubarea[0].PersonnelSubArea + "'&$format=json", "GET");
                var sfBatchArray = [batchOperation1, batchOperation2, batchOperation3];
                oSFDataModel.addBatchReadOperations(sfBatchArray);
                oSFDataModel.submitBatch(function (oResult) {
                    console.log(oResult)
                    try {
                        this.getView().getModel("valueHelp").setProperty("/vacation", oResult.__batchResponses[0].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/sick", oResult.__batchResponses[1].data.results);
                    } catch (err) { }
                    try {
                        this.getView().getModel("valueHelp").setProperty("/paycode", oResult.__batchResponses[2].data.results);
                        if (JSON.parse(oResult.__batchResponses[2].data.results.length === 0)) {
                            MessageToast.show(this.getResourceBundle().getText("noPayCode"));
                        }
                    } catch (err) { }
                    paycodePromise.resolve();
                }.bind(this), function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(this.getResourceBundle().getText("errorSFBatch"));
                }.bind(this));
                // validation for date
                var timsheetPromise = jQuery.Deferred();
                var Screen1Filters = this.oSelectedFilters();
                var oFilterValues = [];
                Screen1Filters.forEach(oItem => {
                    if (oItem.sPath !== 'Date' && oItem.sPath !== "PayPeriodBeginDate" && oItem.sPath !== "PayPeriodEndDate") {
                        oFilterValues.push(oItem);
                    }
                })
                var oFromDateTimePeriod = oSelectedData.PayPeriodBeginDate;
                var oEndDateTimePeriod = oSelectedData.PayPeriodEndDate;
                this.oFromDate = new Date(oFromDateTimePeriod); //yyyy-MM-dd
                this.oToDate = new Date(oEndDateTimePeriod); // yyyy-MM-dd
                // Filters for Service call
                var DateRange = new sap.ui.model.Filter({
                    path: "Date",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: oFromDateTimePeriod,
                    value2: oEndDateTimePeriod
                });
                oFilterValues.push(DateRange);
                var oName = new sap.ui.model.Filter({
                    path: "EmployeeID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: oSelectedData.EmployeeID
                });
                oFilterValues.push(DateRange, oName);
                var oTimePeriodModel = new JSONModel();
                this.getView().setModel(oTimePeriodModel, "timePeriod");
                //get timesheet details
                this.getOwnerComponent().getModel().read("/TimeSheetDetails_prd", {
                    filters: oFilterValues,
                    sorters: [
                        new sap.ui.model.Sorter("Date", /*descending*/false) // "Sorter" required from "sap/ui/model/Sorter"
                    ],
                    success: function (odata) {
                        for (var i = 0; i < odata.results.length; i++) {
                            odata.results[i].TotalHours = odata.results[i].TotalHours.replaceAll(".", ":");
                        }
                        sap.ui.getCore().byId("idFormTotalValues").setNumber(TotalHoursForPopup);//oFormTotalHours
                        this.getView().getModel("timePeriod").setProperty("/timesheetData", odata.results);
                        this.getView().getModel("timePeriod").refresh();
                        timsheetPromise.resolve();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().byId("listTab").setBusy(false);
                        MessageBox.error(this.getResourceBundle().getText("errorTimesheet"));
                    }.bind(this)
                });

                $.when(paycodePromise, timsheetPromise).done(
                    function () {
                        sap.ui.getCore().byId("idTimesheetDialog").setBusy(false);
                    });
            },
            //add record to the timeperiod table
            onAddTimePeriod: function () {
                var oModel = this.getView().getModel("timePeriod");
                var aTimePeriodModel = oModel.getData();
                this.timePeriod = aTimePeriodModel.timesheetData.timeperiod;
                try {
                    var day = parseInt(aTimePeriodModel[aTimePeriodModel.length - 1].Date.split("-")[0]) + 1;
                    var date = day + "-" + aTimePeriodModel[aTimePeriodModel.length - 1].Date.split("-")[1] + "-" + aTimePeriodModel[aTimePeriodModel.length - 1].Date.split("-")[2];
                } catch (err) { }
                for (var i = 0; i < aTimePeriodModel.timesheetData.length; i++) {
                    aTimePeriodModel.timesheetData[i].PayrollApprovalStatus = "Not";
                }
                var oRecord = {
                    "MinDate": this.oFromDate, "MaxDate": this.oToDate, "Date": "", "PayCode": "", "CostCenter": "", "Activity": "",
                    "WorkOrder": "", "Job": "", "Section": "", "Phase": "", "TotalHours": "", "ManagerApprovalName": this.loginName, "SaveSubmitStatus": "Approved",
                    "PayrollApprovalStatus": "Not", "NewRecord": true
                };
                aTimePeriodModel.timesheetData.push(oRecord);
                oModel.refresh();
            },
            // delete record from timeperiod table
            onDeleteTimePeriod: function () {
                var sfpayload = {};
                var sfModel = this.getOwnerComponent().getModel("v2");
                var oSFDataModel = new sap.ui.model.odata.ODataModel(sfModel.sServiceUrl);
                var valueHelpData = this.getView().getModel("valueHelp").getData();
                // prepare uuid for sfcall
                var d = new Date();
                var timestamp = d.getTime();
                var dyear = d.getFullYear();
                var dmonth = d.getMonth() + 1;
                var dday = d.getDate();
                var oTableData = this.getView().getModel("timePeriod").getData().timesheetData;
                var aTable = sap.ui.getCore().byId("idTimePeriodTable");
                if (aTable.getSelectedItems().length === 0) {
                    MessageBox.error(this.getResourceBundle().getText("errorAtlestSelectOneRecord"));
                    return;
                }
                // delete existing records
                var oDeleteModel = this.getOwnerComponent().getModel();
                var deletePayload = [];
                var sfBatchArray = [];
                var oDataModel = new sap.ui.model.odata.ODataModel(oDeleteModel.sServiceUrl);
                var sItems = aTable.getSelectedItems();
                //delete newly added fileds
                for (var i = 0; i < oTableData.length; i++) {
                    delete oTableData[i].MinDate;
                    delete oTableData[i].MaxDate;
                    delete oTableData[i].PayCodeValueState;
                    delete oTableData[i].CostCenterValueState;
                    delete oTableData[i].JobValueState;
                    delete oTableData[i].SectionValueState;
                    delete oTableData[i].CostCenterState;
                    delete oTableData[i].TotalHourslueState;
                    delete oTableData[i].DateValueState;
                    this.getView().getModel("timePeriod").refresh();
                }
                for (var i = sItems.length - 1; i >= 0; i--) {
                    var path = sItems[i].getBindingContextPath();
                    var idx = parseInt(path.substring(path.lastIndexOf('/') + 1), 10);
                    oTableData[idx].DELETED = true;
                    if (oTableData[idx].PayCode == "2000") {
                        // payload for sf call - vacation leave update
                        sfpayload.externalCode = timestamp + dyear.toString() + dmonth.toString() + dday.toString() + oTableData[0].EmployeeID + i;
                        var timeaccount = valueHelpData.vacation[0] && valueHelpData.vacation[0].timeAccount ? valueHelpData.vacation[0].timeAccount : "";
                        sfpayload.TimeAccount_externalCode = timeaccount;
                        sfpayload.bookingAmount = "+" + oTableData[idx].TotalHours;
                        sfpayload.bookingType = "MANUAL_ADJUSTMENT";
                        sfpayload.bookingUnit = "HOURS";
                        sfpayload.bookingDate = new Date().toISOString();
                        var sfbatchOperation = oSFDataModel.createBatchOperation("/TimeAccountDetail", "POST", sfpayload);
                        sfBatchArray.push(sfbatchOperation);
                    }
                    else if (oTableData[idx].PayCode == "1140") { //sickleave
                        sfpayload.externalCode = timestamp + dyear.toString() + dmonth.toString() + dday.toString() + oTableData[0].EmployeeID + i;
                        var timeaccount = valueHelpData.sick[0] && valueHelpData.sick[0].timeAccount ? valueHelpData.sick[0].timeAccount : "";
                        sfpayload.TimeAccount_externalCode = timeaccount;
                        sfpayload.bookingAmount = "+" + oTableData[idx].TotalHours;
                        sfpayload.bookingType = "MANUAL_ADJUSTMENT";
                        sfpayload.bookingUnit = "HOURS";
                        sfpayload.bookingDate = new Date().toISOString();
                        var sfbatchOperation = oSFDataModel.createBatchOperation("/TimeAccountDetail", "POST", sfpayload);
                        sfBatchArray.push(sfbatchOperation);
                    }
                    if (oTableData[idx].ID !== "") {
                        var batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd(ID=" + oTableData[idx].ID + ",AppName='" + oTableData[idx].AppName + "',Date='" + oTableData[idx].Date + "')", "PATCH", oTableData[idx]);
                        deletePayload.push(batchOperation);
                    }
                    oTableData.splice(idx, 1);
                }
                if (deletePayload.length > 0) {
                    oDataModel.addBatchChangeOperations(deletePayload);
                    oDataModel.submitBatch(function (oResult) {
                        MessageBox.success(this.getResourceBundle().getText("deleteSuccess"));
                        this.getView().getModel("timePeriod").refresh();
                        // sf call to update sick/vacation
                        if (sfBatchArray.length != 0) {
                            oSFDataModel.addBatchChangeOperations(sfBatchArray);
                            oSFDataModel.submitBatch(function (oResult) {
                                try {
                                    if (oResult.__batchResponses[0].__changeResponses[0].statusCode == '201' || oResult.__batchResponses[0].__changeResponses[0].statusCode == '200') {
                                        MessageBox.success(this.getResourceBundle().getText("errorSickVacation"));
                                    }
                                } catch (err) { }
                            }.bind(this), function (oError) {
                                MessageBox.error(this.getResourceBundle().getText("errorSfBatch"));
                            }.bind(this));
                        }
                        this.onSearch(); // refreshing the data
                    }.bind(this), function (oError) {
                        MessageBox.error(this.getResourceBundle().getText("errorBatch"));
                    }.bind(this));
                }
                sap.ui.getCore().byId("idTimePeriodTable").removeSelections();
            },
            onChangeF4Help: function (oEvent) {
                oEvent.getSource().setValue("");
                MessageToast.show(this.getResourceBundle().getText("selectF4"));
            },
            onChangePayPeriodF4Help: function (oEvent) {
                var sSelectedKey = this.getView().byId("idPayPeriodComboBox").getValue();
                oEvent.getSource().setValue("");
                MessageToast.show(this.getResourceBundle().getText("selectF4"));
                if (sSelectedKey == "") {
                    this.getView().byId("idStartDate").setEnabled(true);
                    this.getView().byId("idFinishDate").setEnabled(true);
                }
                else {
                    this.getView().byId("idStartDate").setDateValue();
                    this.getView().byId("idFinishDate").setDateValue();
                    this.getView().byId("idStartDate").setEnabled(false);
                    this.getView().byId("idFinishDate").setEnabled(false);
                }
            },
            onChangeComboBox: function (oEvent) {
                var sPath = oEvent.getSource().getParent().getBindingContextPath();
                var oData = this.getView().getModel("timePeriod");
                var oItem = oData.getProperty(sPath);
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oEvent.getSource().setValue("");
                    MessageToast.show(this.getResourceBundle().getText("selectComboBox"));
                }
                else {
                    this.UpdateIndicatorValue(oEvent); // update indicator with X for approved objects
                    if (sSelectedKey == "1140" || sSelectedKey == "2000") {
                        var sickValidation = this.sickLeaveValidation();
                        if (sickValidation == "Error") {
                            return;
                        }
                    }
                    oValidatedComboBox.setValueState(ValueState.None);
                }
            },
            sickLeaveValidation: function () {
                // validation for multiple sick/vacation selection for same date
                var data = this.getView().getModel("timePeriod").getData().timesheetData;
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data.length; j++) {
                        if (i != j && data[i].Date == data[j].Date && ((data[i].PayCode == "1140" && data[j].PayCode == "1140") || (data[i].PayCode == "2000" && data[j].PayCode == "2000"))) {
                            data[j].DateValueState = "Error";
                            data[j].PayCodeValueState = "Error";
                            MessageBox.error(this.getResourceBundle().getText("errorSameDateCannotSelectMultipleSick"));
                            this.getView().getModel("timePeriod").refresh();
                            return "Error";
                        }
                        else {
                            data[j].DateValueState = "None";
                            data[j].PayCodeValueState = "None";
                        }
                    }
                }
                this.getView().getModel("timePeriod").refresh();
            },
            //validations for saving time period data
            timePeriodDialogSave: function (oEvent) {
                var oModelData = this.getView().getModel("timePeriod").getData().timesheetData;
                var sickLeave = 0;
                var vacationLeave = 0;
                sap.ui.getCore().byId("idSave").setEnabled(true);
                for (var i = 0; i < oModelData.length; i++) {
                    if (oModelData[i].Date == "") {
                        oModelData[i].DateValueState = "Error";
                        MessageBox.error(this.getResourceBundle().getText("errorDate"));
                        this.getView().getModel("timePeriod").refresh();
                        sap.ui.getCore().byId("idSave").setEnabled(false);
                        return;
                    }
                    if (oModelData[i].TotalHours == "") {
                        oModelData[i].TotalHourslueState = "Error";
                        MessageBox.error(this.getResourceBundle().getText("errorTotalHours"));
                        this.getView().getModel("timePeriod").refresh();
                        sap.ui.getCore().byId("idSave").setEnabled(false);
                        return;
                    }
                    // sick leave validation
                    if (oModelData[i].PayCode == "1140") {
                        sickLeave += Number(oModelData[i].TotalHours);
                        this.sickLeaveEntered = true;
                    }
                    //vacation leave validation
                    if (oModelData[i].PayCode == "2000") {
                        vacationLeave += Number(oModelData[i].TotalHours);
                        this.vacationLeaveEntered = true;
                    }

                    if (oModelData[i].PayCode != "1140" && oModelData[i].PayCode != "2000" && oModelData[i].Activity == "" && oModelData[i].CostCenter == "" && oModelData[i].WorkOrder == "" && oModelData[i].Job == "") {
                        MessageBox.error(this.getResourceBundle().getText("errorWBS"));
                        this.getView().getModel("timePeriod").refresh();
                        sap.ui.getCore().byId("idSave").setEnabled(false);
                        return;
                    }
                }
                var valueHelpData = this.getView().getModel("valueHelp").getData();
                // sick leave validation
                if (valueHelpData.sick && valueHelpData.sick[0] && Number(valueHelpData.sick[0].balance) < sickLeave) {
                    MessageBox.error(this.getResourceBundle().getText("infoSick") + Number(valueHelpData.sick[0].balance) + " " + this.getResourceBundle().getText("info"));
                    sap.ui.getCore().byId("idSave").setEnabled(false);
                    return;
                }
                // vacation leave validation
                if (valueHelpData.vacation && valueHelpData.vacation[0] && Number(valueHelpData.vacation[0].balance) < vacationLeave) {
                    MessageBox.error(this.getResourceBundle().getText("infoVacation") + Number(valueHelpData.vacation[0].balance) + " " + this.getResourceBundle().getText("info"));
                    sap.ui.getCore().byId("idSave").setEnabled(false);
                    return;
                }
                this.timeSheetApprove("TimePeriodSave");
                this._oImportTimePeriodDialog.close();
            },
            onChangeHours: function (oEvent) {
                // /*oEvent.getSource().getValue());*/
                var sPath = oEvent.getSource().getParent().getBindingContextPath();
                var oData = this.getView().getModel("timePeriod");
                var oItem = oData.getProperty(sPath);
                oItem.TotalHours = oItem.TotalHours.replaceAll(".", ":");
                if (oItem.TotalHours.includes(":")) {
                    var num = oItem.TotalHours;
                }
                else {
                    num = oItem.TotalHours + ":00";
                }
                oItem.TotalHours = num;
                if (oItem.TotalHours.split(":")[0].length != 2) {
                    oItem.TotalHours = Number(oItem.TotalHours.split(":")[0]) >= 10 ? num : "0" + num;
                }
                if (Number(num.split(":")[1]) > 60) {
                    MessageBox.error(this.getResourceBundle().getText("errorMaxWorkingMins"));
                    sap.ui.getCore().byId("idSave").setEnabled(false);
                    return;
                }
                var Hours = 0;
                sap.ui.getCore().byId("idSave").setEnabled(true);
                for (var i = 0; i < oData.getData().timesheetData.length; i++) {
                    var record = oData.getData().timesheetData[i];
                    if (record.Date == oItem.Date && record.PayCode != '1095' && record.PayCode != '1225' && record.PayCode != 'BOA' && record.PayCode != 'BT' && record.PayCode != 'BSP' && record.PayCode != 'BN' && record.PayCode != '1230' && record.PayCode != '1070') {
                        Hours += Number(record.TotalHours.split(":")[0]);
                    }
                    if (record.Date == oItem.Date && Hours > 24) {
                        record.TotalHourslueState = "Error";
                        MessageBox.error(this.getResourceBundle().getText("errorMaxWorkingHours"));
                        this.getView().getModel("timePeriod").refresh();
                        sap.ui.getCore().byId("idSave").setEnabled(false);
                        return;
                    }
                    else {
                        oItem.DateValueState = "None";
                        oItem.DateValueState = "None";
                        oItem.PayCodeValueState = "None"
                        record.TotalHourslueState = "None";
                    }
                }
                this.getView().getModel("timePeriod").refresh();
                var sickValidation = this.sickLeaveValidation();
                if (sickValidation == "Error") {
                    return;
                }
                //sick/vacation check
                if (oItem.PayCode == "2000" || oItem.PayCode == "1140") {
                    if (oItem.PayCode == "1140" && oEvent.getSource().getValue() > 8) {
                        MessageBox.error(this.getResourceBundle().getText("errorMaxSick"));
                        oItem.TotalHours = "";
                        this.getView().getModel("timePeriod").refresh();
                        sap.ui.getCore().byId("idSave").setEnabled(false);
                        return;
                    }
                }
                this.getView().getModel("timePeriod").refresh();
                this.UpdateIndicatorValue(oEvent); // update indicator with X for approved objects
            },
            //et i18n properties
            getResourceBundle: function () {
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                return oResourceBundle;
            },
            timePeriodDialogCancel: function (oEvent) {
                this._oImportTimePeriodDialog.close();
            },
            //Send update indicator if user changes any filed if is already approved/executed
            UpdateIndicatorValue: function (oEvent, selectedPath) {
                if (selectedPath !== undefined && selectedPath !== null) {
                    var path = selectedPath;
                } else {
                    var path = oEvent.getSource().getParent().getBindingContextPath();
                }
                var selectedData = this.getView().getModel("timePeriod").getProperty(path);
                if (selectedData.PayrollApprovalStatus == "Executed") {
                    selectedData.UpdateIndicator = "X";
                }
                if (selectedData.SaveSubmitStatus == "Approved" && selectedData.ManagerApprovalName !== null && selectedData.ManagerApprovalName !== null) {
                    selectedData.UpdateIndicator = "X";
                }
                this.getView().getModel("timePeriod").refresh();
                sap.ui.getCore().byId("idSave").setEnabled(true);
            },
            onDateChange: function (oEvent) {
                var val = oEvent.getSource().getValue();
                var path = oEvent.getSource().getParent().getBindingContextPath();
                this.UpdateIndicatorValue(oEvent);
                var Data = this.getView().getModel("timePeriod").getData().timesheetData;
                for (var i = 0; i < Data.length; i++) {
                    if (Data[i].Date == val) {
                        Data[i].SequenceNo == null ? Data[i].SequenceNo = 0 : Data[i].SequenceNo;
                        var SeqNo = parseInt(Data[i].SequenceNo);
                        SeqNo += 1;
                        this.getView().getModel("timePeriod").getProperty(path).SequenceNo = SeqNo;
                    }
                }
                this.getView().getModel("timePeriod").refresh();
            },
            //post call for timesheetdetails
            timeSheetApprove: function (param) {
                var oModel = this.getOwnerComponent().getModel();
                var oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl);
                var batchArray = [];
                var batchOperation = "";
                var sfModel = this.getOwnerComponent().getModel("v2");
                var oSFDataModel = new sap.ui.model.odata.ODataModel(sfModel.sServiceUrl);
                var valueHelpData = this.getView().getModel("valueHelp").getData();
                var sfBatchArray = [];
                // prepare uuid for sfcall
                var d = new Date();
                var timestamp = d.getTime();
                var dyear = d.getFullYear();
                var dmonth = d.getMonth() + 1;
                var dday = d.getDate();
                if (param == "TimePeriodSave") { //time period save
                    var timePeriodData = this.getView().getModel("timePeriod").getData().timesheetData;
                    for (var i = 0; i < timePeriodData.length; i++) {
                        var payload = {};
                        var sfpayload = {};
                        payload.ID = timePeriodData[i].ID;
                        payload.AppName = timePeriodData[0].AppName;
                        payload.Date = timePeriodData[i].Date;
                        payload.EmployeeID = timePeriodData[0].EmployeeID;
                        payload.EmployeeName = timePeriodData[0].EmployeeName;
                        payload.CompanyID = timePeriodData[0].CompanyID;
                        payload.CompanyName = timePeriodData[0].CompanyName;
                        payload.PayPeriodBeginDate = timePeriodData[0].PayPeriodBeginDate;
                        payload.PayPeriodEndDate = timePeriodData[0].PayPeriodEndDate;
                        payload.WorkOrder = timePeriodData[i].WorkOrder;
                        payload.PayCode = timePeriodData[i].PayCode;
                        payload.Job = timePeriodData[i].Job;
                        payload.Section = timePeriodData[i].Section;
                        payload.Phase = timePeriodData[i].Phase;
                        payload.CostCenter = timePeriodData[i].CostCenter;
                        payload.SaveSubmitStatus = timePeriodData[i].SaveSubmitStatus;
                        payload.PayrollApprovalStatus = timePeriodData[i].PayrollApprovalStatus;
                        payload.TotalHours = timePeriodData[i].TotalHours.replaceAll(":", ".");
                        payload.Activity = timePeriodData[i].Activity;
                        payload.UpdateIndicator = timePeriodData[i].UpdateIndicator;
                        // sick/vacation leave service call for sf
                        var extcode = timestamp + dyear.toString() + dmonth.toString() + dday.toString() + timePeriodData[0].EmployeeID + i;
                        if ((timePeriodData[i].PayCode == "1140" || timePeriodData[i].PayCode == "2000") && timePeriodData[i].NewRecord == true) {
                            if (timePeriodData[i].PayCode == "2000") {
                                var timeaccount = valueHelpData.vacation[0] && valueHelpData.vacation[0].timeAccount ? valueHelpData.vacation[0].timeAccount : "";
                            }
                            else {
                                var timeaccount = valueHelpData.sick[0] && valueHelpData.sick[0].timeAccount ? valueHelpData.sick[0].timeAccount : "";
                            }
                            sfpayload.externalCode = extcode;
                            sfpayload.TimeAccount_externalCode = timeaccount;
                            sfpayload.bookingAmount = "-" + timePeriodData[i].TotalHours;
                            sfpayload.bookingType = "MANUAL_ADJUSTMENT";
                            sfpayload.bookingUnit = "HOURS";
                            sfpayload.bookingDate = new Date().toISOString();
                            var sfbatchOperation = oSFDataModel.createBatchOperation("/TimeAccountDetail", "POST", sfpayload);
                            sfBatchArray.push(sfbatchOperation);
                        }
                        if (timePeriodData[i].ID !== "" && timePeriodData[i].ID !== undefined) {
                            batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd(ID=" + payload.ID + ",AppName='" + payload.AppName + "',Date='" + timePeriodData[i].Date + "')", "PATCH", payload);
                        }
                        else {
                            delete payload.ID;
                            batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd", "POST", payload);
                        }
                        batchArray.push(batchOperation);
                    }
                } else { // import holiday approval
                    var selectedPaths = sap.ui.getCore().byId("idImportHolidays").getSelectedContextPaths();
                    if (selectedPaths.length == 0) {
                        MessageBox.error(this.getResourceBundle().getText("errorAtleatOneRecord"));
                        return;
                    }
                    for (var i = 0; i < selectedPaths.length; i++) {
                        var payload = this.getView().getModel("localModel").getProperty(selectedPaths[i]);
                        payload.AppName = "TIMESHEET";
                        var batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd", "POST", payload);
                        batchArray.push(batchOperation);
                    }
                }
                oDataModel.addBatchChangeOperations(batchArray);
                oDataModel.submitBatch(function (oResult) {
                    try {
                        if (oResult.__batchResponses[0].__changeResponses[0].statusCode == '201' || oResult.__batchResponses[0].__changeResponses[0].statusCode == '200') {
                            MessageBox.success(this.getResourceBundle().getText("successRecordPosted"));
                            if (sfBatchArray.length > 0) {
                                oSFDataModel.addBatchChangeOperations(sfBatchArray);
                                oSFDataModel.submitBatch(function (oResult) {
                                    try {
                                        if (oResult.__batchResponses[0].__changeResponses[0].statusCode == '201' || oResult.__batchResponses[0].__changeResponses[0].statusCode == '200') {
                                            MessageBox.success(this.getResourceBundle().getText("errorSickVacation"));
                                        }
                                    } catch (err) { }
                                }.bind(this), function (oError) {
                                    MessageBox.error(this.getResourceBundle().getText("errorSfBatch"));
                                }.bind(this));
                            }
                            if (param == "TimePeriodSave") {
                                this.onSearch(); // refresh time sheet details
                            }
                        }
                    } catch (err) { }
                    try {
                        if (oResult.__batchResponses[0].response.statusCode == '500' || oResult.__batchResponses[0].response.statusCode == '400' || oResult.__batchResponses[0].response.statusCode == '405') {
                            MessageBox.error(this.getResourceBundle().getText("errorRecordPosted"));
                        }
                    } catch (err) { }
                }.bind(this), function (oError) {
                    MessageBox.error(this.getResourceBundle().getText("errorBatch"));
                }.bind(this));
                try { this._oImportHolidayDialog.close(); } catch (err) { }
            },
            getApplicationID: function () {
                return this.getOwnerComponent().getManifestEntry("/sap.app").id.replaceAll(".", "");
            },
            getApplicationVersion: function () {
                return this.getOwnerComponent().getManifestEntry("/sap.app").applicationVersion.version;
            },
            getApplicationRouter: function () {
                return "/" + this.getOwnerComponent().getManifestEntry("/sap.cloud").service;
            },
            getCompleteURL: function () {
                return this.getApplicationRouter() + "." + this.getApplicationID() + "-" + this.getApplicationVersion();
            },
            onPressApprove: function () {
                var batchArray = [];
                var oModel = this.getOwnerComponent().getModel();
                var oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl);
                var selectedValues = this.getView().byId("listTab").getSelectedContextPaths();
                if (selectedValues.length == 0) {
                    MessageBox.error(this.getResourceBundle().getText("errorAtleatOneRecord"));
                    return;
                }
                for (var i = 0; i < selectedValues.length; i++) {
                    var oSelectedData = this.getView().getModel("payroll").getProperty(selectedValues[i]);
                    for (var j = 0; j < this.completeResponse.length; j++) {
                        if (oSelectedData.EmployeeID == this.completeResponse[j].EmployeeID && oSelectedData.PayPeriodBeginDate == this.completeResponse[j].PayPeriodBeginDate && oSelectedData.PayPeriodEndDate == this.completeResponse[j].PayPeriodEndDate) {
                            // payload for timesheet details update call for payroll status
                            var payload = {};
                            payload.ID = this.completeResponse[j].ID;
                            payload.AppName = this.completeResponse[j].AppName;
                            payload.Date = this.completeResponse[j].Date;
                            payload.EmployeeID = this.completeResponse[j].EmployeeID;
                            payload.EmployeeName = this.completeResponse[j].EmployeeName;
                            payload.PayPeriodBeginDate = this.completeResponse[j].PayPeriodBeginDate;
                            payload.PayPeriodEndDate = this.completeResponse[j].PayPeriodEndDate;
                            payload.SaveSubmitStatus = "Approved";
                            var batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd(ID=" + payload.ID + ",AppName='" + payload.AppName + "',Date='" + payload.Date + "')", "PATCH", payload);
                            batchArray.push(batchOperation);
                        }
                    }
                }
                this.updateStatus(oDataModel, batchArray);
            },
            // approve record(s) and send it to CPI
            onPressApproveCPI: function (approve) {
                var that = this;
                var oModel = this.getOwnerComponent().getModel();
                var oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl);
                var batchArray = [];
                var selectedValues = this.getView().byId("listTab").getSelectedContextPaths();
                if (selectedValues.length == 0) {
                    MessageBox.error(this.getResourceBundle().getText("errorAtleatOneRecord"));
                    return;
                }
                for (var i = 0; i < selectedValues.length; i++) {
                    var oSelectedData = this.getView().getModel("payroll").getProperty(selectedValues[i]);
                    if (oSelectedData.SaveSubmitStatus !== "Approved") {
                        MessageBox.error(this.getResourceBundle().getText("errorInApprovedRecords"));
                        return;
                    }
                }
                sap.ui.core.BusyIndicator.show(-1);
                var oPayCodeList = this.getView().getModel("valueHelp").getData().paycodeall;
                var oCost_allowance = this.getView().getModel("valueHelp").getData().cost_allowance;
                var cpiPayload = [];
                for (var i = 0; i < selectedValues.length; i++) {
                    var oSelectedData = this.getView().getModel("payroll").getProperty(selectedValues[i]);
                    for (var j = 0; j < this.completeResponse.length; j++) {
                        if (oSelectedData.EmployeeID == this.completeResponse[j].EmployeeID && oSelectedData.PayPeriodBeginDate == this.completeResponse[j].PayPeriodBeginDate && oSelectedData.PayPeriodEndDate == this.completeResponse[j].PayPeriodEndDate) {
                            let date = this.completeResponse[j].Date;
                            let wagetype = this.completeResponse[j].PayCode == null ? "" : this.completeResponse[j].PayCode;
                            if (wagetype !== "0001" && wagetype !== "0002") {
                                var obj = {};
                                // payload for cpi call 
                                obj.EmployeeNumber = this.completeResponse[j].EmployeeID;
                                obj.Date = date.replaceAll("-", "");
                                obj.WageType = wagetype;
                                this.completeResponse[j].TotalHours = this.completeResponse[j].TotalHours.replaceAll(":", ".");
                                obj.Amount = "";
                                for (var i = 0; i < oCost_allowance.length; i++) {
                                    if (oCost_allowance[i].cust_paycodeID == wagetype && (oCost_allowance[i].cust_Location !== null && oCost_allowance[i].cust_Location == this.completeResponse[j].LocationCode) && (oCost_allowance[i].cust_profitCenter !== null && oCost_allowance[i].cust_profitCenter == this.completeResponse[j].ProfitCenter)) {
                                        obj.Amount = Number(oCost_allowance[i].cust_Amount) * Number(this.completeResponse[j].TotalHours);
                                        break;
                                    }
                                    else if (oCost_allowance[i].cust_paycodeID == wagetype && oCost_allowance[i].cust_Location == this.completeResponse[j].LocationCode) {
                                        obj.Amount = Number(oCost_allowance[i].cust_Amount) * Number(this.completeResponse[j].TotalHours);
                                        break;
                                    }
                                    else if (oCost_allowance[i].cust_paycodeID == wagetype) {
                                        obj.Amount = Number(oCost_allowance[i].cust_Amount) * Number(this.completeResponse[j].TotalHours);
                                        break;
                                    }
                                }
                                obj.Number = this.completeResponse[j].TotalHours.replaceAll(":", ".");
                                if (obj.WageType == "1000" || obj.WageType == "1090") {
                                    obj.Unit = "Hours";
                                    obj.Currency = "";
                                }
                                else {
                                    for (var k = 0; k < oPayCodeList.length; k++) {
                                        if (obj.WageType == oPayCodeList[k].PaycodeID) {
                                            obj.Unit = oPayCodeList[k].cust_Unit;
                                            obj.Currency = oPayCodeList[k].cust_Currency;
                                        }
                                    }
                                }
                                if (oPayCodeList.length == 0) {
                                    obj.Unit = "";
                                    obj.Currency = "";
                                }
                                if (obj.Unit == undefined || obj.Unit == null) {
                                    obj.Unit = "";
                                }
                                if (obj.Currency == undefined || obj.Currency == null) {
                                    obj.Currency = "";
                                }
                                if (obj.Unit == "Amount") {
                                    obj.Number = "";
                                }
                                obj.CostCenter = this.completeResponse[j].CostCenter;
                                obj.CompanyCodeCostCenter = this.completeResponse[j].CompanyID;
                                obj.Posid = "";
                                let job = this.completeResponse[j].Job == null ? "" : this.completeResponse[j].Job;
                                let section = this.completeResponse[j].Section == null ? "" : this.completeResponse[j].Section;
                                let phase = this.completeResponse[j].Phase == null ? "" : this.completeResponse[j].Phase;
                                let wbs = "";
                                if (job == "" || section == "" || phase == "") {
                                    wbs = "";
                                }
                                else if (job != "" && section != "" && phase != "") {
                                    wbs = job + "-" + section + "-" + phase;
                                }
                                else if (job != "" && section != "") {
                                    wbs = job + "-" + section;
                                }
                                else if (job != "") {
                                    wbs = job;
                                }
                                obj.WBS = wbs;// RT/OT payload condition
                                if (Number(this.completeResponse[j].OverTime) != 0) {
                                    obj.WageType = "1090";
                                    obj.Number = this.completeResponse[j].OverTime;
                                    cpiPayload.push(obj);
                                }
                                if (Number(this.completeResponse[j].RegularTime) != 0) {
                                    let obj1 = { ...obj };
                                    obj1.WageType = "1000";
                                    obj1.Number = this.completeResponse[j].RegularTime;
                                    cpiPayload.push(obj1);
                                }
                                if (Number(this.completeResponse[j].OverTime) == 0 && Number(this.completeResponse[j].RegularTime) == 0) {
                                    cpiPayload.push(obj);
                                }
                            }
                            // payload for timesheet details update call for payroll status
                            var payload = {};
                            payload.ID = this.completeResponse[j].ID;
                            payload.AppName = this.completeResponse[j].AppName;
                            payload.Date = this.completeResponse[j].Date;
                            payload.EmployeeID = this.completeResponse[j].EmployeeID;
                            payload.EmployeeName = this.completeResponse[j].EmployeeName;
                            payload.PayPeriodBeginDate = this.completeResponse[j].PayPeriodBeginDate;
                            payload.PayPeriodEndDate = this.completeResponse[j].PayPeriodEndDate;
                            payload.PayrollApprovalStatus = "Executed";
                            if (this.completeResponse[j].SaveSubmitStatus != "Approved") {
                                payload.SaveSubmitStatus = "Approved";
                                payload.ManagerApprovalName = this.loginName;
                            }
                            payload.PayrollApprovalName = this.loginName;
                            payload.PayrollApprovalEmail = this.logedinEmail;
                            var batchOperation = oDataModel.createBatchOperation("/TimeSheetDetails_prd(ID=" + payload.ID + ",AppName='" + payload.AppName + "',Date='" + payload.Date + "')", "PATCH", payload);
                            batchArray.push(batchOperation);
                        }
                    }
                }
                var payload_cpi = {
                    "Records": cpiPayload
                };
                //this.getCompleteURL() +
                var serviceUrl = this.getCompleteURL() + "/http/PayrollReport";
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status == 200) {
                        var parseData = JSON.parse(xhr.status);
                        MessageBox.success(that.getResourceBundle().getText("successRecordCPI"));
                        sap.ui.core.BusyIndicator.hide();
                        that.updateStatus(oDataModel, batchArray);
                    }
                    else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
                        MessageBox.error(that.getResourceBundle().getText("errorRecordPosted"));
                        sap.ui.core.BusyIndicator.hide();
                    }
                }
                xhr.open('POST', serviceUrl, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(payload_cpi));
            },
            // update timesheetstatus call
            updateStatus: function (oDataModel, batchArray) {
                oDataModel.addBatchChangeOperations(batchArray);
                oDataModel.submitBatch(function (oResult) {
                    try {
                        if (oResult.__batchResponses[0].__changeResponses[0].statusCode == '201' || oResult.__batchResponses[0].__changeResponses[0].statusCode == '200') {
                            MessageBox.success(this.getResourceBundle().getText("successRecordPosted"));
                            this.onSearch(); // refresh time sheet details
                        }
                    } catch (err) { }
                    try {
                        if (oResult.__batchResponses[0].response.statusCode == '400' || oResult.__batchResponses[0].response.statusCode == '405') {
                            MessageBox.error(this.getResourceBundle().getText("errorRecordPosted"));
                        }
                    } catch (err) { }
                }.bind(this), function (oError) {
                    MessageBox.error(this.getResourceBundle().getText("errorBatch"));
                }.bind(this));
            },
            onExportHoliday: function () {
                var rows = [];
                var fileName = "Template.xlsx";
                var obj = {
                    "Date": "",
                    "EmployeeID": "",
                    "EmployeeName": "",
                    "PayCode": "",
                    "TotalHours": ""
                }
                rows.push(obj);
                var workbook = XLSX.utils.book_new();
                var worksheet = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(workbook, worksheet, "Import Holiday");
                XLSX.writeFile(workbook, fileName, { compression: true });
            },
            onExportTimeData: function (oEvent) {
                var dateObject = new Date();
                var date = dateObject.getDate().toString();
                var month = (dateObject.getMonth() + 1).toString();
                var year = dateObject.getFullYear().toString();
                var spreadsheetName = "Time Data_" + month + '-' + date + '-' + year + ".xlsx";
                new Spreadsheet({
                    workbook: {
                        columns: this.createColumns()
                    },
                    dataSource: this.completeResponse,
                    fileName: spreadsheetName,
                }).build();
            },
            createColumns: function () {
                return [
                    {
                        label: "Employee Name",
                        property: "EmployeeName"
                    },
                    {
                        label: "Company Name",
                        property: "CompanyName"
                    },
                    {
                        label: "App Name",
                        property: "AppName"
                    },
                    {
                        label: "PayPeriod BeginDate",
                        property: "PayPeriodBeginDate"
                    },
                    {
                        label: "PayPeriod EndDate",
                        property: "PayPeriodEndDate"
                    },
                    {
                        label: "Period Hours",
                        property: "TotalHoursPercentage"
                    },
                    {
                        label: "Regular Time",
                        property: "RegularTime"
                    },
                    {
                        label: "Over Time",
                        property: "OverTime"
                    },
                    {
                        label: "PayCode",
                        property: "PayCode"
                    },
                    {
                        label: "CostCenter",
                        property: "CostCenter"
                    },
                    {
                        label: "Activity",
                        property: "Activity"
                    },
                    {
                        label: "WorkOrder",
                        property: "WorkOrder"
                    },
                    {
                        label: "Job",
                        property: "Job"
                    },
                    {
                        label: "Section",
                        property: "Section"
                    },
                    {
                        label: "Phase",
                        property: "Phase"
                    },
                    {
                        label: "Timesheet Status",
                        property: "SaveSubmitStatus"
                    },
                    {
                        label: "PayrollApproval Status",
                        property: "PayrollApprovalStatus"
                    },
                ];
            }
        });
    });



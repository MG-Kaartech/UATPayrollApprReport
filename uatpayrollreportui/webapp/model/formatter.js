sap.ui.define([], function () {
	"use strict";
	return {
		Status: function (val) {
			if (val === "Approved" || val === "Executed") {
				return "Success";
			}
			else if (val === "Rejected" || val === "Not Executed") {
				return "Error"
			}
			else if (val === "Saved" || val === "Submitted" || val === "Submited") {
				return "Information"
			}
			else {
				return "Warning";
			}
		},
		StatusName: function (val) {
			if (val == null || val == "Not Executed") {
				return "Not Executed";
			}
			else {
				return "Executed";
			}
		},
		PayrollApprStatusName: function (val) {
			if (val == "Executed") {
				return "Executed";
			}
			else {
				return "Not Executed";
			}
		},
		PayCodeCount: function (val) {
			var count = 0;
			if (val != null) {
				val.split("#").forEach(index => {
					if (index != '1000' && index != '' && index != null && index != "null" && index != undefined) {
						count++
					}
				})
			}
			return count;
		},
		StatusValue: function (status) {
			var count = 0;
			if (status == null || status == "") {
				return "Warning";
			}
			else {
				status.split("#").forEach(index => {
					if (index != 'Approved') {
						count++;
					}
				})
			}
			if (count == 0) {
				return "Success";
			} else {
				return "Warning";
			}
		},
		SaveSubmitStatusText: function (status) {
			var count = 0;
			if (status == null || status == "") {
				return "Inprogress";
			}
			else {
				status.split("#").forEach(index => {
					if (index != 'Approved') {
						count++;
					}
				})
			}
			if (count == 0) {
				return "Approved";
			} else {
				return "Inprogress";
			}
		},
		SickEditable: function (val, TotalHours, NewRecord) {
			if (NewRecord == true) {
				return true;
			}
			if ((val == "2000" || val == "1140") && TotalHours != "") {
				return false;
			}
			else {
				return true;
			}
		},
		TotalHoursCalculation: function (paycode, val) {
			if (val !== "" && val != null && val != "null" && val != undefined) {
				var hours = 0;
				if (paycode == null || paycode == "") {
					val.split("#").forEach(index => {
						if (index != '') {
							hours += Number(index);
						}
					})
					return hours;
				}
				else {
					var pay = paycode.split("#");
					var value = val.split("#");
					var arr = [];
					for (var i = 0; i < pay.length; i++) {
						var obj = {};
						obj.paycode = pay[i]
						obj.total = value[i]
						arr.push(obj)
					}

					for(var i=0;i<arr.length;i++){
						if (arr[i].paycode !== "1095" && arr[i].paycode !== "1225" && arr[i].paycode !==  "BOA" && arr[i].paycode !==  "BT" && arr[i].paycode !==  "BSP" && arr[i].paycode !== "BN" && arr[i].paycode !== "1230" && arr[i].paycode !== "1070") {
							if (arr[i].total != '' && arr[i].total != "null" && arr[i].total != null) {
								hours += Number(arr[i].total);
							}
						}
					}
					return hours;
				}
				/*if (paycode.includes("1095") != true && paycode.includes("1225") != true && paycode.includes("BOA") != true && paycode.includes("BT") != true && paycode.includes("BSP") != true && paycode.includes("BN") != true && paycode.includes("1230") != true && paycode.includes("1070") != true) {
					val.split("#").forEach(index => {
						if (index != '' && index != "null" && index != null) {
							hours += Number(index);
						}
					})
					return hours;
				}*/
			}
		}
	};
});

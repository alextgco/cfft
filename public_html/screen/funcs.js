getDateString =function (date){
    if(typeof date == 'object'){
        var local = date.toLocaleDateString();
        var arr = local.split('.');
        for(var i in arr){
            if(arr[i].length == 1){
                arr[i] = '0'+arr[i];
            }
        }
        return arr.join('.');
    }
};
revertDateString = function(str){
    function revert(dayMthStr){
        var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
        var result = {};
        result.day = (dayMthStr.substr(0,2).substr(0,1) == "0")? dayMthStr.substr(1,1): dayMthStr.substr(0,2);
        result.mth = months[(+dayMthStr.substr(3,2))-1];

        return result;
    }
    return {
        day: revert(str.substr(0, 5)).day,
        mth: revert(str.substr(0, 5)).mth,
        year: '`'+str.substr(8,2)
    };
};
cloneObj = function(obj) {
    var key, temp;
    if ((obj == null) || typeof obj !== "object") {
        return obj;
}    temp = {};
    for (key in obj) {
        temp[key] = MB.Core.cloneObj(obj[key]);
    }
    return temp;
};
jsonToObj = function(obj) {
    var i, index, objIndex, obj_true;
    i = void 0;
    index = void 0;
    objIndex = void 0;
    obj_true = void 0;
    obj_true = {};
    objIndex = {};
    if (obj["DATA"] !== undefined) {
        for (i in obj["DATA"]) {
            for (index in obj["NAMES"]) {
                if (obj_true[i] === undefined) {
                    obj_true[i] = {};
                }
                obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index];
            }
        }
    } else if (obj["data"] !== undefined) {
        for (i in obj["data"]) {
            if (obj["names"] !== undefined) {
                for (index in obj["names"]) {
                    if (obj_true[i] === undefined) {
                        obj_true[i] = {};
                    }
                    obj_true[i][obj["names"][index]] = obj["data"][i][index];
                }
            } else if (obj["data_columns"] !== undefined) {
                for (index in obj["data_columns"]) {
                    if (obj_true[i] === undefined) {
                        obj_true[i] = {};
                    }
                    obj_true[i][obj["data_columns"][index]] = obj["data"][i][index];
                }
            }
        }
    }
    return obj_true;
};
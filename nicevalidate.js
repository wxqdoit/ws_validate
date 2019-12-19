/*
 * NiceValidate JavaScript Library v1.2.2
 * Date: 2018-12-24
 * author: wxqdoit
 */
(function (name, context, factory) {
    // AMD ,Node ,browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else context[name] = factory();
})("NiceValidate",typeof window !== "undefined" ? window : this, function () {
    "use strict";
    let defaultObj = {
        color:"#de8484!important",
        nullErr:"this field can not be null.",
        rangeErr:"the length of this field is invalid.",
        emailErr:"the email is invalid.",
        phoneErr:"the phone is invalid.",
        numberErr:"the number is invalid.",
        cardErr:"the card is invalid.",
        dateErr:"the date is invalid.",
        tagNames:['input',"textarea","select"],
        typeList:["email", "phone", "card", "date", "number"]
    };

    function isNull(val) {
        return val === null;
    }
    function isNullString(val) {
        return val === "";
    }
    function isObject(val) {
        if(val !== null && typeof val === "object"){
            return val.constructor === Object;
        }
        return false ;
    }
    function isUndefined(val) {
        return val === undefined;
    }
    function isNumber(val) {
        return typeof val === 'number';
    }
    function isString(val) {
        return typeof val === 'string';
    }
    function isBoolean(val) {
        return val === true || val === false;
    }
    function isTrue (val) {
        return val === true;
    }
    function isFalse (val) {
        return val === false;
    }
    function isArray(val) {
        return val instanceof Array
    }

    let Utils = {
        $email(email) {
            let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,3})+$/;
            let re = new RegExp(reg);
            return re.test(email)
        },
        $phone(phone) {
            let reg =  /^1[0-9]{10}$/;
            let re = new RegExp(reg);
            return re.test(phone)
        },
        $card(card) {
            let reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            let re = new RegExp(reg);
            return re.test(card)
        },
        $date(date) {
            let reg =  /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
            let re = new RegExp(reg);
            return re.test(date)
        },
        $number(data) {
            let reg =  /^-?\d+\.?\d*$/;
            let re = new RegExp(reg);
            return re.test(data)
        }
    };

    /**
     * @constructor
     */
    function NiceValidate() {
        this.confArg = null;
        this.autoElArg = null;
        if(arguments.length === 0){
            console.warn("You should probably pass in some parameters.");
            return;
        }
        //0 < arg <=2
        if(arguments.length>0 && arguments.length<=2){
            for(let item in arguments){
                assign(arguments[item],this);
            }
        }
        //arg > 2
        if(arguments.length>2){
            for(let i = 0 ; i < 2;i++){
                assign(arguments[i],this);
            }
        }
    }
    /**
     * allocates data according to the type of parameter。
     * @param argData
     * @param ctx
     */
    function assign(argData,ctx) {
        if(isObject(argData)){
            ctx.autoElArg = argData
        }
        if(isArray(argData)){
            ctx.confArg = argData
        }
    }
    /**
     * create data for automatic retrieval validation.
     */
    function setAutoElArray (autoElArg) {
        let auto_el = null;
        if(isUndefined(autoElArg.el)){
            console.warn("You need a global selector.")
        }else if(!isString(autoElArg.el)){
            console.warn("You selector "+ autoElArg.el.toString() +" is invalid.")
        }else if(autoElArg.el[0] === "." || autoElArg.el[0] === "#"){
            let el = document.querySelector(autoElArg.el);
            if(isNull(el)){
                throw new Error("Can not find "+autoElArg.el+".");
            }else if(el.hasChildNodes()){
                if(isArray(autoElArg.tagNames) && autoElArg.tagNames.length>0){
                    auto_el = domCollectionToArray(el,autoElArg.tagNames)
                }else {
                    auto_el = domCollectionToArray(el,defaultObj.tagNames)
                }
            }
        }else {
            throw new Error(autoElArg.el +" is not a selector.")
        }
        return auto_el
    }
    /**
     * dom obj to array.
     * @param el
     * @param tagNameArray
     * @returns {Array}
     */
    function domCollectionToArray(el,tagNameArray) {
        let array = [];
        for (let i = 0;i<tagNameArray.length;i++){
            let tagTemp = el.getElementsByTagName(tagNameArray[i]);
            if(tagTemp){
                for (let j = 0;j<tagTemp.length;j++){
                    array.push(tagTemp[j])
                }
            }
        }
        return array
    }

    /**
     * @param node
     * @param ctx
     * @returns {*}
     */
    function setAutoValidError(node,ctx) {
        let valueObj = {};
        let dom_id = node.getAttribute("id");
        if(!dom_id){
            let tmpNode = document.createElement( "span" );
            tmpNode.appendChild(node.cloneNode(true));
            let str = tmpNode.innerHTML;
            console.warn("The node "+str+" needs id.");
        }
        let _required = ctx.autoElArg.required;
        if(isUndefined(_required) || isTrue(_required)){
            let errDom = document.querySelector("#err-"+dom_id);
            if(errDom){
                errDom.parentNode.removeChild(errDom);
                node.style.borderColor = "";
            }
            if(isNullString(node.value)){
                insertAfter(ctx.autoElArg,node,dom_id,'nullErr');
                return false
            }else {
                return setAutoValidData(ctx,valueObj,dom_id,node)
            }
        }else {
            return setAutoValidData(ctx,valueObj,dom_id,node)
        }
    }
    /**
     * insert err msg after the dom.
     * @param node_obj
     * @param node
     * @param dom_id
     * @param errType
     */
    function insertAfter(node_obj,node,dom_id,errType){
        let currentDom = document.createElement("div");
        currentDom.setAttribute("class","err-info");
        currentDom.setAttribute("id","err-"+dom_id);
        node.style.borderColor = node_obj.borderColor ? node_obj.borderColor : defaultObj.color;
        if(isObject(node_obj.promptStyle)){
            for (let item in node_obj.promptStyle){
                try {
                    currentDom.style[item] = node_obj.promptStyle[item]
                }catch (err){
                    throw new Error(err)
                }
            }
        }
        currentDom.innerHTML = !isUndefined(node_obj[errType]) ? node_obj[errType] : defaultObj[errType];
        let parent = node.parentNode;
        if (parent.lastChild === node) {
            parent.appendChild(currentDom);
        } else {
            parent.insertBefore(currentDom, node.nextSibling);
        }
    }
    /**
     * set auto validate data.
     * @param ctx
     * @param valueObj
     * @param dom_id
     * @param node
     * @returns {*}
     */
    function setAutoValidData(ctx,valueObj,dom_id,node) {
        let temp = valueObj;
        let alwaysReturn = ctx.autoElArg.alwaysReturn;
        if( isTrue(alwaysReturn) || isUndefined(alwaysReturn)){
            if(dom_id){
                temp[dom_id] = node.value;
            }
        }else {
            if(dom_id && node.value !== ""){
                temp[dom_id] = node.value;
            }
        }
        return temp;
    }
    /**
     * @type {{constructor: NiceValidate, validate: NiceValidate.validate}}
     */
    NiceValidate.prototype = {
        Constructor:NiceValidate,
        validate:function () {
            if(this.autoElArg && !this.confArg){
                let temp_data = [];
                let return_data = {};
                let data = setAutoElArray(this.autoElArg);
                if(data){
                    for(let i = 0 ; i < data.length ; i++){
                        temp_data.push(setAutoValidError(data[i],this))
                    }
                    for(let j = 0 ; j < temp_data.length ;j++){
                        if(!temp_data[j]){
                            return false
                        }else {
                            for(let item in temp_data[j]){
                                if(item) {
                                    return_data[item] = temp_data[j][item]
                                }
                            }
                        }
                    }
                    return return_data
                }
            }
            if(this.confArg){
                let _temp_data = [];
                let _return_data = {};
                for(let item in this.confArg){
                    _temp_data.push(setConfValidError(this.confArg[item]))
                }
                for(let n = 0 ; n < _temp_data.length ;n++){
                    if(!_temp_data[n]){
                        return false
                    }else {
                        for(let item in _temp_data[n]){
                            if(item) {
                                _return_data[item] = _temp_data[n][item]
                            }
                        }
                    }
                }
                return _return_data
            }
        }
    };
    /**
     * setConfValidError
     * @param confObj
     * @returns {*}
     */
    function setConfValidError(confObj) {
        let valueObj = {};
        let node = document.querySelector(confObj.el);
        let dom_id = "";
        if(confObj.el[0] !== "." && confObj.el[0] !== "#"){
            throw new Error(confObj.el +" is not a selector.")
        }
        if(confObj.el[0] === "."){
            dom_id = confObj.el.split(".")[1]
        }
        if(confObj.el[0] === "#"){
            dom_id = confObj.el.split("#")[1]
        }
        let errDom = document.querySelector("#err-"+dom_id);
        if(errDom){
            errDom.parentNode.removeChild(errDom);
            node.style.borderColor = "";
        }
        if(isUndefined(confObj.required) || isTrue(confObj.required)){
            if(isNullString(node.value)){
                insertAfter(confObj,node,dom_id,'nullErr');
                return false
            }
        }
        if(isArray(confObj.range) && !isNullString(node.value)){
            if(confObj.range[0] <= confObj.range[1] && confObj.range[0] >= 0 && confObj.range[1] > 0 && confObj.range.length === 2 ){
                if(node.value.length < confObj.range[0] || node.value.length > confObj.range[1]) {
                    insertAfter(confObj,node,dom_id,'rangeErr');
                    return false
                }
            }else {
                throw new Error("The 'range' is invalid")
            }
        }
        if(isString(confObj.type) && !isNullString(confObj.type) && !isNullString(node.value)){
            if(!DependencyInjection(confObj.type)(node.value)){
                insertAfter(confObj,node,dom_id,confObj.type+'Err');
                return false
            }
        }
        valueObj[dom_id] = node.value;
        return valueObj;
    }
    /**
     * dependency match.
     * @param nv_type
     * @returns {*}
     * @constructor
     */
    function DependencyInjection(nv_type) {
        for (let item in Utils){
            if(item.replace("$","") === nv_type){
                return Utils[item]
            }
        }
        throw new Error("Cannot found the type of "+nv_type+".")
    }
    return NiceValidate;
});
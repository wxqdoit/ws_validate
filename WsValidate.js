/*
 * WsValidate JavaScript Library v1.0.0
 * Date: 2019-12-13
 * author: wxqdoit
 */
(function (name, context, factory) {
    // AMD ,Node ,Browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else context[name] = factory();
})("WsValidate", typeof window !== "undefined" ? window : this, function () {
    "use strict";
    let defaultStr = {
        color: "#de8484!important",
        nullErr: "this field can not be null.",
        rangeErr: "the length of this field is invalid.",
        emailErr: "the email is invalid.",
        phoneErr: "the phone is invalid.",
        numberErr: "the number is invalid.",
        cardErr: "the card is invalid.",
        dateErr: "the date is invalid.",
    };

    function isNull(val) {
        return val === null;
    }

    function isNullString(val) {
        return val === "";
    }

    function isObject(val) {
        if (val !== null && typeof val === "object") {
            return val.constructor === Object;
        }
        return false;
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

    function isTrue(val) {
        return val === true;
    }

    function isFalse(val) {
        return val === false;
    }

    function isArray(val) {
        return val instanceof Array
    }

    let utils = {
        tagNames: ['input', "textarea", "select"],
        typeList: ["email", "phone", "card", "date", "number"],
        $email(email) {
            let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,3})+$/;
            let re = new RegExp(reg);
            return re.test(email)
        },
        $phone(phone) {
            let reg = /^1[0-9]{10}$/;
            let re = new RegExp(reg);
            return re.test(phone)
        },
        $card(card) {
            let reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            let re = new RegExp(reg);
            return re.test(card)
        },
        $date(date) {
            let reg = /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
            let re = new RegExp(reg);
            return re.test(date)
        },
        $number(data) {
            let reg = /^-?\d+\.?\d*$/;
            let re = new RegExp(reg);
            return re.test(data)
        }
    };

    /**
     *
     * @param args
     * @returns {WsValidate}
     * @constructor
     */
    function WsValidate(...args) {
        this.utils = utils;
        this.config = {};
        this.result = {};
        this.elCollections = null;
        if (args.length === 0) {
            return this;
        } else {
            if (isObject(args) || JSON.stringify(args) !== '{}') {
                // deep copy config to WsValidate
                let arg = args[0];
                this.config = {
                    el: arg.el || '',
                    autoValidate: arg.autoValidate || false,
                    required: arg.required || false,
                    tagNames: arg.tagNames || '',
                    onBlur: arg.onBlur || function () {
                    },
                    onChange: arg.onChange || function () {
                    },
                }
            } else {
                return this;
            }
        }
        if (isString(this.config.el)) {
            // if el is String : "#id" ".class"
            this.elCollections = parseSelector(this.config.el, this);
            if (this.config.autoValidate) {
                autoValidate(this.elCollections, this)
            }
        } else if (isArray(this.config.el)) {
            // if el is array : [{"#id"},{".class"}]
            if (this.config.autoValidate) {
                autoValidate(this.config.el, this)
            }
        }

    }

    /**
     *
     * @type {{Constructor: WsValidate}}
     */
    WsValidate.prototype = {
        Constructor: WsValidate,
        validate() {
            console.log(this);
            return this.result;
        }
    };

    /**
     * @param selector
     * @param ctx
     * @returns {*}
     */
    function parseSelector(selector, ctx) {
        let elCollection = null;
        if (isUndefined(selector) || isNullString(selector)) {
            console.warn("You need a global node config.");
            return ctx;
        }
        if (isString(selector) && (selector[0] === "." || selector[0] === "#")) {
            let el = document.querySelector(selector);
            if (isNull(el)) {
                throw new Error("Can not find '" + selector + "'.");
            } else if (el.hasChildNodes()) {
                if (isArray(ctx.config.tagNames) && ctx.config.tagNames.length > 0) {
                    elCollection = domCollectionToArray(el, ctx.config.tagNames)
                } else {
                    elCollection = domCollectionToArray(el)
                }
            }
        }
        return elCollection
    }

    function autoValidate(elc, ctx) {
        if (elc) {
            for (let i = 0; i < elc.length; i++) {
                onEventImpl(elc[i], ctx)
            }
        }
    }

    /**
     * Blur event implement.
     * @param ctx
     * @param node
     * @param fn
     */
    function onEventImpl(node, ctx) {
        if (isString(node.el)) {
            if (node.el) {
                let el = document.querySelector(node.el);
                if (!isNull(el)) {

                    if (node.onBlur && typeof node.onBlur === 'function') {

                        el.onblur = () => {
                            node.value = el.value;
                            node.dataset = el.dataset || '';
                            node.id = el.getAttribute('id');
                            node.klass = el.getAttribute('class');
                            node.onBlur(node)
                        }
                    }

                    if (node.onInput && typeof node.onInput === 'function') {
                        el.oninput = function () {
                            node.value = el.value;
                            node.dataset = el.dataset || '';
                            node.id = el.getAttribute('id');
                            node.klass = el.getAttribute('class');
                            node.onInput(node)
                        }
                    }

                } else {
                    throw new Error(node.el + " can not be found.")
                }
            } else {
                throw new Error("Field of 'el' required.")
            }
        } else {
            node.el.onblur = () => {
                node.value = node.el.value;
                ctx.config.onBlur(node)
            };
            node.el.onchange = () => {
                node.value = node.el.value;
                ctx.config.onChange(node)
            }
        }
    }

    /**
     * dom obj to array.
     * @param el
     * @param tagNameArray
     * @returns {Array}
     */
    function domCollectionToArray(el, tagNameArray = utils.tagNames) {
        let array = [];
        for (let i = 0; i < tagNameArray.length; i++) {
            let tagTemp = el.getElementsByTagName(tagNameArray[i]);
            if (tagTemp) {
                for (let j = 0; j < tagTemp.length; j++) {
                    let item = {
                        el: tagTemp[j],
                        id: tagTemp[j].getAttribute('id'),
                        klass: tagTemp[j].getAttribute('class'),
                        dataset: tagTemp[j].dataset || ''
                    };
                    array.push(item)
                }
            }
        }
        return array
    }

    return WsValidate;
});
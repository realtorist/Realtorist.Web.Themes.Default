(function (Bloodhound) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Bloodhound__default = /*#__PURE__*/_interopDefaultLegacy(Bloodhound);

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function");
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                writable: true,
                configurable: true
            }
        });
        if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
        _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
            return o.__proto__ || Object.getPrototypeOf(o);
        };
        return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
        _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
            o.__proto__ = p;
            return o;
        };

        return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === "function") return true;

        try {
            Date.prototype.toString.call(Reflect.construct(Date, [], function () { }));
            return true;
        } catch (e) {
            return false;
        }
    }

    function _assertThisInitialized(self) {
        if (self === void 0) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return self;
    }

    function _possibleConstructorReturn(self, call) {
        if (call && (typeof call === "object" || typeof call === "function")) {
            return call;
        }

        return _assertThisInitialized(self);
    }

    function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();

        return function _createSuperInternal() {
            var Super = _getPrototypeOf(Derived),
                result;

            if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;

                result = Reflect.construct(Super, arguments, NewTarget);
            } else {
                result = Super.apply(this, arguments);
            }

            return _possibleConstructorReturn(this, result);
        };
    }

    function _superPropBase(object, property) {
        while (!Object.prototype.hasOwnProperty.call(object, property)) {
            object = _getPrototypeOf(object);
            if (object === null) break;
        }

        return object;
    }

    function _get(target, property, receiver) {
        if (typeof Reflect !== "undefined" && Reflect.get) {
            _get = Reflect.get;
        } else {
            _get = function _get(target, property, receiver) {
                var base = _superPropBase(target, property);

                if (!base) return;
                var desc = Object.getOwnPropertyDescriptor(base, property);

                if (desc.get) {
                    return desc.get.call(receiver);
                }

                return desc.value;
            };
        }

        return _get(target, property, receiver || target);
    }
    /**
     * Supplier of default formatResult function.
     *
     * @return default implementation of formatResult function
     */

    function formatResultSupplier() {
        return function (feature) {
            return feature
        };
    }

    var Options = /*#__PURE__*/function () {
        /**
         * URL of the Photon API to use
         * @type {string}
         */

        /**
         * Limit number of results
         * @type {number}
         */

        /**
         * Function to control the way features types (amenity, school, etc.) are displayed in the default
         * formatResult function
         * @type {Function}
         */

        /**
         * Function to control the way geojson features are displayed in the results box
         * @type {Function}
         */

        /**
         * Latitude to make search with priority to a geo position
         * @type {number}
         */

        /**
         * Longitude to make search with priority to a geo position
         * @type {number}
         */

        /**
         * Preferred language
         * @type {string}
         */
        function Options(options) {
            _classCallCheck(this, Options);

            options && Object.assign(this, options);
        }

        _createClass(Options, [{
            key: "api",
            get: function get() {
                return '/api/Address/Autocomplete';
            }
        }, {
            key: "formatResultFunc",
            get: function get() {
                return this.formatResult || formatResultSupplier();
            }
        }, {
            key: "reqParams",
            get: function get() {
                var reqParams = {
                };

                return reqParams;
            }
        }]);

        return Options;
    }();

    var AddressEngine = /*#__PURE__*/function (_Bloodhound) {
        _inherits(AddressEngine, _Bloodhound);

        var _super = _createSuper(AddressEngine);

        function AddressEngine(options) {
            var _this;

            var $ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.$;

            _classCallCheck(this, AddressEngine);

            options = new Options(options);
            _this = _super.call(this, {
                local: [],
                queryTokenizer: Bloodhound__default['default'].tokenizers.nonword,
                datumTokenizer: AddressEngine.datumTokenizer,
                identify: AddressEngine.identify,
                remote: {
                    url: options.api,
                    sufficient: 5,
                    prepare: function prepare(query, settings) {
                        settings.data = options.reqParams;
                        settings.data.query = query;
                        return settings;
                    },
                    transform: function transform(response) {
                        return response || [];
                    }
                }
            });

            _defineProperty(_assertThisInitialized(_this), "options", void 0);

            _defineProperty(_assertThisInitialized(_this), "jQuery", void 0);

            _this.options = options;
            _this.jQuery = $;
            return _this;
        }

        _createClass(AddressEngine, [{
            key: "search",
            value: function search(query, syncFn, asyncFn) {
                var _this2 = this;

                var syncPromise = this.jQuery.Deferred();
                var asyncPromise = this.jQuery.Deferred();

                _get(_getPrototypeOf(AddressEngine.prototype), "search", this).call(this, query, function (datums) {
                    syncPromise.resolve(datums);
                }, function (datums) {
                    asyncPromise.resolve(datums);
                });

                this.jQuery.when(syncPromise, asyncPromise).then(function (syncResults, asyncResults2) {
                    var allResults = [].concat(syncResults, asyncResults2);

                    _this2.jQuery(_this2).trigger('addresspicker:predictions', [allResults]);

                    syncFn(syncResults);
                    asyncFn(asyncResults2);
                });
            }
            /**
             * Transforms default typeahead event 'typeahead:selected' to
             * 'addresspicker:selected'. The same event is triggered by
             * bloodhound.reverseGeocode.
             *
             * @param typeahead jquery wrapper around address input
             */

        }, {
            key: "bindDefaultTypeaheadEvent",
            value: function bindDefaultTypeaheadEvent(typeahead) {
                var _this3 = this;

                typeahead.bind('typeahead:select', function (event, place) {
                    _this3.jQuery(_this3).trigger('addresspicker:selected', [place]);
                });
            }
            /**
             * Makes reverse geocoding of position and triggers event
             * 'addresspicker:selected' with result.
             *
             * @param position array with latitude & longitude
             */

        }], [{
            key: "datumTokenizer",
            value: function datumTokenizer(feature) {
                feature;
            }
        }, {
            key: "identify",
            value: function identify(feature) {
                return feature;
            }
        }]);

        return AddressEngine;
    }(Bloodhound__default['default']);

    window.AddressEngine = AddressEngine;

}(Bloodhound));

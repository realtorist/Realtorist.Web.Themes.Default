;
calculatorUtils = (function () {

    function calculateButtonPrevent(event) {
        event.preventDefault();
    }

    //Validate on keypress to restrict users to type anything but numeric values.
    function inputValidation() {
        //Parse the value of the money inputs to be float with 2 decimals
        $('.money').on('blur', function () {
            if ($(this).val().length > 0) $(this).val(parseFloat($(this).val()).toFixed(2));
        });
    }

    function attachCustomEvent() {
        $("body").on("htmlInserted", accordion);
    }

    function accordion() {
        var element = $(".accordion");
        // We hide all panel-body as initial state id dont contain the class active
        $(".accordion:not(.active)").find('.panel-body').hide();

        element.find('.panel-heading').on('click', function (event) {
            event.preventDefault();

            var panelHeading = $(this),
                panelBody = panelHeading.next('.panel-body');


            if (panelHeading.hasClass("active")) {
                panelBody.slideUp();
                panelHeading.removeClass("active");
            } else {
                $(this).addClass("active");
                panelBody.slideDown();
            }

        });

    }

    function initialize() {
        inputValidation();
        attachCustomEvent();
        $("button[id='calculate']").on("click", calculateButtonPrevent);
    }

    // Reveal public pointers to
    // private functions and properties
    return {
        init: initialize
    };

})();

mortgageCalculator = (function () {
    function MortgageCalculator() {

    };

    MortgageCalculator.prototype = {
        paymentFrequencyArray: {
            "none": 0,
            "weekly": 52,
            "accelerated_weekly": 52,
            "accelerated_bi_weekly": 26,
            "bi_weekly": 26,
            "semi_monthly": 24,
            "monthly": 12,
            "yearly": 1,
            "one_time": 0
        },
        paymentFrequencyMap: {
            "none": '',
            "weekly": 'weekly',
            "accelerated_weekly": 'weekly',
            "accelerated_bi_weekly": 'bi-weekly',
            "bi_weekly": 'bi-weekly',
            "semi_monthly": 'semi-monthly',
            "monthly": 'monthly',
            "yearly": 'yearly',
            "one_time": 'one time'
        },

        getMinimumDownpaymentPercent: function (price) {
            var low = 500000;
            var high = 1000000;
            if (price < low) return 5;
            else if (price >= high) return 20;
            else return (low * 0.05 + (price - low) * 0.1) * 100 / price;
        },

        calculateCompoundInt: function (paymentFrequency, interestRate) {
            return (Math.pow(1 + (interestRate / 200), (1 / (paymentFrequency / 2))) - 1);
        },

        getCompundInterest: function (paymentFrequencyInput, interestRate) {
            if (paymentFrequencyInput === "accelerated_weekly") {
                // compound interest for Accelerated Payments
                return this.calculateCompoundInt(12, interestRate);
            } else if (this.paymentFrequencyInput === "accelerated_bi_weekly") {
                // compound interest for Accelerated Payments
                return this.calculateCompoundInt(12, interestRate);
            } else {
                var paymentFrequency = this.paymentFrequencyArray[paymentFrequencyInput];
                return this.calculateCompoundInt(paymentFrequency, interestRate);
            }
        },

        mortgageFormula: function (paymentFrequency, years, compoundInterest, principal) {
            var numberOfPayments = paymentFrequency * years;
            var numerator = compoundInterest * principal * (Math.pow((1 + compoundInterest), numberOfPayments));
            var denominator = (Math.pow((1 + compoundInterest), numberOfPayments)) - 1;
            return numerator / denominator;
        },
        getPeriodicPaymentAmnt: function (paymentFrequencyInput, interestRate, years, principal) {
            var compoundInterest = this.getCompundInterest(paymentFrequencyInput, interestRate);

            if (paymentFrequencyInput === "accelerated_weekly") {
                // compound interest for Accelerated Payments
                return this.mortgageFormula(12, years, compoundInterest, principal) / 4; //Accelerated Weekly
            } else if (this.paymentFrequencyInput === "accelerated_bi_weekly") {
                // compound interest for Accelerated Payments
                return this.mortgageFormula(12, years, compoundInterest, principal) / 2; //Accelerated Bi-weekly
            } else {
                var paymentFrequency = this.paymentFrequencyArray[paymentFrequencyInput];
                return this.mortgageFormula(paymentFrequency, years, compoundInterest, principal);
            }

        },
        calculatePrepayment: function (paymentFrequency, prepaymentFrequency, years, prepaymentAmount, startWith) {
            var prepaymentArray = [];
            var totalNumPayments = paymentFrequency * years;

            var prepaymentEvery;
            // We calculate the ratio of the regular payments and additional payments
            var paymentRatio = prepaymentFrequency > 0 ? paymentFrequency / prepaymentFrequency : 0;
            // if the ratio is not an integer we need to divide the additional payment by the payment ratio
            // So we can get how much will pay each payment thus the prepayEvery is equal to 1
            // Otherwise the prepaymentRatio is integer and we can use it on our for loop as prepaymentEvery
            if (paymentRatio % 1) {
                prepaymentAmount = prepaymentAmount / paymentRatio;
                prepaymentEvery = 1;
            } else {
                prepaymentEvery = paymentRatio;
            }
            // This loop will create the prepayment array
            var counter = 0;
            for (var i = 1; i <= totalNumPayments; i++) {
                if (i == startWith || i == counter) {
                    prepaymentArray[i] = parseFloat(prepaymentAmount);
                    counter = i + prepaymentEvery;
                    continue;
                }
                // we need to put zeros on the prepayment array until we reach startWith or the 
                // counter is equal to the payment 
                prepaymentArray[i] = 0;
            }

            return prepaymentArray;
        },
        calculatePaymentBreakdownPrepayments: function (prepaymentArray, paymentFrequencyInput, principal, interestRate, years) {
            var breakDownArray = [],
                principalAmountAdditionalPayments = 0,
                principalAmount = 0,
                initialBalance = principal,
                balanceWithPayments = principal,
                k = 1; // counter for prepaymentArray

            var paymentFrequency = this.paymentFrequencyArray[paymentFrequencyInput];

            //we have to recalculate compound interest to avoid miscalculations on compound interest
            var compoundInterest = this.getCompundInterest(paymentFrequencyInput, interestRate);
            var periodicPaymentAmnt = this.getPeriodicPaymentAmnt(paymentFrequencyInput, interestRate, years, principal);
            if (prepaymentArray) {
                for (var i = 0; i < years; i++) {
                    //We Add the year and the corresponding balance to the breakdown array 
                    breakDownArray.push([i, Number(initialBalance.toFixed(0)), Number(balanceWithPayments.toFixed(0))]);
                    for (var j = 1; j <= paymentFrequency; j++) {
                        principalAmount = periodicPaymentAmnt - ((compoundInterest * initialBalance));
                        principalAmountAdditionalPayments = periodicPaymentAmnt + prepaymentArray[k] - ((compoundInterest * balanceWithPayments));
                        k++;
                        if ((initialBalance - principalAmount) <= 0) {
                            break;
                        }
                        initialBalance -= principalAmount;
                        balanceWithPayments = (balanceWithPayments - principalAmountAdditionalPayments) <= 0 ? 0 : balanceWithPayments -= principalAmountAdditionalPayments;
                    }
                }
            }
            return breakDownArray;
        },
        calculateInterestTotalPrepayments: function (prepaymentArray, paymentFrequencyInput, years, interestRate, principal) {
            var interestTotal = 0,
                interestTotalPrepayments = 0,
                principalAmount = 0,
                principalAmountPrepayments = 0,
                initialBalance = principal,
                balancePrepayments = principal,
                k = 1; // counter for prepaymentArray

            var paymentFrequency = this.paymentFrequencyArray[paymentFrequencyInput];
            var compoundInterest = this.getCompundInterest(paymentFrequencyInput, interestRate);
            var periodicPaymentAmnt = this.getPeriodicPaymentAmnt(paymentFrequencyInput, interestRate, years, principal);
            if (prepaymentArray) {
                for (var i = 0; i < years; i++) {
                    for (var j = 1; j <= paymentFrequency; j++) {

                        var interestPeriod = (compoundInterest * initialBalance);
                        var interestPeriodPrepayments = (compoundInterest * balancePrepayments);

                        principalAmount = periodicPaymentAmnt - interestPeriod;
                        principalAmountPrepayments = periodicPaymentAmnt + prepaymentArray[k] - interestPeriodPrepayments;
                        k++;
                        interestTotal += interestPeriod;
                        interestTotalPrepayments += interestPeriodPrepayments;
                        if ((initialBalance - principalAmount) <= 0) {
                            break;
                        }
                        initialBalance -= principalAmount;
                        balancePrepayments = (balancePrepayments - principalAmountPrepayments) <= 0 ? 0 : balancePrepayments -= principalAmountPrepayments;
                    }
                }
            }
            return [interestTotal, interestTotalPrepayments];
        },
        calculatePaymentBreakdown: function (principal, paymentFrequency, interestRate, years, periodicPaymentAmnt) {

            var breakDownArray = [];
            var initialBalance = principal;
            var principalAmount = 0;


            var compoundInterest = this.calculateCompoundInt(paymentFrequency, interestRate);


            for (var i = 0; i < years; i++) {
                //We Add the year and the corresponding balance to the breakdown array 
                breakDownArray.push([i, Number(initialBalance.toFixed(0))]);
                for (var j = 1; j <= paymentFrequency; j++) {
                    principalAmount = periodicPaymentAmnt - (compoundInterest * initialBalance);

                    if ((initialBalance - principalAmount) <= 0) {
                        break;
                    }
                    initialBalance -= principalAmount;
                }
            }
            return breakDownArray;
        },
        calculateInterestTotal: function (principal, paymentFrequency, years, compoundInterest, periodicPaymentAmnt) {
            var interestTotal = 0;
            var initialBalance = principal;
            var interestPeriod = 0;
            var principalAmount = 0;


            for (var i = 0; i < years; i++) {
                for (var j = 1; j <= paymentFrequency; j++) {

                    interestPeriod = (compoundInterest * initialBalance);
                    principalAmount = periodicPaymentAmnt - interestPeriod;
                    interestTotal += interestPeriod;
                    if ((initialBalance - principalAmount) <= 0) {
                        break;
                    }
                    initialBalance -= principalAmount;

                }
            }
            return interestTotal;
        },
    }

    return new MortgageCalculator();
})();

(function ($, window, document, undefined) {
    "use strict";
    // We create the defaults once
    var pluginName = "calculator",
        defaults = {
            price: 500000,
            downpayment: 5,
            rate: 2.5,
            autoCalculate: false,
            chart_total: "chart_total",
            chart_years: "chart_years",
            chartArea: {
                width: "90%",
                height: "auto",
                left: "120",
                top: "40",
            }
        };

    // The actual plugin constructor
    function Plugin(element, options) {

        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function () {

            this.createForm();

            //First we get the input values
            this.getInputValues();

            //Since weâ€™re using 'this' inside the object scope, weâ€™ll need to use jQuery.proxy on all event handlers
            $(this.element).on("click", "#calculate", $.proxy(this.calculateHandler, this));
            $(this.element).on("change", "[name=price]", $.proxy(this.calculateHandler, this));
            $(this.element).on("change", "[name=downpayment]", $.proxy(this.calculateHandler, this));
            $(this.element).on("change", "[name=interest]", $.proxy(this.calculateHandler, this));
            $(this.element).on("change", "[name=payment_frequency]", $.proxy(this.calculateHandler, this));
            $(this.element).on("change", "[name=prepayment_frequency]", $.proxy(this.prepaymentHandler, this));

            if (this.settings.autoCalculate) {
                this.calculateHandler();
            }

        },
        createForm: function () {
            var newForm = '<div class="col-md-6"><form> ' +
                '<div class="form-group">' +
                '<label for="mortgage">Price</label>' +
                '<div class="input-group">' + 
                '<div class="input-group-prepend">' + 
                '<span class="input-group-text">$</span>' + 
                '</div>' +
                '<input type="number" step="any" required name="price" class="money form-control" max="20000000" value="' + this.settings.price  + '" placeholder="Mortgage Amount">' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="mortgage">Down payment</label>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">%</span>' + 
                '</div>' +
                '<input type="number" step="0.1" required name="downpayment" class="money form-control" max="100" min="' + mortgageCalculator.getMinimumDownpaymentPercent(this.settings.price) + '" value="' + this.settings.downpayment + '" placeholder="Downpayment">' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="downpayment-money">Down payment ($)</label>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">$</span>' +
                '</div>' +
                '<input type="number" required name="downpayment-money" class="money form-control" readonly>' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="mortgage">Mortgage Amount</label>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">$</span>' + 
                '</div>' +
                '<input type="number" required name="mortgage" class="money form-control" readonly>' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label class="control-label" for="amortization">Mortgage Amortization</label>' +
                '<div class="input-group">' +
                '<input type="number" name="amortization" class="form-control" placeholder="Amortization Period - year(s)" min=1 max=30 value=25>' +
                '<div class="input-group-append">' +
                '<span class="input-group-text">Years</span>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="payment_frequency">Payment Type</label>' +
                '<select name="payment_frequency" class="form-control">' +
                '<option value="weekly">Weekly</option>' +
                '<option value="accelerated_weekly">Accelerated weekly</option>' +
                '<option value="accelerated_bi_weekly">Accelerated bi-weekly</option>' +
                '<option value="bi_weekly">Bi-weekly</option>' +
                '<option value="semi_monthly">Semi-monthly</option>' +
                '<option value="monthly" selected="selected">Monthly</option>' +
                '</select>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="interest">Interest Rate</label>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">%</span>' +
                '</div>' +
                '<input type="number" class="form-control" name="interest" min=0 max=99 value="' + this.settings.rate + '" step="0.1" placeholder="Interest Rate"> ' +
                '</div>' +
                '</div>' +

                '<div class="accordion">' +
                '<div class="panel-heading">' +
                '<div class="form-group">' +
                '<a href="#Accordion[panel_prepayment]">Prepayments <i class="icon-chevron-right"></i></a>' +
                '</div>' +
                '</div>' +

                '<div class="prepayments panel-body" id="Accordion[panel_prepayment]">' +
                '<label for="prepayment_frequency">Prepayment Type</label>' +
                '<div class="form-group">' +
                '<select name="prepayment_frequency" class="form-control">' +
                '<option value="none" selected="selected">None</option>' +
                '<option value="weekly">Weekly</option>' +
                '<option value="bi_weekly">Bi-weekly</option>' +
                '<option value="semi_monthly">Semi-monthly</option>' +
                '<option value="monthly">Monthly</option>' +
                '<option value="yearly">Yearly</option>' +
                '<option value="one_time">One-time</option>' +
                '</select>' +
                '</div>' +

                '<div class="form-group">' +
                '<label for="prepayment_amount">Prepayment Amount</label>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text">$</span>' +
                '</div>' +
                '<input type="number" step="any" required name="prepayment_amount" class="money form-control" max=2000000 value=0.00 placeholder="Prepayment Amount" disabled="">' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<label class="control-label" for="start_with">Start with payment</label>' +
                '<input type="number" name="start_with" class="form-control" placeholder="Start with payment" min=1 max=500 value=1 disabled="">' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="form-group">' +
                '<input type="submit" class="form-control" id="calculate" class="button" value="Calculate" />' +
                '</div>' +

                '</form>' +
                '</div > ';


            var chartDivs = '<div class="col-md-6"><div>' + 
                '<strong>Mortgage Payment:</strong> <span id="mortgage_payment"></span>' +
                '</div>' +
                '<div id="chart_total"></div>' +
                '<div id="chart_years"></div></div>';

            var row = $('<div class="row"></div>');
            row.appendTo(this.element);
            row.append(newForm);
            //row.append(mortgagePayment);
            row.append(chartDivs);
            $("body").trigger("htmlInserted");
        },
        getInterestTotalChartData: function (periodicPaymentAmnt) {

            var interestTotal = mortgageCalculator.calculateInterestTotal(this.principal, this.paymentFrequency, this.years, mortgageCalculator.getCompundInterest(this.getPaymentFrequncyType(), this.interestRate), periodicPaymentAmnt);

            var data = [
                ['Mortgage total', 'Total Principal', 'Total Interest', {
                    role: 'annotation'
                }],
                ['Mortgage Term ' + this.years + ' years', this.principal, Number(interestTotal.toFixed(0)), ''],
            ];
            return data;
        },
        getPrice: function () {
            return Number($(this.element).find('[name="price"]').val());
        },
        getDownpayment: function () {
            return Number($(this.element).find('[name="downpayment"]').val());
        },
        getMortgageAmount: function () {
            return this.getPrice() - this.getPrice() * this.getDownpayment() / 100;
        },
        getInputValues: function () {
            this.years = this.getAmortizationYears();
            this.principal = this.getMortgageAmount();
            this.interestRate = this.getInterestRate();
            this.paymentFrequency = this.getPaymentFrequency();
            this.prepaymentAmount = this.getPrepaymentAmount();
            this.prepaymentFrequency = this.getPrepaymentFrequency();
            this.startWith = this.getStartWith();
        },

        getAmortizationYears: function () {
            return parseInt($(this.element).find('[name="amortization"]').val(), 10);
        },

        getInterestRate: function () {
            return Number($(this.element).find('[name="interest"]').val());
        },

        getPaymentFrequncyType: function () {
            return $(this.element).find('[name="payment_frequency"] option:selected').val();
        },

        getPaymentFrequency: function () {
            return mortgageCalculator.paymentFrequencyArray[this.getPaymentFrequncyType()];
        },

        getPrepaymentFrequency: function () {
            this.prepaymentFrequencyInput = $(this.element).find('[name="prepayment_frequency"] option:selected').val();
            return mortgageCalculator.paymentFrequencyArray[this.prepaymentFrequencyInput];
        },

        getPrepaymentAmount: function () {
            return $(this.element).find('[name="prepayment_amount"]').val();
        },

        getStartWith: function () {
            return $(this.element).find('[name="start_with"]').val();
        },

        
        drawChart: function (dataInterest, dataPaymentBreakdown) {
            googleCharts.GoogleCharts.load(() => {
                this.drawChartInternal(dataInterest, dataPaymentBreakdown);
            });
        },
        drawChartInternal: function (dataInterest, dataPaymentBreakdown) {
            var data1 = googleCharts.GoogleCharts.api.visualization.arrayToDataTable(dataInterest);
            var options1 = {
                chartArea: this.settings.chartArea,
                colors: ['#123456', '#234567'],
                legend: {
                    position: 'top',
                    maxLines: 3
                },
                bar: {
                    groupWidth: '75%'
                },
                isStacked: true,
            };

            var chart1 = new googleCharts.GoogleCharts.api.visualization.ColumnChart(document.getElementById(this.settings.chart_total));
            chart1.draw(data1, options1);


            var data2 = googleCharts.GoogleCharts.api.visualization.arrayToDataTable(dataPaymentBreakdown);
            var options2 = {
                chartArea: this.settings.chartArea,
                title: 'Mortgage',
                colors: ['#123456', '#234567'],
                hAxis: {
                    title: 'Year',
                    /*titleTextStyle: {
                        color: 'orange'
                    }*/
                },
                vAxis: {
                    format: '0'
                }
            };

            var chart2 = new googleCharts.GoogleCharts.api.visualization.ColumnChart(document.getElementById(this.settings.chart_years));
            chart2.draw(data2, options2);
        },
        prepaymentHandler: function () {
            //We need to disable/enable the inputs based on the prepayment type input
            var frequencySelect = $(this.element).find("[name=prepayment_frequency]");
            var disable = $("option:selected", frequencySelect).val() === "none" ? true : false;

            $(this.element).find('[name="prepayment_amount"]').prop("disabled", disable);
            $(this.element).find('[name="start_with"]').prop("disabled", disable);
        },
        calculateHandler: function (event) {
            event && event.preventDefault();
            //We need to get the payment frequency each time the user change it

            var dataInterest = [];
            var dataPaymentBreakdown = [];

            var minDownpayment = mortgageCalculator.getMinimumDownpaymentPercent(this.getPrice());
            if (this.getDownpayment() < minDownpayment) {
                $(this.element).find('[name="downpayment"]').val(minDownpayment.toFixed(2)).attr('min', minDownpayment.toFixed(2));
            }

            //We start with getting all the inputs values
            this.getInputValues();

            var periodicPaymentAmnt = mortgageCalculator.getPeriodicPaymentAmnt(this.getPaymentFrequncyType(), this.interestRate, this.years, this.principal);

            $(this.element).find("#mortgage_payment").text("$" + Number(periodicPaymentAmnt).toFixed(2) + ' ' + mortgageCalculator.paymentFrequencyMap[this.getPaymentFrequncyType()]);
            $(this.element).find('[name="mortgage"]').val(Number(this.getMortgageAmount()).toFixed(2));
            $(this.element).find('[name="downpayment-money"]').val((this.getPrice() - Number(this.getMortgageAmount())).toFixed(2));

            if (this.prepaymentFrequencyInput !== "none") {

                var prepaymentArray = mortgageCalculator.calculatePrepayment(this.paymentFrequency, this.prepaymentFrequency, this.years, this.prepaymentAmount, this.getStartWith());

                var paymentBreakdownPrepayments = mortgageCalculator.calculatePaymentBreakdownPrepayments(prepaymentArray, this.getPaymentFrequncyType(), this.principal, this.interestRate, this.years);

                var interest = mortgageCalculator.calculateInterestTotalPrepayments(prepaymentArray, this.getPaymentFrequncyType(), this.years, this.interestRate, this.principal);
                dataInterest = [
                    ['Mortgage total', 'Total Principal', 'Total Interest', {
                        role: 'annotation'
                    }],
                    ['Mortgage term ' + this.years + ' years', this.principal, Number(interest[0].toFixed(0)), ''],
                    ['Mortgage term ' + this.years + ' years with additional payments', this.principal, Number(interest[1].toFixed(0)), '']
                ];


                dataPaymentBreakdown = [
                    ['Year', 'Principal Balance', 'Balance With Additional Payments']
                ].concat(paymentBreakdownPrepayments);
                this.drawChart(dataInterest, dataPaymentBreakdown);

            } else {
                var paymentBreakdownNoPrepayments = mortgageCalculator.calculatePaymentBreakdown(this.principal, this.paymentFrequency, this.interestRate, this.years, periodicPaymentAmnt);
                dataInterest = this.getInterestTotalChartData(periodicPaymentAmnt);
                dataPaymentBreakdown = [
                    ['Year', 'Principal Balance']
                ].concat(paymentBreakdownNoPrepayments);
                this.drawChart(dataInterest, dataPaymentBreakdown);
            }
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });

        return this;
    };

})(jQuery, window, document);
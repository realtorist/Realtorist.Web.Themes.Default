AOS.init({
    duration: 800,
    easing: 'slide'
});

(function ($) {

    "use strict";

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        var $checkbox = $('input[type=checkbox]', this);
        $.each($checkbox, function () {
            if (o.hasOwnProperty(this.name) && Array.isArray(o[this.name])) {
                o[this.name] = o[this.name][0];
            }
        });
        return o;
    };

    $(window).stellar({
        responsive: true,
        parallaxBackgrounds: true,
        parallaxElements: true,
        horizontalScrolling: false,
        hideDistantElements: false,
        scrollProperty: 'scroll'
    });


    var fullHeight = function () {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });

    };
    fullHeight();

    // loader
    var loader = function () {
        setTimeout(function () {
            if ($('#page-loader').length > 0) {
                $('#page-loader').removeClass('show');
            }
        }, 1);
    };
    loader();

    // Scrollax
    $.Scrollax();

    // Burger Menu
    var burgerMenu = function () {

        $('body').on('click', '.js-fh5co-nav-toggle', function (event) {

            event.preventDefault();

            if ($('#ftco-nav').is(':visible')) {
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
            }



        });

    };
    burgerMenu();


    var onePageClick = function () {


        $(document).on('click', '#ftco-nav a[href^="#"]', function (event) {
            event.preventDefault();

            var href = $.attr(this, 'href');

            $('html, body').animate({
                scrollTop: $($.attr(this, href)).offset().top - 70
            }, 500, function () {
                // window.location.hash = href;
            });
        });

    };

    onePageClick();

    var carousel = function () {
        $('.home-slider').owlCarousel({
            loop: true,
            autoplay: true,
            margin: 0,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            nav: false,
            autoplayHoverPause: false,
            items: 1,
            navText: ["<span class='ion-md-arrow-back'></span>", "<span class='ion-chevron-right'></span>"],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                1000: {
                    items: 1
                }
            }
        });
        $('.carousel-properties').owlCarousel({
            autoplay: true,
            center: false,
            loop: true,
            items: 1,
            margin: 30,
            stagePadding: 0,
            nav: false,
            navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            }
        });
        $('.carousel-photos').owlCarousel({
            autoplay: true,
            center: false,
            loop: true,
            items: 1,
            margin: 0,
            stagePadding: 0,
            nav: true,
            navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                1000: {
                    items: 3
                }
            }
        });
        $('.carousel-agent').owlCarousel({
            autoplay: true,
            center: false,
            loop: true,
            items: 1,
            margin: 30,
            stagePadding: 0,
            nav: false,
            navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            }
        });
        $('.carousel-testimony').owlCarousel({
            autoplay: true,
            autoHeight: true,
            center: true,
            loop: true,
            items: 1,
            margin: 30,
            stagePadding: 0,
            nav: false,
            dots: true,
            navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            },
            onInitialize: function (event) {
                if (event.target.querySelector('.item') <= 3) {
                    this.options.loop = false;
                }
            }
        });

    };
    carousel();

    $('nav .dropdown').hover(function () {
        var $this = $(this);
        // 	 timer;
        // clearTimeout(timer);
        $this.addClass('show');
        $this.find('> a').attr('aria-expanded', true);
        // $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
        $this.find('.dropdown-menu').addClass('show');
    }, function () {
        var $this = $(this);
        // timer;
        // timer = setTimeout(function(){
        $this.removeClass('show');
        $this.find('> a').attr('aria-expanded', false);
        // $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
        $this.find('.dropdown-menu').removeClass('show');
        // }, 100);
    });


    $('#dropdown04').on('show.bs.dropdown', function () {
        console.log('show');
    });

    // scroll
    var scrollWindow = function () {
        $(window).scroll(function () {
            var $w = $(this),
                st = $w.scrollTop(),
                navbar = $('.ftco_navbar'),
                sd = $('.js-scroll-wrap');

            if (!navbar) return;

            if (st > 150) {
                if (!navbar.hasClass('scrolled')) {
                    navbar.addClass('scrolled');
                }
            }
            if (st < 150) {
                if (navbar.hasClass('scrolled')) {
                    navbar.removeClass('scrolled sleep');
                }
            }
            if (st > 350) {
                if (!navbar.hasClass('awake')) {
                    navbar.addClass('awake');
                }

                if (sd.length > 0) {
                    sd.addClass('sleep');
                }
            }
            if (st < 350) {
                if (navbar.hasClass('awake')) {
                    navbar.removeClass('awake');
                    navbar.addClass('sleep');
                }
                if (sd.length > 0) {
                    sd.removeClass('sleep');
                }
            }
        });
    };
    scrollWindow();



    var counter = function () {

        $('#section-counter, .hero-wrap, .ftco-counter').waypoint(function (direction) {

            if (direction === 'down' && !$(this.element).hasClass('animate__animated')) {

                var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
                $('.number').each(function () {
                    var $this = $(this),
                        num = $this.data('number');
                    console.log(num);
                    $this.animateNumber(
                        {
                            number: num,
                            numberStep: comma_separator_number_step
                        }, 7000
                    );
                });

            }

        }, { offset: '95%' });

    }
    counter();

    contentWayPoint();

    // magnific popup
    $('.carousel-photos').magnificPopup({
        type: 'image',
        delegate: '.owl-item:not(.cloned) a',
        closeOnContentClick: true,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            verticalFit: true,
            titleSrc: function (item) {
                return item.el.find('img').attr('title');
            }
        },
        zoom: {
            enabled: true,
            duration: 300, // don't foget to change the duration also in CSS
            opener: function (element) {
                return element.find('img');
            }
        }
    });

    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,

        fixedContentPos: false
    });

    var getRequestInformationText = function (type, address) {
        switch (type) {
            case '1': return 'I was searching on your site and came across a property at ' + address + '. Please send me more information about this listing.\nThank you.';
            case '2': return 'I was searching on your site and came across a property at ' + address + '.  I would like to schedule an appointment to further discuss this property.\nThank you.';
            case '3': return 'I was searching on your site and came across a property at ' + address + '. Please send me more information about the neighbourhood around this listing.\nThank you.';
            case '4': return 'I was searching on your site and came across a property at ' + address + '.  I am interested in any recently sold listings in the area of this property.\nThank you.';
            case '5': return 'I want to get free evaluation for my home at ' + address + '.\nThank you.';
            case '0': default: 'I was searching on your site and want to get in touch with you to discuss more.\nThank you.'
        }
    }

    $('#createAccountModal').on('show.bs.modal', function (e) {
        $(e.currentTarget).find('form')[0].reset();

        $(e.currentTarget).find('#request-form-type').trigger('change');

        var $form = $(e.currentTarget).find('form');
        var $submitbutton = $(e.currentTarget).find('button.submit');
        var $loader = $form.find('#request-form-loader');

        $submitbutton.unbind();
        $submitbutton.click(function () {
            $form.submit();
        });

        $form.unbind();

        $form.on('submit', function (submitEvent) {
            submitEvent.preventDefault();
            if (!$form.valid()) return;

            var $modal = $form.closest('#createAccountModal');
            $loader.addClass('show');
            $modal.find('button.submit').attr('disabled', 'true');

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                dataType: 'text',
                data: JSON.stringify($form.serializeObject()),
                contentType: 'application/json',
                success: function (result) {
                    showSnackBar('Thanks for creating an account');
                    $loader.removeClass('show');
                    $modal.modal('hide');
                    $modal.find('button.submit').removeAttr('disabled');

                    sendEvent('form', $form.find('#request-form-listing-id').val());

                    setCookie('AccountCreated', 'true', 30);
                },
                error: function (xhr, resp, text) {
                    showSnackBar('There was error during submitting your request. Please try again.');
                    $loader.removeClass('show');
                    $modal.find('button.submit').removeAttr('disabled');
                }
            })

            return false;
        })

        $form.on("blur", "input", (event) => {
            if ($(event.currentTarget).valid()) {
                $submitbutton.removeAttr("disabled");
            } else {
                $submitbutton.attr("disabled", "disabled");
            }
        });
    });

    $('#requestInformationModal').on('show.bs.modal', function (e) {
        $(e.currentTarget).find('form')[0].reset();

        var address = $(e.relatedTarget).data('address');
        var listingId = $(e.relatedTarget).data('listing-id');
        $(e.currentTarget).find('#request-form-address').val(address);
        $(e.currentTarget).find('#request-form-listing-id').val(listingId);

        $(e.currentTarget).find('#request-form-type').trigger('change');

        $(e.currentTarget).find('button.submit').unbind();
        $(e.currentTarget).find('button.submit').click(function () {
            $(e.currentTarget).find('form').submit();
        });
    });

    $('form.request-information-form').each(function () {
        var $form = $(this);

        var $type = $form.find('#request-form-type');
        var $message = $form.find('#request-form-message');

        $type.unbind();
        $type.change(function () {
            var message = getRequestInformationText(this.value, $form.find('#request-form-address').val());
            $message.val(message);
        });

        $type.trigger('change');

        var $submitbutton = $form.find('[type="submit"]');
        var $loader = $form.find('#request-form-loader');

        $form.unbind();

        $form.on('submit', function (submitEvent) {
            submitEvent.preventDefault();
            if (!$form.valid()) return;

            var $modal = $form.closest('#requestInformationModal');
            $loader.addClass('show');
            $modal.find('button.submit').attr('disabled', 'true');

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                dataType: 'text',
                data: JSON.stringify($form.serializeObject()),
                contentType: 'application/json',
                success: function (result) {
                    showSnackBar('Your request was submitted. Thanks for your request. You will be contacted soon.');
                    $loader.removeClass('show');
                    $modal.modal('hide');
                    $modal.find('button.submit').removeAttr('disabled');

                    sendEvent('form', $form.find('#request-form-listing-id').val());
                },
                error: function (xhr, resp, text) {
                    showSnackBar('There was error during submitting your request. Please try again.');
                    $loader.removeClass('show');
                    $modal.find('button.submit').removeAttr('disabled');
                }
            })

            return false;
        })

        $form.on("blur", "input", (event) => {
            if ($(event.currentTarget).valid()) {
                $submitbutton.removeAttr("disabled");
            } else {
                $submitbutton.attr("disabled", "disabled");
            }
        });
    })
})(jQuery);


function contentWayPoint() {
    var i = 0;
    $('.ftco-animate').waypoint(function (direction) {

        if (direction === 'down' && !($(this.element).hasClass('animate__animated'))) {

            i++;

            $(this.element).addClass('item-animate');
            setTimeout(function () {

                $('body .ftco-animate.item-animate').each(function (k) {
                    var el = $(this);
                    setTimeout(function () {
                        var effect = el.data('animate-effect');
                        if (effect === 'fadeIn') {
                            el.addClass('animate__fadeIn animate__animated');
                        } else if (effect === 'fadeInLeft') {
                            el.addClass('animate__fadeInLeft animate__animated');
                        } else if (effect === 'fadeInRight') {
                            el.addClass('animate__fadeInRight animate__animated');
                        } else {
                            el.addClass('animate__fadeInUp animate__animated');
                        }
                        el.removeClass('item-animate');
                    }, k * 20, 'easeInOutExpo');
                });

            }, 100);

        }

    }, { offset: '95%' });
};

function updateURLParameter(url, param, paramVal) {
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];
        if (TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }
    else {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];

        if (TheParams)
            baseURL = TheParams;
    }

    if (TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function getQueryParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function scrollToElement(selector) {
    $('html, body').animate({
        scrollTop: $(selector).offset().top - 70
    }, 500, function () {
    });
}

function autocollapse(menu, child, maxHeight) {
    var $menu = $(menu);
    var menuHeight = $menu.innerHeight();
    if (menuHeight >= maxHeight) {

        $(menu + ' .dropdown').removeClass('d-none');
        $menu.removeClass('w-auto').addClass("w-100");

        while (menuHeight > maxHeight) {
            //  add child to dropdown
            var children = $menu.children(menu + ' ' + child + ':not(.skip,.dropdown)');
            var count = children.length;
            $(children[count - 1]).prependTo(menu + ' .dropdown-menu');
            menuHeight = $menu.innerHeight();
        }
        $menu.addClass("w-auto").removeClass('w-100');

    }
    else {

        var collapsed = $(menu + ' .dropdown-menu').children(menu + ' ' + child);

        if (collapsed.length === 0) {
            $(menu + ' .dropdown').addClass('d-none');
        }

        while (menuHeight < maxHeight && ($menu.children(menu + ' ' + child).length > 0) && collapsed.length > 0) {
            //  remove child from dropdown
            collapsed = $(menu + ' .dropdown-menu').children(child);
            $(collapsed[0]).insertBefore($menu.children(menu + ' ' + child + '.dropdown'));
            menuHeight = $menu.innerHeight();

            if (collapsed.length === 0) {
                $(menu + ' .dropdown').addClass('d-none');
            }
        }

        if (menuHeight > maxHeight) {
            autocollapse(menu, child, maxHeight);
        }
    }
}

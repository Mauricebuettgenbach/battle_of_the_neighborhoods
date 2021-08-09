(function () {
    var keyMatch = window.location.search.match(/[?&]alenoWidgetKey=([^&]+).*$/) || [];
    var PARAM_PUBLIC_KEY = keyMatch[1];

    if (PARAM_PUBLIC_KEY) {
        window.ALENO_PUBLIC_KEY = PARAM_PUBLIC_KEY;
    }

    if (typeof window.alenoPopup !== 'object') {
        window.alenoPopup = {};

        alenoPopup.getUrl = function (href) {
            var absoluteUrl;
            var params;
            var hrefKeyParam = (href || '').match(/[?&]k=([^&?]+).*$/) || [];
            window.ALENO_PUBLIC_KEY = hrefKeyParam[1] || window.ALENO_PUBLIC_KEY;

            if (typeof window.ALENO_PUBLIC_KEY !== 'string') {
                throw 'ALENO_PUBLIC_KEY not found';
            }
            try {
                absoluteUrl = JSON.parse(atob(ALENO_PUBLIC_KEY)).s;
            } catch (error) {}
            try {
                absoluteUrl = absoluteUrl || atob(ALENO_PUBLIC_KEY).split('_')[2];
            } catch (error) {}

            if (href) {
                params = href.substr(href.indexOf('?'), href.length);
                return absoluteUrl + 'reservations/v2.0/reservations.html' + (params || '');
            }

            params = location.search ? '&' + location.search.slice(1) : '';
            return absoluteUrl + 'reservations/v2.0/reservations.html?k=' + ALENO_PUBLIC_KEY + params;
        };

        alenoPopup.onClosePopup = function (event) {
            if (event && event.data && event.data.name === 'request-close-popup') {
                alenoPopup.removeIFrame();
            }
        };

        alenoPopup.createIFrame = function (href) {
            var iFrame = document.createElement('iframe');
            iFrame.setAttribute('src', alenoPopup.getUrl(href));
            iFrame.setAttribute('allowtransparency', 'true');
            iFrame.className = 'aleno-reservations';

            document.body.appendChild(iFrame);
        };

        alenoPopup.removeIFrame = function () {
            var iFrames = document.getElementsByClassName('aleno-reservations');
            Array.prototype.slice.call(iFrames).forEach(function (iframe) {
                iframe.parentNode.removeChild(iframe);
            });
            window.removeEventListener('message', alenoPopup.onClosePopup);
        };

        alenoPopup.show = function (event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            alenoPopup.removeIFrame();
            alenoPopup.createIFrame(event && (event.currentTarget && event.currentTarget.href || event.target && event.target.href));
            window.addEventListener('message', alenoPopup.onClosePopup);
        };

        alenoPopup.getButtons = function () {
            var $buttonsRaw = document.querySelectorAll('.open-reservation2,a[href*="/reservations/v2.0/reservations.html"]');
            return Array.prototype.slice.call($buttonsRaw);
        };

        alenoPopup.destroy = function ($buttons) {
            $buttons = $buttons || alenoPopup.getButtons();
            $buttons.forEach(function ($button) {
                $button.removeEventListener('click', alenoPopup.show, false);
            });
        };

        alenoPopup.init = function () {
            var $buttons = alenoPopup.getButtons();
            alenoPopup.destroy($buttons);

            $buttons.forEach(function ($button) {
                $button.addEventListener('click', alenoPopup.show, false);
            });
        };

        alenoPopup.check = function () {
            if (location.search.match(/[&?]alenoWidget=open/)) {
                alenoPopup.show();
                alenoPopup.check = function () {};
            }
        };
    }

    if (/complete|interactive|loaded/.test(document.readyState)) {
        alenoPopup.check();
        alenoPopup.init();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            alenoPopup.check();
            alenoPopup.init();
        });
    }
})();

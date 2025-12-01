(function ($) {
    "use strict";

    // ===== LOGIN FUNCTIONALITY =====
    
    // Helper function to get cookie by name
    function getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }
    
    // Check if user is logged in
    window.isUserLoggedIn = function() {
        return getCookie('poseifyLoggedIn') === 'true';
    };

    // Navigate to page only if logged in
    window.bookNow = function(page) {
        if (isUserLoggedIn()) {
            window.location.href = page || 'contact.html';
        } else {
            alert('Please log in to book a model.');
        }
        return false;
    };

    // Redirect to login if not logged in
    window.requireLogin = function(redirectAfterLogin) {
        if (!isUserLoggedIn()) {
            // Store the page they want to visit after login
            const expirationTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000); // 1 hour
            document.cookie = `redirectAfterLogin=${redirectAfterLogin || 'index.html'}; expires=${expirationTime.toUTCString()}; path=/`;
            window.location.href = 'login.html';
            return false;
        }
        return true;
    };

    // Update login/logout button visibility
    window.updateLoginButtonVisibility = function() {
        const isLoggedIn = isUserLoggedIn();
        
        // Desktop buttons
        const loginBtn = document.getElementById('loginNavBtn');
        const logoutBtn = document.getElementById('logoutNavBtn');
        
        // Mobile buttons
        const loginBtnMobile = document.getElementById('loginNavBtnMobile');
        const logoutBtnMobile = document.getElementById('logoutNavBtnMobile');
        
        if (loginBtn) {
            isLoggedIn ? loginBtn.classList.add('d-none') : loginBtn.classList.remove('d-none');
        }
        if (logoutBtn) {
            isLoggedIn ? logoutBtn.classList.remove('d-none') : logoutBtn.classList.add('d-none');
        }
        if (loginBtnMobile) {
            isLoggedIn ? loginBtnMobile.classList.add('d-none') : loginBtnMobile.classList.remove('d-none');
        }
        if (logoutBtnMobile) {
            isLoggedIn ? logoutBtnMobile.classList.remove('d-none') : logoutBtnMobile.classList.add('d-none');
        }
    };

    // Hide "Login to Access" carousel buttons when logged in
    window.updateLoginButtonsVisibility = function() {
        const isLoggedIn = isUserLoggedIn();
        const carouselLoginButtons = document.querySelectorAll('.carousel-login-btn');
        
        carouselLoginButtons.forEach(function(btn) {
            isLoggedIn ? btn.classList.add('d-none') : btn.classList.remove('d-none');
        });
    };

    // Logout user
    window.logoutUser = function() {
        // Clear cookies by setting expiration to past date
        document.cookie = 'poseifyLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        document.cookie = 'poseifyUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        document.cookie = 'redirectAfterLogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        
        updateLoginButtonVisibility();
        updateLoginButtonsVisibility(); // Hide login carousel buttons
        alert('You have been logged out.');
        window.location.href = 'index.html';
    };

    // Check if user should be redirected after login
    $(document).ready(function() {
        // Update login button visibility
        updateLoginButtonVisibility();
        updateLoginButtonsVisibility();
    });

    // Spinner
    var spinner = function () {
        $(window).on('load', function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        });
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.navbar').addClass('position-fixed bg-dark shadow-sm');
        } else {
            $('.navbar').removeClass('position-fixed bg-dark shadow-sm');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });

    // Duration - Show/Hide Time Range
    $('#duration').on('change', function() {
        var selectedDuration = $(this).val();
        var timeRangeContainer = $('#timeRangeContainer');
        var endTimeContainer = $('#endTimeContainer');
        var startTimeInput = $('#startTime');
        var endTimeInput = $('#endTime');
        
        // Show time range only if duration is selected and not "Full Day"
        if (selectedDuration && selectedDuration !== 'Full Day' && selectedDuration !== '') {
            timeRangeContainer.show();
            endTimeContainer.show();
            startTimeInput.focus();
        } else {
            timeRangeContainer.hide();
            endTimeContainer.hide();
            startTimeInput.val('');
            endTimeInput.val('');
        }
    });

    // Booking form submission to Google Sheet via Google Apps Script Web App
    var showFormMessage = function(html, type) {
        // type: 'success' or 'danger'
        var msg = '<div class="alert alert-' + (type || 'success') + ' alert-dismissible fade show" role="alert">' +
            html +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
            '</div>';
        $('#formMessage').html(msg);
    };

    $('#bookingForm').on('submit', function(e) {
        e.preventDefault();

        // Deployed Apps Script Web App URL
        var webAppUrl = 'https://script.google.com/macros/s/AKfycbxZkEBPV15lEtEB3n5GUIWTs485IiIeUouMdzvZ-WdwUlP9Ve_g3NS-76MLAhfeytTT/exec';
        if (!webAppUrl || webAppUrl.indexOf('PASTE_YOUR_WEB_APP_URL_HERE') === 0) {
            showFormMessage('Form not configured: please set the Google Apps Script Web App URL in <code>js/main.js</code>.', 'danger');
            return;
        }

        var payload = {
            timestamp: new Date().toISOString(),
            name: $('#name').val() || '',
            email: $('#email').val() || '',
            phone: $('#phone').val() || '',
            eventDate: $('#eventDate').val() || '',
            duration: $('#duration').val() || '',
            location: $('#location').val() || '',
            message: $('#message').val() || ''
        };

        // disable submit while sending and show spinner
        var $btn = $(this).find('button[type="submit"]');
        $btn.prop('disabled', true).text('Sending...');
        $('#formSpinner').removeClass('d-none');

        $.ajax({
            url: webAppUrl,
            method: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json'
        }).done(function(res) {
            console.log('Form submission success:', res);
            showFormMessage('Thanks! Your booking request has been sent.', 'success');
            $('#bookingForm')[0].reset();

            // show success modal
            try {
                var successModalEl = document.getElementById('successModal');
                var successModal = new bootstrap.Modal(successModalEl);
                successModal.show();
            } catch (err) {
                // fallback: show message in formMessage
                showFormMessage('We Will Contact You Soon.', 'success');
            }
        }).fail(function(xhr, status, err) {
            console.error('Form submission error:', {status: xhr.status, statusText: xhr.statusText, responseText: xhr.responseText, error: err});
            showFormMessage('There was a problem sending your request. Please try again later. (Error: ' + xhr.status + ')', 'danger');
        }).always(function() {
            $btn.prop('disabled', false).text('Book Model');
            $('#formSpinner').addClass('d-none');
        });
    });

    
})(jQuery);



(function($) {
    // $.validator.addMethod('filesize', function (value, elemet, param){
    //     return this.optional(element) || (element.files[0].size <= param)
    // }, 'File size must be less than {0}');
    // Limit the size of each individual file in a FileList.
    $.validator.addMethod( "maxsize", function( value, element, param ) {
        if ( this.optional( element ) ) {
            return true;
        }

        if ( $( element ).attr( "type" ) === "file" ) {
            if ( element.files && element.files.length ) {
                for ( var i = 0; i < element.files.length; i++ ) {
                    if ( element.files[ i ].size > param ) {
                        return false;
                    }
                }
            }
        }

        return true;
    }, $.validator.format( "File size must not exceed {0} bytes each." ) );
    var form = $("#signup-form");
    form.validate({
        errorPlacement: function errorPlacement(error, element) {
            element.before(error);
        },
        rules: {
            username: {
                required: true,
            },
            email: {
                required: true,
                email : true
            },
            password: {
                required: true,
            },
            password2: {
                required: true,
                equalTo: '#password',
            },
            postcode: {
                required: true,
            },
            bathrooms: {
                required: true,
            },
            bedrooms: {
                required: true,
            },
            mobilenumber: {
                required: true,
                digits: true
            },
            fullname: {
                required: true,
            },
            city: {
                required: true,
            },
            address: {
                required: true,
            },
            income: {
                required: true
            },
            profilePic:{
                required: true,
                extension: "png|jpeg|jpg|gif",
                maxsize: 20000000,
            },
            nationalID:{
                required: true,
                extension: "png|jpeg|jpg|pdf",
                maxsize: 20000000,
            },
            healthInsurance:{
                required: true,
                extension: "pdf",
                maxsize: 20000000,
            }
        },
        messages : {
            email: {
                email: 'Not a valid email address <i class="zmdi zmdi-info"></i>'
            },
            password2: 'Passwords do not match',
            mobilenumber: 'Please enter a valid phone number',
            profilePic: 'Your file must be JPG, GIF or PNG and less than 2MB',
            nationalID: 'Your ID must be in JPG, GIF, PNG or PDF format and less than 2MB',
            healthInsurance: 'Your Health Insurance must be in PDF format and less than 2MB'
        },
        onfocusout: function(element) {
            $(element).valid();
        },
    });
    form.steps({
        headerTag: "h3",
        bodyTag: "fieldset",
        transitionEffect: "slideLeft",
        labels: {
            previous: 'Previous',
            next: 'Next',
            finish: 'Finish',
            current: ''
        },
        titleTemplate: '<div class="title"><span class="number">#index#</span>#title#</div>',
        onStepChanging: function(event, currentIndex, newIndex) {
            form.validate().settings.ignore = ":disabled,:hidden";
            // console.log(form.steps("getCurrentIndex"));
            return form.valid();
        },
        onFinishing: function(event, currentIndex) {
            form.validate().settings.ignore = ":disabled";
            //console.log(getCurrentIndex);
            console.log('finished');
            return form.valid();
        },
        onFinished: function(event, currentIndex) {
            //console.log('finished finished')
           if(document.getElementById('signup-form').submit()){
               console.log('form submited');
           }
           //alert('Submited');

        },
        // onInit : function (event, currentIndex) {
        //     event.append('demo');
        // }
    });

    jQuery.extend(jQuery.validator.messages, {
        required: "",
        remote: "",
        url: "",
        date: "",
        dateISO: "",
        number: "",
        digits: "",
        creditcard: "",
        equalTo: ""
    });


    $.dobPicker({
        daySelector: '#expiry_date',
        monthSelector: '#expiry_month',
        yearSelector: '#expiry_year',
        dayDefault: 'DD',
        yearDefault: 'YYYY',
        minimumAge: 0,
        maximumAge: 120
    });

    $('#password').pwstrength();
    $('#password2').pwstrength();

    $('#button').click(function () {
        $("input[type='file']").trigger('click');
    })

    $("input[type='file']").change(function () {
        $('#val').text(this.value.replace(/C:\\fakepath\\/i, ''))
    })



})(jQuery);

$('.side-bar-link.users').addClass('active');



$('.add-btn').on('click', () => {
    $('.add-form').removeClass('hidden');
})



$('.close').on('click', () => {
    $('form').addClass('hidden');
})



$('.modify-form-password').addClass('hidden')



let userId = ''
let result = {};
                                           
$('.data').on('click', async function () {
    try {
        $('.user-pop-up').removeClass('hidden');
        userId = $(this).attr('id');
        
        const response = await fetch(`/users/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        result = await response.json();

        $('.username').html(result.username);
        $('.email').html(result.email);
        $('.role').html(result.role);

      

        if (result.banned) {
            $('.status').html('محظور');
            $('.ban-btn').html('إلغاء حظر المستخدم')
        } else {
            $('.status').html('فعال')
            $('.ban-btn').html('حظر المستخدم')
        }


    } catch (error) {
        console.error('Error fetching:', error);
    }
})


$('.user-pop-up .close').on('click', () => {
    $('.user-pop-up').addClass('hidden');
})

$('.user-pop-up .modify-btn').on('click', () => {
    $('.pop-up-modify h5').html(` ${result.username} تعديل المستخدم`)
    $('.pop-up-modify').removeClass('hidden');
    $('.upper-layer').removeClass('hidden');
})


$('.pop-up-modify .info').on('click', () => {
    $('.modify-form.info').removeClass('hidden');
    $('.user-pop-up').addClass('hidden');
    $('.pop-up-modify').addClass('hidden');
    $('.upper-layer').addClass('hidden');

    $('.modify-form input[name="username"]').val(result.username)
    $('.modify-form input[name="email"]').val(result.email)
    $('.modify-form input[name="number"]').val(result.number)
    $('.modify-form select[name="role"]').val(result.role)
})


$('.pop-up-modify .password').on('click', function () {
    $('.modify-form-password').removeClass('hidden');
    $('.modify-form-password h5').html(`${result.username} تعديل كلمة المرور للمستخدم`)
    $('.user-pop-up').addClass('hidden');
    $('.pop-up-modify').addClass('hidden');
    $('.upper-layer').addClass('hidden');
})


$('.pop-up-modify .close').on('click', () => {
    $('.pop-up-modify').addClass('hidden');
    $('.upper-layer').addClass('hidden');
})


$('.ban-btn').on('click', async function() {
    try {
        const response = await fetch(`users/user/ban/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        })


        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.alertMessage);
        
        window.location.href = 'users'
    } catch (error) {
        console.log("Error fetching:", error)
    }
})



$('.patch-btn').on('click', function (event) {              
    event.preventDefault();
    submitForm('PATCH');
})


$('.delete-btn').on('click', function (event) {            
    event.preventDefault();
    console.log("delete-btn");
    submitForm('DELETE');
})


async function submitForm(method) {
    try {
        let URL;
        let response;

        if (method === 'PATCH') {
            URL = `users/user/update/${userId}`;
            response = await fetch(URL, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: $('.modify-form input[name="username"]').val(),
                    email: $('.modify-form input[name="email"]').val(),
                    number: $('.modify-form input[name="number"]').val(),
                    role: $('.modify-form select[name="role"]').val(),
                })
            });
        } else if (method === 'DELETE') {
            URL = `users/user/delete/${userId}`;
            response = await fetch(URL, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }


        if (method === 'PATCH') {
            alert(` تم تعديل معلومات المستخدم ${result.username} بنجاح`)
        } else {
            alert(`تم حذف المستخدم ${result.username} بنجاح`)
        }

        
        // Redirect to the users page after the operation
        window.location.href = "/users";

    } catch (error) {
        console.log('Error fetching:', error);
    }
}


$('.modify-form-password').on('submit', async function(event) {
    try {
        event.preventDefault();
        const password = $('.modify-form-password input[name="password"]').val();
        const password2 = $('.modify-form-password input[name="password2"]').val();

        const response = await fetch(`users/user/password/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password,
                password2: password2
            })
        })

        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        alert(result.alertMessage);
        
        if (password === password2)
            window.location.href = '/users'



    } catch (error) {
        console.log('Error fetching:', error);
    }
})

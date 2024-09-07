$('.side-bar-link.settings').addClass('active');



const data = document.getElementById('account');
const account = JSON.parse(data.dataset.account);
const id = account._id;

let result = {};
$('.setting.modify').on('click', async function() {
    try {

        const response = await fetch(`/users/user/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
    
        result = await response.json();

    } catch (error) {
        console.log("Error fetching:", error);
    }

    $('.pop-up-modify').removeClass('hidden');
})




$('.pop-up-modify .close').on('click', () => {
    $('.pop-up-modify').addClass('hidden');
})


$('.close').on('click', () => {
    $('form').addClass('hidden');
})




$('.pop-up-modify .info').on('click', () => {
    $('.pop-up-modify').addClass('hidden');
    $('.modify-form.info').removeClass('hidden');

    $('.modify-form input[name="username"]').val(result.username)
    $('.modify-form input[name="email"]').val(result.email)
    $('.modify-form input[name="number"]').val(result.number)
})


$('.pop-up-modify .password').on('click', () => {
    $('.pop-up-modify').addClass('hidden');
    $('.modify-form-password').removeClass('hidden');
})



$('.modify-form.info').on('submit', async function(event) {
    try {
        event.preventDefault();
        const response = await fetch(`/users/user/update/${id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                username: $('.modify-form input[name="username"]').val(),
                email: $('.modify-form input[name="email"]').val(),
                number: $('.modify-form input[name="number"]').val(),
            })
        })

        if (!response.ok) {
            throw new Error('HTTP error! Status:', response.status);
        }

        window.location.href = '/settings';

    } catch(error) {
        console.log('Error fetching:', error)
    }
})



$('.modify-form-password').on('submit', async function(event) {
    try {
        event.preventDefault();
        const password = $('.modify-form-password input[name="password"]').val();
        const password2 = $('.modify-form-password input[name="password2"]').val();

        const response = await fetch(`users/user/password/${id}`, {
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
            window.location.href = '/settings'



    } catch (error) {
        console.log('Error fetching:', error);
    }
})
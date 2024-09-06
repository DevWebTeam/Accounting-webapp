$('.side-bar-link.clients').addClass('active');




$('#add-btn').on('click', () => {           
    $('.add-form').removeClass('hidden');
})





$('.close').on('click', () => {            
    $('form').addClass('hidden');
})





$('#group-btn').on('click', () => {
    $('#group-table').removeClass('hidden')
});





$('.group-close').on('click', () => {
    $('#group-table').addClass('hidden')
})



$('.group-add-btn').on('click', () => {
    $('#group-form').removeClass('hidden');
})



$('.dlt-btn').on('click', async function () {
    const groupId = this.id;

    try {
        // Perform the DELETE request
        const response = await fetch(`/clients/groups/delete/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = response.json()
        alert(`تم حذف المجموعة`);

        // Fetch the updated group list
        const groupListResponse = await fetch('/clients/groups');
        if (!groupListResponse.ok) {
            throw new Error(`HTTP error! Status: ${groupListResponse.status}`);
        }

        // Parse the JSON from the correct response
        const groups = await groupListResponse.json();
        

        const groupListDiv = $('.group-list');
        groupListDiv.empty(); // Clear the existing content

        // Rebuild the group list
        groups.forEach(group => {
            const groupHtml = `
                <div class="group">
                    <button class="dlt-btn" id=${group._id}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(250,7,7,1)">
                            <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 4V6H15V4H9Z"></path>
                        </svg>
                    </button>
                    <p class="group-data">${group.name}</p>
                </div>
            `;
            groupListDiv.append(groupHtml);
        });

    } catch (error) {
        console.log('Error fetching:', error);
    }
});







let clientId = ''         
let result;                                
$('.data').on('click', async function () {                 

    clientId = this.id

    try {
        
        const response = await fetch(`/clients/client/${clientId}`);              
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        result = await response.json();
        
        
        $('.modify-form').removeClass('hidden');          
                                  
        $('#name').val(result.name);
        $('#email').val(result.email);
        $('#group').val(result.group);
        $('#number').val(result.number);
        $('#priorityCli').val(result.priorityCli);

    } catch (error) {
        console.error('Error fetching:', error);
    }
});








$('.patch-btn').on('click', function (event) {              
    event.preventDefault();
    submitForm('PATCH');
})


$('.delete-btn').on('click', function (event) {            
    event.preventDefault();
    submitForm('DELETE');
})


 async function submitForm(method) {
        let URL;

        if (method === 'PATCH') {
            URL = `clients/client/patch/${clientId}`
        } else if (method === 'DELETE') {
            URL = `clients/client/delete/${clientId}`
        }


        try {
            const response = await fetch(URL, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    name: $('#name').val(),             
                    email: $('#email').val(),
                    group: $('#group').val(),
                    number: $('#number').val(),
                    priorityCli: $('#priorityCli').val(),
                })

            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            if (method === 'DELETE') {
                alert(`تم حذف العميل ${result.name}`)
            } else {
                alert(`تم تعديل معلومات العميل ${result.name}`)
            }
            
            window.location.href = "/clients";

        } catch (error) {
            console.log('Error fetching:', error);
        }
}




$('#group-form').on('submit', async function (event) {
    event.preventDefault();
    try {
        const response = await fetch(`/clients/groups/add`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: $('.group-input').val()
            })

        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        $('#group-form').addClass('hidden')

        const groupListResponse = await fetch('/clients/groups');
        if (!groupListResponse.ok) {
            throw new Error(`HTTP error! Status: ${groupListResponse.status}`);
        }

        // Parse the JSON from the correct response
        const groups = await groupListResponse.json();
        console.log(groups);

        const groupListDiv = $('.group-list');
        groupListDiv.empty(); // Clear the existing content

        // Rebuild the group list
        groups.forEach(group => {
            const groupHtml = `
                <div class="group">
                    <button class="dlt-btn" id=${group._id}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(250,7,7,1)">
                            <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 4V6H15V4H9Z"></path>
                        </svg>
                    </button>
                    <p class="group-data">${group.name}</p>
                </div>
            `;
            groupListDiv.append(groupHtml);
        });

        $('.group-input').val('');
    
    } catch (error) {
        console.log('Error fetching', error);
    }
})
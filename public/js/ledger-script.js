
const clientName = $('select option:selected').text();
let ids = {};
let currencyName = '';




$('form.search').on('submit', async function (event) {
    try {
        event.preventDefault();
        
        const clientName = $('select option:selected').text(); // Make sure clientName is defined
        
        const response = await fetch(`/finances/ledger/currencies/${clientName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.log(response);
            return;
        }


        const result = await fetch('/currencies/exchRates', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })


        if (!result.ok) {
            console.log(result);
            return;
        }

        const currencies = await result.json();
        

        const currenciesExchRate = {};

        const transactions = await response.json();
        transactions.forEach(transaction => {
            ids[`${transaction.currencyName}`] = transaction.transactionIds;
            currenciesExchRate[`${transaction.currencyName}`] = currencies.find(currency => currency.nameInArabic === `${transaction.currencyName}`)?.exchRate
            
        })

        
        // Clear the existing content
        $('.overview-data').remove();


        let totalDeptedForUs = 0;
        
        // Update the DOM with the fetched transactions
        transactions.forEach(transaction => {
            const balance = transaction.totalCreditForUs - transaction.totalDeptedForUs;
            const balanceInDollar = +(balance * currenciesExchRate[transaction.currencyName]).toFixed(3)
            if (!isNaN(balanceInDollar)) {
                totalDeptedForUs += balanceInDollar;
            }  
            const html = `
                <div class="overview-data" id="${transaction.currencyName}">
                    <div>
                        <p>الرصيد المقوم</p>
                        <span>${balanceInDollar}</span>
                    </div>
                    <div>
                        <p>رصيد العملة</p>
                        <span>${balance}</span>
                    </div>
                    <div>
                        <p>دالن علينا</p>
                        <span>${transaction.totalDeptedForUs}</span>
                    </div>
                    <div>
                        <p>مدين لنا</p>
                        <span>${transaction.totalCreditForUs}</span>
                    </div>
                    <div>
                        <p>العملة</p>
                        <span>${transaction.currencyName}</span>
                    </div>
                </div>
            `;
            $('.transactions-container').append(html);

        });

        if (totalDeptedForUs < 0) {
            $('.total-count').html(`<p> ${-totalDeptedForUs.toFixed(2)} $ إجمالي الرصيد المقوم : دائن علينا ب`).removeClass('hidden').addClass('negative')
        } else if (totalDeptedForUs > 0) {
            $('.total-count').html(`<p> ${totalDeptedForUs.toFixed(2)} $ إجمالي الرصيد المقوم :مدين لنا ب`).removeClass('hidden').addClass('positive')
        } else {
            $('.total-count').addClass('hidden');
        }
    } catch (error) {
        console.log(error);
    }
});







$(document).on('click', '.overview-data', async function () {
    try {
        currencyName = $(this).attr('id');

        const response = await fetch('/finances/ledger/currencies/client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: ids[currencyName],
                clientName: clientName,
                currencyName: currencyName
            })
        });


        if (!response.ok) {
            console.error('Failed to fetch:', response.status);
            return;
        }




        // Handle the response (e.g., redirect or update the DOM)
        const data = await response.json();

        const transaction = encodeURIComponent(JSON.stringify(data.transactions));
        const total = encodeURIComponent(JSON.stringify(data.total));
        const account = encodeURIComponent(JSON.stringify(data.account));
        const info = encodeURIComponent(JSON.stringify(data.info));

        console.log(data);
        window.location.href = `/finances/ledger/account-statement?transaction=${transaction}&total=${total}&account=${account}&info=${info}`;

    } catch (error) {
        console.log(error.message);
    }
});
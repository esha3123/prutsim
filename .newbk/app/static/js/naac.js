document.addEventListener('DOMContentLoaded', () => {
    // IQAC Composition Data
    const compositionData = [
        { year: '2023-2024', link: 'https://saketcollege.edu.in/Docs/IQAC/IQAC-2023-24.pdf' },
        { year: '2022-2023', link: 'https://saketcollege.edu.in/Docs/IQAC/IQAC-2022-23.pdf' },
        { year: '2021-2022', link: 'https://saketcollege.edu.in/Docs/IQAC/IQAC-2021-22.pdf' },
        { year: '2020-2021', link: 'https://saketcollege.edu.in/Docs/IQAC/IQAC-2020-21.pdf' }
    ];

    // IQAC Minutes Data
    const minutesData = [
        { date: '2024-25', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/2024-25.pdf' },
        { date: '2023-24', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/2023-24.pdf' },
        { date: '2022-23', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/2022-23.pdf' },
        { date: '19-5-2021', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/19-5-2021.pdf', atr: 'https://saketcollege.edu.in/Docs/IQAC/ATR/19-5-2021.pdf' },
        { date: '11-2-2021', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/11-2-2021.pdf', atr: 'https://saketcollege.edu.in/Docs/IQAC/ATR/11-2-2021.pdf' },
        { date: '7-7-2020', minutes: 'https://saketcollege.edu.in/Docs/IQAC/Minutes/7-7-2020.pdf', atr: 'https://saketcollege.edu.in/Docs/IQAC/ATR/7-7-2020.pdf' }
    ];

    // Feedback Data
    const feedbackData = [
        { year: '2021-2022', link: 'https://saketcollege.edu.in/Docs/Feedback/2021-22.pdf' },
        { year: '2020-2021', link: 'https://saketcollege.edu.in/Docs/Feedback/2020-21.pdf' },
        { year: '2019-2020', link: 'https://saketcollege.edu.in/Docs/Feedback/2019-20.pdf' },
        { year: '2018-2019', link: 'https://saketcollege.edu.in/Docs/Feedback/2018-19.pdf' }
    ];

    // Populate IQAC Composition Table
    const compositionTable = document.getElementById('iqac-composition-table')?.getElementsByTagName('tbody')[0];
    if (compositionTable) {
        compositionData.forEach(item => {
            const row = compositionTable.insertRow();
            row.insertCell(0).textContent = item.year;
            row.insertCell(1).innerHTML = `<a href="${item.link}" class="view-btn" target="_blank"><button>View</button></a>`;
        });
    }

    // Populate IQAC Minutes Table
    const minutesTable = document.getElementById('iqac-minutes-table')?.getElementsByTagName('tbody')[0];
    if (minutesTable) {
        minutesData.forEach(item => {
            const row = minutesTable.insertRow();
            row.insertCell(0).textContent = item.date;
            row.insertCell(1).innerHTML = `<a href="${item.minutes}" class="view-btn" target="_blank"><button>View</button></a>`;
            row.insertCell(2).innerHTML = item.atr ? 
                `<a href="${item.atr}" class="view-btn" target="_blank"><button>View</button></a>` : 
                'N/A';
        });
    }

    // Populate Feedback Table
    const feedbackTable = document.getElementById('feedback-table')?.getElementsByTagName('tbody')[0];
    if (feedbackTable) {
        feedbackData.forEach(item => {
            const row = feedbackTable.insertRow();
            row.insertCell(0).textContent = item.year;
            row.insertCell(1).innerHTML = `<a href="${item.link}" class="view-btn" target="_blank"><button>View</button></a>`;
        });
    }

    // Tab Functionality
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
function fetchData(){
    //  // Replace with your Node.js server URL
    //  const apiUrl = 'http://localhost:3000/api/data';
  
    //  fetch(apiUrl)
    //    .then(response => {
    //      if (!response.ok) {
    //        throw new Error(`HTTP error! Status: ${response.status}`);
    //      }
    //      return response.json();
    //    })
    //    .then(data => {
    //     //  // Handle the fetched data
    //     //  document.getElementById('result').innerText = data.message;
    //     alert(`data.message : ${data.message}`) ; 
    //    })
    //    .catch(error => {
    //      console.error('Fetch error:', error);
    //      alert('Error fetching data.') ; 
    //    });
  
      const inputData = document.getElementById('com-box').value;
      
      // Replace with your Node.js server URL
      const apiUrl = 'http://localhost:8000/api/data';
    
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputData }),
      })
      .then(response => response.json())
      .then(data => {
  
        console.log('Data submitted successfully:', data);
  
        alert( `OwnerName  : ${data.message.ownerName}\nOwnerContactNumber : ${data.message.ownerContactNumber}`);
      })
      .catch(error => {
        console.error('Error submitting data:', error);
      });
    
    
  }
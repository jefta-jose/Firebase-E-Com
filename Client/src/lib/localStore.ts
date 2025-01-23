export const getUserRole = () => {
    // Retrieve the item from local storage
    const data = localStorage.getItem('supergear-storage');
  
    if (data) {
      try {
        // Parse the JSON string into a JavaScript object
        const parsedData = JSON.parse(data);
  
        // Access the role property
        const role = parsedData.state?.currentUser?.role;
  
        return role;
      } catch (error) {
        console.error('Error parsing local storage data:', error);
      }
    } else {
      console.log('No data found in local storage for the given key.');
    }
  
    return null;
  };
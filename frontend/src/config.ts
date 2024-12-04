export const config = {
  apiUrl: async () => {
    // Try ports in sequence
    const ports = [3001,3002, 3003];
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          console.log(`Connected to server on port ${port}`);
          return `http://localhost:${port}`;
        }
      } catch (e) {
        console.log(`Port ${port} not available, trying next...`);
      }
    }
    throw new Error('No server connection available. Please restart the server.');
  }
}; 

export const validateNotionUrl = (url: string): boolean => {
  return /^https:\/\/www\.notion\.so\/quilt-payfac\/[^-]+-[a-f0-9]{32}$/i.test(url);
}; 
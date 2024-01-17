// pages/api/savePlaces.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), 'selectedPlaces.json');

    // Read the existing data from the file
    fs.readFile(filePath, 'utf8', (readErr, data) => {
      if (readErr) {
        res.status(500).json({ message: 'Error reading file', error: readErr });
        return;
      }

      // Parse existing data and combine with new data
      let existingData = JSON.parse(data);
      const newData = req.body;

      // Combine and remove duplicates
      let combinedData = [...existingData, ...newData];
      combinedData = combinedData.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      // Write the updated data back to the file
      fs.writeFile(filePath, JSON.stringify(combinedData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          res.status(500).json({ message: 'Error writing to file', error: writeErr });
          return;
        }
        res.status(200).json({ message: 'Data saved successfully' });
      });
    });
  } else {
    // Handle any other HTTP method
    res.status(200).json({ name: 'John Doe' });
  }
}

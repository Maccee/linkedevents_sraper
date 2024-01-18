import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const filePath = path.join(process.cwd(), "selectedPlaces.json");

    fs.readFile(filePath, "utf8", (readErr, data) => {
      if (readErr) {
        res.status(500).json({ message: "Error reading file", error: readErr });
        return;
      }

      let existingData = JSON.parse(data);
      const newData = req.body;

      let combinedData = [...existingData, ...newData];
      combinedData = combinedData.reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      fs.writeFile(
        filePath,
        JSON.stringify(combinedData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            res
              .status(500)
              .json({ message: "Error writing to file", error: writeErr });
            return;
          }
          res.status(200).json({ message: "Data saved successfully" });
        }
      );
    });
  } else {
    res.status(200).json({ name: "John Doe" });
  }
}

import React, { useState } from "react";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const fetchPlaces = () => {
    const data = require("./data.json");
    let uniqueIds = new Set(); // Set to keep track of unique IDs

    data.places.forEach((dataKeyword) => {
      const urls = [
        `https://api.hel.fi/linkedevents/v1/place/?text=${dataKeyword}&show_all_places=true`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&input=${dataKeyword}`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&q=${dataKeyword}`,
      ];

      Promise.all(urls.map((url) => fetch(url).then((resp) => resp.json())))
        .then((responses) => {
          // Combine data from all responses
          const combinedData = responses.flatMap((response) => response.data);

          // Filter places with ID starting with "tprek" and not already included
          const filteredData = combinedData.filter((item) => {
            const isUnique =
              item.id.startsWith("tprek") && !uniqueIds.has(item.id);
            if (isUnique) {
              uniqueIds.add(item.id); // Add new unique ID to the set
            }
            return isUnique;
          });

          // Include the keyword in each place item
          const placesWithKeyword = filteredData.map((item) => ({
            ...item,
            queryKeyword: dataKeyword, // Add keyword to each place
          }));

          setPlaces((prev) => [...prev, ...placesWithKeyword]);
          console.log(placeswi);
        })
        .catch((error) => console.error(error));
    });
  };

  const handleClick = (place) => {
    setSelectedPlaces((prev) => [...prev, place]);
    // Additional logic for handling the clicked place
  };

  return (
    <main>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={fetchPlaces}
      >
        Load Places
      </button>
      <div className="flex flex-wrap">
        {places.map((place) => (
          <div
            key={place.id}
            onClick={() => handleClick(place)}
            className="flex max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
          >
            <div className="px-6 py-4">
              <p className="font-semibold text-green-600">
                {place.queryKeyword}
              </p>
              <h2 className="font-bold text-xl mb-2">{place.name.fi}</h2>
              <p className="text-gray-700 text-base">
                {place.description?.fi
                  ? `${place.description.fi.split(".")[0]}.`
                  : ""}
              </p>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                Coordinates: {place.position.coordinates.join(", ")}
              </span>
            </div>

            <div className="px-6 pt-4 pb-2">
              {Array.isArray(place.image) &&
                place.image.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index}`}
                    className="w-full"
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

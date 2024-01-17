import React, { useState } from "react";
import selectedPlacesData from "../selectedPlaces.json";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const fetchDatajson = () => {
    const data = require("./data.json");
    let uniqueIds = new Set();
    data.places.forEach((dataKeyword) => {
      const urls = [
        `https://api.hel.fi/linkedevents/v1/place/?text=${dataKeyword}&show_all_places=true`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&input=${dataKeyword}`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&q=${dataKeyword}`,
      ];
      Promise.all(urls.map((url) => fetch(url).then((resp) => resp.json())))
        .then((responses) => {
          const combinedData = responses.flatMap((response) => response.data);
          const filteredData = combinedData.filter((item) => {
            const hasCoordinates = item.position && item.position.coordinates;
            const isUnique =
              item.id.startsWith("tprek") && !uniqueIds.has(item.id);
            const isNotKierratyspiste = !item.name.fi
              .toLowerCase()
              .includes("kierrätyspiste");
            const isNotPysakointialue = !item.name.fi
              .toLowerCase()
              .includes("pysäköintialue");
            const isNotYleisovessa = !item.name.fi
              .toLowerCase()
              .includes("yleisövessa");
            if (
              isUnique && hasCoordinates &&
              isNotKierratyspiste &&
              isNotPysakointialue &&
              isNotYleisovessa
            ) {
              uniqueIds.add(item.id);
              return true;
            }
            return false;
          });
          // Fetch image URLs for filtered data
          const fetchImagePromises = filteredData.map((place) => {
            const placeWithKeyword = { ...place, queryKeyword: dataKeyword }; // Add queryKeyword to the place object
            if (place.image) {
              return fetch(
                `https://api.hel.fi/linkedevents/v1/image/${place.image}`
              )
                .then((resp) => resp.json())
                .then((imageData) => {
                  placeWithKeyword.imageUrl = imageData.url; // Store the image URL in the place object
                  return placeWithKeyword;
                });
            }
            return Promise.resolve(placeWithKeyword); // If no image, just return the place as is
          });
          return Promise.all(fetchImagePromises);
        })
        .then((placesWithImages) => {
          setPlaces((prev) => [...prev, ...placesWithImages]);
          console.log(placesWithImages);
        })
        .catch((error) => console.error(error));
    });
  };

  const fetchPlaces = () => {
    console.log(places);
    let existingIds = new Set(places.map((place) => place.id)); // Create a set of existing IDs for comparison
  
    places.forEach((place) => {
      let nameKeyword = place.name.fi;
      const urls = [
        `https://api.hel.fi/linkedevents/v1/place/?text=${nameKeyword}&show_all_places=true`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&input=${nameKeyword}`,
        `https://api.hel.fi/linkedevents/v1/search/?type=place&q=${nameKeyword}`,
      ];
  
      Promise.all(urls.map((url) => fetch(url).then((resp) => resp.json())))
        .then((responses) => {
          const combinedData = responses.flatMap((response) => response.data);
          const filteredData = combinedData.filter((item) => {
            const hasCoordinates = item.position && item.position.coordinates;
            const isUnique = item.id.startsWith("tprek") && !existingIds.has(item.id);
            const isNotKierratyspiste = !item.name.fi.toLowerCase().includes("kierrätyspiste");
            const isNotPysakointialue = !item.name.fi.toLowerCase().includes("pysäköintialue");
            const isNotYleisovessa = !item.name.fi.toLowerCase().includes("yleisövessa");
  
            if (isUnique && hasCoordinates && isNotKierratyspiste && isNotPysakointialue && isNotYleisovessa) {
              existingIds.add(item.id); // Add new IDs to the set
              return true;
            }
            return false;
          });
  
          // Fetch image URLs for filtered data
          const fetchImagePromises = filteredData.map((place) => {
            const placeWithKeyword = { ...place, queryKeyword: nameKeyword };
            if (place.image) {
              return fetch(`https://api.hel.fi/linkedevents/v1/image/${place.image}`)
                .then((resp) => resp.json())
                .then((imageData) => {
                  placeWithKeyword.imageUrl = imageData.url;
                  return placeWithKeyword;
                });
            }
            return Promise.resolve(placeWithKeyword); // If no image, just return the place as is
          });
  
          return Promise.all(fetchImagePromises);
        })
        .then((placesWithImages) => {
          setPlaces((prev) => [...prev, ...placesWithImages]);
          console.log(placesWithImages);
        })
        .catch((error) => console.error(error));
    });
  };
  

  const handleClick = (place) => {
    setSelectedPlaces((prev) => {
      // Check if the place is already in the list
      if (prev.find((p) => p.id === place.id)) {
        return prev; // If it's already there, return the current state
      }
      return [...prev, place]; // Otherwise, add the new place
    });
    console.log(selectedPlaces);
  };

  
  const saveToJson = () => {
    fetch('/api/savePlaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedPlaces),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <main className="">
      <div className="flex sticky top-0 z-50 bg-white items-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
          onClick={fetchDatajson}
        >
          Fetch from data.json
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
          onClick={fetchPlaces}
        >
          Fetch from places.name
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2"
          onClick={saveToJson}
        >
          Save to JSON
        </button>
        <p className="border-2 p-2 rounded">Total pois in file: {selectedPlacesData.length}</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {places.map((place) => (
          <div
            key={place.id}
            onClick={() => handleClick(place)}
            className="relative flex max-w-sm overflow-hidden rounded-2xl shadow-2xl hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
            style={{
              backgroundImage: `url(${place.imageUrl})`,
              backgroundSize: "cover", // Ensure the image covers the entire card
              backgroundPosition: "center", // Center the image in the card
            }}
          >
            {selectedPlacesData.some(
              (selectedPlace) => selectedPlace.id === place.id
            ) && (
              <span className="absolute top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-sm font-bold rounded-bl-xl">
                ADDED
              </span>
            )}
            <div className="px-6 py-4 bg-black bg-opacity-55">
              <p className="font-semibold text-green-600">
                data: {place.queryKeyword}
              </p>
              <h2 className="font-bold text-xl text-white mb-2">
                {place.name.fi}
              </h2>
              <p className="text-base text-white">
                {place.description?.fi
                  ? `${place.description.fi.split(".")[0]}.`
                  : ""}
              </p>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 mt-2">
                {place.position.coordinates.join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
